import { describe, expect, it } from 'vitest';
import { generateUUIDv7, getUUIDv7Timestamp, isValidUUID } from './uuid';

describe('UUIDv7', () => {
  it('generates valid UUID format', () => {
    const uuid = generateUUIDv7();
    expect(isValidUUID(uuid)).toBe(true);
  });

  it('generates unique UUIDs', () => {
    const set = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      set.add(generateUUIDv7());
    }
    expect(set.size).toBe(1000);
  });

  it('produces time-sortable UUIDs', () => {
    const uuids: string[] = [];
    for (let i = 0; i < 10; i++) {
      uuids.push(generateUUIDv7());
    }
    const timestamps = uuids.map(getUUIDv7Timestamp);
    expect(timestamps).toEqual([...timestamps].sort((a, b) => a - b));
  });

  it('rejects invalid UUID format', () => {
    expect(isValidUUID('not-a-uuid')).toBe(false);
    expect(isValidUUID('')).toBe(false);
    expect(isValidUUID('123')).toBe(false);
  });

  it('accepts valid UUID formats', () => {
    expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(isValidUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
  });
});
