import { create } from "zustand";

export type ModalityType =
  | "Vaccine"
  | "Vermifuge"
  | "Medication"
  | "PhysicalTherapy"
  | "Grooming";

export interface RecurrenceConfig {
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  interval: number;
  count?: number;
  until?: string; // YYYY-MM-DD
}

export interface CareEventItem {
  id: string;
  shelterId: string;
  petId: string;
  modality: ModalityType;
  substance: string;
  instructions?: string | null;
  startDate: string; // YYYY-MM-DD
  recurrenceRule?: RecurrenceConfig | null;
  temporaryEndDate?: string | null; // YYYY-MM-DD
  status: "active" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface CareOccurrenceItem {
  id: string;
  careEventId: string;
  shelterId: string;
  petId: string;
  modality: ModalityType;
  substance: string;
  dueDate: string; // YYYY-MM-DD
  status: "scheduled" | "completed" | "skipped" | "overdue";
  completedAt?: string | null;
  completionNotes?: string | null;
  skippedReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CareState {
  careEvents: CareEventItem[];
  occurrences: CareOccurrenceItem[];
  setCareEvents: (events: CareEventItem[]) => void;
  setOccurrences: (occurrences: CareOccurrenceItem[]) => void;
  addCareEvent: (event: CareEventItem) => void;
  completeOccurrence: (id: string, notes?: string) => void;
  skipOccurrence: (id: string, reason: string) => void;
  cancelCareEvent: (id: string) => void;
}

function computeOccurrences(event: CareEventItem): CareOccurrenceItem[] {
  const list: CareOccurrenceItem[] = [];
  const now = new Date().toISOString();
  const startDate = new Date(event.startDate + "T00:00:00Z");

  if (!event.recurrenceRule) {
    list.push({
      id: `occ-${event.id}-0`,
      careEventId: event.id,
      shelterId: event.shelterId,
      petId: event.petId,
      modality: event.modality,
      substance: event.substance,
      dueDate: event.startDate,
      status: "scheduled",
      createdAt: now,
      updatedAt: now,
    });
    return list;
  }

  const { frequency, interval } = event.recurrenceRule;
  const maxOccurrences = event.recurrenceRule.count || 7; // default max 7 projected occurrences
  const untilDate = event.temporaryEndDate || event.recurrenceRule.until;

  for (let i = 0; i < maxOccurrences; i++) {
    const cur = new Date(startDate.getTime());
    if (frequency === "daily") {
      cur.setUTCDate(cur.getUTCDate() + i * interval);
    } else if (frequency === "weekly") {
      cur.setUTCDate(cur.getUTCDate() + i * interval * 7);
    } else if (frequency === "monthly") {
      cur.setUTCMonth(cur.getUTCMonth() + i * interval);
    } else if (frequency === "yearly") {
      cur.setUTCFullYear(cur.getUTCFullYear() + i * interval);
    }

    const dateStr = cur.toISOString().split("T")[0];
    if (untilDate && dateStr > untilDate) {
      break;
    }

    list.push({
      id: `occ-${event.id}-${i}`,
      careEventId: event.id,
      shelterId: event.shelterId,
      petId: event.petId,
      modality: event.modality,
      substance: event.substance,
      dueDate: dateStr,
      status: "scheduled",
      createdAt: now,
      updatedAt: now,
    });
  }

  return list;
}

export const useCareStore = create<CareState>((set) => ({
  careEvents: [],
  occurrences: [],

  setCareEvents: (careEvents) => set({ careEvents }),
  setOccurrences: (occurrences) => set({ occurrences }),

  addCareEvent: (event) => {
    const newOccurrences = computeOccurrences(event);
    set((state) => ({
      careEvents: [event, ...state.careEvents],
      occurrences: [...newOccurrences, ...state.occurrences],
    }));
  },

  completeOccurrence: (id, notes) => {
    const now = new Date().toISOString();
    set((state) => ({
      occurrences: state.occurrences.map((occ) =>
        occ.id === id
          ? {
              ...occ,
              status: "completed",
              completedAt: now,
              completionNotes: notes || null,
              updatedAt: now,
            }
          : occ
      ),
    }));
  },

  skipOccurrence: (id, reason) => {
    const now = new Date().toISOString();
    set((state) => ({
      occurrences: state.occurrences.map((occ) =>
        occ.id === id
          ? {
              ...occ,
              status: "skipped",
              skippedReason: reason,
              updatedAt: now,
            }
          : occ
      ),
    }));
  },

  cancelCareEvent: (id) => {
    const now = new Date().toISOString();
    set((state) => ({
      careEvents: state.careEvents.map((evt) =>
        evt.id === id ? { ...evt, status: "cancelled", updatedAt: now } : evt
      ),
      occurrences: state.occurrences.filter((occ) => occ.careEventId !== id),
    }));
  },
}));
