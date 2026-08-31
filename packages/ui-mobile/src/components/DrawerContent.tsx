import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { NAVIGATION_ROUTES } from "../navigation.js";
import { useShelterStore } from "../stores/shelter-store.js";
import { useOperatorStore } from "../stores/operator-store.js";

export interface DrawerContentProps {
  currentRoute?: string;
  onNavigate?: (route: string) => void;
  onOpenShelterSwitcher?: () => void;
}

export const DrawerContent: React.FC<DrawerContentProps> = ({
  currentRoute = NAVIGATION_ROUTES.DASHBOARD,
  onNavigate,
  onOpenShelterSwitcher,
}) => {
  const activeShelter = useShelterStore((state) => state.getActiveShelter());
  const operatorProfile = useOperatorStore((state) => state.profile);

  const menuItems = [
    { key: NAVIGATION_ROUTES.DASHBOARD, label: "Dashboard", icon: "📊" },
    { key: NAVIGATION_ROUTES.PETS, label: "Pet Profiles", icon: "🐾" },
    { key: NAVIGATION_ROUTES.VETERINARY, label: "Veterinary Directory", icon: "🏥" },
    { key: NAVIGATION_ROUTES.CARE_SCHEDULE, label: "Care Events", icon: "💊" },
    { key: NAVIGATION_ROUTES.PROFILE, label: "Operator & Settings", icon: "⚙️" },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.operatorHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {operatorProfile?.name ? operatorProfile.name.charAt(0).toUpperCase() : "👤"}
          </Text>
        </View>
        <View style={styles.operatorInfo}>
          <Text style={styles.operatorName}>
            {operatorProfile?.name || "Local Operator"}
          </Text>
          <Text style={styles.operatorEmail}>
            {operatorProfile?.email || "Offline Mode"}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.shelterCard}
        onPress={onOpenShelterSwitcher}
        accessibilityLabel="Change Shelter Context"
      >
        <Text style={styles.shelterLabel}>Shelter Context</Text>
        <Text style={styles.shelterName} numberOfLines={1}>
          {activeShelter ? activeShelter.name : "No Shelter Selected"}
        </Text>
        <Text style={styles.switchHint}>Tap to switch shelter ⇄</Text>
      </TouchableOpacity>

      <View style={styles.navSection}>
        {menuItems.map((item) => {
          const isActive = currentRoute === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.navItem, isActive && styles.activeNavItem]}
              onPress={() => onNavigate?.(item.key)}
              accessibilityLabel={item.label}
            >
              <Text style={styles.navIcon}>{item.icon}</Text>
              <Text style={[styles.navLabel, isActive && styles.activeNavLabel]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Luna's Pet Central v1.0 (Offline MVP)</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  contentContainer: {
    padding: 20,
    flexGrow: 1,
  },
  operatorHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    color: "#ffffff",
    fontWeight: "bold",
  },
  operatorInfo: {
    flex: 1,
  },
  operatorName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  operatorEmail: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  shelterCard: {
    backgroundColor: "#f0fdf4",
    borderColor: "#86efac",
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  shelterLabel: {
    fontSize: 10,
    color: "#15803d",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  shelterName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#166534",
    marginTop: 2,
  },
  switchHint: {
    fontSize: 11,
    color: "#22c55e",
    marginTop: 4,
  },
  navSection: {
    flex: 1,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  activeNavItem: {
    backgroundColor: "#eff6ff",
  },
  navIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  navLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#4b5563",
  },
  activeNavLabel: {
    color: "#1d4ed8",
    fontWeight: "bold",
  },
  footer: {
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    alignItems: "center",
  },
  footerText: {
    fontSize: 11,
    color: "#9ca3af",
  },
});
