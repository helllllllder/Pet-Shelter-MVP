/**
 * UUIDv7 generation — time-sortable, collision-resistant.
 * Embeds Unix timestamp (milliseconds) in the first 48 bits.
 */
export function generateUUIDv7(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  // Get current timestamp in milliseconds
  const now = Date.now();

  // Set first 6 bytes to timestamp (48 bits)
  bytes[0] = (now >> 40) & 0xff;
  bytes[1] = (now >> 32) & 0xff;
  bytes[2] = (now >> 24) & 0xff;
  bytes[3] = (now >> 16) & 0xff;
  bytes[4] = (now >> 8) & 0xff;
  bytes[5] = now & 0xff;

  // Set version to 7 (bits 4-7 of byte 6)
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  // Set variant to RFC4122 (bits 6-7 of byte 8)
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  return formatUUID(bytes);
}

function formatUUID(bytes: Uint8Array): string {
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/** Parse a UUID string and extract the timestamp portion (first 48 bits for v7). */
export function getUUIDv7Timestamp(uuid: string): number {
  const hex = uuid.replace(/-/g, '');
  const timestampHex = hex.slice(0, 12);
  return parseInt(timestampHex, 16);
}

/** Validate UUID format (v1-v7). */
export function isValidUUID(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
}
