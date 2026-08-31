import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useShelterStore } from "../stores/shelter-store.js";

export interface ShelterHeaderProps {
  onOpenSwitcher?: () => void;
  onOpenDrawer?: () => void;
}

export const ShelterHeader: React.FC<ShelterHeaderProps> = ({
  onOpenSwitcher,
  onOpenDrawer,
}) => {
  const activeShelter = useShelterStore((state) => state.getActiveShelter());

  return (
    <View style={styles.headerContainer}>
      {onOpenDrawer && (
        <TouchableOpacity
          style={styles.menuButton}
          onPress={onOpenDrawer}
          accessibilityLabel="Open Navigation Menu"
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.shelterSelector}
        onPress={onOpenSwitcher}
        accessibilityLabel="Switch Shelter Context"
      >
        <Text style={styles.shelterLabel}>Shelter Context</Text>
        <View style={styles.shelterRow}>
          <Text style={styles.shelterName} numberOfLines={1}>
            {activeShelter ? activeShelter.name : "No Shelter Selected"}
          </Text>
          <Text style={styles.dropdownIcon}>▼</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.badgeContainer}>
        <View style={styles.offlineDot} />
        <Text style={styles.badgeText}>Offline</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  menuButton: {
    padding: 8,
    marginRight: 8,
  },
  menuIcon: {
    fontSize: 20,
    color: "#374151",
  },
  shelterSelector: {
    flex: 1,
    paddingVertical: 4,
  },
  shelterLabel: {
    fontSize: 10,
    color: "#6b7280",
    textTransform: "uppercase",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  shelterRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  shelterName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    maxWidth: 220,
  },
  dropdownIcon: {
    fontSize: 10,
    color: "#6b7280",
    marginLeft: 6,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  offlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10b981",
    marginRight: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#374151",
  },
});
