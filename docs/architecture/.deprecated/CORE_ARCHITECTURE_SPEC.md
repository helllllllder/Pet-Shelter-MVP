# Core System Architecture Spec — Luna's Pet Central MVP v1.0

## Section 1: Data Models

### Tenant (Shelter)

| Field | Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| `id` | UUIDv7 | PRIMARY KEY, NOT NULL | Time-sortable primary key |
| `name` | VARCHAR(255) | NOT NULL | Unique per tenant context (not globally); duplicate names allowed across tenants |
| `slug` | VARCHAR(100) | UNIQUE, NOT NULL | URL-safe identifier derived from name |
| `description` | TEXT | NULLABLE | Optional shelter description |
| `settings` | JSONB | NOT NULL, default `{}` | Shelter-specific configuration (e.g., notification preferences, branding) |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, default `now()` | Record creation time |
| `updated_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, default `now()` | Last modification time |
| `is_archived` | BOOLEAN | NOT NULL, default `false` | Soft-delete flag; archived shelters are read-only |

**Relationships:**
- One-to-many with `ShelterUserRole.shelter_id`
- One-to-many with `InviteLink.shelter_id`
- Every tenant-scoped entity (pets, inventory, appointments, etc.) references this table via `shelter_id`

---

### User (Platform Account)

| Field | Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| `id` | UUIDv7 | PRIMARY KEY, NOT NULL | Time-sortable primary key |
| `google_sub` | VARCHAR(255) | UNIQUE, NOT NULL | Google Identity Platform subject identifier; maps to Google email |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Verified via Google OAuth; identity-bound for invite redemption |
| `full_name` | VARCHAR(255) | NOT NULL | Display name from Google profile |
| `avatar_url` | VARCHAR(500) | NULLABLE | Profile picture URL from Google |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, default `now()` | Account creation time |
| `updated_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, default `now()` | Last profile update time |

**Relationships:**
- One-to-many with `ShelterUserRole.user_id`
- One-to-many with `InviteLink.created_by` (admin who generated invite)
- One-to-many with `InviteLink.redeemed_by` (user who redeemed invite, nullable)

---

### ShelterUserRole (Junction Table)

| Field | Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| `id` | UUIDv7 | PRIMARY KEY, NOT NULL | Time-sortable primary key |
| `shelter_id` | UUID | FK → `tenants.id`, NOT NULL | References the shelter |
| `user_id` | UUID | FK → `users.id`, NOT NULL | References the platform user |
| `role` | ENUM('admin', 'staff', 'read_only') | NOT NULL | Role within this specific shelter |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, default `now()` | Assignment creation time |

**Constraints:**
- Unique constraint: `(shelter_id, user_id)` — a user can hold only one role per shelter
- At least one `admin` must exist per shelter; system prevents last-admin removal

**Relationships:**
- Many-to-many bridge between `tenants` and `users`
- Governs all access control decisions (NFR07)

---

### InviteLink

| Field | Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| `id` | UUIDv7 | PRIMARY KEY, NOT NULL | Time-sortable primary key |
| `token` | UUIDv4 | UNIQUE, NOT NULL | Opaque, cryptographically random token; used in invite URLs |
| `shelter_id` | UUID | FK → `tenants.id`, NOT NULL | Target shelter for the invite |
| `invited_email` | VARCHAR(255) | NOT NULL | Email address of the person being invited (identity-bound) |
| `role` | ENUM('staff', 'read_only') | NOT NULL | Role assigned upon successful redemption |
| `status` | ENUM('pending', 'redeemed', 'expired', 'invalidated') | NOT NULL, default `'pending'` | Lifecycle state of the invite |
| `created_by` | UUID | FK → `users.id`, NOT NULL | Admin who generated this invite |
| `redeemed_by` | UUID | FK → `users.id`, NULLABLE | User who redeemed the invite (populated on redemption) |
| `created_at` | TIMESTAMP WITH TIME ZONE | NOT NULL, default `now()` | Invite generation time |
| `expires_at` | TIMESTAMP WITH TIME ZONE | NOT NULL | 30 days from creation; expired invites cannot be redeemed |
| `redeemed_at` | TIMESTAMP WITH TIME ZONE | NULLABLE | Redemption timestamp |

