export interface IMediaStorageService {
  /**
   * Stores a binary buffer to the local filesystem and returns the relative file path.
   */
  storeFile(
    fileBuffer: Buffer | Uint8Array,
    fileName: string,
    mimeType: string,
    shelterId: string
  ): Promise<{ filePath: string; fileSizeBytes: number }>;

  /**
   * Reads a binary file from the local filesystem.
   */
  readFile(filePath: string): Promise<Buffer>;

  /**
   * Permanently deletes a file from the local filesystem.
   */
  deleteFile(filePath: string): Promise<boolean>;
}

export interface InAppAlert {
  id: string;
  shelterId: string;
  title: string;
  message: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  isRead: boolean;
}

export interface INotificationService {
  /**
   * Dispatches a local in-app alert banner.
   */
  sendInAppAlert(
    alert: Omit<InAppAlert, "id" | "createdAt" | "isRead">
  ): Promise<InAppAlert>;

  /**
   * Retrieves unread in-app alerts for the active shelter.
   */
  getUnreadAlerts(shelterId: string): Promise<InAppAlert[]>;

  /**
   * Marks an in-app alert as acknowledged/read.
   */
  markAsRead(alertId: string): Promise<void>;
}
