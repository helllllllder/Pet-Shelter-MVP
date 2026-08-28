export interface ExportOptions {
  exportType: 'SINGLE_SHELTER' | 'ALL_SHELTERS';
  targetShelterId?: string;
}

export interface ExportResult {
  filePath: string;
  checksumSha256: string;
  exportedAtUtc: string;
  totalRecordsCount: number;
}

export interface IDataExportService {
  exportData(options: ExportOptions): Promise<ExportResult>;
}

export interface IFileStorageService {
  saveFile(sourceUri: string, destinationRelativePath: string): Promise<{ localPath: string; sha256: string; sizeBytes: number }>;
  deleteFile(localRelativePath: string): Promise<void>;
  getAvailableDiskSpaceBytes(): Promise<number>;
}
