import type { IPetRepository } from "../../../src/core/contracts/pet-repository.js";
import type { ICareEventRepository } from "../../../src/core/contracts/care-event-repository.js";

export interface DashboardOverview {
  totalActivePets: number;
  petsInTreatment: number;
  petsInFoster: number;
  dueCareEvents: number;
  overdueCareEvents: number;
}

export class DashboardService {
  constructor(
    private readonly petRepo: IPetRepository,
    private readonly careEventRepo: ICareEventRepository
  ) {}

  async getOverview(
    shelterId: string,
    referenceTime: string = new Date().toISOString()
  ): Promise<DashboardOverview> {
    const pets = await this.petRepo.search(shelterId);
    const activePets = pets.filter((p) => !p.isArchived);

    const petsInTreatment = activePets.filter(
      (p) => p.healthStatus === "In Treatment" || (p.healthStatus as string) === "InTreatment"
    ).length;

    const petsInFoster = activePets.filter(
      (p) => p.outcomeStatus === "In Foster"
    ).length;

    const dueOccurrences = await this.careEventRepo.listDueOccurrences(
      shelterId,
      referenceTime
    );

    const refTime = new Date(referenceTime).getTime();
    const overdueOccurrences = dueOccurrences.filter(
      (o) => new Date(o.dueDate).getTime() < refTime
    );

    return {
      totalActivePets: activePets.length,
      petsInTreatment,
      petsInFoster,
      dueCareEvents: dueOccurrences.length,
      overdueCareEvents: overdueOccurrences.length,
    };
  }
}
