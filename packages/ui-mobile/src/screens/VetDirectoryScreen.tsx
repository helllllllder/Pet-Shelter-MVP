import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useShelterStore } from "../stores/shelter-store";
import { useVetStore, type ClinicItem, type VeterinarianItem } from "../stores/vet-store";
import { RegisterClinicModal } from "../components/RegisterClinicModal";
import { AddVetModal } from "../components/AddVetModal";

export const VetDirectoryScreen: React.FC = () => {
  const shelters = useShelterStore((state) => state.shelters);
  const activeShelterId = useShelterStore((state) => state.activeShelterId);
  const activeShelter = shelters.find((s) => s.id === activeShelterId) ?? null;

  const allClinics = useVetStore((state) => state.clinics);
  const allVets = useVetStore((state) => state.veterinarians);

  const clinics = activeShelter
    ? allClinics.filter((c) => c.shelterId === activeShelter.id)
    : [];
  const vets = activeShelter
    ? allVets.filter((v) => v.shelterId === activeShelter.id)
    : [];

  const [search, setSearch] = useState("");
  const [registerClinicVisible, setRegisterClinicVisible] = useState(false);
  const [addVetClinicId, setAddVetClinicId] = useState<string | null>(null);

  const filteredClinics = clinics.filter((c) => {
    const matchesSearch =
      search.trim() === "" ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.address && c.address.toLowerCase().includes(search.toLowerCase())) ||
      vets.some(
        (v) =>
          v.clinicId === c.id &&
          (v.name.toLowerCase().includes(search.toLowerCase()) ||
            (v.specialization && v.specialization.toLowerCase().includes(search.toLowerCase())))
      );
    return matchesSearch;
  });

  const renderClinicItem = ({ item }: { item: ClinicItem }) => {
    const clinicVets = vets.filter((v) => v.clinicId === item.id);

    return (
      <View style={styles.clinicCard}>
        <View style={styles.clinicHeader}>
          <View style={styles.clinicTitleRow}>
            <Text style={styles.clinicIcon}>🏥</Text>
            <View style={styles.clinicTitleContainer}>
              <Text style={styles.clinicName}>{item.name}</Text>
              {item.address ? <Text style={styles.clinicAddress}>📍 {item.address}</Text> : null}
            </View>
          </View>
          {item.isEmergency && (
            <View style={styles.emergencyBadge}>
              <Text style={styles.emergencyBadgeText}>24/7 ER</Text>
            </View>
          )}
        </View>

        {(item.phone || item.email) && (
          <View style={styles.contactRow}>
            {item.phone && <Text style={styles.contactText}>📞 {item.phone}</Text>}
            {item.email && <Text style={styles.contactText}>✉️ {item.email}</Text>}
          </View>
        )}

        {item.notes && <Text style={styles.notesText}>{item.notes}</Text>}

        {/* Attending Vets section */}
        <View style={styles.vetsSection}>
          <View style={styles.vetsHeader}>
            <Text style={styles.vetsTitle}>Attending Veterinarians ({clinicVets.length})</Text>
            <TouchableOpacity
              style={styles.addVetBtn}
              onPress={() => setAddVetClinicId(item.id)}
            >
              <Text style={styles.addVetBtnText}>+ Add Vet</Text>
            </TouchableOpacity>
          </View>

          {clinicVets.length === 0 ? (
            <Text style={styles.noVetsText}>No veterinarians registered under this clinic yet.</Text>
          ) : (
            clinicVets.map((v) => (
              <View key={v.id} style={styles.vetRow}>
                <Text style={styles.vetIcon}>👨‍⚕️</Text>
                <View style={styles.vetDetails}>
                  <Text style={styles.vetName}>{v.name}</Text>
                  <Text style={styles.vetSpecialization}>
                    {v.specialization || "General Practice"}
                    {v.licenseNumber ? ` • Lic: ${v.licenseNumber}` : ""}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Veterinary Directory</Text>
            <Text style={styles.subtitle}>
              {activeShelter ? activeShelter.name : "No Shelter Selected"} ({clinics.length} clinics, {vets.length} vets)
            </Text>
          </View>
          <TouchableOpacity
            style={styles.registerBtn}
            onPress={() => setRegisterClinicVisible(true)}
          >
            <Text style={styles.registerBtnText}>+ Register Clinic</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search clinics, doctors, or specializations..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredClinics}
        keyExtractor={(item) => item.id}
        renderItem={renderClinicItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🏥</Text>
            <Text style={styles.emptyTitle}>No veterinary clinics registered</Text>
            <Text style={styles.emptySubtitle}>
              Tap "+ Register Clinic" to add your shelter's partner veterinary hospitals and doctors.
            </Text>
          </View>
        }
      />

      <RegisterClinicModal
        visible={registerClinicVisible}
        onClose={() => setRegisterClinicVisible(false)}
      />

      <AddVetModal
        visible={addVetClinicId !== null}
        clinicId={addVetClinicId}
        onClose={() => setAddVetClinicId(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  subtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  registerBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  registerBtnText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "bold",
  },
  searchInput: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#111827",
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  clinicCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  clinicHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  clinicTitleRow: {
    flexDirection: "row",
    flex: 1,
    marginRight: 8,
  },
  clinicIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  clinicTitleContainer: {
    flex: 1,
  },
  clinicName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  clinicAddress: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  emergencyBadge: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  emergencyBadgeText: {
    color: "#b91c1c",
    fontSize: 10,
    fontWeight: "bold",
  },
  contactRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
    flexWrap: "wrap",
  },
  contactText: {
    fontSize: 12,
    color: "#4b5563",
  },
  notesText: {
    fontSize: 12,
    color: "#6b7280",
    fontStyle: "italic",
    marginTop: 6,
  },
  vetsSection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  vetsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  vetsTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#374151",
  },
  addVetBtn: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderColor: "#bfdbfe",
    borderWidth: 1,
  },
  addVetBtnText: {
    fontSize: 11,
    color: "#1d4ed8",
    fontWeight: "bold",
  },
  noVetsText: {
    fontSize: 12,
    color: "#9ca3af",
    fontStyle: "italic",
    paddingVertical: 4,
  },
  vetRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  vetIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  vetDetails: {
    flex: 1,
  },
  vetName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  vetSpecialization: {
    fontSize: 11,
    color: "#6b7280",
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: "center",
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 4,
    maxWidth: 280,
  },
});
