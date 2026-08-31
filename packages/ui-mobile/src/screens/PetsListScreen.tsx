import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { useShelterStore } from "../stores/shelter-store";
import { usePetStore, type PetItem } from "../stores/pet-store";

export interface PetsListScreenProps {
  onSelectPet?: (petId: string) => void;
  onOpenRegister?: () => void;
}

export const PetsListScreen: React.FC<PetsListScreenProps> = ({
  onSelectPet,
  onOpenRegister,
}) => {
  const shelters = useShelterStore((state) => state.shelters);
  const activeShelterId = useShelterStore((state) => state.activeShelterId);
  const activeShelter = shelters.find((s) => s.id === activeShelterId) ?? null;

  const allPets = usePetStore((state) => state.pets);
  const pets = activeShelter
    ? allPets.filter((p) => p.shelterId === activeShelter.id)
    : [];

  const [search, setSearch] = useState("");
  const [filterSpecies, setFilterSpecies] = useState<"All" | "Dog" | "Cat">("All");

  const filteredPets = pets.filter((pet) => {
    const matchesSearch =
      search.trim() === "" ||
      pet.name.toLowerCase().includes(search.toLowerCase()) ||
      (pet.breed && pet.breed.toLowerCase().includes(search.toLowerCase()));

    const matchesSpecies =
      filterSpecies === "All" || pet.species === filterSpecies;

    return matchesSearch && matchesSpecies;
  });

  const renderPetItem = ({ item }: { item: PetItem }) => {
    const statusColor =
      item.healthStatus === "Healthy"
        ? "#10b981"
        : item.healthStatus === "InTreatment"
        ? "#3b82f6"
        : item.healthStatus === "Critical"
        ? "#ef4444"
        : "#f59e0b";

    return (
      <TouchableOpacity
        style={styles.petCard}
        onPress={() => onSelectPet?.(item.id)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarIcon}>
            {item.species === "Dog" ? "🐶" : "🐱"}
          </Text>
        </View>

        <View style={styles.petInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.petName}>{item.name}</Text>
            {item.availableForAdoption && (
              <View style={styles.adoptionBadge}>
                <Text style={styles.adoptionBadgeText}>Adoptable</Text>
              </View>
            )}
          </View>

          <Text style={styles.petSubText}>
            {item.breed || item.species} • {item.sex || "Unknown sex"} • Born {item.dateOfBirth}
            {item.estimatedDOB ? " (Est.)" : ""}
          </Text>

          <View style={styles.statusRow}>
            <View
              style={[styles.healthPill, { backgroundColor: statusColor + "20" }]}
            >
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.healthPillText, { color: statusColor }]}>
                {item.healthStatus}
              </Text>
            </View>

            {item.status === "in_foster" && (
              <View style={styles.fosterPill}>
                <Text style={styles.fosterPillText}>In Foster</Text>
              </View>
            )}

            {item.status === "archived" && (
              <View style={styles.archivedPill}>
                <Text style={styles.archivedPillText}>{item.outcome || "Archived"}</Text>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.title}>Pet Profiles</Text>
            <Text style={styles.subtitle}>
              {activeShelter ? activeShelter.name : "No Shelter Selected"} ({filteredPets.length} pets)
            </Text>
          </View>
          {onOpenRegister && (
            <TouchableOpacity style={styles.addButton} onPress={onOpenRegister}>
              <Text style={styles.addButtonText}>+ Intake Pet</Text>
            </TouchableOpacity>
          )}
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Search pets by name or breed..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />

        <View style={styles.filterRow}>
          {(["All", "Dog", "Cat"] as const).map((s) => (
            <TouchableOpacity
              key={s}
              style={[
                styles.filterChip,
                filterSpecies === s && styles.filterChipActive,
              ]}
              onPress={() => setFilterSpecies(s)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterSpecies === s && styles.filterChipTextActive,
                ]}
              >
                {s === "All" ? "All Pets" : s === "Dog" ? "🐶 Dogs" : "🐱 Cats"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredPets}
        keyExtractor={(item) => item.id}
        renderItem={renderPetItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🐾</Text>
            <Text style={styles.emptyTitle}>No pet profiles found</Text>
            <Text style={styles.emptySubtitle}>
              {activeShelter
                ? "Tap '+ Intake Pet' to register the first animal in this shelter."
                : "Select or create a shelter to manage animal records."}
            </Text>
          </View>
        }
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
  addButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
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
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
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
  petCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarIcon: {
    fontSize: 22,
  },
  petInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  petName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  adoptionBadge: {
    backgroundColor: "#dcfce7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adoptionBadgeText: {
    color: "#15803d",
    fontSize: 10,
    fontWeight: "bold",
  },
  petSubText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  healthPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  healthPillText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  fosterPill: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fosterPillText: {
    color: "#b45309",
    fontSize: 10,
    fontWeight: "bold",
  },
  archivedPill: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  archivedPillText: {
    color: "#4b5563",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  chevron: {
    fontSize: 22,
    color: "#9ca3af",
    marginLeft: 8,
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
    maxWidth: 260,
  },
});
