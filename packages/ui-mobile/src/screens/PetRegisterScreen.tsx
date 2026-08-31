import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { useShelterStore } from "../stores/shelter-store";
import { usePetStore } from "../stores/pet-store";

export interface PetRegisterScreenProps {
  onSuccess?: () => void;
}

export const PetRegisterScreen: React.FC<PetRegisterScreenProps> = ({ onSuccess }) => {
  const activeShelter = useShelterStore((state) => state.getActiveShelter());
  const addPet = usePetStore((state) => state.addPet);

  const [name, setName] = useState("");
  const [species, setSpecies] = useState<"Dog" | "Cat">("Dog");
  const [breed, setBreed] = useState("");
  const [sex, setSex] = useState<"Male" | "Female">("Male");
  const [color, setColor] = useState("");
  const [dob, setDob] = useState("2023-01-01");
  const [estimatedDOB, setEstimatedDOB] = useState(false);
  const [intakeOrigin, setIntakeOrigin] = useState("StreetRescue");
  const [healthStatus, setHealthStatus] = useState<
    "Healthy" | "InTreatment" | "Critical" | "UnderObservation"
  >("Healthy");
  const [availableForAdoption, setAvailableForAdoption] = useState(true);

  const handleRegister = () => {
    if (!activeShelter) {
      Alert.alert("Error", "Please select or create an active shelter first.");
      return;
    }
    if (!name.trim()) {
      Alert.alert("Validation", "Pet name is required.");
      return;
    }
    if (!dob.trim()) {
      Alert.alert("Validation", "Date of birth (YYYY-MM-DD) is required.");
      return;
    }

    const now = new Date().toISOString();
    const newPet = {
      id: "pet-" + Date.now(),
      shelterId: activeShelter.id,
      name: name.trim(),
      species,
      breed: breed.trim() || null,
      sex,
      color: color.trim() || null,
      dateOfBirth: dob.trim(),
      estimatedDOB,
      intakeOrigin,
      healthConditions: [],
      healthStatus,
      status: "active" as const,
      availableForAdoption,
      createdAt: now,
      updatedAt: now,
    };

    addPet(newPet);
    Alert.alert("Success", `${name} registered into ${activeShelter.name}!`);

    // Reset form
    setName("");
    setBreed("");
    setColor("");
    onSuccess?.();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Register New Pet</Text>
      <Text style={styles.subtitle}>
        Intake demographics for {activeShelter ? activeShelter.name : "Active Shelter"}
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Pet Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Buster"
          placeholderTextColor="#9ca3af"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Species *</Text>
        <View style={styles.segmentedRow}>
          <TouchableOpacity
            style={[styles.segmentBtn, species === "Dog" && styles.segmentBtnActive]}
            onPress={() => setSpecies("Dog")}
          >
            <Text
              style={[
                styles.segmentText,
                species === "Dog" && styles.segmentTextActive,
              ]}
            >
              🐶 Dog
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentBtn, species === "Cat" && styles.segmentBtnActive]}
            onPress={() => setSpecies("Cat")}
          >
            <Text
              style={[
                styles.segmentText,
                species === "Cat" && styles.segmentTextActive,
              ]}
            >
              🐱 Cat
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.twoColRow}>
          <View style={styles.col}>
            <Text style={styles.label}>Sex</Text>
            <View style={styles.segmentedRow}>
              <TouchableOpacity
                style={[styles.segmentBtn, sex === "Male" && styles.segmentBtnActive]}
                onPress={() => setSex("Male")}
              >
                <Text
                  style={[
                    styles.segmentText,
                    sex === "Male" && styles.segmentTextActive,
                  ]}
                >
                  Male
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentBtn,
                  sex === "Female" && styles.segmentBtnActive,
                ]}
                onPress={() => setSex("Female")}
              >
                <Text
                  style={[
                    styles.segmentText,
                    sex === "Female" && styles.segmentTextActive,
                  ]}
                >
                  Female
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Breed</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Beagle Mix"
              placeholderTextColor="#9ca3af"
              value={breed}
              onChangeText={setBreed}
            />
          </View>
        </View>

        <Text style={styles.label}>Color / Markings</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Tricolor / White Patch"
          placeholderTextColor="#9ca3af"
          value={color}
          onChangeText={setColor}
        />

        <Text style={styles.label}>Date of Birth (YYYY-MM-DD) *</Text>
        <TextInput
          style={styles.input}
          placeholder="2023-01-01"
          placeholderTextColor="#9ca3af"
          value={dob}
          onChangeText={setDob}
        />

        <View style={styles.switchRow}>
          <View style={styles.switchLabelContainer}>
            <Text style={styles.switchTitle}>Estimated Date of Birth</Text>
            <Text style={styles.switchSubtitle}>Exact birthdate is approximate/unknown</Text>
          </View>
          <Switch value={estimatedDOB} onValueChange={setEstimatedDOB} />
        </View>

        <Text style={styles.label}>Intake Origin</Text>
        <View style={styles.segmentedRow}>
          {[
            { key: "StreetRescue", label: "Street Rescue" },
            { key: "OwnerSurrender", label: "Surrender" },
            { key: "TransferFromAnotherShelter", label: "Transfer" },
          ].map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.segmentBtn,
                intakeOrigin === item.key && styles.segmentBtnActive,
              ]}
              onPress={() => setIntakeOrigin(item.key)}
            >
              <Text
                style={[
                  styles.segmentText,
                  intakeOrigin === item.key && styles.segmentTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Health Status</Text>
        <View style={styles.segmentedRow}>
          {(
            [
              "Healthy",
              "InTreatment",
              "Critical",
              "UnderObservation",
            ] as const
          ).map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.segmentBtn,
                healthStatus === status && styles.segmentBtnActive,
              ]}
              onPress={() => setHealthStatus(status)}
            >
              <Text
                style={[
                  styles.segmentText,
                  healthStatus === status && styles.segmentTextActive,
                ]}
              >
                {status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.switchRow}>
          <View style={styles.switchLabelContainer}>
            <Text style={styles.switchTitle}>Available for Adoption</Text>
            <Text style={styles.switchSubtitle}>Eligible for public adoption matchmaking</Text>
          </View>
          <Switch
            value={availableForAdoption}
            onValueChange={setAvailableForAdoption}
          />
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleRegister}>
          <Text style={styles.submitBtnText}>✓ Save & Register Pet</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  content: {
    padding: 20,
    paddingBottom: 40,
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
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  label: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#4b5563",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 14,
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111827",
  },
  segmentedRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  segmentBtn: {
    flex: 1,
    minWidth: 80,
    backgroundColor: "#f3f4f6",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  segmentBtnActive: {
    backgroundColor: "#eff6ff",
    borderColor: "#3b82f6",
    borderWidth: 1,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#4b5563",
  },
  segmentTextActive: {
    color: "#1d4ed8",
    fontWeight: "bold",
  },
  twoColRow: {
    flexDirection: "row",
    gap: 12,
  },
  col: {
    flex: 1,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f3f4f6",
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: 12,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  switchSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  submitBtn: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  submitBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
