import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDatabase, ScopedRepositoryFactory } from '@adapters/sqlite';
import {
  RegisterOperatorUseCase,
  CreateShelterUseCase,
  CreatePetUseCase,
  CreateInventoryItemUseCase,
  CreateUsageTemplateUseCase,
  RecordCareWithTemplateUseCase,
} from '@core/usecases';

describe('1-Click Inventory Usage Templates & Care Decrement Tests (FR21, ADR 0004, TC-FR21-01)', () => {
  let db: any;
  let sqlite: any;
  let factory: ScopedRepositoryFactory;
  let session: any;
  let inventoryRepo: any;
  let careRepo: any;
  let petRepo: any;
  let petId: string;

  beforeEach(async () => {
    const instance = createTestDatabase(true);
    db = instance.db;
    sqlite = instance.sqlite;
    factory = new ScopedRepositoryFactory(db);

    const operatorRepo = factory.getOperatorRepository();
    const shelterRepo = factory.getShelterRepository();

    const regOp = new RegisterOperatorUseCase(operatorRepo);
    await regOp.execute({ fullName: 'Vet Tech Clara', email: 'clara@sheltercare.org' });

    const createShelter = new CreateShelterUseCase(shelterRepo, operatorRepo);
    const shelter = await createShelter.execute({ name: 'Template Care Hub' });

    session = factory.createSession(shelter.id);
    inventoryRepo = factory.getInventoryRepository(session);
    careRepo = factory.getCareEventRepository(session);
    petRepo = factory.getPetRepository(session);

    const pet = await petRepo.create({
      name: 'Barnaby',
      species: 'CANINE',
      breed: 'Beagle',
      sex: 'MALE',
      color: 'Tricolor',
      dateOfBirth: '2023-01-01',
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
  });

  afterEach(() => {
    sqlite.close();
  });

  it('TC-FR21-01: Automatically decrements template items upon recording care event', async () => {
    const createItem = new CreateInventoryItemUseCase(inventoryRepo);
    const createTemplate = new CreateUsageTemplateUseCase(inventoryRepo);
    const recordCare = new RecordCareWithTemplateUseCase(careRepo, inventoryRepo);

    const vaccineDose = await createItem.execute({
      name: 'Distemper Vaccine Vial',
      category: 'MEDICATION',
      quantity: 50,
      unitOfMeasure: 'UNITS',
    });

    const syringe = await createItem.execute({
      name: '3ml Syringe with Needle',
      category: 'EQUIPMENT',
      quantity: 100,
      unitOfMeasure: 'UNITS',
    });

    const template = await createTemplate.execute({
      name: 'Standard Puppy Vaccination Pack',
      description: '1 vaccine vial + 1 syringe',
      items: [
        { inventoryItemId: vaccineDose.id, quantityToDecrement: 1 },
        { inventoryItemId: syringe.id, quantityToDecrement: 1 },
      ],
    });

    expect(template.id).toBeDefined();

    // Record care event with template attachment
    await recordCare.execute({
      petId,
      modality: 'VACCINE',
      substanceName: 'Canine Distemper',
      dosage: '1 dose',
      recurrenceIntervalUnit: 'NONE',
      recurrenceIntervalValue: 0,
      startDate: new Date().toISOString(),
      inventoryUsageTemplateId: template.id,
    });

    // Check inventory decrement
    const updatedVial = await inventoryRepo.getById(vaccineDose.id);
    const updatedSyringe = await inventoryRepo.getById(syringe.id);

    expect(updatedVial?.quantity).toBe(49);
    expect(updatedSyringe?.quantity).toBe(99);
  });
});
