import { RecurrenceUnit } from './enums';

export interface OccurrenceDueCalculation {
  dueDate: string; // ISO-8601 UTC
}

export function calculateOccurrences(
  startDateIso: string,
  unit: RecurrenceUnit,
  value: number,
  countLimit = 12,
  endDateIso?: string | null
): OccurrenceDueCalculation[] {
  const occurrences: OccurrenceDueCalculation[] = [];
  const start = new Date(startDateIso);
  const end = endDateIso ? new Date(endDateIso).getTime() : null;

  if (unit === 'NONE' || value <= 0) {
    return [{ dueDate: start.toISOString() }];
  }

  let current = new Date(start);

  for (let i = 0; i < countLimit; i++) {
    if (end && current.getTime() > end) {
      break;
    }
    occurrences.push({ dueDate: current.toISOString() });

    const next = new Date(current);
    if (unit === 'HOURS') {
      next.setHours(next.getHours() + value);
    } else if (unit === 'DAYS') {
      next.setDate(next.getDate() + value);
    } else if (unit === 'MONTHS') {
      next.setMonth(next.getMonth() + value);
    } else if (unit === 'YEARS') {
      next.setFullYear(next.getFullYear() + value);
    }

    current = next;
  }

  return occurrences;
}
