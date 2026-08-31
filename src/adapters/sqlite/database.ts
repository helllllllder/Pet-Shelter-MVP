import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";

export type LunaDatabase = BetterSQLite3Database<typeof schema>;

export const SCHEMA_DDL = `
-- 1. Operator Profile
CREATE TABLE IF NOT EXISTS operator_profile (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 2. Shelters
CREATE TABLE IF NOT EXISTS shelters (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_shelters_name ON shelters (name);
CREATE INDEX IF NOT EXISTS idx_shelters_active ON shelters (is_active);

-- 3. Pets
CREATE TABLE IF NOT EXISTS pets (
  id TEXT PRIMARY KEY,
  shelter_id TEXT NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dob TEXT NOT NULL,
  is_dob_estimated INTEGER NOT NULL DEFAULT 0,
  species TEXT NOT NULL,
  breed TEXT NOT NULL,
  sex TEXT NOT NULL,
  color TEXT NOT NULL,
  intake_origin TEXT NOT NULL,
  intake_origin_detail TEXT,
  health_conditions TEXT,
  health_status TEXT NOT NULL,
  available_for_adoption INTEGER NOT NULL DEFAULT 0,
  outcome_status TEXT,
  outcome_date TEXT,
  is_archived INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pets_shelter_id ON pets (shelter_id);
CREATE INDEX IF NOT EXISTS idx_pets_shelter_name ON pets (shelter_id, name);
CREATE INDEX IF NOT EXISTS idx_pets_shelter_species ON pets (shelter_id, species);
CREATE INDEX IF NOT EXISTS idx_pets_shelter_status ON pets (shelter_id, outcome_status, is_archived);
CREATE INDEX IF NOT EXISTS idx_pets_shelter_adoption ON pets (shelter_id, available_for_adoption);

-- 4. Pet Media
CREATE TABLE IF NOT EXISTS pet_media (
  id TEXT PRIMARY KEY,
  shelter_id TEXT NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
  pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size_bytes INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pet_media_shelter ON pet_media (shelter_id);
CREATE INDEX IF NOT EXISTS idx_pet_media_pet ON pet_media (pet_id);

-- 5. Adopter Details
CREATE TABLE IF NOT EXISTS adopter_details (
  id TEXT PRIMARY KEY,
  shelter_id TEXT NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
  pet_id TEXT NOT NULL UNIQUE REFERENCES pets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_adopter_details_shelter ON adopter_details (shelter_id);
CREATE INDEX IF NOT EXISTS idx_adopter_details_pet ON adopter_details (pet_id);

-- 6. Shadow Records
CREATE TABLE IF NOT EXISTS shadow_records (
  id TEXT PRIMARY KEY,
  origin_shelter_id TEXT NOT NULL REFERENCES shelters(id) ON DELETE RESTRICT,
  destination_shelter_id TEXT NOT NULL REFERENCES shelters(id) ON DELETE RESTRICT,
  origin_pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE RESTRICT,
  destination_pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE RESTRICT,
  snapshot_data TEXT NOT NULL,
  transferred_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_shadow_records_origin_shelter ON shadow_records (origin_shelter_id);
CREATE INDEX IF NOT EXISTS idx_shadow_records_dest_shelter ON shadow_records (destination_shelter_id);
CREATE INDEX IF NOT EXISTS idx_shadow_records_origin_pet ON shadow_records (origin_pet_id);

-- 7. Veterinary Clinics
CREATE TABLE IF NOT EXISTS vet_clinics (
  id TEXT PRIMARY KEY,
  shelter_id TEXT NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  is_deleted INTEGER NOT NULL DEFAULT 0,
  deleted_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_vet_clinics_shelter ON vet_clinics (shelter_id);
CREATE INDEX IF NOT EXISTS idx_vet_clinics_shelter_name ON vet_clinics (shelter_id, name);
CREATE INDEX IF NOT EXISTS idx_vet_clinics_deleted ON vet_clinics (shelter_id, is_deleted);

-- 8. Veterinarians
CREATE TABLE IF NOT EXISTS veterinarians (
  id TEXT PRIMARY KEY,
  shelter_id TEXT NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
  clinic_id TEXT NOT NULL REFERENCES vet_clinics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  specialization TEXT,
  phone TEXT,
  email TEXT,
  is_deleted INTEGER NOT NULL DEFAULT 0,
  deleted_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_veterinarians_shelter ON veterinarians (shelter_id);
CREATE INDEX IF NOT EXISTS idx_veterinarians_clinic ON veterinarians (clinic_id);
CREATE INDEX IF NOT EXISTS idx_veterinarians_shelter_name ON veterinarians (shelter_id, name);
CREATE INDEX IF NOT EXISTS idx_veterinarians_deleted ON veterinarians (shelter_id, is_deleted);

-- 9. Veterinary Appointments
CREATE TABLE IF NOT EXISTS vet_appointments (
  id TEXT PRIMARY KEY,
  shelter_id TEXT NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
  pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  clinic_id TEXT NOT NULL REFERENCES vet_clinics(id) ON DELETE RESTRICT,
  veterinarian_id TEXT REFERENCES veterinarians(id) ON DELETE SET NULL,
  appointment_date TEXT NOT NULL,
  is_retroactive INTEGER NOT NULL DEFAULT 0,
  notes TEXT NOT NULL,
  is_deleted INTEGER NOT NULL DEFAULT 0,
  deleted_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_vet_appointments_shelter ON vet_appointments (shelter_id);
CREATE INDEX IF NOT EXISTS idx_vet_appointments_pet ON vet_appointments (pet_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_vet_appointments_clinic ON vet_appointments (clinic_id);
CREATE INDEX IF NOT EXISTS idx_vet_appointments_vet ON vet_appointments (veterinarian_id);
CREATE INDEX IF NOT EXISTS idx_vet_appointments_deleted ON vet_appointments (shelter_id, is_deleted);

-- 10. Veterinary Documents
CREATE TABLE IF NOT EXISTS vet_documents (
  id TEXT PRIMARY KEY,
  shelter_id TEXT NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
  appointment_id TEXT NOT NULL REFERENCES vet_appointments(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size_bytes INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_vet_documents_shelter ON vet_documents (shelter_id);
CREATE INDEX IF NOT EXISTS idx_vet_documents_appointment ON vet_documents (appointment_id);

-- 11. Care Events
CREATE TABLE IF NOT EXISTS care_events (
  id TEXT PRIMARY KEY,
  shelter_id TEXT NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
  pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  appointment_id TEXT REFERENCES vet_appointments(id) ON DELETE SET NULL,
  modality TEXT NOT NULL,
  substance TEXT,
  instructions TEXT,
  is_recurring INTEGER NOT NULL DEFAULT 0,
  recurrence_interval_value INTEGER,
  recurrence_interval_unit TEXT,
  is_temporary INTEGER NOT NULL DEFAULT 0,
  start_date TEXT NOT NULL,
  end_date TEXT,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_care_events_shelter ON care_events (shelter_id);
CREATE INDEX IF NOT EXISTS idx_care_events_pet ON care_events (pet_id, status);
CREATE INDEX IF NOT EXISTS idx_care_events_appointment ON care_events (appointment_id);
CREATE INDEX IF NOT EXISTS idx_care_events_modality ON care_events (shelter_id, modality);

-- 12. Care Event Occurrences
CREATE TABLE IF NOT EXISTS care_event_occurrences (
  id TEXT PRIMARY KEY,
  shelter_id TEXT NOT NULL REFERENCES shelters(id) ON DELETE CASCADE,
  care_event_id TEXT NOT NULL REFERENCES care_events(id) ON DELETE CASCADE,
  pet_id TEXT NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  due_date TEXT NOT NULL,
  status TEXT NOT NULL,
  completed_at TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_care_occurrences_shelter ON care_event_occurrences (shelter_id);
CREATE INDEX IF NOT EXISTS idx_care_occurrences_due ON care_event_occurrences (shelter_id, status, due_date);
CREATE INDEX IF NOT EXISTS idx_care_occurrences_event ON care_event_occurrences (care_event_id);
CREATE INDEX IF NOT EXISTS idx_care_occurrences_pet ON care_event_occurrences (pet_id, status);

-- 13. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  shelter_id TEXT REFERENCES shelters(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  actor_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  details TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_shelter ON audit_logs (shelter_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs (shelter_id, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs (shelter_id, created_at);
`;

/**
 * Creates and initializes a SQLite database connection with Drizzle ORM.
 */
export function createDatabase(
  dbPath: string = ":memory:"
): { rawDb: Database.Database; db: LunaDatabase } {
  const rawDb = new Database(dbPath);
  rawDb.pragma("foreign_keys = ON");
  if (dbPath !== ":memory:") {
    rawDb.pragma("journal_mode = WAL");
  }

  // Execute DDL setup
  rawDb.exec(SCHEMA_DDL);

  const db = drizzle(rawDb, { schema });
  return { rawDb, db };
}
