import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useOperatorStore } from "../stores/operator-store";
import { useShelterStore } from "../stores/shelter-store";

export interface OnboardingWizardModalProps {
  visible: boolean;
  onComplete: () => void;
}

export const OnboardingWizardModal: React.FC<OnboardingWizardModalProps> = ({
  visible,
  onComplete,
}) => {
  const setProfile = useOperatorStore((state) => state.setProfile);
  const addShelter = useShelterStore((state) => state.addShelter);

  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Operator fields
  const [operatorName, setOperatorName] = useState("");
  const [operatorEmail, setOperatorEmail] = useState("");

  // Step 2: Shelter fields
  const [shelterName, setShelterName] = useState("");
  const [shelterDescription, setShelterDescription] = useState("");

  const handleNextStep = () => {
    if (!operatorName.trim()) {
      Alert.alert("Required", "Please enter your name as the operator.");
      return;
    }
    if (!operatorEmail.trim()) {
      Alert.alert("Required", "Please enter your contact email.");
      return;
    }
    setStep(2);
  };

  const handleFinish = () => {
    if (!shelterName.trim()) {
      Alert.alert("Required", "Please enter a name for your initial shelter.");
      return;
    }

    const now = new Date().toISOString();

    // 1. Save operator profile
    setProfile({
      id: "op-" + Date.now(),
      name: operatorName.trim(),
      email: operatorEmail.trim(),
      createdAt: now,
      updatedAt: now,
    });

    // 2. Save shelter and set as active context
    addShelter({
      id: "shelter-" + Date.now(),
      name: shelterName.trim(),
      description: shelterDescription.trim() || null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    onComplete();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logoBadge}>🐾 Luna's Pet Central</Text>
            <Text style={styles.stepTitle}>
              {step === 1 ? "Step 1: Operator Setup" : "Step 2: Shelter Setup"}
            </Text>
            <Text style={styles.stepSubtitle}>
              {step === 1
                ? "Configure your device operator profile to manage shelters and records."
                : "Create your primary shelter facility to start registering animals."}
            </Text>
          </View>

          {/* Form */}
          {step === 1 ? (
            <View style={styles.formSection}>
              <Text style={styles.label}>Operator Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Jane Doe"
                placeholderTextColor="#9ca3af"
                value={operatorName}
                onChangeText={setOperatorName}
                autoCapitalize="words"
              />

              <Text style={styles.label}>Operator Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. jane@shelter.org"
                placeholderTextColor="#9ca3af"
                value={operatorEmail}
                onChangeText={setOperatorEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TouchableOpacity style={styles.primaryButton} onPress={handleNextStep}>
                <Text style={styles.buttonText}>Continue to Shelter Setup →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.formSection}>
              <Text style={styles.label}>Shelter Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Happy Paws Sanctuary"
                placeholderTextColor="#9ca3af"
                value={shelterName}
                onChangeText={setShelterName}
                autoCapitalize="words"
              />

              <Text style={styles.label}>Shelter Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="e.g. Main adoption center and rescue facility"
                placeholderTextColor="#9ca3af"
                value={shelterDescription}
                onChangeText={setShelterDescription}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity style={styles.primaryButton} onPress={handleFinish}>
                <Text style={styles.buttonText}>Complete Setup & Enter Shelter 🚀</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => setStep(1)}
              >
                <Text style={styles.secondaryButtonText}>← Back to Operator Info</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContent: {
    padding: 24,
    paddingTop: 48,
    flexGrow: 1,
  },
  header: {
    marginBottom: 32,
  },
  logoBadge: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2563eb",
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  stepSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 6,
    lineHeight: 20,
  },
  formSection: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 28,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  secondaryButtonText: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "500",
  },
});
