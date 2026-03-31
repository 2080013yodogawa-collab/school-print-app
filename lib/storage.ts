import type { PrintRecord } from "./types";

const STORAGE_KEY = "school-print-records";

export function loadRecords(): PrintRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveRecords(records: PrintRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function addRecord(record: PrintRecord) {
  const records = loadRecords();
  records.unshift(record);
  saveRecords(records);
}

export function updateRecord(id: string, updated: Partial<PrintRecord>) {
  const records = loadRecords();
  const index = records.findIndex((r) => r.id === id);
  if (index !== -1) {
    records[index] = { ...records[index], ...updated };
    saveRecords(records);
  }
}

export function deleteRecord(id: string) {
  const records = loadRecords().filter((r) => r.id !== id);
  saveRecords(records);
}
