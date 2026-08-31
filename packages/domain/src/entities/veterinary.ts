import { generateUUIDv7 } from '../uuid.js';

export interface VeterinaryClinic {
  id: string;
  shelterId: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Veterinarian {
  id: string;
  shelterId: string;
  clinicId: string;
  name: string;
  specialization?: string;
  phone?: string;
  email?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  shelterId: string;
  petId: string;
  clinicId: string;
  veterinarianId: string;
  scheduledAt: Date;
  notes?: string;
  isRetroactive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class VeterinaryValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VeterinaryValidationError';
  }
}

export class VeterinaryClinicEntity {
  static create(shelterId: string, name: string, options?: { address?: string; phone?: string; email?: string }): VeterinaryClinic {
    const validated = VeterinaryClinicEntity.validate(name);
    const now = new Date();
    return {
      id: generateUUIDv7(),
      shelterId,
      name: validated.name,
      address: options?.address?.trim() || undefined,
      phone: options?.phone?.trim() || undefined,
      email: options?.email?.trim().toLowerCase() || undefined,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };
  }

  static update(
    clinic: VeterinaryClinic,
    name: string,
    options?: { address?: string; phone?: string; email?: string },
  ): VeterinaryClinic {
    const validated = VeterinaryClinicEntity.validate(name);
    return {
      ...clinic,
      name: validated.name,
      address: options?.address !== undefined ? (options.address.trim() || undefined) : clinic.address,
      phone: options?.phone !== undefined ? (options.phone.trim() || undefined) : clinic.phone,
      email: options?.email !== undefined ? (options.email.trim().toLowerCase() || undefined) : clinic.email,
      updatedAt: new Date(),
    };
  }

  static softDelete(clinic: VeterinaryClinic): VeterinaryClinic {
    return { ...clinic, isDeleted: true, updatedAt: new Date() };
  }

  private static validate(name: string): { name: string } {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new VeterinaryValidationError('Clinic name is required');
    }
    return { name: trimmedName };
  }
}

export class VeterinarianEntity {
  static create(
    shelterId: string,
    clinicId: string,
    name: string,
    options?: { specialization?: string; phone?: string; email?: string },
  ): Veterinarian {
    const validated = VeterinarianEntity.validate(name);
    const now = new Date();
    return {
      id: generateUUIDv7(),
      shelterId,
      clinicId,
      name: validated.name,
      specialization: options?.specialization?.trim() || undefined,
      phone: options?.phone?.trim() || undefined,
      email: options?.email?.trim().toLowerCase() || undefined,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };
  }

  static update(
    vet: Veterinarian,
    name: string,
    options?: { specialization?: string; phone?: string; email?: string },
  ): Veterinarian {
    const validated = VeterinarianEntity.validate(name);
    return {
      ...vet,
      name: validated.name,
      specialization: options?.specialization !== undefined ? (options.specialization.trim() || undefined) : vet.specialization,
      phone: options?.phone !== undefined ? (options.phone.trim() || undefined) : vet.phone,
      email: options?.email !== undefined ? (options.email.trim().toLowerCase() || undefined) : vet.email,
      updatedAt: new Date(),
    };
  }

  static softDelete(vet: Veterinarian): Veterinarian {
    return { ...vet, isDeleted: true, updatedAt: new Date() };
  }

  private static validate(name: string): { name: string } {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new VeterinaryValidationError('Veterinarian name is required');
    }
    return { name: trimmedName };
  }
}

export class AppointmentEntity {
  static create(
    shelterId: string,
    petId: string,
    clinicId: string,
    veterinarianId: string,
    scheduledAt: Date,
    notes?: string,
  ): Appointment {
    if (!petId.trim()) {
      throw new VeterinaryValidationError('Pet ID is required');
    }
    if (!clinicId.trim()) {
      throw new VeterinaryValidationError('Clinic ID is required');
    }
    if (!veterinarianId.trim()) {
      throw new VeterinaryValidationError('Veterinarian ID is required');
    }

    const isRetroactive = scheduledAt < new Date();

    return {
      id: generateUUIDv7(),
      shelterId,
      petId: petId.trim(),
      clinicId: clinicId.trim(),
      veterinarianId: veterinarianId.trim(),
      scheduledAt,
      notes: notes?.trim() || undefined,
      isRetroactive,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  static update(
    appointment: Appointment,
    updates: Partial<Pick<Appointment, 'scheduledAt' | 'notes' | 'clinicId' | 'veterinarianId'>>,
  ): Appointment {
    const now = new Date();
    const scheduledAt = updates.scheduledAt ?? appointment.scheduledAt;
    const isRetroactive = scheduledAt < now;

    return {
      ...appointment,
      ...(updates.clinicId !== undefined ? { clinicId: updates.clinicId.trim() } : {}),
      ...(updates.veterinarianId !== undefined ? { veterinarianId: updates.veterinarianId.trim() } : {}),
      scheduledAt,
      notes: updates.notes !== undefined ? (updates.notes.trim() || undefined) : appointment.notes,
      isRetroactive,
      updatedAt: now,
    };
  }
}
