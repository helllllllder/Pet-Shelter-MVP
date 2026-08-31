import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const VetDirectoryScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Veterinary Directory</Text>
      <Text style={styles.subtitle}>Veterinary clinics and veterinarians.</Text>
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
  },
});
