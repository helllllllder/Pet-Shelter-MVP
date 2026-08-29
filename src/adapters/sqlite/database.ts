import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

export const SQLITE_DDL_SCHEMA = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS operator_profile (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    last_active_shelter_id TEXT,
    device_install_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS shelters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pets (
    id TEXT PRIMARY KEY,
    shelter_id TEXT NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    species TEXT NOT NULL,
    breed TEXT NOT NULL,
    sex TEXT NOT NULL,
    color TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    is_dob_estimated INTEGER NOT NULL DEFAULT 0,
    intake_origin TEXT NOT NULL,
    intake_origin_details TEXT,
    health_status TEXT NOT NULL DEFAULT 'HEALTHY',
    health_conditions TEXT NOT NULL DEFAULT '[]',
    is_available_for_adoption INTEGER NOT NULL DEFAULT 0,
    outcome_status TEXT NOT NULL DEFAULT 'ACTIVE',
    outcome_date TEXT,
    outcome_notes TEXT,
    media_references TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS adopter_details (
    id TEXT PRIMARY KEY,
    shelter_id TEXT NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
    pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    adopter_name TEXT NOT NULL,
    adopter_phone TEXT NOT NULL,
    adopter_address TEXT NOT NULL,
    adopted_at TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS shadow_records (
    id TEXT PRIMARY KEY,
    original_shelter_id TEXT NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
    target_shelter_id TEXT NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
    original_pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    new_pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    snapshot_data_json TEXT NOT NULL,
    transferred_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS vet_clinics (
    id TEXT PRIMARY KEY,
    shelter_id TEXT NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    emergency_services INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS veterinarians (
    id TEXT PRIMARY KEY,
    shelter_id TEXT NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
    clinic_id TEXT NOT NULL REFERENCES vet_clinics(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    license_number TEXT,
    phone TEXT,
    email TEXT,
    specialization TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS vet_appointments (
    id TEXT PRIMARY KEY,
    shelter_id TEXT NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
    pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    clinic_id TEXT NOT NULL REFERENCES vet_clinics(id) ON DELETE CASCADE,
    veterinarian_id TEXT REFERENCES veterinarians(id) ON DELETE SET NULL,
    appointment_date TEXT NOT NULL,
    reason TEXT NOT NULL,
    diagnosis TEXT,
    prognosis TEXT,
    is_retroactive INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS vet_documents (
    id TEXT PRIMARY KEY,
    shelter_id TEXT NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
    appointment_id TEXT NOT NULL REFERENCES vet_appointments(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    local_relative_path TEXT NOT NULL,
    sha256_checksum TEXT NOT NULL,
    uploaded_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS care_events (
    id TEXT PRIMARY KEY,
    shelter_id TEXT NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
    pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    linked_appointment_id TEXT REFERENCES vet_appointments(id) ON DELETE SET NULL,
    modality TEXT NOT NULL,
    substance_name TEXT,
    dosage TEXT,
    administration_instructions TEXT,
    recurrence_interval_unit TEXT NOT NULL DEFAULT 'NONE',
    recurrence_interval_value INTEGER NOT NULL DEFAULT 0,
    start_date TEXT NOT NULL,
    end_date TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS care_event_occurrences (
    id TEXT PRIMARY KEY,
    shelter_id TEXT NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
    care_event_id TEXT NOT NULL REFERENCES care_events(id) ON DELETE CASCADE,
    pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    due_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'SCHEDULED',
    administered_at TEXT,
    administered_by_operator_name TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    shelter_id TEXT REFERENCES shelters(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    actor_contact TEXT,
    payload_diff_json TEXT,
    ip_or_device_id TEXT NOT NULL,
    created_at TEXT NOT NULL
);

-- Phase 2 Tables
CREATE TABLE IF NOT EXISTS inventory_items (
    id TEXT PRIMARY KEY,
    shelter_id TEXT NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    quantity REAL NOT NULL DEFAULT 0,
    unit_of_measure TEXT NOT NULL,
    purchase_date TEXT,
    expiration_date TEXT,
    description TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS inventory_alert_rules (
    id TEXT PRIMARY KEY,
    shelter_id TEXT NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
    inventory_item_id TEXT NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    trigger_type TEXT NOT NULL,
    threshold_value REAL,
    days_before_expiration INTEGER,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory_usage_templates (
    id TEXT PRIMARY KEY,
    shelter_id TEXT NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory_usage_template_items (
    id TEXT PRIMARY KEY,
    template_id TEXT NOT NULL REFERENCES inventory_usage_templates(id) ON DELETE CASCADE,
    inventory_item_id TEXT NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    quantity_to_decrement REAL NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS maintenance_tasks (
    id TEXT PRIMARY KEY,
    shelter_id TEXT NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
    task_type TEXT NOT NULL,
    description TEXT NOT NULL,
    scheduled_date TEXT NOT NULL,
    recurrence_interval_unit TEXT NOT NULL DEFAULT 'NONE',
    recurrence_interval_value INTEGER NOT NULL DEFAULT 0,
    assigned_to_name TEXT,
    status TEXT NOT NULL DEFAULT 'SCHEDULED',
    completed_at TEXT,
    completed_by_operator_name TEXT,
    completion_notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    shelter_id TEXT NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
    tier TEXT NOT NULL DEFAULT 'STANDARD',
    channel TEXT NOT NULL DEFAULT 'IN_APP',
    recipient_identifier TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    last_attempted_at TEXT,
    delivered_at TEXT,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notification_escalation_logs (
    id TEXT PRIMARY KEY,
    notification_id TEXT NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
    shelter_id TEXT NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
    failure_reason TEXT NOT NULL,
    is_dismissed INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    dismissed_at TEXT
);

-- Indexes for sub-300ms queries (NFR02)
CREATE INDEX IF NOT EXISTS pets_shelter_id_idx ON pets(shelter_id);
CREATE INDEX IF NOT EXISTS pets_outcome_status_idx ON pets(outcome_status);
CREATE INDEX IF NOT EXISTS pets_name_idx ON pets(name);
CREATE INDEX IF NOT EXISTS inventory_items_shelter_id_idx ON inventory_items(shelter_id);
CREATE INDEX IF NOT EXISTS inventory_items_category_idx ON inventory_items(category);
CREATE INDEX IF NOT EXISTS maintenance_tasks_shelter_id_idx ON maintenance_tasks(shelter_id);
CREATE INDEX IF NOT EXISTS maintenance_tasks_status_idx ON maintenance_tasks(status);
CREATE INDEX IF NOT EXISTS notifications_shelter_id_idx ON notifications(shelter_id);
CREATE INDEX IF NOT EXISTS notifications_status_idx ON notifications(status);
`;

export function createTestDatabase(inMemory = true) {
  const sqlite = inMemory ? new Database(':memory:') : new Database('luna_pet_shelter.db');
  sqlite.exec(SQLITE_DDL_SCHEMA);
  const db = drizzle(sqlite, { schema });
  return { db, sqlite };
}
