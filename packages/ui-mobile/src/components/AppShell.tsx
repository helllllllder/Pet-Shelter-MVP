import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { ShelterHeader } from "./ShelterHeader";
import { ShelterSwitcherModal } from "./ShelterSwitcherModal";
import { DrawerContent } from "./DrawerContent";
import { NAVIGATION_ROUTES } from "../navigation";
import { DashboardScreen } from "../screens/DashboardScreen";
import { PetsListScreen } from "../screens/PetsListScreen";
import { PetDetailScreen } from "../screens/PetDetailScreen";
import { PetRegisterScreen } from "../screens/PetRegisterScreen";
import { VetDirectoryScreen } from "../screens/VetDirectoryScreen";
import { CareScheduleScreen } from "../screens/CareScheduleScreen";
import { ProfileScreen } from "../screens/ProfileScreen";

export interface AppShellProps {
  initialRoute?: string;
  onCreateNewShelter?: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  initialRoute = NAVIGATION_ROUTES.DASHBOARD,
  onCreateNewShelter,
}) => {
  const [currentRoute, setCurrentRoute] = useState(initialRoute);
  const [switcherVisible, setSwitcherVisible] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleNavigate = (route: string) => {
    setCurrentRoute(route);
    setDrawerOpen(false);
  };

  const renderCurrentScreen = () => {
    switch (currentRoute) {
      case NAVIGATION_ROUTES.PETS:
        return <PetsListScreen />;
      case NAVIGATION_ROUTES.PET_DETAIL:
        return <PetDetailScreen />;
      case NAVIGATION_ROUTES.PET_REGISTER:
        return <PetRegisterScreen />;
      case NAVIGATION_ROUTES.VETERINARY:
        return <VetDirectoryScreen />;
      case NAVIGATION_ROUTES.CARE_SCHEDULE:
        return <CareScheduleScreen />;
      case NAVIGATION_ROUTES.PROFILE:
        return <ProfileScreen />;
      case NAVIGATION_ROUTES.DASHBOARD:
      default:
        return <DashboardScreen />;
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
        onCreateNewShelter={onCreateNewShelter}
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
