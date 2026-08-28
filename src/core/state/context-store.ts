import { create } from 'zustand';
import { ShelterModel } from '@core/domain';
import { IShelterRepository, IOperatorRepository, IShelterSession } from '@core/contracts';

export interface ActiveContextStore {
  activeShelterId: string | null;
  activeShelter: ShelterModel | null;
  activeSession: IShelterSession | null;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  isUnsavedModalVisible: boolean;
  pendingShelterId: string | null;

  // Actions
  initializeContext: (
    shelterRepo: IShelterRepository,
    operatorRepo: IOperatorRepository
  ) => Promise<void>;
  requestContextSwitch: (
    targetShelterId: string,
    shelterRepo: IShelterRepository,
    operatorRepo: IOperatorRepository,
    onCacheEvict?: () => void
  ) => Promise<boolean>;
  confirmContextSwitch: (
    shelterRepo: IShelterRepository,
    operatorRepo: IOperatorRepository,
    onCacheEvict?: () => void
  ) => Promise<void>;
  cancelContextSwitch: () => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  setActiveShelterDirect: (shelter: ShelterModel) => void;
}

export const useActiveContextStore = create<ActiveContextStore>((set, get) => ({
  activeShelterId: null,
  activeShelter: null,
  activeSession: null,
  isLoading: false,
  hasUnsavedChanges: false,
  isUnsavedModalVisible: false,
  pendingShelterId: null,

  initializeContext: async (shelterRepo, operatorRepo) => {
    set({ isLoading: true });
    try {
      const profile = await operatorRepo.getProfile();
      let activeShelter: ShelterModel | null = null;

      if (profile?.lastActiveShelterId) {
        activeShelter = await shelterRepo.getById(profile.lastActiveShelterId);
      }

      if (!activeShelter) {
        const allShelters = await shelterRepo.listAll();
        const firstActive = allShelters.find((s) => s.isActive);
        if (firstActive) {
          activeShelter = firstActive;
          await operatorRepo.updateLastActiveShelter(firstActive.id);
        }
      }

      if (activeShelter) {
        set({
          activeShelterId: activeShelter.id,
          activeShelter,
          activeSession: {
            activeShelterId: activeShelter.id,
            operatorId: profile?.id || 'local-operator',
          },
        });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  requestContextSwitch: async (targetShelterId, shelterRepo, operatorRepo, onCacheEvict) => {
    const { hasUnsavedChanges, activeShelterId } = get();

    if (targetShelterId === activeShelterId) {
      return true;
    }

    if (hasUnsavedChanges) {
      set({
        isUnsavedModalVisible: true,
        pendingShelterId: targetShelterId,
      });
      return false; // Paused awaiting user confirmation (TC-FR04-03)
    }

    // Direct switch
    set({ isLoading: true });
    try {
      if (onCacheEvict) {
        onCacheEvict();
      }

      const targetShelter = await shelterRepo.getById(targetShelterId);
      if (!targetShelter) {
        throw new Error(`Target shelter ${targetShelterId} not found.`);
      }

      await operatorRepo.updateLastActiveShelter(targetShelterId);

      const profile = await operatorRepo.getProfile();
      set({
        activeShelterId: targetShelter.id,
        activeShelter: targetShelter,
        activeSession: {
          activeShelterId: targetShelter.id,
          operatorId: profile?.id || 'local-operator',
        },
        hasUnsavedChanges: false,
        isUnsavedModalVisible: false,
        pendingShelterId: null,
      });
      return true;
    } finally {
      set({ isLoading: false });
    }
  },

  confirmContextSwitch: async (shelterRepo, operatorRepo, onCacheEvict) => {
    const { pendingShelterId } = get();
    if (!pendingShelterId) return;

    set({ isLoading: true, isUnsavedModalVisible: false, hasUnsavedChanges: false });
    try {
      if (onCacheEvict) {
        onCacheEvict();
      }

      const targetShelter = await shelterRepo.getById(pendingShelterId);
      if (!targetShelter) {
        throw new Error(`Target shelter ${pendingShelterId} not found.`);
      }

      await operatorRepo.updateLastActiveShelter(pendingShelterId);

      const profile = await operatorRepo.getProfile();
      set({
        activeShelterId: targetShelter.id,
        activeShelter: targetShelter,
        activeSession: {
          activeShelterId: targetShelter.id,
          operatorId: profile?.id || 'local-operator',
        },
        pendingShelterId: null,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  cancelContextSwitch: () => {
    set({
      isUnsavedModalVisible: false,
      pendingShelterId: null,
    });
  },

  setHasUnsavedChanges: (hasChanges: boolean) => {
    set({ hasUnsavedChanges: hasChanges });
  },

  setActiveShelterDirect: (shelter: ShelterModel) => {
    set({
      activeShelterId: shelter.id,
      activeShelter: shelter,
      activeSession: {
        activeShelterId: shelter.id,
        operatorId: 'local-operator',
      },
    });
  },
}));
