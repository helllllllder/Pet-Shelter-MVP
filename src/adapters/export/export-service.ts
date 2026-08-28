import * as crypto from 'crypto';
import { IDataExportService, ExportOptions, ExportResult } from '@core/contracts';
import { ExportEnvelopeSchema } from '@core/schemas/export-schema';
import { pets, shelters, operatorProfile, adopterDetails, vetClinics, veterinarians, vetAppointments, vetDocuments, careEvents, careEventOccurrences, auditLogs } from '../sqlite/schema';
import { eq } from 'drizzle-orm';

export class LocalDataExportService implements IDataExportService {
  constructor(private readonly db: any) {}

  async exportData(options: ExportOptions): Promise<ExportResult> {
    const operator = this.db.select().from(operatorProfile).all()[0];
    if (!operator) {
      throw new Error('[EXPORT_FAILED] No operator profile found to attach to export metadata.');
    }

    let targetShelters: any[] = [];
    if (options.exportType === 'SINGLE_SHELTER') {
      if (!options.targetShelterId) {
        throw new Error('[EXPORT_FAILED] targetShelterId is required for SINGLE_SHELTER export.');
      }
      targetShelters = this.db.select().from(shelters).where(eq(shelters.id, options.targetShelterId)).all();
    } else {
      targetShelters = this.db.select().from(shelters).all();
    }

    if (targetShelters.length === 0) {
      throw new Error('[EXPORT_FAILED] No shelters found matching the export criteria.');
    }

    let totalRecords = targetShelters.length;
    const shelterContainers = targetShelters.map((s) => {
      const shelterPets = this.db.select().from(pets).where(eq(pets.shelterId, s.id)).all();
      const shelterAdopters = this.db.select().from(adopterDetails).where(eq(adopterDetails.shelterId, s.id)).all();
      const shelterClinics = this.db.select().from(vetClinics).where(eq(vetClinics.shelterId, s.id)).all();
      const shelterVets = this.db.select().from(veterinarians).where(eq(veterinarians.shelterId, s.id)).all();
      const shelterAppts = this.db.select().from(vetAppointments).where(eq(vetAppointments.shelterId, s.id)).all();
      const shelterDocs = this.db.select().from(vetDocuments).where(eq(vetDocuments.shelterId, s.id)).all();
      const shelterCare = this.db.select().from(careEvents).where(eq(careEvents.shelterId, s.id)).all();
      const shelterOccurrences = this.db.select().from(careEventOccurrences).where(eq(careEventOccurrences.shelterId, s.id)).all();
      const shelterAudits = this.db.select().from(auditLogs).where(eq(auditLogs.shelterId, s.id)).all();

      totalRecords +=
        shelterPets.length +
        shelterAdopters.length +
        shelterClinics.length +
        shelterVets.length +
        shelterAppts.length +
        shelterDocs.length +
        shelterCare.length +
        shelterOccurrences.length +
        shelterAudits.length;

      return {
        shelterId: s.id,
        name: s.name,
        description: s.description,
        address: s.address,
        phone: s.phone,
        email: s.email,
        isActive: Boolean(s.isActive),
        createdAt: s.createdAt,
        pets: shelterPets,
        adopterDetails: shelterAdopters,
        vetClinics: shelterClinics,
        veterinarians: shelterVets,
        vetAppointments: shelterAppts,
        vetDocuments: shelterDocs,
        careEvents: shelterCare,
        careEventOccurrences: shelterOccurrences,
        auditLogs: shelterAudits,
      };
    });

    const now = new Date().toISOString();

    const dataPayload = JSON.stringify({
      operator: {
        operatorId: operator.id,
        fullName: operator.fullName,
        email: operator.email,
      },
      shelters: shelterContainers,
    });

    const checksumSha256 = crypto.createHash('sha256').update(dataPayload).digest('hex');

    const envelope = {
      $schema: 'https://schemas.lunaspetcentral.org/v1/export-envelope.json',
      schemaVersion: '1.0.0' as const,
      exportedAtUtc: now,
      exportType: options.exportType,
      checksumSha256,
      operator: {
        operatorId: operator.id,
        fullName: operator.fullName,
        email: operator.email,
      },
      shelterCount: shelterContainers.length,
      shelters: shelterContainers,
    };

    // Validate against JSON schema contract
    ExportEnvelopeSchema.parse(envelope);

    return {
      filePath: `luna_export_${options.exportType.toLowerCase()}_${Date.now()}.json`,
      checksumSha256,
      exportedAtUtc: now,
      totalRecordsCount: totalRecords,
    };
  }
}
