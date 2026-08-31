import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useOperatorStore } from "../stores/operator-store";

export const ProfileScreen: React.FC = () => {
  const profile = useOperatorStore((state) => state.profile);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Operator Profile</Text>
      <Text style={styles.subtitle}>Manage operator contact information.</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{profile?.name || "Not set"}</Text>

        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{profile?.email || "Not set"}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  label: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "bold",
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    color: "#111827",
    marginTop: 2,
  },
});
