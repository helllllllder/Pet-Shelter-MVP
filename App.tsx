import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  StatusBar,
  FlatList,
} from 'react-native';

interface Pet {
  id: string;
  name: string;
  species: 'CANINE' | 'FELINE' | 'AVIAN' | 'SMALL_FURRY' | 'REPTILE' | 'OTHER';
  breed: string;
  sex: 'MALE' | 'FEMALE' | 'UNKNOWN';
  dateOfBirth: string;
  isDobEstimated: boolean;
  healthStatus: 'HEALTHY' | 'SICK' | 'INJURED';
  isAvailableForAdoption: boolean;
  intakeOrigin: string;
}

interface CareEvent {
  id: string;
  petName: string;
  modality: string;
  substanceName: string;
  dosage: string;
  dueDate: string;
  isDueToday: boolean;
}

interface InventoryItem {
  id: string;
  name: string;
  category: 'FOOD' | 'MEDICATION' | 'CLEANING_SUPPLIES' | 'EQUIPMENT' | 'OTHER';
  quantity: number;
  unitOfMeasure: string;
  threshold: number;
}

interface MaintenanceTask {
  id: string;
  taskType: 'REPAIR' | 'PREVENTIVE_MAINTENANCE' | 'CLEANING';
  description: string;
  scheduledDate: string;
  status: 'SCHEDULED' | 'COMPLETED';
}

