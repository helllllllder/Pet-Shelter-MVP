import { describe, expect, it } from 'vitest';
import {
  PetLifecycleStateMachine,
  PetOutcome,
  PetStatus,
  LifecycleTransitionError,
} from './pet-lifecycle';

describe('PetLifecycleStateMachine', () => {
  const sm = new PetLifecycleStateMachine();

  describe('valid transitions', () => {
    it('allows Active -> In Foster', () => {
      const result = sm.transition(PetStatus.Active, PetOutcome.InFoster);
      expect(result.newStatus).toBe(PetStatus.InFoster);
      expect(result.sideEffects.clearAdoptionFlag).toBe(true);
      expect(result.sideEffects.cancelCareEvents).toBe(false);
    });

    it('allows In Foster -> Active', () => {
      const result = sm.transition(PetStatus.InFoster, PetOutcome.Active);
      expect(result.newStatus).toBe(PetStatus.Active);
      expect(result.sideEffects.clearAdoptionFlag).toBe(false);
      expect(result.sideEffects.cancelCareEvents).toBe(false);
    });

    it('allows Active -> Adopted', () => {
      const result = sm.transition(PetStatus.Active, PetOutcome.Adopted);
      expect(result.newStatus).toBe(PetStatus.Archived);
      expect(result.outcome).toBe(PetOutcome.Adopted);
      expect(result.sideEffects.clearAdoptionFlag).toBe(true);
      expect(result.sideEffects.cancelCareEvents).toBe(true);
    });

    it('allows In Foster -> Adopted', () => {
      const result = sm.transition(PetStatus.InFoster, PetOutcome.Adopted);
      expect(result.newStatus).toBe(PetStatus.Archived);
      expect(result.outcome).toBe(PetOutcome.Adopted);
    });

    it('allows Active -> Deceased', () => {
      const result = sm.transition(PetStatus.Active, PetOutcome.Deceased);
      expect(result.newStatus).toBe(PetStatus.Archived);
      expect(result.outcome).toBe(PetOutcome.Deceased);
      expect(result.sideEffects.cancelCareEvents).toBe(true);
    });

    it('allows Active -> TransferredExternal', () => {
      const result = sm.transition(PetStatus.Active, PetOutcome.TransferredExternal);
      expect(result.newStatus).toBe(PetStatus.Archived);
      expect(result.outcome).toBe(PetOutcome.TransferredExternal);
      expect(result.sideEffects.cancelCareEvents).toBe(true);
    });
  });

  describe('invalid transitions', () => {
    it('rejects Adopted -> Active', () => {
      expect(() => sm.transition(PetStatus.Archived, PetOutcome.Active)).toThrow(LifecycleTransitionError);
    });

    it('rejects Deceased -> Active', () => {
      expect(() => sm.transition(PetStatus.Archived, PetOutcome.Active)).toThrow(LifecycleTransitionError);
    });

    it('rejects Archived -> In Foster', () => {
      expect(() => sm.transition(PetStatus.Archived, PetOutcome.InFoster)).toThrow(LifecycleTransitionError);
    });

    it('rejects Active -> Adopted when already adopted', () => {
      // Simulate already-archived state
      sm.transition(PetStatus.Active, PetOutcome.Adopted);
      expect(() => sm.transition(PetStatus.Archived, PetOutcome.Adopted)).toThrow(LifecycleTransitionError);
    });
  });

  describe('side effects', () => {
    it('clears adoption flag on all archived transitions', () => {
      for (const outcome of [PetOutcome.Adopted, PetOutcome.Deceased, PetOutcome.TransferredExternal]) {
        const sm2 = new PetLifecycleStateMachine();
        const result = sm2.transition(PetStatus.Active, outcome);
        expect(result.sideEffects.clearAdoptionFlag).toBe(true);
      }
    });

    it('triggers care event cancel on terminal outcomes', () => {
      for (const outcome of [PetOutcome.Adopted, PetOutcome.Deceased, PetOutcome.TransferredExternal]) {
        const sm2 = new PetLifecycleStateMachine();
        const result = sm2.transition(PetStatus.Active, outcome);
        expect(result.sideEffects.cancelCareEvents).toBe(true);
      }
    });

    it('does not trigger care event cancel on foster toggle', () => {
      const sm2 = new PetLifecycleStateMachine();
      const result = sm2.transition(PetStatus.Active, PetOutcome.InFoster);
      expect(result.sideEffects.cancelCareEvents).toBe(false);
    });
  });

  describe('error message', () => {
    it('provides descriptive error for invalid transition', () => {
      try {
        sm.transition(PetStatus.Archived, PetOutcome.Active);
      } catch (e) {
        expect(e).toBeInstanceOf(LifecycleTransitionError);
        expect((e as LifecycleTransitionError).message).toContain('Active');
      }
    });
  });
});
