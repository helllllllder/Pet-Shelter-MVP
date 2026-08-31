import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { ShelterHeader } from "./ShelterHeader";
import { ShelterSwitcherModal } from "./ShelterSwitcherModal";
import { CreateShelterModal } from "./CreateShelterModal";
import { OnboardingWizardModal } from "./OnboardingWizardModal";
import { DrawerContent } from "./DrawerContent";
import { NAVIGATION_ROUTES } from "../navigation";
import { DashboardScreen } from "../screens/DashboardScreen";
import { PetsListScreen } from "../screens/PetsListScreen";
import { PetDetailScreen } from "../screens/PetDetailScreen";
import { PetRegisterScreen } from "../screens/PetRegisterScreen";
import { VetDirectoryScreen } from "../screens/VetDirectoryScreen";
import { CareScheduleScreen } from "../screens/CareScheduleScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { useOperatorStore } from "../stores/operator-store";
import { useShelterStore } from "../stores/shelter-store";
import { usePetStore } from "../stores/pet-store";

export interface AppShellProps {
  initialRoute?: string;
  onCreateNewShelter?: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  initialRoute = NAVIGATION_ROUTES.DASHBOARD,
  onCreateNewShelter,
}) => {
  const profile = useOperatorStore((state) => state.profile);
  const shelters = useShelterStore((state) => state.shelters);
  const setSelectedPetId = usePetStore((state) => state.setSelectedPetId);

  const [currentRoute, setCurrentRoute] = useState(initialRoute);
  const [switcherVisible, setSwitcherVisible] = useState(false);
  const [createShelterVisible, setCreateShelterVisible] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Show onboarding wizard if operator profile or shelters don't exist yet
  const needsOnboarding = !profile || shelters.length === 0;
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);

  const handleNavigate = (route: string) => {
    setCurrentRoute(route);
    setDrawerOpen(false);
  };

  const handleSelectPet = (petId: string) => {
    setSelectedPetId(petId);
    setCurrentRoute(NAVIGATION_ROUTES.PET_DETAIL);
  };

  const renderCurrentScreen = () => {
    switch (currentRoute) {
      case NAVIGATION_ROUTES.PETS:
        return (
          <PetsListScreen
            onSelectPet={handleSelectPet}
            onOpenRegister={() => setCurrentRoute(NAVIGATION_ROUTES.PET_REGISTER)}
          />
        );
      case NAVIGATION_ROUTES.PET_DETAIL:
        return (
          <PetDetailScreen
            onBack={() => setCurrentRoute(NAVIGATION_ROUTES.PETS)}
          />
        );
      case NAVIGATION_ROUTES.PET_REGISTER:
        return (
          <PetRegisterScreen
            onSuccess={() => setCurrentRoute(NAVIGATION_ROUTES.PETS)}
          />
        );
      case NAVIGATION_ROUTES.VETERINARY:
        return <VetDirectoryScreen />;
      case NAVIGATION_ROUTES.CARE_SCHEDULE:
        return <CareScheduleScreen />;
      case NAVIGATION_ROUTES.PROFILE:
        return <ProfileScreen />;
      case NAVIGATION_ROUTES.DASHBOARD:
      default:
        return (
          <DashboardScreen
            onNavigateToPets={() => setCurrentRoute(NAVIGATION_ROUTES.PETS)}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      <ShelterHeader
        onOpenSwitcher={() => setSwitcherVisible(true)}
        onOpenDrawer={() => setDrawerOpen(!drawerOpen)}
      />

      <View style={styles.body}>
        {drawerOpen ? (
          <DrawerContent
            currentRoute={currentRoute}
            onNavigate={handleNavigate}
            onOpenShelterSwitcher={() => {
              setDrawerOpen(false);
              setSwitcherVisible(true);
            }}
          />
        ) : (
          renderCurrentScreen()
        )}
      </View>

      <ShelterSwitcherModal
        visible={switcherVisible}
        onClose={() => setSwitcherVisible(false)}
        onCreateNewShelter={
          onCreateNewShelter || (() => setCreateShelterVisible(true))
        }
      />

      <CreateShelterModal
        visible={createShelterVisible}
        onClose={() => setCreateShelterVisible(false)}
      />

      <OnboardingWizardModal
        visible={needsOnboarding && !onboardingDismissed}
        onComplete={() => setOnboardingDismissed(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  body: {
    flex: 1,
  },
});
