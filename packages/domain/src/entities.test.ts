import { describe, expect, it } from 'vitest';
import {
  Operator,
  Shelter,
  Pet,
  MediaAsset,
  VeterinaryClinicEntity,
  VeterinarianEntity,
  AppointmentEntity,
  CareEventEntity,
  CareOccurrenceEntity,
} from './index';
import { PetOutcome } from './pet-lifecycle';

describe('Operator', () => {
  it('creates a valid operator profile', () => {
    const profile = Operator.create('John Doe', 'john@example.com');
    expect(profile.name).toBe('John Doe');
    expect(profile.email).toBe('john@example.com');
    expect(profile.id).toBeTruthy();
    expect(profile.createdAt).toBeInstanceOf(Date);
  });

  it('rejects empty name', () => {
    expect(() => Operator.create('', 'john@example.com')).toThrow('Name is required');
  });

  it('rejects short name', () => {
    expect(() => Operator.create('J', 'john@example.com')).toThrow('at least 2 characters');
  });

  it('rejects invalid email', () => {
    expect(() => Operator.create('John Doe', 'not-an-email')).toThrow('valid email');
  });

  it('trims and lowercases email on update', () => {
    const profile = Operator.create('John Doe', 'JOHN@EXAMPLE.COM');
    const updated = Operator.update(profile, 'John Smith', '  john.smith@example.com  ');
    expect(updated.email).toBe('john.smith@example.com');
    expect(updated.name).toBe('John Smith');
  });
});

describe('Shelter', () => {
  it('creates a shelter with name only', () => {
    const shelter = Shelter.create('Downtown Shelter');
    expect(shelter.name).toBe('Downtown Shelter');
    expect(shelter.shelterId).toBeTruthy();
  });

  it('creates a shelter with description', () => {
    const shelter = Shelter.create('Uptown Shelter', 'Main campus facility');
    expect(shelter.description).toBe('Main campus facility');
  });

  it('allows duplicate names', () => {
    const s1 = Shelter.create('Same Name');
    const s2 = Shelter.create('Same Name');
    expect(s1.id).not.toBe(s2.id);
  });

  it('rejects empty name', () => {
    expect(() => Shelter.create('')).toThrow('required');
  });
});

describe('Pet', () => {
  it('creates a valid pet profile', () => {
    const pet = Pet.create(
      'shelter-1',
      'Luna',
      'Cat',
      'StreetRescue',
      'Healthy',
      { estimatedDOB: true },
    );
    expect(pet.name).toBe('Luna');
    expect(pet.species).toBe('Cat');
    expect(pet.estimatedDOB).toBe(true);
    expect(pet.status).toBe('active');
    expect(pet.availableForAdoption).toBe(false);
  });

  it('allows duplicate names within shelter', () => {
    const p1 = Pet.create('s1', 'Luna', 'Cat', 'StreetRescue', 'Healthy');
    const p2 = Pet.create('s1', 'Luna', 'Dog', 'OwnerSurrender', 'Healthy');
    expect(p1.id).not.toBe(p2.id);
  });

  it('rejects empty name', () => {
    expect(() => Pet.create('s1', '', 'Cat', 'StreetRescue', 'Healthy')).toThrow('required');
  });

  it('sets availableForAdoption based on option', () => {
    const pet = Pet.create('s1', 'Luna', 'Cat', 'StreetRescue', 'Healthy', {
      availableForAdoption: true,
    });
    expect(pet.availableForAdoption).toBe(true);
  });

  it('updates pet fields', () => {
    const pet = Pet.create('s1', 'Luna', 'Cat', 'StreetRescue', 'Healthy');
    const updated = Pet.update(pet, { color: 'Orange' });
    expect(updated.color).toBe('Orange');
    expect(updated.name).toBe('Luna');
  });
});

