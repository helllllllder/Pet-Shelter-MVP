import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useShelterStore } from "../stores/shelter-store";
import { usePetStore } from "../stores/pet-store";

export interface DashboardOverviewData {
  totalActivePets?: number;
  petsInTreatment?: number;
  petsInFoster?: number;
  dueCareEvents?: number;
  overdueCareEvents?: number;
}

export interface DashboardScreenProps {
  overview?: DashboardOverviewData;
  onNavigateToPets?: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ overview }) => {
  const activeShelter = useShelterStore((state) => state.getActiveShelter());
  const pets = usePetStore((state) =>
    activeShelter ? state.getPetsForShelter(activeShelter.id) : []
  );

  const activePets = pets.filter((p) => p.status === "active" || p.status === "in_foster");
  const inTreatmentPets = pets.filter(
    (p) => p.healthStatus === "InTreatment" && p.status !== "archived"
  );
  const inFosterPets = pets.filter((p) => p.status === "in_foster");

  const totalActivePets = overview?.totalActivePets ?? activePets.length;
  const petsInTreatment = overview?.petsInTreatment ?? inTreatmentPets.length;
  const petsInFoster = overview?.petsInFoster ?? inFosterPets.length;
  const dueCareEvents = overview?.dueCareEvents ?? 0;
  const overdueCareEvents = overview?.overdueCareEvents ?? 0;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shelter Overview</Text>
        <Text style={styles.subtitle}>
          {activeShelter ? activeShelter.name : "No Shelter Selected"}
        </Text>
      </View>

      <View style={styles.grid}>
        <View style={[styles.kpiCard, { borderLeftColor: "#3b82f6" }]}>
          <Text style={styles.kpiValue}>{totalActivePets}</Text>
          <Text style={styles.kpiLabel}>Total Active Pets</Text>
        </View>
        <View style={[styles.kpiCard, { borderLeftColor: "#10b981" }]}>
          <Text style={styles.kpiValue}>{petsInTreatment}</Text>
          <Text style={styles.kpiLabel}>Pets in Treatment</Text>
        </View>
        <View style={[styles.kpiCard, { borderLeftColor: "#f59e0b" }]}>
          <Text style={styles.kpiValue}>{petsInFoster}</Text>
          <Text style={styles.kpiLabel}>In Foster</Text>
        </View>
        <View style={[styles.kpiCard, { borderLeftColor: "#6366f1" }]}>
          <Text style={styles.kpiValue}>{dueCareEvents}</Text>
          <Text style={styles.kpiLabel}>Due Care Events</Text>
        </View>
        <View style={[styles.kpiCard, { borderLeftColor: "#ef4444" }]}>
          <Text style={styles.kpiValue}>{overdueCareEvents}</Text>
          <Text style={styles.kpiLabel}>Overdue Care Events</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    padding: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  grid: {
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  kpiCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  kpiValue: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#111827",
  },
  kpiLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
    fontWeight: "500",
  },
});
