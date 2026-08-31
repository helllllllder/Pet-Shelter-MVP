import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import { useShelterStore } from "../stores/shelter-store";
import { usePetStore } from "../stores/pet-store";
import {
  useCareStore,
  type CareOccurrenceItem,
  type ModalityType,
} from "../stores/care-store";
import { AddCareEventModal } from "../components/AddCareEventModal";

export const CareScheduleScreen: React.FC = () => {
  const shelters = useShelterStore((state) => state.shelters);
  const activeShelterId = useShelterStore((state) => state.activeShelterId);
  const activeShelter = shelters.find((s) => s.id === activeShelterId) ?? null;

  const allPets = usePetStore((state) => state.pets);
  const pets = activeShelter
    ? allPets.filter((p) => p.shelterId === activeShelter.id)
    : [];

  const allOccurrences = useCareStore((state) => state.occurrences);
  const completeOccurrence = useCareStore((state) => state.completeOccurrence);
  const skipOccurrence = useCareStore((state) => state.skipOccurrence);

  const occurrences = activeShelter
    ? allOccurrences.filter((occ) => occ.shelterId === activeShelter.id)
    : [];

  const [search, setSearch] = useState("");
  const [filterModality, setFilterModality] = useState<"All" | ModalityType>("All");
  const [addCareVisible, setAddCareVisible] = useState(false);

  const filteredOccurrences = occurrences.filter((occ) => {
    const pet = pets.find((p) => p.id === occ.petId);
    const petName = pet?.name || "";

    const matchesSearch =
      search.trim() === "" ||
      occ.substance.toLowerCase().includes(search.toLowerCase()) ||
      petName.toLowerCase().includes(search.toLowerCase());

    const matchesModality =
      filterModality === "All" || occ.modality === filterModality;

    return matchesSearch && matchesModality;
  });

  const handleComplete = (item: CareOccurrenceItem) => {
    completeOccurrence(item.id, "Administered by operator");
    Alert.alert("Care Completed ✓", `${item.substance} administered successfully.`);
  };

  const handleSkip = (item: CareOccurrenceItem) => {
    skipOccurrence(item.id, "Skipped due to clinical observation");
    Alert.alert("Care Skipped ✕", `${item.substance} occurrence recorded as skipped.`);
  };

  const renderOccurrenceItem = ({ item }: { item: CareOccurrenceItem }) => {
    const pet = pets.find((p) => p.id === item.petId);
    const statusColor =
      item.status === "completed"
        ? "#16a34a"
        : item.status === "skipped"
        ? "#6b7280"
        : item.status === "overdue"
        ? "#dc2626"
        : "#2563eb";

    const modalityIcon =
      item.modality === "Vaccine"
        ? "💉"
        : item.modality === "Medication"
        ? "💊"
        : item.modality === "Vermifuge"
        ? "🪱"
        : item.modality === "Grooming"
        ? "✂️"
        : "🏃";

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <Text style={styles.modalityIcon}>{modalityIcon}</Text>
            <View style={styles.titleContainer}>
              <Text style={styles.substanceName}>{item.substance}</Text>
              <Text style={styles.petName}>
                🐾 For: <Text style={styles.petNameBold}>{pet?.name || "Unknown Pet"}</Text>
              </Text>
            </View>
          </View>
          <View style={[styles.statusPill, { backgroundColor: statusColor + "15" }]}>
            <Text style={[styles.statusPillText, { color: statusColor }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <Text style={styles.dueDateText}>📅 Due: {item.dueDate}</Text>
          <Text style={styles.modalityTag}>{item.modality}</Text>
        </View>

        {item.status === "scheduled" && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.completeBtn}
              onPress={() => handleComplete(item)}
            >
              <Text style={styles.completeBtnText}>✓ Complete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={() => handleSkip(item)}
            >
              <Text style={styles.skipBtnText}>✕ Skip</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.status === "completed" && item.completedAt && (
          <Text style={styles.logText}>
            ✓ Completed on {item.completedAt.split("T")[0]}
          </Text>
        )}

        {item.status === "skipped" && item.skippedReason && (
          <Text style={styles.logText}>
            ✕ Skipped: {item.skippedReason}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRowMain}>
          <View>
            <Text style={styles.title}>Care & Medical Schedule</Text>
            <Text style={styles.subtitle}>
              {activeShelter ? activeShelter.name : "No Shelter"} ({occurrences.length} scheduled occurrences)
            </Text>
          </View>
          <TouchableOpacity
            style={styles.scheduleBtn}
            onPress={() => setAddCareVisible(true)}
          >
            <Text style={styles.scheduleBtnText}>+ Schedule Care</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search care by substance or pet name..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />

        <View style={styles.filterRow}>
          {(["All", "Vaccine", "Medication", "Vermifuge", "Grooming"] as const).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.filterChip, filterModality === m && styles.filterChipActive]}
              onPress={() => setFilterModality(m)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterModality === m && styles.filterChipTextActive,
                ]}
              >
                {m}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredOccurrences}
        keyExtractor={(item) => item.id}
        renderItem={renderOccurrenceItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>💊</Text>
            <Text style={styles.emptyTitle}>No care events scheduled</Text>
            <Text style={styles.emptySubtitle}>
              Tap "+ Schedule Care" or open a pet's profile to schedule vaccinations, medications, and treatments.
            </Text>
          </View>
        }
      />

      <AddCareEventModal
        visible={addCareVisible}
        onClose={() => setAddCareVisible(false)}
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
  titleRowMain: {
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
  scheduleBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  scheduleBtnText: {
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
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: "row",
    gap: 6,
    flexWrap: "wrap",
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: "#f3f4f6",
  },
  filterChipActive: {
    backgroundColor: "#eff6ff",
    borderColor: "#3b82f6",
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    color: "#4b5563",
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#1d4ed8",
    fontWeight: "bold",
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleRow: {
    flexDirection: "row",
    flex: 1,
    marginRight: 8,
  },
  modalityIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  titleContainer: {
    flex: 1,
  },
  substanceName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
  },
  petName: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  petNameBold: {
    fontWeight: "600",
    color: "#374151",
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f9fafb",
  },
  dueDateText: {
    fontSize: 12,
    color: "#4b5563",
    fontWeight: "500",
  },
  modalityTag: {
    fontSize: 11,
    color: "#6b7280",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  completeBtn: {
    flex: 1,
    backgroundColor: "#16a34a",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  completeBtnText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  skipBtn: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  skipBtnText: {
    color: "#4b5563",
    fontSize: 12,
    fontWeight: "600",
  },
  logText: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 8,
    fontStyle: "italic",
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
