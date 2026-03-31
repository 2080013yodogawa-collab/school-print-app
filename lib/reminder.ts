const REMINDER_KEY = "school-print-reminders";

export interface Reminder {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD - the deadline date
  notified: boolean;
}

export function loadReminders(): Reminder[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(REMINDER_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveReminders(reminders: Reminder[]) {
  localStorage.setItem(REMINDER_KEY, JSON.stringify(reminders));
}

export function addReminder(reminder: Reminder) {
  const reminders = loadReminders();
  // Don't add duplicates
  if (reminders.some((r) => r.id === reminder.id)) return;
  reminders.push(reminder);
  saveReminders(reminders);
}

export function removeReminder(id: string) {
  const reminders = loadReminders().filter((r) => r.id !== id);
  saveReminders(reminders);
}

export function hasReminder(id: string): boolean {
  return loadReminders().some((r) => r.id === id);
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function checkAndNotify() {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const reminders = loadReminders();
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];
  const todayStr = now.toISOString().split("T")[0];

  let changed = false;
  for (const reminder of reminders) {
    if (reminder.notified) continue;

    // Notify if deadline is tomorrow or today
    if (reminder.date === tomorrowStr) {
      new Notification("明日の予定・提出物", {
        body: `「${reminder.title}」の期限が明日です！`,
        icon: "/favicon.ico",
        tag: reminder.id,
      });
      reminder.notified = true;
      changed = true;
    } else if (reminder.date === todayStr) {
      new Notification("本日の予定・提出物", {
        body: `「${reminder.title}」の期限は今日です！`,
        icon: "/favicon.ico",
        tag: reminder.id,
      });
      reminder.notified = true;
      changed = true;
    }
  }

  if (changed) {
    saveReminders(reminders);
  }

  // Clean up old reminders (past deadlines)
  const cleaned = reminders.filter((r) => r.date >= todayStr);
  if (cleaned.length !== reminders.length) {
    saveReminders(cleaned);
  }
}