**Constraints:**
- Unique constraint on `token` (implicit via UNIQUE)
- Resending an invite for the same `(shelter_id, invited_email)` combination invalidates any existing pending invite and creates a new one

**Relationships:**
- Belongs to one `tenants` record
- Created by one `users` record (admin)
- Redeemed by one `users` record (nullable)

---

## Section 2: Tenant Isolation Pattern

### Overview

Luna's Pet Central is a multi-tenant SaaS platform where each shelter operates as an isolated data tenant. The isolation pattern enforces that users can only access data belonging to shelters they have been explicitly assigned to, at the application and database levels.

### Enforcement Mechanism

#### 1. Active Shelter Context

Every authenticated request must operate within a single active shelter context, established via one of:

- **Explicit selection in the URL path**: `/api/shelters/{shelter_id}/...` — the `shelter_id` segment identifies the target tenant.
- **Session-level default**: On first login, if the user has exactly one shelter, it is set as the default. Users with multiple shelters select their active context via a shelter switcher in the UI.

All API handlers extract the active shelter ID from the request context before processing any business logic.

#### 2. Server-Side Authorization Check

Every API handler MUST perform the following authorization validation before processing a request:

```
1. Extract `shelter_id` from URL path or session default
2. Look up `ShelterUserRole` where `shelter_id = :shelter_id AND user_id = :current_user_id`
3. If no row exists → return 403 Forbidden with error code `TENANT_ACCESS_DENIED`
4. If row exists, verify the user's `role` permits the requested action:
   - Admin: full access (read, write, delete, shelter settings, user management)
   - Staff: read/write on records; no shelter settings or user management
   - Read-only: read access only; all write/delete actions denied
```

Role enforcement is validated server-side on every request (NFR07). Client-side role checks are UI convenience only and must not be relied upon for security.

#### 3. Database-Level Guards

All SQL queries against tenant-scoped tables MUST include the shelter filter:

```sql
WHERE shelter_id = :active_shelter_id
```

This applies to:
- All `SELECT` queries returning pet profiles, inventory items, appointments, care events, maintenance tasks, and reports
- All `INSERT` statements (which must include `shelter_id` in the row)
- All `UPDATE` and `DELETE` statements (which must scope the WHERE clause)

This defense-in-depth measure prevents cross-tenant data leakage even if application-level checks fail.

#### 4. Cross-Tenant Operations

The only allowed cross-tenant operation is **internal pet transfer** (FR10):

- When a pet is transferred from Shelter A to Shelter B, the system creates a **shadow record** at Shelter A (read-only copy of full history) and a **new active profile** at Shelter B that references the original.
- This operation is handled via explicit service-layer logic that:
  1. Validates the requesting user has Staff+ access at both shelters
  2. Creates the shadow record at the origin with `is_archived = true`
  3. Creates the new active profile at the destination, copying relevant fields
  4. Migrates active temporary treatments and pending recurring care events to the destination's new profile
  5. Revokes all active shareable links at the origin
- All other operations are strictly single-tenant; no cross-shelter data access is permitted.

#### 5. Error Response for Access Denial

When a user attempts to access a shelter they do not belong to, the system returns:

```json
{
  "error": "TENANT_ACCESS_DENIED",
  "message": "You do not have access to this shelter."
}
```

HTTP status: `403 Forbidden`

This response must not reveal any information about the existence or structure of the requested shelter.

---

## Section 3: API Contracts

### POST /api/auth/google/callback

Google SSO authentication callback. Exchanges the OAuth2 authorization code for a platform session.

**Request:**
- Method: `POST`
- Path: `/api/auth/google/callback`
- Body (application/x-www-form-urlencoded or JSON):
  ```json
  {
    "code": "string (required, OAuth2 authorization code from Google)",
    "state": "string (required, CSRF state parameter)"
  }
  ```

**Response 200 OK:**
```json
{
  "user_id": "uuid",
  "shelters": [
    {
      "id": "uuid",
      "name": "string",
      "role": "admin|staff|read_only"
    }
  ]
}
```

