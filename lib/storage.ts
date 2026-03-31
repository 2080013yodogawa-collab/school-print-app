import type { PrintRecord, Child } from "./types";

const STORAGE_KEY = "school-print-records";
const CHILDREN_KEY = "school-print-children";
const LAST_CHILD_KEY = "school-print-last-child";

// --- Records ---

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

// --- Children ---

export const CHILD_COLORS = [
  { name: "ブルー", hex: "#3b82f6" },
  { name: "ピンク", hex: "#ec4899" },
  { name: "グリーン", hex: "#22c55e" },
  { name: "オレンジ", hex: "#f97316" },
  { name: "パープル", hex: "#a855f7" },
  { name: "レッド", hex: "#ef4444" },
];

export function loadChildren(): Child[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(CHILDREN_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveChildren(children: Child[]) {
  localStorage.setItem(CHILDREN_KEY, JSON.stringify(children));
}

export function addChild(child: Child) {
  const children = loadChildren();
  children.push(child);
  saveChildren(children);
}

export function updateChild(id: string, updated: Partial<Child>) {
  const children = loadChildren();
  const index = children.findIndex((c) => c.id === id);
  if (index !== -1) {
    children[index] = { ...children[index], ...updated };
    saveChildren(children);
  }
}

export function deleteChild(id: string) {
  const children = loadChildren().filter((c) => c.id !== id);
  saveChildren(children);
}

export function getLastChildId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LAST_CHILD_KEY);
}

export function setLastChildId(id: string) {
  localStorage.setItem(LAST_CHILD_KEY, id);
}