describe('MediaAsset', () => {
  it('creates a valid media asset', () => {
    const asset = MediaAsset.create(
      'pet-1',
      'pet',
      'luna.jpg',
      '/storage/luna.jpg',
      'image/jpeg',
      1024,
    );
    expect(asset.fileName).toBe('luna.jpg');
    expect(asset.entityType).toBe('pet');
  });

  it('rejects unsupported MIME type', () => {
    expect(() =>
      MediaAsset.create('pet-1', 'pet', 'doc.pdf', '/storage/doc.pdf', 'application/pdf', 512),
    ).toThrow('Unsupported media type');
  });

  it('rejects zero file size', () => {
    expect(() =>
      MediaAsset.create('pet-1', 'pet', 'empty.jpg', '/storage/empty.jpg', 'image/jpeg', 0),
    ).toThrow('positive');
  });
});

describe('VeterinaryClinicEntity', () => {
  it('creates a clinic', () => {
    const clinic = VeterinaryClinicEntity.create('s1', 'City Vet Clinic', {
      phone: '555-1234',
    });
    expect(clinic.name).toBe('City Vet Clinic');
    expect(clinic.isDeleted).toBe(false);
  });

  it('soft deletes a clinic', () => {
    const clinic = VeterinaryClinicEntity.create('s1', 'City Vet Clinic');
    const deleted = VeterinaryClinicEntity.softDelete(clinic);
    expect(deleted.isDeleted).toBe(true);
  });

  it('rejects empty name', () => {
    expect(() => VeterinaryClinicEntity.create('s1', '')).toThrow('required');
  });
});

describe('VeterinarianEntity', () => {
  it('creates a veterinarian', () => {
    const vet = VeterinarianEntity.create('s1', 'clinic-1', 'Dr. Smith', {
      specialization: 'Exotic Animals',
    });
    expect(vet.name).toBe('Dr. Smith');
    expect(vet.specialization).toBe('Exotic Animals');
  });

  it('rejects empty name', () => {
    expect(() => VeterinarianEntity.create('s1', 'clinic-1', '')).toThrow('required');
  });
});

describe('AppointmentEntity', () => {
  it('creates a future appointment', () => {
    const future = new Date(Date.now() + 86400000); // tomorrow
    const appt = AppointmentEntity.create('s1', 'pet-1', 'clinic-1', 'vet-1', future, 'Checkup');
    expect(appt.isRetroactive).toBe(false);
    expect(appt.notes).toBe('Checkup');
  });

  it('marks past appointment as retroactive', () => {
    const past = new Date(Date.now() - 86400000); // yesterday
    const appt = AppointmentEntity.create('s1', 'pet-1', 'clinic-1', 'vet-1', past);
    expect(appt.isRetroactive).toBe(true);
  });

  it('rejects missing pet ID', () => {
    expect(() => AppointmentEntity.create('s1', '', 'clinic-1', 'vet-1', new Date())).toThrow(
      'Pet ID',
    );
  });
});

describe('CareEventEntity', () => {
  it('creates a care event', () => {
    const event = CareEventEntity.create('s1', 'pet-1', 'Vaccine', new Date(), {
      substance: 'Rabies',
    });
    expect(event.modality).toBe('Vaccine');
    expect(event.substance).toBe('Rabies');
    expect(event.status).toBe('Pending');
  });

  it('rejects future due date', () => {
    const future = new Date(Date.now() + 86400000);
    expect(() => CareEventEntity.create('s1', 'pet-1', 'Vaccine', future)).toThrow('future');
  });

  it('marks event as completed', () => {
    const event = CareEventEntity.create('s1', 'pet-1', 'Vaccine', new Date());
    const completed = CareEventEntity.markCompleted(event, new Date());
    expect(completed.status).toBe('Completed');
  });

  it('cancels an event', () => {
    const event = CareEventEntity.create('s1', 'pet-1', 'Vaccine', new Date());
    const cancelled = CareEventEntity.cancel(event);
    expect(cancelled.status).toBe('Cancelled');
  });
});

describe('CareOccurrenceEntity', () => {
  it('creates an occurrence', () => {
    const occ = CareOccurrenceEntity.create('event-1', new Date());
    expect(occ.careEventId).toBe('event-1');
    expect(occ.status).toBe('Pending');
  });

  it('rejects empty care event ID', () => {
    expect(() => CareOccurrenceEntity.create('', new Date())).toThrow('required');
  });
});