- First-time users (new platform account) receive an empty `shelters` array and must create a shelter before accessing data.
- Returning users receive their assigned shelters with roles.

**Response 401 Unauthorized:**
```json
{
  "error": "invalid_google_token",
  "message": "string describing the authentication failure"
}
```

---

### POST /api/shelters

Create a new shelter. The authenticated user becomes the shelter's Admin.

**Request:**
- Method: `POST`
- Path: `/api/shelters`
- Headers: `Authorization: Bearer <token>`
- Body:
  ```json
  {
    "name": "string (required, max 255 characters)",
    "description": "string (optional)"
  }
  ```

**Response 201 Created:**
```json
{
  "id": "uuid",
  "name": "string",
  "slug": "string",
  "created_at": "timestamp"
}
```

- The creator is automatically assigned the `admin` role via `ShelterUserRole`.
- A slug is auto-generated from the name (lowercase, hyphens, URL-safe).

**Response 409 Conflict:**
```json
{
  "error": "shelter_already_exists",
  "message": "You already have a shelter with this name."
}
```

- Uniqueness check is scoped to the user's owned shelters (not global).

---

### POST /api/shelters/{shelter_id}/invites

Generate an identity-bound invite link for a new staff member.

**Request:**
- Method: `POST`
- Path: `/api/shelters/{shelter_id}/invites`
- Headers: `Authorization: Bearer <token>`
- Body:
  ```json
  {
    "invited_email": "string (required, valid email format)",
    "role": "staff|read_only"
  }
  ```

**Response 201 Created:**
```json
{
  "id": "uuid",
  "token": "string (UUIDv4)",
  "invite_url": "https://app.lunapetcentral.com/invite/{token}",
  "expires_at": "timestamp (30 days from creation)",
  "status": "pending"
}
```

**Side effect:** Invalidates any existing pending invite for the same `(shelter_id, invited_email)` combination. A new `InviteLink` record is created; the old one is marked `invalidated`.

**Response 403 Forbidden:**
```json
{
  "error": "insufficient_permissions",
  "message": "Only admins can generate invites."
}
```

**Response 404 Not Found:**
```json
{
  "error": "shelter_not_found",
  "message": "string"
}
```

---

### GET /api/invite/{token}

Check the validity of an invite link without requiring authentication.

**Request:**
- Method: `GET`
- Path: `/api/invite/{token}`
- No authentication required (public endpoint).

**Response 200 OK:**
```json
{
  "valid": true,
  "shelter_name": "string",
  "assigned_role": "staff|read_only",
  "invited_email": "string"
}
```

**Response 410 Gone:**
```json
{
  "error": "invite_expired",
  "message": "This invite has expired. Please request a new invitation from your shelter admin."
}
```

**Response 404 Not Found:**
```json
{
  "error": "invite_not_found",
  "message": "This invite link is invalid or has been invalidated."
}
```

---

### POST /api/invite/{token}/redeem

Redeem an invite link to join a shelter. Requires Google SSO authentication; the authenticated email must match `invited_email`.

**Request:**
- Method: `POST`
- Path: `/api/invite/{token}/redeem`
- Headers: `Authorization: Bearer <token>` (Google SSO session)
- No request body required.

**Response 200 OK:**
```json
{
  "shelter_id": "uuid",
  "role": "staff|read_only",
  "message": "Successfully joined shelter"
}
```

**Side effects:**
- `InviteLink.status` set to `redeemed`
- `InviteLink.redeemed_by` set to the current user's ID
- `InviteLink.redeemed_at` set to current timestamp
- `ShelterUserRole` record created for `(shelter_id, user_id)` with the assigned role

**Response 400 Bad Request:**
```json
{
  "error": "email_mismatch",
  "message": "Authenticated email does not match invited email."
}
```

**Response 410 Gone:**
```json
{
  "error": "invite_expired",
  "message": "string"
}
```

**Response 404 Not Found:**
```json
{
  "error": "invite_not_found",
  "message": "string"
}
```

---

## Section 4: Architecture Decision Records (ADRs)

### ADR-001: Google SSO as Sole Authentication Method

