import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useOperatorStore } from "../stores/operator-store";

export const ProfileScreen: React.FC = () => {
  const { profile, setProfile } = useOperatorStore();

  const [name, setName] = useState(profile?.name || "");
  const [email, setEmail] = useState(profile?.email || "");
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Operator name cannot be blank.");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Validation", "Operator email cannot be blank.");
      return;
    }

    const now = new Date().toISOString();
    setProfile({
      id: profile?.id || "op-" + Date.now(),
      name: name.trim(),
      email: email.trim(),
      createdAt: profile?.createdAt || now,
      updatedAt: now,
    });

    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Operator & Settings</Text>
      <Text style={styles.subtitle}>
        Manage local operator profile and administrative device preferences.
      </Text>

      {savedSuccess && (
        <View style={styles.successBanner}>
          <Text style={styles.successText}>✓ Operator profile saved successfully!</Text>
        </View>
      )}

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {name ? name.charAt(0).toUpperCase() : "👤"}
            </Text>
          </View>
          <View style={styles.headerDetails}>
            <Text style={styles.profileName}>{name || "Local Operator"}</Text>
            <Text style={styles.profileEmail}>{email || "No email configured"}</Text>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Operator Name</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Operator full name"
              placeholderTextColor="#9ca3af"
            />
          ) : (
            <Text style={styles.readOnlyValue}>{name || "Not set"}</Text>
          )}

          <Text style={styles.label}>Contact Email</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Operator email"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          ) : (
            <Text style={styles.readOnlyValue}>{email || "Not set"}</Text>
          )}

          {isEditing ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setName(profile?.name || "");
                  setEmail(profile?.email || "");
                  setIsEditing(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.editButtonText}>✎ Edit Profile</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.systemCard}>
        <Text style={styles.systemTitle}>Device & Offline Storage</Text>
        <Text style={styles.systemText}>• Storage engine: SQLite (Local Offline)</Text>
        <Text style={styles.systemText}>• Multi-shelter isolation: Active</Text>
        <Text style={styles.systemText}>• System version: v1.0.0 (Phase 1 MVP)</Text>
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
    marginBottom: 20,
  },
  successBanner: {
    backgroundColor: "#dcfce7",
    borderColor: "#86efac",
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  successText: {
    color: "#166534",
    fontSize: 14,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  avatarText: {
    fontSize: 24,
    color: "#ffffff",
    fontWeight: "bold",
  },
  headerDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  profileEmail: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 2,
  },
  formSection: {
    marginTop: 4,
  },
  label: {
    fontSize: 12,
    color: "#4b5563",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 6,
  },
  readOnlyValue: {
    fontSize: 16,
    color: "#111827",
    paddingVertical: 6,
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
  buttonRow: {
    flexDirection: "row",
    marginTop: 20,
    gap: 10,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#4b5563",
    fontSize: 15,
    fontWeight: "600",
  },
  editButton: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 20,
  },
  editButtonText: {
    color: "#1d4ed8",
    fontSize: 15,
    fontWeight: "600",
  },
  systemCard: {
    marginTop: 24,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  systemTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
  },
  systemText: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
  },
});
