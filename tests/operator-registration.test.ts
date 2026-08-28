import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDatabase, ScopedRepositoryFactory } from '@adapters/sqlite';
import { RegisterOperatorUseCase, GetOperatorSessionUseCase } from '@core/usecases';

describe('Local Operator Profile Registration Tests (FR01, TC-FR01-01..03)', () => {
  let db: any;
  let sqlite: any;
  let factory: ScopedRepositoryFactory;
  let operatorRepo: any;

  beforeEach(() => {
    const instance = createTestDatabase(true);
    db = instance.db;
    sqlite = instance.sqlite;
    factory = new ScopedRepositoryFactory(db);
    operatorRepo = factory.getOperatorRepository();
  });

  afterEach(() => {
    sqlite.close();
  });

  it('TC-FR01-01: Valid registration creates local operator and grants immediate access', async () => {
    const registerUseCase = new RegisterOperatorUseCase(operatorRepo);
    const sessionUseCase = new GetOperatorSessionUseCase(operatorRepo);

    // Initial check: not registered
    const initialSession = await sessionUseCase.execute();
    expect(initialSession.isRegistered).toBe(false);
    expect(initialSession.profile).toBeNull();

    // Register operator
    const profile = await registerUseCase.execute({
      fullName: 'Carlos Santana',
      email: 'carlos@petcentral.org',
      phone: '+55 11 98765-4321',
    });

    expect(profile.id).toBeDefined();
    expect(profile.fullName).toBe('Carlos Santana');
    expect(profile.email).toBe('carlos@petcentral.org');
    expect(profile.phone).toBe('+55 11 98765-4321');

    // Post-registration check: registered and accessible
    const activeSession = await sessionUseCase.execute();
    expect(activeSession.isRegistered).toBe(true);
    expect(activeSession.profile?.fullName).toBe('Carlos Santana');
  });

  it('TC-FR01-02: Rejects incomplete or invalid registration details with validation errors', async () => {
    const registerUseCase = new RegisterOperatorUseCase(operatorRepo);

    // Invalid email
    await expect(
      registerUseCase.execute({
        fullName: 'Carlos Santana',
        email: 'invalid-email-address',
      })
    ).rejects.toThrow();

    // Empty name
    await expect(
      registerUseCase.execute({
        fullName: '',
        email: 'valid@petcentral.org',
      })
    ).rejects.toThrow();
  });

  it('TC-FR01-03: Returning operator loads existing profile without auth prompt', async () => {
    const registerUseCase = new RegisterOperatorUseCase(operatorRepo);
    const sessionUseCase = new GetOperatorSessionUseCase(operatorRepo);

    await registerUseCase.execute({
      fullName: 'Marina Silva',
      email: 'marina@petcentral.org',
    });

    // Simulate returning operator app restart
    const restoredSession = await sessionUseCase.execute();
    expect(restoredSession.isRegistered).toBe(true);
    expect(restoredSession.profile?.email).toBe('marina@petcentral.org');

    // Attempting duplicate registration fails
    await expect(
      registerUseCase.execute({
        fullName: 'Duplicate User',
        email: 'duplicate@petcentral.org',
      })
    ).rejects.toThrow('[OPERATOR_ALREADY_REGISTERED]');
  });
});