- **Status**: Accepted
- **Date**: 2026-07-09
- **Context**: NFR07 requires role-based access control. No local authentication means no password management overhead, no password breach surface, and simplified onboarding. The BRD explicitly states "Google SSO is the sole authentication method."
- **Choice**: Google Identity Platform for OAuth2/OIDC authentication. Users sign in with their Google account; the system creates a platform `User` record linked by `google_sub` (Google's subject identifier).
- **Rationale**: 
  - Eliminates password storage, hashing, and breach risk entirely.
  - Leverages Google's security infrastructure (MFA, anomaly detection, session management).
  - Simplifies onboarding: no registration form, no email verification flow, no password reset.
  - Identity-bound invites (FR03) naturally integrate: the invited email must match the Google account email at redemption time.
- **Trade-offs**: 
  - Users without Google accounts cannot use the platform (acceptable for shelter staff demographics).
  - Platform depends on Google's availability; handled via graceful error page per edge case spec.

### ADR-002: UUID Version Strategy

- **Status**: Accepted
- **Date**: 2026-07-09
- **Context**: Multi-tenant SaaS requires non-sequential, non-guessable identifiers (NFR10 — Link Anonymity). Database performance benefits from time-sortable keys to reduce B-tree index fragmentation on high-write tables. Security tokens must be cryptographically random.
- **Choice**: 
  - **UUIDv7** for all primary keys and audit log IDs: time-sortable, monotonic, compatible with sequential index scanning.
  - **UUIDv4** for security tokens (invite `token`, shareable link tokens, hashing salts): fully random, non-predictable.
- **Rationale**: 
  - UUIDv7 embeds a timestamp prefix, providing natural ordering that improves insert performance on clustered indexes and reduces page splits in PostgreSQL B-trees.
  - UUIDv4 provides 122 bits of randomness, making tokens unguessable even if partially observed — critical for invite links and shareable profile URLs (NFR10).
- **Trade-offs**: 
  - UUIDv7 requires a modern database or application-level generation; PostgreSQL natively supports it via `uuid-ossp` or `pgcrypto` extensions.
  - Slightly larger than integer auto-increments, but the security and distributed-systems benefits far outweigh the storage cost.

### ADR-003: Row-Level Security via shelter_id Column

- **Status**: Accepted
- **Date**: 2026-07-09
- **Context**: NFR08 requires data isolation at the database level. Application-level checks alone are insufficient — a bug or misconfigured route could expose cross-tenant data. Defense in depth is required for a multi-tenant SaaS.
- **Choice**: Every tenant-scoped table includes a `shelter_id` foreign key column. All queries include `WHERE shelter_id = :active_shelter_id`. Application-level authorization (Section 2, Step 2) provides the first layer; the SQL WHERE clause provides the second.
- **Rationale**: 
  - Eliminates the possibility of cross-tenant data leakage via query bugs, missing joins, or ORM misconfiguration.
  - Makes tenant scoping explicit and auditable — any query without a `shelter_id` filter is immediately identifiable as a potential security issue.
  - Aligns with the multi-tenant architecture where each shelter is an independent data boundary.
- **Trade-offs**: 
  - Every query must explicitly include the shelter filter; developers cannot omit it accidentally without a database-level constraint or RLS policy (future enhancement).
  - Cross-tenant operations (internal transfers, FR10) require explicit service-layer handling that bypasses the standard filter with documented justification.

---

## Appendix: Source Requirements Traceability

| Spec Element | Source FR/NFR |
| :--- | :--- |
| Google SSO authentication | FR01, NFR07 |
| Shelter creation with Admin auto-assignment | FR02, NFR07, NFR08 |
| Identity-bound invite link generation and redemption | FR03, NFR07, NFR10 |
| Role-based access control (Admin, Staff, Read-only) | FR04, NFR07 |
| Tenant isolation via `shelter_id` column | NFR08 |
| UUIDv7 for PKs, UUIDv4 for tokens | NFR10 |
| Cross-tenant shadow records for internal transfers | FR10, NFR08 |
| 403/TENANT_ACCESS_DENIED on unauthorized shelter access | NFR07, NFR08 |
