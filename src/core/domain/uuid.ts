import crypto from "node:crypto";

let lastTimestamp = -1;
let seq = 0;

/**
 * Generates a time-sortable UUID version 7 (RFC 9562).
 */
export function generateUUIDv7(timestampMs: number = Date.now()): string {
  if (timestampMs > lastTimestamp) {
    lastTimestamp = timestampMs;
    seq = 0;
  } else {
    seq = (seq + 1) & 0xfff;
    if (seq === 0) {
      // Sequence overflow in same millisecond, increment timestamp artificially
      lastTimestamp++;
      timestampMs = lastTimestamp;
    }
  }

  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  // 48-bit timestamp (bytes 0-5)
  bytes[0] = (timestampMs / 0x10000000000) & 0xff;
  bytes[1] = (timestampMs / 0x100000000) & 0xff;
  bytes[2] = (timestampMs / 0x1000000) & 0xff;
  bytes[3] = (timestampMs / 0x10000) & 0xff;
  bytes[4] = (timestampMs / 0x100) & 0xff;
  bytes[5] = timestampMs & 0xff;

  // Version 7 in top 4 bits of byte 6, plus top 4 bits of seq in bottom 4 bits of byte 6
  bytes[6] = 0x70 | ((seq >> 8) & 0x0f);
  // Bottom 8 bits of seq in byte 7
  bytes[7] = seq & 0xff;

  // Variant (10xxxxxx) in byte 8
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  // Convert to canonical UUID string format 8-4-4-4-12
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}
