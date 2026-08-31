import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  Alert,
} from "react-native";
import { useVetStore } from "../stores/vet-store";
import { useShelterStore } from "../stores/shelter-store";

export interface RegisterClinicModalProps {
  visible: boolean;
  onClose: () => void;
}

export const RegisterClinicModal: React.FC<RegisterClinicModalProps> = ({
  visible,
  onClose,
}) => {
  const shelters = useShelterStore((state) => state.shelters);
  const activeShelterId = useShelterStore((state) => state.activeShelterId);
  const activeShelter = shelters.find((s) => s.id === activeShelterId) ?? null;

  const addClinic = useVetStore((state) => state.addClinic);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    if (!activeShelter) {
      Alert.alert("Error", "Please select an active shelter first.");
      return;
    }
    if (!name.trim()) {
      Alert.alert("Validation", "Clinic name is required.");
      return;
    }

    const now = new Date().toISOString();
    addClinic({
      id: "clinic-" + Date.now(),
      shelterId: activeShelter.id,
      name: name.trim(),
      address: address.trim() || null,
      phone: phone.trim() || null,
      email: email.trim() || null,
      isEmergency,
      notes: notes.trim() || null,
      createdAt: now,
      updatedAt: now,
    });

    setName("");
    setAddress("");
    setPhone("");
    setEmail("");
    setIsEmergency(false);
    setNotes("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Register Partner Clinic</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={styles.label}>Clinic Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. City Central Animal Hospital"
              placeholderTextColor="#9ca3af"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Physical Address</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 100 Main Street, Suite 4"
              placeholderTextColor="#9ca3af"
              value={address}
              onChangeText={setAddress}
            />

            <View style={styles.twoCol}>
              <View style={styles.col}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="555-0123"
                  placeholderTextColor="#9ca3af"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="clinic@vet.com"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.switchRow}>
              <View style={styles.switchLabelContainer}>
                <Text style={styles.switchTitle}>24/7 Emergency Care</Text>
                <Text style={styles.switchSubtitle}>Provides round-the-clock urgent critical care</Text>
              </View>
              <Switch value={isEmergency} onValueChange={setIsEmergency} />
            </View>

            <Text style={styles.label}>Clinical Notes / Specialties</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="e.g. Orthopedic surgery, low-cost spay/neuter partner"
              placeholderTextColor="#9ca3af"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>✓ Register Clinic</Text>
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
    maxHeight: "90%",
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
  scroll: {
    paddingBottom: 24,
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
  textArea: {
    minHeight: 60,
    textAlignVertical: "top",
  },
  twoCol: {
    flexDirection: "row",
    gap: 10,
  },
  col: {
    flex: 1,
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
