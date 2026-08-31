import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useVetStore } from "../stores/vet-store";
import { useShelterStore } from "../stores/shelter-store";

export interface AddVetModalProps {
  visible: boolean;
  clinicId?: string | null;
  onClose: () => void;
}

export const AddVetModal: React.FC<AddVetModalProps> = ({
  visible,
  clinicId,
  onClose,
}) => {
  const shelters = useShelterStore((state) => state.shelters);
  const activeShelterId = useShelterStore((state) => state.activeShelterId);
  const activeShelter = shelters.find((s) => s.id === activeShelterId) ?? null;

  const clinics = useVetStore((state) =>
    activeShelter ? state.clinics.filter((c) => c.shelterId === activeShelter.id) : []
  );
  const addVeterinarian = useVetStore((state) => state.addVeterinarian);

  const [selectedClinicId, setSelectedClinicId] = useState(clinicId || "");
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [phone, setPhone] = useState("");

  const effectiveClinicId = clinicId || selectedClinicId || (clinics.length > 0 ? clinics[0].id : "");

  const handleSave = () => {
    if (!activeShelter) {
      Alert.alert("Error", "No active shelter selected.");
      return;
    }
    if (!effectiveClinicId) {
      Alert.alert("Validation", "Please select a clinic for this veterinarian.");
      return;
    }
    if (!name.trim()) {
      Alert.alert("Validation", "Veterinarian name is required.");
      return;
    }

    const now = new Date().toISOString();
    addVeterinarian({
      id: "vet-" + Date.now(),
      shelterId: activeShelter.id,
      clinicId: effectiveClinicId,
      name: name.trim(),
      specialization: specialization.trim() || null,
      licenseNumber: licenseNumber.trim() || null,
      phone: phone.trim() || null,
      createdAt: now,
      updatedAt: now,
    });

    setName("");
    setSpecialization("");
    setLicenseNumber("");
    setPhone("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Add Attending Veterinarian</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Veterinarian Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Dr. Emily Thorne, DVM"
            placeholderTextColor="#9ca3af"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Specialization</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Surgery, Feline Internal Medicine, Dental"
            placeholderTextColor="#9ca3af"
            value={specialization}
            onChangeText={setSpecialization}
          />

          <Text style={styles.label}>License Number (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. VET-CA-88492"
            placeholderTextColor="#9ca3af"
            value={licenseNumber}
            onChangeText={setLicenseNumber}
          />

          <Text style={styles.label}>Direct Phone (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="555-9876"
            placeholderTextColor="#9ca3af"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>✓ Add Veterinarian</Text>
          </TouchableOpacity>
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
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
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
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
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
