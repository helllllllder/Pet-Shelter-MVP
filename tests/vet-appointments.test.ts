import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDatabase, ScopedRepositoryFactory } from '@adapters/sqlite';
import { RegisterOperatorUseCase, CreateShelterUseCase, CreatePetUseCase, LogAppointmentUseCase } from '@core/usecases';

describe('Vet Directory & Appointments Logging Tests (FR11, FR12, FR13, FR14)', () => {
  let db: any;
  let sqlite: any;
  let factory: ScopedRepositoryFactory;
  let session: any;
  let vetRepo: any;
  let petId: string;
  let clinicId: string;

  beforeEach(async () => {
    const instance = createTestDatabase(true);
    db = instance.db;
    sqlite = instance.sqlite;
    factory = new ScopedRepositoryFactory(db);

    const operatorRepo = factory.getOperatorRepository();
    const shelterRepo = factory.getShelterRepository();

    const regOp = new RegisterOperatorUseCase(operatorRepo);
    await regOp.execute({ fullName: 'Operator Paul', email: 'paul@vetclinic.org' });

    const createShelter = new CreateShelterUseCase(shelterRepo, operatorRepo);
    const shelter = await createShelter.execute({ name: 'City Rescue Hub' });

    session = factory.createSession(shelter.id);
    vetRepo = factory.getVetDirectoryRepository(session);
    const petRepo = factory.getPetRepository(session);

    const pet = await petRepo.create({
      name: 'Shadow',
      species: 'CANINE',
      breed: 'Husky',
      sex: 'MALE',
      color: 'Grey',
      dateOfBirth: '2021-05-01',
      isDobEstimated: false,
      intakeOrigin: 'STREET_RESCUE',
      intakeOriginDetails: null,
      healthStatus: 'HEALTHY',
      healthConditions: [],
      isAvailableForAdoption: true,
      outcomeStatus: 'ACTIVE',
      outcomeDate: null,
      outcomeNotes: null,
      mediaReferences: [],
    });
    petId = pet.id;

    const clinic = await vetRepo.createClinic({
      name: 'Metropolis Animal Hospital',
      phone: '+1 555-0900',
      email: 'info@metropolisvet.com',
      address: '456 Broadway',
      emergencyServices: true,
      notes: '24/7 emergency care',
    });
    clinicId = clinic.id;
  });

  afterEach(() => {
    sqlite.close();
  });

  it('TC-FR11-01: Creates and lists shelter-scoped vet clinics', async () => {
    const clinics = await vetRepo.listClinics();
    expect(clinics.length).toBe(1);
    expect(clinics[0].name).toBe('Metropolis Animal Hospital');
    expect(clinics[0].emergencyServices).toBe(true);
  });

  it('TC-FR12-01 & TC-FR12-02: Logs appointment with retroactive warning confirmation', async () => {
    const logAppt = new LogAppointmentUseCase(vetRepo);

    const pastDate = new Date(Date.now() - 86400000 * 5).toISOString(); // 5 days ago

    // Attempt retroactive logging without explicit confirmation
    await expect(
      logAppt.execute({
        petId,
        clinicId,
        appointmentDate: pastDate,
        reason: 'Annual Vaccination Checkup',
      })
    ).rejects.toThrow('[RETROACTIVE_CONFIRMATION_REQUIRED]');

    // Log with confirmation
    const appt = await logAppt.execute({
      petId,
      clinicId,
      appointmentDate: pastDate,
      reason: 'Annual Vaccination Checkup',
      confirmRetroactive: true,
    });

    expect(appt.id).toBeDefined();
    expect(appt.isRetroactive).toBe(true);
    expect(appt.reason).toBe('Annual Vaccination Checkup');
  });

  it('TC-FR13-01: Attaches medical documents with SHA-256 integrity hash', async () => {
    const logAppt = new LogAppointmentUseCase(vetRepo);
    const appt = await logAppt.execute({
      petId,
      clinicId,
      appointmentDate: new Date().toISOString(),
      reason: 'Blood Panel Diagnostics',
    });

    const doc = await vetRepo.attachDocument({
      appointmentId: appt.id,
      fileName: 'blood_panel_results.pdf',
      fileType: 'APPLICATION_PDF',
      fileSizeBytes: 204850,
      localRelativePath: `media/documents/${appt.id}/blood_panel_results.pdf`,
      sha256Checksum: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
      uploadedAt: new Date().toISOString(),
    });

    expect(doc.id).toBeDefined();
    expect(doc.fileName).toBe('blood_panel_results.pdf');

    const docs = await vetRepo.listDocumentsByAppointment(appt.id);
    expect(docs.length).toBe(1);
    expect(docs[0].sha256Checksum).toBe('a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e');
  });

  it('TC-FR14-02: Soft-deleting appointment marks deletedAt timestamp', async () => {
    const logAppt = new LogAppointmentUseCase(vetRepo);
    const appt = await logAppt.execute({
      petId,
      clinicId,
      appointmentDate: new Date().toISOString(),
      reason: 'Follow-up exam',
    });

    await vetRepo.softDeleteAppointment(appt.id);

    const fetched = await vetRepo.getAppointmentById(appt.id);
    expect(fetched?.deletedAt).toBeDefined();
  });
});
