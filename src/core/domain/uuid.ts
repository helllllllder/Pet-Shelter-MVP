/**
 * RFC 9562 compliant UUIDv7 generator (Pure TypeScript, zero dependencies).
 * Generates 128-bit time-ordered UUIDs with millisecond precision timestamp and random bits.
 */
export function generateUUIDv7(): string {
  const timestamp = Date.now();
  const hexTimestamp = timestamp.toString(16).padStart(12, '0');

  // Generate 10 random bytes (80 bits)
  const randomBytes = new Uint8Array(10);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < 10; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }
  }

  // Version 7 (0111) in the most significant 4 bits of octet 6
  randomBytes[0] = (randomBytes[0] & 0x0f) | 0x70;

  // Variant (10) in the most significant 2 bits of octet 8
  randomBytes[2] = (randomBytes[2] & 0x3f) | 0x80;

  const hexRandom = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  // Form UUID: 8-4-4-4-12
  const part1 = hexTimestamp.slice(0, 8);
  const part2 = hexTimestamp.slice(8, 12);
  const part3 = hexRandom.slice(0, 4);
  const part4 = hexRandom.slice(4, 8);
  const part5 = hexRandom.slice(8, 20);

  return `${part1}-${part2}-${part3}-${part4}-${part5}`;
}
