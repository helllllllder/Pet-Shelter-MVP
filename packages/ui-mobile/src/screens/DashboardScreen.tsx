import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useShelterStore } from "../stores/shelter-store.js";

export const DashboardScreen: React.FC = () => {
  const activeShelter = useShelterStore((state) => state.getActiveShelter());

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
          <Text style={styles.kpiValue}>0</Text>
          <Text style={styles.kpiLabel}>Total Active Pets</Text>
        </View>
        <View style={[styles.kpiCard, { borderLeftColor: "#10b981" }]}>
          <Text style={styles.kpiValue}>0</Text>
          <Text style={styles.kpiLabel}>Pets in Treatment</Text>
        </View>
        <View style={[styles.kpiCard, { borderLeftColor: "#f59e0b" }]}>
          <Text style={styles.kpiValue}>0</Text>
          <Text style={styles.kpiLabel}>In Foster</Text>
        </View>
        <View style={[styles.kpiCard, { borderLeftColor: "#ef4444" }]}>
          <Text style={styles.kpiValue}>0</Text>
          <Text style={styles.kpiLabel}>Due Care Events</Text>
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
