import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import { usePetStore } from "../stores/pet-store";
import { useCareStore, type CareOccurrenceItem } from "../stores/care-store";
import { AddCareEventModal } from "../components/AddCareEventModal";

export interface PetDetailScreenProps {
  petId?: string;
  onBack?: () => void;
}

export const PetDetailScreen: React.FC<PetDetailScreenProps> = ({
  petId,
  onBack,
}) => {
  const selectedPetId = usePetStore((state) => state.selectedPetId);
  const allPets = usePetStore((state) => state.pets);
  const updatePet = usePetStore((state) => state.updatePet);

  const activeId = petId || selectedPetId;
  const pet = activeId ? allPets.find((p) => p.id === activeId) ?? null : null;

  // Care store
  const allOccurrences = useCareStore((state) => state.occurrences);
  const completeOccurrence = useCareStore((state) => state.completeOccurrence);
  const skipOccurrence = useCareStore((state) => state.skipOccurrence);

  const petOccurrences = pet
    ? allOccurrences.filter((occ) => occ.petId === pet.id)
    : [];

  // Modals state
  const [addCareModalVisible, setAddCareModalVisible] = useState(false);
  const [adoptionModalVisible, setAdoptionModalVisible] = useState(false);
  const [adopterName, setAdopterName] = useState("");
  const [adopterPhone, setAdopterPhone] = useState("");
  const [adopterAddress, setAdopterAddress] = useState("");

  if (!pet) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No pet profile selected.</Text>
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backBtnText}>← Back to Pets List</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const handleFosterToggle = () => {
    if (pet.status === "in_foster") {
      updatePet(pet.id, { status: "active" });
      Alert.alert("Foster Updated", `${pet.name} has returned from foster care.`);
    } else {
      updatePet(pet.id, { status: "in_foster" });
      Alert.alert("Foster Placement", `${pet.name} has been placed in foster care.`);
    }
  };

  const handleFinalizeAdoption = () => {
    if (!adopterName.trim() || !adopterPhone.trim()) {
      Alert.alert("Validation", "Adopter name and contact phone are required.");
      return;
    }

    updatePet(pet.id, {
      status: "archived",
      outcome: "adopted",
      availableForAdoption: false,
      adopter: {
        name: adopterName.trim(),
        phone: adopterPhone.trim(),
        address: adopterAddress.trim() || undefined,
      },
    });

    setAdoptionModalVisible(false);
    Alert.alert("Adoption Finalized 🎉", `${pet.name} is officially adopted!`);
  };

  const handleCompleteCare = (occ: CareOccurrenceItem) => {
    completeOccurrence(occ.id, "Administered at shelter");
    Alert.alert("Care Completed ✓", `${occ.substance} administered to ${pet.name}.`);
  };

  const handleSkipCare = (occ: CareOccurrenceItem) => {
    skipOccurrence(occ.id, "Skipped by shelter staff");
    Alert.alert("Care Skipped ✕", `${occ.substance} skipped for ${pet.name}.`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {onBack && (
        <TouchableOpacity style={styles.headerBack} onPress={onBack}>
          <Text style={styles.headerBackText}>← Back to Pet Directory</Text>
        </TouchableOpacity>
      )}

      {/* Hero Card */}
      <View style={styles.heroCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarIcon}>
            {pet.species === "Dog" ? "🐶" : "🐱"}
          </Text>
        </View>
        <Text style={styles.petName}>{pet.name}</Text>
        <Text style={styles.petSubtitle}>
          {pet.breed || pet.species} • {pet.sex || "Unknown sex"}
        </Text>

        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Status: {pet.status}</Text>
          </View>
          <View
            style={[
              styles.badge,
              { backgroundColor: pet.availableForAdoption ? "#dcfce7" : "#f3f4f6" },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: pet.availableForAdoption ? "#15803d" : "#6b7280" },
              ]}
            >
              {pet.availableForAdoption ? "Adoptable" : "Not Adoptable"}
            </Text>
          </View>
        </View>
      </View>

      {/* Demographics Details */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Demographic Profile</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Date of Birth:</Text>
          <Text style={styles.value}>
            {pet.dateOfBirth} {pet.estimatedDOB ? "(Estimated)" : "(Exact)"}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Color / Markings:</Text>
          <Text style={styles.value}>{pet.color || "None recorded"}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Intake Origin:</Text>
          <Text style={styles.value}>{pet.intakeOrigin}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Health Status:</Text>
          <Text style={[styles.value, { fontWeight: "bold" }]}>
            {pet.healthStatus}
          </Text>
        </View>
      </View>

      {/* Care Schedule & Medical Events Section */}
      <View style={styles.sectionCard}>
        <View style={styles.careSectionHeader}>
          <Text style={styles.sectionTitle}>Medical & Care Schedule ({petOccurrences.length})</Text>
          {pet.status !== "archived" && (
            <TouchableOpacity
              style={styles.addCareBtn}
              onPress={() => setAddCareModalVisible(true)}
            >
              <Text style={styles.addCareBtnText}>+ Add Care</Text>
            </TouchableOpacity>
          )}
        </View>

        {petOccurrences.length === 0 ? (
          <Text style={styles.noCareText}>
            No medical treatments, vaccines, or care events recorded for {pet.name}.
          </Text>
        ) : (
          petOccurrences.map((occ) => {
            const statusColor =
              occ.status === "completed"
                ? "#16a34a"
                : occ.status === "skipped"
                ? "#6b7280"
                : occ.status === "overdue"
                ? "#dc2626"
                : "#2563eb";

            const modalityIcon =
              occ.modality === "Vaccine"
                ? "💉"
                : occ.modality === "Medication"
                ? "💊"
                : occ.modality === "Vermifuge"
                ? "🪱"
                : occ.modality === "Grooming"
                ? "✂️"
                : "🏃";

            return (
              <View key={occ.id} style={styles.careOccurrenceCard}>
                <View style={styles.careHeaderRow}>
                  <View style={styles.careTitleRow}>
                    <Text style={styles.careIcon}>{modalityIcon}</Text>
                    <View>
                      <Text style={styles.careSubstance}>{occ.substance}</Text>
                      <Text style={styles.careDueDate}>📅 Due: {occ.dueDate}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor + "15" }]}>
                    <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                      {occ.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {occ.status === "scheduled" && (
                  <View style={styles.careActionRow}>
                    <TouchableOpacity
                      style={styles.careCompleteBtn}
                      onPress={() => handleCompleteCare(occ)}
                    >
                      <Text style={styles.careCompleteBtnText}>✓ Complete</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.careSkipBtn}
                      onPress={() => handleSkipCare(occ)}
                    >
                      <Text style={styles.careSkipBtnText}>✕ Skip</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>

      {/* Adopter info if adopted */}
      {pet.adopter && (
        <View style={[styles.sectionCard, { backgroundColor: "#f0fdf4" }]}>
          <Text style={[styles.sectionTitle, { color: "#166534" }]}>
            ✓ Legal Adopter Record
          </Text>
          <View style={styles.row}>
            <Text style={styles.label}>Adopter:</Text>
            <Text style={styles.value}>{pet.adopter.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{pet.adopter.phone}</Text>
          </View>
          {pet.adopter.address && (
            <View style={styles.row}>
              <Text style={styles.label}>Address:</Text>
              <Text style={styles.value}>{pet.adopter.address}</Text>
            </View>
          )}
        </View>
      )}

      {/* Lifecycle Actions */}
      {pet.status !== "archived" && (
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              pet.status === "in_foster"
                ? styles.returnFosterBtn
                : styles.fosterBtn,
            ]}
            onPress={handleFosterToggle}
          >
            <Text style={styles.actionBtnText}>
              {pet.status === "in_foster"
                ? "🏡 Return from Foster"
                : "🤝 Place in Foster"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.adoptBtn]}
            onPress={() => setAdoptionModalVisible(true)}
          >
            <Text style={styles.actionBtnText}>🎉 Record Legal Adoption</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Add Care Modal */}
      <AddCareEventModal
        visible={addCareModalVisible}
        petId={pet.id}
        onClose={() => setAddCareModalVisible(false)}
      />

      {/* Adoption Modal */}
      <Modal
        visible={adoptionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAdoptionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Record Adoption for {pet.name}</Text>
            <Text style={styles.modalSubtitle}>
              Enter legal adopter contact information.
            </Text>

            <Text style={styles.modalLabel}>Adopter Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Alice Walker"
              placeholderTextColor="#9ca3af"
              value={adopterName}
              onChangeText={setAdopterName}
            />

            <Text style={styles.modalLabel}>Adopter Phone *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 555-0199"
              placeholderTextColor="#9ca3af"
              value={adopterPhone}
              onChangeText={setAdopterPhone}
              keyboardType="phone-pad"
            />

            <Text style={styles.modalLabel}>Physical Address (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 742 Evergreen Terrace"
              placeholderTextColor="#9ca3af"
              value={adopterAddress}
              onChangeText={setAdopterAddress}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleFinalizeAdoption}
              >
                <Text style={styles.modalConfirmText}>Finalize Adoption</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setAdoptionModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerBack: {
    marginBottom: 16,
  },
  headerBackText: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "bold",
  },
  heroCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#eff6ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarIcon: {
    fontSize: 36,
  },
  petName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
  },
  petSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
  },
  badge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "600",
  },
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
  },
  careSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addCareBtn: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderColor: "#bfdbfe",
    borderWidth: 1,
  },
  addCareBtnText: {
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: "bold",
  },
  noCareText: {
    fontSize: 13,
    color: "#9ca3af",
    fontStyle: "italic",
    paddingVertical: 6,
  },
  careOccurrenceCard: {
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  careHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  careTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  careIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  careSubstance: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  careDueDate: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  careActionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  careCompleteBtn: {
    flex: 1,
    backgroundColor: "#16a34a",
    paddingVertical: 6,
    borderRadius: 4,
    alignItems: "center",
  },
  careCompleteBtnText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "bold",
  },
  careSkipBtn: {
    flex: 1,
    backgroundColor: "#e5e7eb",
    paddingVertical: 6,
    borderRadius: 4,
    alignItems: "center",
  },
  careSkipBtnText: {
    color: "#374151",
    fontSize: 11,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f9fafb",
  },
  label: {
    fontSize: 13,
    color: "#6b7280",
  },
  value: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "500",
  },
  actionContainer: {
    gap: 10,
    marginTop: 8,
  },
  actionBtn: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  fosterBtn: {
    backgroundColor: "#d97706",
  },
  returnFosterBtn: {
    backgroundColor: "#4b5563",
  },
  adoptBtn: {
    backgroundColor: "#16a34a",
  },
  actionBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
  },
  backBtn: {
    marginTop: 16,
  },
  backBtnText: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
    marginBottom: 14,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#374151",
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#111827",
  },
  modalBtnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: "#16a34a",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalConfirmText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalCancelText: {
    color: "#4b5563",
    fontSize: 14,
    fontWeight: "600",
  },
});
