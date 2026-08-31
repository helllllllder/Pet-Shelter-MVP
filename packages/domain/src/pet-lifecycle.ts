/**
 * Pet lifecycle state machine implementing the full transition graph.
 */

export enum PetStatus {
  Active = 'active',
  InFoster = 'in_foster',
  Archived = 'archived',
}

export enum PetOutcome {
  Active = 'active',
  InFoster = 'in_foster',
  Adopted = 'adopted',
  Deceased = 'deceased',
  TransferredExternal = 'transferred_external',
}

export interface LifecycleSideEffects {
  clearAdoptionFlag: boolean;
  cancelCareEvents: boolean;
}

export interface LifecycleTransitionResult {
  newStatus: PetStatus;
  outcome?: PetOutcome;
  sideEffects: LifecycleSideEffects;
}

export class LifecycleTransitionError extends Error {
  constructor(from: PetStatus, to: PetOutcome) {
    const fromLabel = from.charAt(0).toUpperCase() + from.slice(1);
    const toLabel = to.charAt(0).toUpperCase() + to.slice(1);
    super(`Cannot transition pet from ${fromLabel} to ${toLabel}`);
    this.name = 'LifecycleTransitionError';
  }
}

/** Valid transitions: fromStatus -> Set of allowed outcomes */
const VALID_TRANSITIONS: Readonly<Record<PetStatus, Set<PetOutcome>>> = {
  [PetStatus.Active]: new Set([
    PetOutcome.Active,
    PetOutcome.InFoster,
    PetOutcome.Adopted,
    PetOutcome.Deceased,
    PetOutcome.TransferredExternal,
  ]),
  [PetStatus.InFoster]: new Set([
    PetOutcome.Active,
    PetOutcome.InFoster,
    PetOutcome.Adopted,
    PetOutcome.Deceased,
    PetOutcome.TransferredExternal,
  ]),
  [PetStatus.Archived]: new Set(), // No transitions from archived
};

const TERMINAL_OUTCOMES = new Set([
  PetOutcome.Adopted,
  PetOutcome.Deceased,
  PetOutcome.TransferredExternal,
]);

export class PetLifecycleStateMachine {
  transition(from: PetStatus, outcome: PetOutcome): LifecycleTransitionResult {
    const allowed = VALID_TRANSITIONS[from];

    if (!allowed || !allowed.has(outcome)) {
      throw new LifecycleTransitionError(from, outcome);
    }

    // Foster toggle: Active -> InFoster clears adoption flag (animal offsite)
    if (outcome === PetOutcome.InFoster && from === PetStatus.Active) {
      return {
        newStatus: PetStatus.InFoster,
        outcome: PetOutcome.InFoster,
        sideEffects: { clearAdoptionFlag: true, cancelCareEvents: false },
      };
    }

    // Return from foster: InFoster -> Active
    if (outcome === PetOutcome.Active && from === PetStatus.InFoster) {
      return {
        newStatus: PetStatus.Active,
        outcome: PetOutcome.Active,
        sideEffects: { clearAdoptionFlag: false, cancelCareEvents: false },
      };
    }

    // Terminal outcomes → archived
    if (TERMINAL_OUTCOMES.has(outcome)) {
      return {
        newStatus: PetStatus.Archived,
        outcome,
        sideEffects: { clearAdoptionFlag: true, cancelCareEvents: true },
      };
    }

    // Active staying active (no status change)
    return {
      newStatus: from,
      outcome,
      sideEffects: { clearAdoptionFlag: false, cancelCareEvents: false },
    };
  }
}
