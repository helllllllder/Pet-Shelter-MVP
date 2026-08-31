import { generateUUIDv7 } from '../uuid.js';

export interface OperatorProfile {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export class OperatorValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OperatorValidationError';
  }
}

export class Operator {
  static create(name: string, email: string): OperatorProfile {
    const validated = Operator.validate(name, email);
    const now = new Date();
    return {
      id: generateUUIDv7(),
      name: validated.name,
      email: validated.email,
      createdAt: now,
      updatedAt: now,
    };
  }

  static update(profile: OperatorProfile, name: string, email: string): OperatorProfile {
    const validated = Operator.validate(name, email);
    return {
      ...profile,
      name: validated.name,
      email: validated.email,
      updatedAt: new Date(),
    };
  }

  private static validate(name: string, email: string): { name: string; email: string } {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      throw new OperatorValidationError('Name is required');
    }
    if (trimmedName.length < 2) {
      throw new OperatorValidationError('Name must be at least 2 characters');
    }
    if (!trimmedEmail) {
      throw new OperatorValidationError('Email is required');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      throw new OperatorValidationError('Email must be a valid email address');
    }

    return { name: trimmedName, email: trimmedEmail };
  }
}
