import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDatabase, shelters, pets, operatorProfile, careEvents, vetAppointments, vetClinics } from '@adapters/sqlite';
import { generateUUIDv7 } from '@core/domain';
import { eq } from 'drizzle-orm';

describe('SQLite DDL Schema & Drizzle ORM Tests', () => {
  let db: any;
  let sqlite: any;

  beforeEach(() => {
    const instance = createTestDatabase(true);
    db = instance.db;
    sqlite = instance.sqlite;
  });

  afterEach(() => {
    sqlite.close();
  });

  it('UUIDv7 generator produces valid format and time-ordered values', () => {
    const id1 = generateUUIDv7();
    const id2 = generateUUIDv7();

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(id1).toMatch(uuidRegex);
    expect(id2).toMatch(uuidRegex);
    expect(id1 < id2 || id1 <= id2).toBe(true);
  });

  it('Creates operator profile and shelter containers with relational cascade', () => {
    const operatorId = generateUUIDv7();
    const shelterId = generateUUIDv7();
    const now = new Date().toISOString();

    db.insert(operatorProfile).values({
      id: operatorId,
      fullName: 'Jane Doe',
      email: 'jane@petshelter.org',
      phone: '+1234567890',
      lastActiveShelterId: shelterId,
      deviceInstallId: 'device-test-123',
      createdAt: now,
      updatedAt: now,
    }).run();

    db.insert(shelters).values({
      id: shelterId,
      name: 'Safe Haven Rescue',
      description: 'Rescue sanctuary',
      address: '100 Forest Rd',
      phone: '+1234567890',
      email: 'safe@haven.org',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }).run();

    const petId = generateUUIDv7();
    db.insert(pets).values({
      id: petId,
      shelterId: shelterId,
      name: 'Barnaby',
      species: 'CANINE',
      breed: 'Golden Retriever',
      sex: 'MALE',
      color: 'Golden',
      dateOfBirth: '2020-05-10',
      isDobEstimated: false,
      intakeOrigin: 'STREET_RESCUE',
      intakeOriginDetails: null,
      healthStatus: 'HEALTHY',
      healthConditions: '[]',
      isAvailableForAdoption: true,
      outcomeStatus: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    }).run();

    const fetchedPets = db.select().from(pets).where(eq(pets.shelterId, shelterId)).all();
    expect(fetchedPets.length).toBe(1);
    expect(fetchedPets[0].name).toBe('Barnaby');

    // Deleting shelter cascades to pets
    db.delete(shelters).where(eq(shelters.id, shelterId)).run();
    const remainingPets = db.select().from(pets).where(eq(pets.id, petId)).all();
    expect(remainingPets.length).toBe(0);
  });

  it('Prevents orphaned pets with non-existent shelterId foreign key violation', () => {
    const invalidShelterId = generateUUIDv7();
    const petId = generateUUIDv7();
    const now = new Date().toISOString();

    expect(() => {
      db.insert(pets).values({
        id: petId,
        shelterId: invalidShelterId,
        name: 'Ghost',
        species: 'FELINE',
        breed: 'Tabby',
        sex: 'FEMALE',
        color: 'Orange',
        dateOfBirth: '2023-01-01',
        intakeOrigin: 'STREET_RESCUE',
        createdAt: now,
        updatedAt: now,
      }).run();
    }).toThrow();
  });
});
