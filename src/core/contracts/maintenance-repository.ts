import { MaintenanceTaskModel, MaintenanceStatus } from '../domain';

export interface IMaintenanceRepository {
  getById(id: string): Promise<MaintenanceTaskModel | null>;
  listTasks(status?: MaintenanceStatus): Promise<MaintenanceTaskModel[]>;
  createTask(data: Omit<MaintenanceTaskModel, 'id' | 'shelterId' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<MaintenanceTaskModel>;
  markCompleted(id: string, operatorName: string, notes?: string | null): Promise<MaintenanceTaskModel>;
  softDelete(id: string): Promise<void>;
}
