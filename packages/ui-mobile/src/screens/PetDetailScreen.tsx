import React from "react";
import { View, Text, StyleSheet } from "react-native";

export interface PetDetailScreenProps {
  route?: { params?: { petId?: string } };
}

export const PetDetailScreen: React.FC<PetDetailScreenProps> = ({ route }) => {
  const petId = route?.params?.petId;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pet Profile</Text>
      <Text style={styles.subtitle}>Pet ID: {petId || "None specified"}</Text>
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
