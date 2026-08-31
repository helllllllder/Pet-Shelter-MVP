import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import { useShelterStore, type ShelterItem } from "../stores/shelter-store";

export interface ShelterSwitcherModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateNewShelter?: () => void;
}

export const ShelterSwitcherModal: React.FC<ShelterSwitcherModalProps> = ({
  visible,
  onClose,
  onCreateNewShelter,
}) => {
  const shelters = useShelterStore((state) => state.shelters);
  const activeShelterId = useShelterStore((state) => state.activeShelterId);
  const setActiveShelter = useShelterStore((state) => state.setActiveShelter);

  const handleSelect = (shelterId: string) => {
    setActiveShelter(shelterId);
    onClose();
  };

  const renderItem = ({ item }: { item: ShelterItem }) => {
    const isSelected = item.id === activeShelterId;
    return (
      <TouchableOpacity
        style={[styles.shelterItem, isSelected && styles.selectedShelterItem]}
        onPress={() => handleSelect(item.id)}
        accessibilityLabel={`Select ${item.name}`}
      >
        <View style={styles.itemInfo}>
          <Text
            style={[styles.itemText, isSelected && styles.selectedItemText]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          {item.description ? (
            <Text style={styles.itemDescription} numberOfLines={1}>
              {item.description}
            </Text>
          ) : null}
        </View>
        {isSelected && <Text style={styles.checkIcon}>✓</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={styles.modalContent}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Switch Shelter Context</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={shelters}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No shelters configured yet.</Text>
            }
          />

          {onCreateNewShelter && (
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => {
                onClose();
                onCreateNewShelter();
              }}
            >
              <Text style={styles.createButtonText}>+ Add New Shelter</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  closeButton: {
    fontSize: 18,
    color: "#6b7280",
    padding: 4,
  },
  listContainer: {
    paddingVertical: 4,
  },
  shelterItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: "#f9fafb",
  },
  selectedShelterItem: {
    backgroundColor: "#eff6ff",
    borderColor: "#3b82f6",
    borderWidth: 1,
  },
  itemInfo: {
    flex: 1,
    marginRight: 8,
  },
  itemText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#374151",
  },
  selectedItemText: {
    color: "#1d4ed8",
    fontWeight: "600",
  },
  itemDescription: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  checkIcon: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2563eb",
  },
  emptyText: {
    textAlign: "center",
    color: "#9ca3af",
    paddingVertical: 20,
    fontSize: 14,
  },
  createButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#2563eb",
    alignItems: "center",
  },
  createButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
});
