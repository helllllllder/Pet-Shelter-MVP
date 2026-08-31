export type IntakeOrigin =
  | "STREET_RESCUE"
  | "OWNER_SURRENDER"
  | "TRANSFER"
  | "BORN_AT_SHELTER"
  | "OTHER";

export type HealthStatus = "Healthy" | "In Treatment" | "Recovering";

export type PetOutcomeStatus =
  | "In Foster"
  | "Adopted"
  | "Deceased"
  | "Transferred (External)"
  | "Transferred (Internal)";

export type PetSex = "Male" | "Female" | "Unknown";

export type MediaType = "PHOTO" | "VIDEO";

export type CareModality =
  | "Vaccine"
  | "Vermifuge"
  | "Medication"
  | "Physical Therapy"
  | "Grooming"
  | "Other";

export type RecurrenceIntervalUnit = "hours" | "days" | "months" | "years";

export type CareEventStatus = "SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export type CareOccurrenceStatus = "PENDING" | "COMPLETED" | "SKIPPED" | "CANCELLED";

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "ARCHIVE"
  | "RESTORE"
  | "TRANSFER"
  | "ERASURE";

export type AuditActorType = "OPERATOR" | "SYSTEM";