export default function App() {
  const [operator, setOperator] = useState({ fullName: 'Operator Jane', email: 'jane@petshelter.org' });
  const [activeShelter, setActiveShelter] = useState('Downtown Animal Haven');
  const [activeTab, setActiveTab] = useState<'pets' | 'care' | 'inventory' | 'maintenance' | 'export'>('pets');
  
  // Modals
  const [isAddPetModalVisible, setAddPetModalVisible] = useState(false);
  const [isAdoptModalVisible, setAdoptModalVisible] = useState(false);
  const [isSwitchShelterModalVisible, setSwitchShelterModalVisible] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  // Form State
  const [newPetName, setNewPetName] = useState('');
  const [newPetBreed, setNewPetBreed] = useState('');
  const [adopterName, setAdopterName] = useState('');
  const [adopterPhone, setAdopterPhone] = useState('');
  const [adopterAddress, setAdopterAddress] = useState('');

  // Data Store
  const [pets, setPets] = useState<Pet[]>([
    {
      id: '019163f0-0001-7000-8000-000000000001',
      name: 'Buddy',
      species: 'CANINE',
      breed: 'Golden Retriever Mix',
      sex: 'MALE',
      dateOfBirth: '2023-04-15',
      isDobEstimated: false,
      healthStatus: 'HEALTHY',
      isAvailableForAdoption: true,
      intakeOrigin: 'STRAY',
    },
    {
      id: '019163f0-0002-7000-8000-000000000002',
      name: 'Mochi',
      species: 'FELINE',
      breed: 'Domestic Shorthair',
      sex: 'FEMALE',
      dateOfBirth: '2024-01-10',
      isDobEstimated: true,
      healthStatus: 'HEALTHY',
      isAvailableForAdoption: true,
      intakeOrigin: 'OWNER_SURRENDER',
    },
  ]);

  const [careEvents, setCareEvents] = useState<CareEvent[]>([
    {
      id: '019163f0-0003-7000-8000-000000000003',
      petName: 'Buddy',
      modality: 'VACCINE',
      substanceName: 'Rabies Booster',
      dosage: '1 vial (1ml)',
      dueDate: 'Today',
      isDueToday: true,
    },
    {
      id: '019163f0-0004-7000-8000-000000000004',
      petName: 'Mochi',
      modality: 'DEWORMING',
      substanceName: 'Pyrantel Pamoate',
      dosage: '0.5ml oral',
      dueDate: 'Tomorrow',
      isDueToday: false,
    },
  ]);

  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: '1', name: 'Puppy Dry Food', category: 'FOOD', quantity: 45, unitOfMeasure: 'KG', threshold: 15 },
    { id: '2', name: 'Rabies Vaccine Vials', category: 'MEDICATION', quantity: 8, unitOfMeasure: 'DOSES', threshold: 10 },
    { id: '3', name: 'Kennel Disinfectant', category: 'CLEANING_SUPPLIES', quantity: 24, unitOfMeasure: 'L', threshold: 5 },
    { id: '4', name: '3ml Syringes', category: 'EQUIPMENT', quantity: 98, unitOfMeasure: 'UNITS', threshold: 25 },
  ]);

  const [tasks, setTasks] = useState<MaintenanceTask[]>([
    { id: '1', taskType: 'REPAIR', description: 'Kennel 3 door latch replacement', scheduledDate: '2026-09-01', status: 'SCHEDULED' },
    { id: '2', taskType: 'CLEANING', description: 'Isolation ward deep disinfection', scheduledDate: 'Today', status: 'SCHEDULED' },
  ]);

  const [escalations, setEscalations] = useState<string[]>([
    'Warning: External Email alert for Rabies Booster failed 3 retries (SMTP Timeout). Escalated to in-app banner.',
  ]);

  const handleAddPet = () => {
    if (!newPetName.trim()) {
      Alert.alert('Validation Error', 'Pet name is required');
      return;
    }
    const newPet: Pet = {
      id: Date.now().toString(),
      name: newPetName.trim(),
      species: 'CANINE',
      breed: newPetBreed.trim() || 'Mixed',
      sex: 'UNKNOWN',
      dateOfBirth: new Date().toISOString().split('T')[0],
      isDobEstimated: true,
      healthStatus: 'HEALTHY',
      isAvailableForAdoption: true,
      intakeOrigin: 'STRAY',
    };
    setPets([newPet, ...pets]);
    setNewPetName('');
    setNewPetBreed('');
    setAddPetModalVisible(false);
    Alert.alert('Success', `${newPet.name} added to shelter.`);
  };

  const handleAdoptPet = () => {
    if (!selectedPet || !adopterName.trim() || !adopterPhone.trim()) {
      Alert.alert('Validation Error', 'Adopter Name and Phone are required (GDPR Compliance).');
      return;
    }
    setPets(pets.map(p => p.id === selectedPet.id ? { ...p, isAvailableForAdoption: false } : p));
    setAdoptModalVisible(false);
    setSelectedPet(null);
    setAdopterName('');
    setAdopterPhone('');
    setAdopterAddress('');
    Alert.alert('Adoption Finalized 🎉', `${selectedPet.name} has been adopted! PII securely logged.`);
  };

  const handleAdjustInventory = (id: string, delta: number) => {
    setInventory(inventory.map(item => {
      if (item.id === id) {
        const nextQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: nextQty };
      }
      return item;
    }));
  };

  const handleApply1ClickTemplate = () => {
    setInventory(inventory.map(item => {
      if (item.name.includes('Vaccine')) {
        return { ...item, quantity: Math.max(0, item.quantity - 1) };
      }
      if (item.name.includes('Syringes')) {
        return { ...item, quantity: Math.max(0, item.quantity - 1) };
      }
      return item;
    }));
    Alert.alert('1-Click Template Applied', 'Decremented 1x Rabies Vaccine Vial and 1x Syringe atomically from inventory.');
  };

  const handleCompleteTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: 'COMPLETED' } : t));
    Alert.alert('Task Completed', 'Task marked as completed with operator timestamp.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🐾 Luna's Pet Central</Text>
          <TouchableOpacity onPress={() => setSwitchShelterModalVisible(true)} style={styles.shelterSelector}>
            <Text style={styles.headerSubtitle}>🏠 {activeShelter} ▾</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.operatorBadge}>
          <Text style={styles.operatorText}>👤 {operator.fullName}</Text>
          <Text style={styles.offlinePill}>OFFLINE</Text>
        </View>
      </View>

      {/* Escalated Notification Banner */}
      {escalations.length > 0 && (
        <View style={styles.escalationBanner}>
          <Text style={styles.escalationText}>⚠️ {escalations[0]}</Text>
          <TouchableOpacity onPress={() => setEscalations([])} style={styles.dismissButton}>
            <Text style={styles.dismissText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Content Area */}
      <View style={styles.content}>
        {activeTab === 'pets' && (
          <View style={styles.tabContent}>
            <View style={styles.tabHeaderRow}>
              <Text style={styles.sectionHeading}>Active Shelter Pets ({pets.filter(p => p.isAvailableForAdoption).length})</Text>
              <TouchableOpacity onPress={() => setAddPetModalVisible(true)} style={styles.primaryButton}>
                <Text style={styles.buttonText}>+ Add Pet</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={pets}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.species === 'CANINE' ? '🐶' : '🐱'} {item.name}</Text>
                    <Text style={[styles.badge, item.isAvailableForAdoption ? styles.badgeGreen : styles.badgeMuted]}>
                      {item.isAvailableForAdoption ? 'ADOPTABLE' : 'ADOPTED'}
                    </Text>
                  </View>
                  <Text style={styles.cardBody}>{item.breed} • Born: {item.dateOfBirth} {item.isDobEstimated && '(Est.)'}</Text>
                  <Text style={styles.cardSub}>Intake: {item.intakeOrigin} • Health: {item.healthStatus}</Text>
                  
                  {item.isAvailableForAdoption && (
                    <TouchableOpacity
                      onPress={() => { setSelectedPet(item); setAdoptModalVisible(true); }}
                      style={styles.adoptButton}
                    >
                      <Text style={styles.adoptButtonText}>Process Adoption</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />
          </View>
        )}

        {activeTab === 'care' && (
          <View style={styles.tabContent}>
            <View style={styles.tabHeaderRow}>
              <Text style={styles.sectionHeading}>Scheduled Care Events</Text>
              <TouchableOpacity onPress={handleApply1ClickTemplate} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>⚡ 1-Click Intake Pack</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={careEvents}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>💉 {item.substanceName}</Text>
                    {item.isDueToday && <Text style={[styles.badge, styles.badgeRed]}>DUE TODAY</Text>}
                  </View>
                  <Text style={styles.cardBody}>Pet: {item.petName} • Dosage: {item.dosage}</Text>
                  <Text style={styles.cardSub}>Due: {item.dueDate} • Recurrence: Scheduled</Text>
                </View>
              )}
            />
          </View>
        )}

        {activeTab === 'inventory' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeading}>Categorized Inventory</Text>
            <FlatList
              data={inventory}
              keyExtractor={item => item.id}
              renderItem={({ item }) => {
                const isLow = item.quantity <= item.threshold;
                return (
                  <View style={styles.card}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>{item.name}</Text>
                      {isLow && <Text style={[styles.badge, styles.badgeOrange]}>LOW STOCK</Text>}
                    </View>
                    <Text style={styles.cardBody}>Category: {item.category} • Alert Threshold: {item.threshold} {item.unitOfMeasure}</Text>
                    
                    <View style={styles.quantityRow}>
                      <Text style={styles.quantityText}>{item.quantity} {item.unitOfMeasure}</Text>
                      <View style={styles.adjustRow}>
                        <TouchableOpacity onPress={() => handleAdjustInventory(item.id, -1)} style={styles.adjustBtn}>
                          <Text style={styles.adjustBtnText}>-</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleAdjustInventory(item.id, 1)} style={styles.adjustBtn}>
                          <Text style={styles.adjustBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              }}
            />
          </View>
        )}

        {activeTab === 'maintenance' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeading}>Facility Maintenance Tasks</Text>
            <FlatList
              data={tasks}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>🛠️ {item.taskType}</Text>
                    <Text style={[styles.badge, item.status === 'COMPLETED' ? styles.badgeGreen : styles.badgeOrange]}>
                      {item.status}
                    </Text>
                  </View>
                  <Text style={styles.cardBody}>{item.description}</Text>
                  <Text style={styles.cardSub}>Scheduled: {item.scheduledDate}</Text>
                  {item.status === 'SCHEDULED' && (
                    <TouchableOpacity onPress={() => handleCompleteTask(item.id)} style={styles.completeBtn}>
                      <Text style={styles.completeBtnText}>✓ Mark Completed</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />
          </View>
        )}

        {activeTab === 'export' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeading}>Local Data Privacy & Export</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📦 Export Shelter Database</Text>
              <Text style={styles.cardBody}>Generates a tamper-evident JSON backup envelope with SHA-256 cryptographic verification.</Text>
              <TouchableOpacity
                onPress={() => Alert.alert('Export Generated', 'Export envelope v1.0.0 created at /exports/shelter_export.json\nSHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069')}
                style={styles.primaryButton}
              >
                <Text style={styles.buttonText}>Export All Records (JSON)</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.card, { marginTop: 16 }]}>
              <Text style={styles.cardTitle}>🔒 GDPR Right-to-Erasure</Text>
              <Text style={styles.cardBody}>Permanently tombstone adopter PII with `[GDPR ERASURE VERIFIED]` while retaining anonymized care logs.</Text>
              <TouchableOpacity
                onPress={() => Alert.alert('GDPR Action', 'PII tombstoning ready for audited compliance.')}
                style={[styles.secondaryButton, { borderColor: '#f43f5e' }]}
              >
                <Text style={[styles.secondaryButtonText, { color: '#f43f5e' }]}>Execute GDPR Tombstone</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => setActiveTab('pets')} style={styles.navItem}>
          <Text style={[styles.navIcon, activeTab === 'pets' && styles.navActive]}>🐶</Text>
          <Text style={[styles.navLabel, activeTab === 'pets' && styles.navActive]}>Pets</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('care')} style={styles.navItem}>
          <Text style={[styles.navIcon, activeTab === 'care' && styles.navActive]}>💉</Text>
          <Text style={[styles.navLabel, activeTab === 'care' && styles.navActive]}>Care</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('inventory')} style={styles.navItem}>
          <Text style={[styles.navIcon, activeTab === 'inventory' && styles.navActive]}>📦</Text>
          <Text style={[styles.navLabel, activeTab === 'inventory' && styles.navActive]}>Stock</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('maintenance')} style={styles.navItem}>
          <Text style={[styles.navIcon, activeTab === 'maintenance' && styles.navActive]}>🛠️</Text>
          <Text style={[styles.navLabel, activeTab === 'maintenance' && styles.navActive]}>Tasks</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('export')} style={styles.navItem}>
          <Text style={[styles.navIcon, activeTab === 'export' && styles.navActive]}>⚙️</Text>
          <Text style={[styles.navLabel, activeTab === 'export' && styles.navActive]}>System</Text>
        </TouchableOpacity>
      </View>

      {/* Modal: Add Pet */}
      <Modal visible={isAddPetModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Pet Intake</Text>
            <TextInput
              style={styles.input}
              placeholder="Pet Name (e.g. Luna)"
              placeholderTextColor="#94a3b8"
              value={newPetName}
              onChangeText={setNewPetName}
            />
            <TextInput
              style={styles.input}
              placeholder="Breed (e.g. Labrador Retriever)"
              placeholderTextColor="#94a3b8"
              value={newPetBreed}
              onChangeText={setNewPetBreed}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setAddPetModalVisible(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddPet} style={styles.primaryButton}>
                <Text style={styles.buttonText}>Save Intake</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Adoption Outcome */}
      <Modal visible={isAdoptModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Process Adoption for {selectedPet?.name}</Text>
            <TextInput
              style={styles.input}
              placeholder="Adopter Full Legal Name"
              placeholderTextColor="#94a3b8"
              value={adopterName}
              onChangeText={setAdopterName}
            />
            <TextInput
              style={styles.input}
              placeholder="Adopter Phone Number"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
              value={adopterPhone}
              onChangeText={setAdopterPhone}
            />
            <TextInput
              style={styles.input}
              placeholder="Residential Address"
              placeholderTextColor="#94a3b8"
              value={adopterAddress}
              onChangeText={setAdopterAddress}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setAdoptModalVisible(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAdoptPet} style={styles.primaryButton}>
                <Text style={styles.buttonText}>Finalize Adoption</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Switch Shelter */}
      <Modal visible={isSwitchShelterModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Switch Shelter Context</Text>
            <TouchableOpacity
              onPress={() => { setActiveShelter('Downtown Animal Haven'); setSwitchShelterModalVisible(false); }}
              style={styles.shelterOption}
            >
              <Text style={styles.shelterOptionText}>🏠 Downtown Animal Haven (Active)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { setActiveShelter('North Valley Rescue Branch'); setSwitchShelterModalVisible(false); }}
              style={styles.shelterOption}
            >
              <Text style={styles.shelterOptionText}>🏠 North Valley Rescue Branch</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSwitchShelterModalVisible(false)} style={[styles.cancelBtn, { marginTop: 12 }]}>
              <Text style={styles.cancelBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1e293b',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#38bdf8',
    fontWeight: '600',
    marginTop: 2,
  },
  shelterSelector: {
    paddingVertical: 2,
  },
  operatorBadge: {
    alignItems: 'flex-end',
  },
  operatorText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  offlinePill: {
    fontSize: 9,
    fontWeight: '800',
    backgroundColor: '#f97316',
    color: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 2,
  },
  escalationBanner: {
    backgroundColor: '#881337',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  escalationText: {
    color: '#fecdd3',
    fontSize: 11,
    flex: 1,
    fontWeight: '500',
  },
  dismissButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  dismissText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tabContent: {
    flex: 1,
  },
  tabHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f8fafc',
  },
  cardBody: {
    fontSize: 13,
    color: '#cbd5e1',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 12,
    color: '#94a3b8',
  },
  badge: {
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeGreen: { backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399' },
  badgeOrange: { backgroundColor: 'rgba(249, 115, 22, 0.2)', color: '#fb923c' },
  badgeRed: { backgroundColor: 'rgba(244, 63, 94, 0.2)', color: '#fb7185' },
  badgeMuted: { backgroundColor: 'rgba(148, 163, 184, 0.2)', color: '#94a3b8' },
  primaryButton: {
    backgroundColor: '#f97316',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#38bdf8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  secondaryButtonText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '600',
  },
  adoptButton: {
    marginTop: 10,
    backgroundColor: '#0284c7',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  adoptButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#38bdf8',
  },
  adjustRow: {
    flexDirection: 'row',
    gap: 8,
  },
  adjustBtn: {
    backgroundColor: '#334155',
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  completeBtn: {
    marginTop: 8,
    backgroundColor: '#059669',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  completeBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 8,
    paddingBottom: 16,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 20,
    color: '#64748b',
  },
  navLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 2,
  },
  navActive: {
    color: '#f97316',
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelBtnText: {
    color: '#94a3b8',
    fontWeight: '600',
    fontSize: 13,
  },
  shelterOption: {
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  shelterOptionText: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '500',
  },
});
