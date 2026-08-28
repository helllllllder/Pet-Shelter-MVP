import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

export const SQL_DDL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS operator_profile (
    id TEXT PRIMARY KEY NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    last_active_shelter_id TEXT,
    device_install_id TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS shelters (
    id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_shelters_active ON shelters(is_active);

CREATE TABLE IF NOT EXISTS pets (
    id TEXT PRIMARY KEY NOT NULL,
    shelter_id TEXT NOT NULL,
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
    health_conditions TEXT,
    is_available_for_adoption INTEGER NOT NULL DEFAULT 0,
    outcome_status TEXT NOT NULL DEFAULT 'ACTIVE',
    outcome_date TEXT,
    outcome_notes TEXT,
    media_references TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT,
    FOREIGN KEY (shelter_id) REFERENCES shelters(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_pets_shelter_outcome ON pets(shelter_id, outcome_status, deleted_at);
CREATE INDEX IF NOT EXISTS idx_pets_shelter_species ON pets(shelter_id, species);
CREATE INDEX IF NOT EXISTS idx_pets_search ON pets(shelter_id, name COLLATE NOCASE);

CREATE TABLE IF NOT EXISTS adopter_details (
    id TEXT PRIMARY KEY NOT NULL,
    shelter_id TEXT NOT NULL,
    pet_id TEXT NOT NULL UNIQUE,
    adopter_name TEXT NOT NULL,
    adopter_phone TEXT NOT NULL,
    adopter_address TEXT NOT NULL,
    adopted_at TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (shelter_id) REFERENCES shelters(id) ON DELETE CASCADE,
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_adopter_shelter ON adopter_details(shelter_id);

CREATE TABLE IF NOT EXISTS shadow_records (
    id TEXT PRIMARY KEY NOT NULL,
    origin_shelter_id TEXT NOT NULL,
    destination_shelter_id TEXT NOT NULL,
    origin_pet_id TEXT NOT NULL,
    destination_pet_id TEXT NOT NULL,
    transferred_at TEXT NOT NULL,
    snapshot_payload_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (origin_shelter_id) REFERENCES shelters(id) ON DELETE RESTRICT,
    FOREIGN KEY (destination_shelter_id) REFERENCES shelters(id) ON DELETE RESTRICT,
    FOREIGN KEY (origin_pet_id) REFERENCES pets(id) ON DELETE RESTRICT,
    FOREIGN KEY (destination_pet_id) REFERENCES pets(id) ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS idx_shadow_origin ON shadow_records(origin_shelter_id, origin_pet_id);
CREATE INDEX IF NOT EXISTS idx_shadow_dest ON shadow_records(destination_shelter_id, destination_pet_id);

CREATE TABLE IF NOT EXISTS vet_clinics (
    id TEXT PRIMARY KEY NOT NULL,
    shelter_id TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT NOT NULL,
    emergency_services INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT,
    FOREIGN KEY (shelter_id) REFERENCES shelters(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_vet_clinics_shelter ON vet_clinics(shelter_id, name COLLATE NOCASE);

CREATE TABLE IF NOT EXISTS veterinarians (
    id TEXT PRIMARY KEY NOT NULL,
    shelter_id TEXT NOT NULL,
    clinic_id TEXT NOT NULL,
    name TEXT NOT NULL,
    license_number TEXT,
    phone TEXT,
    email TEXT,
    specialty TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT,
    FOREIGN KEY (shelter_id) REFERENCES shelters(id) ON DELETE CASCADE,
    FOREIGN KEY (clinic_id) REFERENCES vet_clinics(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_vets_shelter_clinic ON veterinarians(shelter_id, clinic_id);

CREATE TABLE IF NOT EXISTS vet_appointments (
    id TEXT PRIMARY KEY NOT NULL,
    shelter_id TEXT NOT NULL,
    pet_id TEXT NOT NULL,
    clinic_id TEXT NOT NULL,
    veterinarian_id TEXT,
    appointment_date TEXT NOT NULL,
    reason TEXT NOT NULL,
    diagnosis TEXT,
    prognosis TEXT,
    is_retroactive INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT,
    FOREIGN KEY (shelter_id) REFERENCES shelters(id) ON DELETE CASCADE,
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
    FOREIGN KEY (clinic_id) REFERENCES vet_clinics(id) ON DELETE RESTRICT,
    FOREIGN KEY (veterinarian_id) REFERENCES veterinarians(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_appointments_pet ON vet_appointments(shelter_id, pet_id, appointment_date DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON vet_appointments(shelter_id, appointment_date);

CREATE TABLE IF NOT EXISTS vet_documents (
    id TEXT PRIMARY KEY NOT NULL,
    shelter_id TEXT NOT NULL,
    appointment_id TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    local_relative_path TEXT NOT NULL,
    sha256_checksum TEXT NOT NULL,
    uploaded_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (shelter_id) REFERENCES shelters(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES vet_appointments(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_vet_docs_appt ON vet_documents(shelter_id, appointment_id);

CREATE TABLE IF NOT EXISTS care_events (
    id TEXT PRIMARY KEY NOT NULL,
    shelter_id TEXT NOT NULL,
    pet_id TEXT NOT NULL,
    linked_appointment_id TEXT,
    modality TEXT NOT NULL,
    substance_name TEXT,
    dosage TEXT,
    administration_instructions TEXT,
    recurrence_interval_unit TEXT,
    recurrence_interval_value INTEGER DEFAULT 0,
    start_date TEXT NOT NULL,
    end_date TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (shelter_id) REFERENCES shelters(id) ON DELETE CASCADE,
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
    FOREIGN KEY (linked_appointment_id) REFERENCES vet_appointments(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_care_events_pet ON care_events(shelter_id, pet_id, status);

CREATE TABLE IF NOT EXISTS care_event_occurrences (
    id TEXT PRIMARY KEY NOT NULL,
    shelter_id TEXT NOT NULL,
    care_event_id TEXT NOT NULL,
    pet_id TEXT NOT NULL,
    due_date TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'SCHEDULED',
    administered_at TEXT,
    administered_by_operator_name TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (shelter_id) REFERENCES shelters(id) ON DELETE CASCADE,
    FOREIGN KEY (care_event_id) REFERENCES care_events(id) ON DELETE CASCADE,
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_occurrences_due ON care_event_occurrences(shelter_id, status, due_date ASC);
CREATE INDEX IF NOT EXISTS idx_occurrences_pet ON care_event_occurrences(shelter_id, pet_id, due_date);

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY NOT NULL,
    shelter_id TEXT,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    actor_contact TEXT,
    payload_diff_json TEXT,
    ip_or_device_id TEXT NOT NULL,
    created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_shelter_entity ON audit_logs(shelter_id, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
`;

export function createTestDatabase(inMemory = true) {
  const sqlite = new Database(inMemory ? ':memory:' : undefined);
  sqlite.exec(SQL_DDL);
  const db = drizzle(sqlite, { schema });
  return { db, sqlite };
}
