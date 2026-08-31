import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { useCareStore, type ModalityType } from "../stores/care-store";
import { useShelterStore } from "../stores/shelter-store";
import { usePetStore } from "../stores/pet-store";

export interface AddCareEventModalProps {
  visible: boolean;
  petId?: string | null;
  onClose: () => void;
}

export const AddCareEventModal: React.FC<AddCareEventModalProps> = ({
  visible,
  petId,
  onClose,
}) => {
  const shelters = useShelterStore((state) => state.shelters);
  const activeShelterId = useShelterStore((state) => state.activeShelterId);
  const activeShelter = shelters.find((s) => s.id === activeShelterId) ?? null;

  const allPets = usePetStore((state) => state.pets);
  const pets = activeShelter
    ? allPets.filter((p) => p.shelterId === activeShelter.id && p.status !== "archived")
    : [];

  const addCareEvent = useCareStore((state) => state.addCareEvent);

  const [selectedPetId, setSelectedPetId] = useState(petId || "");
  const [modality, setModality] = useState<ModalityType>("Vaccine");
  const [substance, setSubstance] = useState("");
  const [instructions, setInstructions] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("daily");
  const [interval, setInterval] = useState("1");
  const [temporaryEndDate, setTemporaryEndDate] = useState("");

  const effectivePetId = petId || selectedPetId || (pets.length > 0 ? pets[0].id : "");

  const handleSave = () => {
    if (!activeShelter) {
      Alert.alert("Error", "No active shelter context selected.");
      return;
    }
    if (!effectivePetId) {
      Alert.alert("Validation", "Please select a pet for this care event.");
      return;
    }
    if (!substance.trim()) {
      Alert.alert("Validation", "Substance or treatment name is required.");
      return;
    }
    if (!startDate.trim()) {
      Alert.alert("Validation", "Start date (YYYY-MM-DD) is required.");
      return;
    }

    const now = new Date().toISOString();
    const intervalNum = Math.max(1, parseInt(interval, 10) || 1);

    addCareEvent({
      id: "care-" + Date.now(),
      shelterId: activeShelter.id,
      petId: effectivePetId,
      modality,
      substance: substance.trim(),
      instructions: instructions.trim() || null,
      startDate: startDate.trim(),
      recurrenceRule: isRecurring
        ? {
            frequency,
            interval: intervalNum,
            count: 7,
            until: temporaryEndDate.trim() || undefined,
          }
        : null,
      temporaryEndDate: temporaryEndDate.trim() || null,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    // Reset fields
    setSubstance("");
    setInstructions("");
    setIsRecurring(false);
    setTemporaryEndDate("");
    onClose();
  };

  const targetPet = pets.find((p) => p.id === effectivePetId);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Schedule Care Event</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scroll}>
            {/* Pet Context */}
            {petId ? (
              <View style={styles.petBanner}>
                <Text style={styles.petBannerText}>
                  🐾 Pet: <Text style={styles.petBannerBold}>{targetPet?.name || "Selected Pet"}</Text>
                </Text>
              </View>
            ) : (
              <View>
                <Text style={styles.label}>Select Pet *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petChipsRow}>
                  {pets.map((p) => {
                    const isSelected = p.id === effectivePetId;
                    return (
                      <TouchableOpacity
                        key={p.id}
                        style={[styles.petChip, isSelected && styles.petChipActive]}
                        onPress={() => setSelectedPetId(p.id)}
                      >
                        <Text style={[styles.petChipText, isSelected && styles.petChipTextActive]}>
                          {p.species === "Dog" ? "🐶" : "🐱"} {p.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Modality */}
            <Text style={styles.label}>Modality (Care Type) *</Text>
            <View style={styles.segmentedRow}>
              {(["Vaccine", "Medication", "Vermifuge", "Grooming", "PhysicalTherapy"] as const).map(
                (m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.segmentBtn, modality === m && styles.segmentBtnActive]}
                    onPress={() => setModality(m)}
                  >
                    <Text style={[styles.segmentText, modality === m && styles.segmentTextActive]}>
                      {m === "Vaccine" ? "💉 Vaccine" : m === "Medication" ? "💊 Med" : m === "Vermifuge" ? "🪱 Vermifuge" : m === "Grooming" ? "✂️ Groom" : "🏃 Therapy"}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            {/* Substance */}
            <Text style={styles.label}>Substance / Treatment Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Rabies 3-Year, Amoxicillin 250mg, NexGard"
              placeholderTextColor="#9ca3af"
              value={substance}
              onChangeText={setSubstance}
            />

            {/* Instructions */}
            <Text style={styles.label}>Administration Instructions (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="e.g. 1 tablet every 12 hours with meal for 7 days"
              placeholderTextColor="#9ca3af"
              value={instructions}
              onChangeText={setInstructions}
              multiline
              numberOfLines={2}
            />

            {/* Start Date */}
            <Text style={styles.label}>Start Date (YYYY-MM-DD) *</Text>
            <TextInput
              style={styles.input}
              placeholder="2026-08-31"
              placeholderTextColor="#9ca3af"
              value={startDate}
              onChangeText={setStartDate}
            />

            {/* Recurring Care Toggle */}
            <View style={styles.switchRow}>
              <View style={styles.switchLabelContainer}>
                <Text style={styles.switchTitle}>Recurring Care Event</Text>
                <Text style={styles.switchSubtitle}>Repeats automatically at configured intervals</Text>
              </View>
              <Switch value={isRecurring} onValueChange={setIsRecurring} />
            </View>

            {isRecurring && (
              <View style={styles.recurringSection}>
                <Text style={styles.label}>Repeat Frequency</Text>
                <View style={styles.segmentedRow}>
                  {(["daily", "weekly", "monthly"] as const).map((freq) => (
                    <TouchableOpacity
                      key={freq}
                      style={[styles.segmentBtn, frequency === freq && styles.segmentBtnActive]}
                      onPress={() => setFrequency(freq)}
                    >
                      <Text style={[styles.segmentText, frequency === freq && styles.segmentTextActive]}>
                        Every {freq === "daily" ? "Day" : freq === "weekly" ? "Week" : "Month"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Temporary Treatment End Date (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 2026-09-07 (for a 7-day course)"
                  placeholderTextColor="#9ca3af"
                  value={temporaryEndDate}
                  onChangeText={setTemporaryEndDate}
                />
              </View>
            )}

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>✓ Schedule Care Event</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "92%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  closeBtn: {
    fontSize: 18,
    color: "#6b7280",
    padding: 4,
  },
  scroll: {
    paddingBottom: 24,
  },
  petBanner: {
    backgroundColor: "#eff6ff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  petBannerText: {
    fontSize: 14,
    color: "#1e40af",
  },
  petBannerBold: {
    fontWeight: "bold",
  },
  petChipsRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  petChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    marginRight: 8,
  },
  petChipActive: {
    backgroundColor: "#eff6ff",
    borderColor: "#3b82f6",
    borderWidth: 1,
  },
  petChipText: {
    fontSize: 12,
    color: "#4b5563",
    fontWeight: "500",
  },
  petChipTextActive: {
    color: "#1d4ed8",
    fontWeight: "bold",
  },
  label: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
    marginTop: 10,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    color: "#111827",
  },
  textArea: {
    minHeight: 50,
    textAlignVertical: "top",
  },
  segmentedRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  segmentBtn: {
    flex: 1,
    minWidth: 60,
    backgroundColor: "#f3f4f6",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  segmentBtnActive: {
    backgroundColor: "#eff6ff",
    borderColor: "#3b82f6",
    borderWidth: 1,
  },
  segmentText: {
    fontSize: 11,
    color: "#4b5563",
    fontWeight: "500",
  },
  segmentTextActive: {
    color: "#1d4ed8",
    fontWeight: "bold",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f3f4f6",
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: 10,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  switchSubtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  recurringSection: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  saveBtn: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  saveBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
  },
});
