import { describe, it, expect, beforeEach } from "vitest";
import { useShelterStore } from "../packages/ui-mobile/src/stores/shelter-store.js";
import { useOperatorStore } from "../packages/ui-mobile/src/stores/operator-store.js";
import { NAVIGATION_ROUTES, type RootDrawerParamList } from "../packages/ui-mobile/src/navigation.js";

describe("Mobile UI Shell & Navigation (Ticket T06 / #27)", () => {
  beforeEach(() => {
    useShelterStore.setState({
      shelters: [],
      activeShelterId: null,
    });
    useOperatorStore.setState({
      profile: null,
      isConfigured: false,
    });
  });

  describe("1. Shelter Store & Context Switching (User Stories 5-9)", () => {
    it("should initialize with empty shelters and null active shelter", () => {
      const state = useShelterStore.getState();
      expect(state.shelters).toEqual([]);
      expect(state.activeShelterId).toBeNull();
      expect(state.getActiveShelter()).toBeNull();
    });

    it("should add shelters and set newly created shelter as active context automatically (US 6)", () => {
      const { addShelter } = useShelterStore.getState();

      addShelter({
        id: "shelter-1",
        name: "Sunny Meadows Shelter",
        description: "Main Shelter",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      let state = useShelterStore.getState();
      expect(state.shelters).toHaveLength(1);
      expect(state.activeShelterId).toBe("shelter-1");
      expect(state.getActiveShelter()?.name).toBe("Sunny Meadows Shelter");

      // Adding a second shelter automatically activates it per US 6
      addShelter({
        id: "shelter-2",
        name: "Riverdale Shelter",
        description: "East Shelter",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      state = useShelterStore.getState();
      expect(state.shelters).toHaveLength(2);
      expect(state.activeShelterId).toBe("shelter-2");
      expect(state.getActiveShelter()?.name).toBe("Riverdale Shelter");
    });

    it("should switch active shelter context immediately", () => {
      const { setShelters, setActiveShelter } = useShelterStore.getState();

      setShelters([
        {
          id: "shelter-a",
          name: "Shelter A",
          description: null,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "shelter-b",
          name: "Shelter B",
          description: null,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);

      setActiveShelter("shelter-b");

      const state = useShelterStore.getState();
      expect(state.activeShelterId).toBe("shelter-b");
      expect(state.getActiveShelter()?.name).toBe("Shelter B");
    });

    it("should update shelter details", () => {
      const { addShelter, updateShelter } = useShelterStore.getState();

      addShelter({
        id: "shelter-1",
        name: "Old Name",
        description: "Old Desc",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      updateShelter("shelter-1", { name: "Renamed Shelter", description: "New Desc" });

      const state = useShelterStore.getState();
      const shelter = state.getActiveShelter();
      expect(shelter?.name).toBe("Renamed Shelter");
      expect(shelter?.description).toBe("New Desc");
    });
  });

  describe("2. Operator Store & Initialization (User Stories 1-3)", () => {
    it("should manage operator profile and configuration status", () => {
      const { setProfile } = useOperatorStore.getState();

      expect(useOperatorStore.getState().isConfigured).toBe(false);

      setProfile({
        id: "op-1",
        name: "Helder Souza",
        email: "helder@example.com",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const state = useOperatorStore.getState();
      expect(state.isConfigured).toBe(true);
      expect(state.profile?.name).toBe("Helder Souza");
      expect(state.profile?.email).toBe("helder@example.com");

      // Clear profile
      setProfile(null);
      expect(useOperatorStore.getState().isConfigured).toBe(false);
    });
  });

  describe("3. Navigation Routes & Screen Definitions", () => {
    it("should define all primary application routes with exact keys", () => {
      expect(NAVIGATION_ROUTES.DASHBOARD).toBe("Dashboard");
      expect(NAVIGATION_ROUTES.PETS).toBe("Pets");
      expect(NAVIGATION_ROUTES.PET_DETAIL).toBe("PetDetail");
      expect(NAVIGATION_ROUTES.PET_REGISTER).toBe("PetRegister");
      expect(NAVIGATION_ROUTES.VETERINARY).toBe("Veterinary");
      expect(NAVIGATION_ROUTES.CARE_SCHEDULE).toBe("CareSchedule");
      expect(NAVIGATION_ROUTES.PROFILE).toBe("Profile");
    });
  });

  describe("4. Component Structure", () => {
    it("should export all shell components and screens", async () => {
      const components = await import("../packages/ui-mobile/src/index.js");
      expect(components.ShelterHeader).toBeDefined();
      expect(components.ShelterSwitcherModal).toBeDefined();
      expect(components.DrawerContent).toBeDefined();
      expect(components.AppShell).toBeDefined();
      expect(components.DashboardScreen).toBeDefined();
      expect(components.PetsListScreen).toBeDefined();
      expect(components.PetDetailScreen).toBeDefined();
      expect(components.PetRegisterScreen).toBeDefined();
      expect(components.VetDirectoryScreen).toBeDefined();
      expect(components.CareScheduleScreen).toBeDefined();
      expect(components.ProfileScreen).toBeDefined();
    });
  });
});
