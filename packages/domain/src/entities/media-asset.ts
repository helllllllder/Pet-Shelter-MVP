import { generateUUIDv7 } from '../uuid';

export type MediaType = 'photo' | 'video';
export type MimeType = 'image/jpeg' | 'image/png' | 'image/gif' | 'video/mp4' | 'video/quicktime';

export interface MediaAsset {
  id: string;
  entityId: string;
  entityType: 'pet' | 'appointment';
  fileName: string;
  filePath: string;
  mimeType: MimeType;
  fileSizeBytes: number;
  uploadedAt: Date;
}

export class MediaValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MediaValidationError';
  }
}

const ALLOWED_MIME_TYPES: Set<MimeType> = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'video/mp4',
  'video/quicktime',
]);

export class MediaAsset {
  static create(
    entityId: string,
    entityType: 'pet' | 'appointment',
    fileName: string,
    filePath: string,
    mimeType: MimeType,
    fileSizeBytes: number,
  ): MediaAsset {
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      throw new MediaValidationError(`Unsupported media type: ${mimeType}`);
    }
    if (fileSizeBytes <= 0) {
      throw new MediaValidationError('File size must be positive');
    }
    if (!entityId.trim()) {
      throw new MediaValidationError('Entity ID is required');
    }

    return {
      id: generateUUIDv7(),
      entityId: entityId.trim(),
      entityType,
      fileName: fileName.trim(),
      filePath: filePath.trim(),
      mimeType,
      fileSizeBytes,
      uploadedAt: new Date(),
    };
  }
}
