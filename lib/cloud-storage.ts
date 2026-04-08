import { getSupabase, isSupabaseConfigured } from "./supabase";
import type { PrintRecord, Child, AnalysisResult } from "./types";

const FAMILY_CODE_KEY = "school-print-family-code";

// ---- Family Code ----

export function getFamilyCode(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(FAMILY_CODE_KEY);
}

export function setFamilyCode(code: string) {
  localStorage.setItem(FAMILY_CODE_KEY, code);
}

export function clearFamilyCode() {
  localStorage.removeItem(FAMILY_CODE_KEY);
}

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ---- Family Operations ----

export async function createFamily(): Promise<string | null> {
  const sb = getSupabase();
  if (!sb) return null;

  for (let i = 0; i < 3; i++) {
    const code = generateCode();
    const { error } = await sb.from("families").insert({ code });
    if (!error) {
      setFamilyCode(code);
      return code;
    }
  }
  return null;
}

export async function joinFamily(code: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  const upper = code.toUpperCase().trim();
  const { data } = await sb
    .from("families")
    .select("code")
    .eq("code", upper)
    .single();

  if (data) {
    setFamilyCode(upper);
    return true;
  }
  return false;
}

// ---- Records ----

export async function cloudLoadRecords(): Promise<PrintRecord[]> {
  const code = getFamilyCode();
  const sb = getSupabase();
  if (!code || !sb) return [];

  const { data, error } = await sb
    .from("records")
    .select("*")
    .eq("family_code", code)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    createdAt: row.created_at,
    result: row.result as AnalysisResult,
    childId: row.child_id || undefined,
  }));
}

export async function cloudAddRecord(record: PrintRecord): Promise<boolean> {
  const code = getFamilyCode();
  const sb = getSupabase();
  if (!code || !sb) return false;

  const { error } = await sb.from("records").insert({
    id: record.id,
    family_code: code,
    title: record.title,
    created_at: record.createdAt,
    result: record.result,
    child_id: record.childId || null,
  });

  return !error;
}

export async function cloudUpdateRecord(id: string, record: PrintRecord): Promise<boolean> {
  const code = getFamilyCode();
  const sb = getSupabase();
  if (!code || !sb) return false;

  const { error } = await sb
    .from("records")
    .update({
      title: record.title,
      result: record.result,
      child_id: record.childId || null,
    })
    .eq("id", id)
    .eq("family_code", code);

  return !error;
}

export async function cloudDeleteRecord(id: string): Promise<boolean> {
  const code = getFamilyCode();
  const sb = getSupabase();
  if (!code || !sb) return false;

  const { error } = await sb
    .from("records")
    .delete()
    .eq("id", id)
    .eq("family_code", code);

  return !error;
}

// ---- Children ----

export async function cloudLoadChildren(): Promise<Child[]> {
  const code = getFamilyCode();
  const sb = getSupabase();
  if (!code || !sb) return [];

  const { data, error } = await sb
    .from("children")
    .select("*")
    .eq("family_code", code)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    color: row.color,
  }));
}

export async function cloudSaveChildren(children: Child[]): Promise<boolean> {
  const code = getFamilyCode();
  const sb = getSupabase();
  if (!code || !sb) return false;

  await sb.from("children").delete().eq("family_code", code);

  if (children.length === 0) return true;

  const rows = children.map((c) => ({
    id: c.id,
    family_code: code,
    name: c.name,
    color: c.color,
  }));

  const { error } = await sb.from("children").insert(rows);
  return !error;
}

// ---- Sync: Upload local data to cloud ----

export async function syncLocalToCloud(): Promise<void> {
  const code = getFamilyCode();
  const sb = getSupabase();
  if (!code || !sb) return;

  const localRecordsStr = localStorage.getItem("school-print-records");
  const localChildrenStr = localStorage.getItem("school-print-children");

  if (localRecordsStr) {
    const localRecords: PrintRecord[] = JSON.parse(localRecordsStr);
    for (const record of localRecords) {
      await cloudAddRecord(record).catch(() => {});
    }
  }

  if (localChildrenStr) {
    const localChildren: Child[] = JSON.parse(localChildrenStr);
    if (localChildren.length > 0) {
      await cloudSaveChildren(localChildren);
    }
  }
}
