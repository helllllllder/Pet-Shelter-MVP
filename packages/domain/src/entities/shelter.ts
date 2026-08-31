import { generateUUIDv7 } from '../uuid.js';

export interface Shelter {
  id: string;
  shelterId: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ShelterValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ShelterValidationError';
  }
}

export class Shelter {
  static create(name: string, description?: string): Shelter {
    const validated = Shelter.validate(name);
    const now = new Date();
    const id = generateUUIDv7();
    return {
      id,
      shelterId: id,
      name: validated.name,
      description: description?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };
  }

  static update(shelter: Shelter, name: string, description?: string): Shelter {
    const validated = Shelter.validate(name);
    return {
      ...shelter,
      name: validated.name,
      description: description !== undefined ? (description.trim() || undefined) : shelter.description,
      updatedAt: new Date(),
    };
  }

  private static validate(name: string): { name: string } {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new ShelterValidationError('Shelter name is required');
    }
    if (trimmedName.length < 2) {
      throw new ShelterValidationError('Shelter name must be at least 2 characters');
    }
    return { name: trimmedName };
  }
}
