import type { IOperatorRepository } from "./operator-repository.js";
import type { IShelterRepository } from "./shelter-repository.js";
import type { IPetRepository } from "./pet-repository.js";
import type { IVetDirectoryRepository } from "./vet-directory-repository.js";
import type { IAppointmentRepository } from "./appointment-repository.js";
import type { ICareEventRepository } from "./care-event-repository.js";
import type { IAuditLogRepository } from "./audit-log-repository.js";

export interface IRepositoryFactory {
  operatorRepo: IOperatorRepository;
  shelterRepo: IShelterRepository;
  petRepo: IPetRepository;
  vetDirectoryRepo: IVetDirectoryRepository;
  appointmentRepo: IAppointmentRepository;
  careEventRepo: ICareEventRepository;
  auditLogRepo: IAuditLogRepository;
}
