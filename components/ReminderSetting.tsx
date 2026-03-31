"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";
import type { SchoolEvent, SchoolItem } from "@/lib/types";
import {
  addReminder,
  removeReminder,
  hasReminder,
  requestNotificationPermission,
} from "@/lib/reminder";

interface ReminderSettingProps {
  events: SchoolEvent[];
  items: SchoolItem[];
}

export default function ReminderSetting({ events, items }: ReminderSettingProps) {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [reminderStates, setReminderStates] = useState<Record<string, boolean>>({});

  const remindableItems = [
    ...events.map((e) => ({ id: `reminder-${e.id}`, title: e.title, date: e.date })),
    ...items
      .filter((i) => i.deadline)
      .map((i) => ({ id: `reminder-${i.id}`, title: i.name, date: i.deadline! })),
  ];

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
    const states: Record<string, boolean> = {};
    for (const item of remindableItems) {
      states[item.id] = hasReminder(item.id);
    }
    setReminderStates(states);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setPermission(granted ? "granted" : "denied");
  };

  const handleToggle = (item: { id: string; title: string; date: string }) => {
    const isSet = reminderStates[item.id];
    if (isSet) {
      removeReminder(item.id);
    } else {
      addReminder({ id: item.id, title: item.title, date: item.date, notified: false });
    }
    setReminderStates((prev) => ({ ...prev, [item.id]: !isSet }));
  };

  if (remindableItems.length === 0) return null;

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-base font-bold text-gray-700 mb-3 flex items-center gap-2">
        <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
          <BellRing className="w-4 h-4 text-amber-500" />
        </div>
        リマインド通知
      </h2>

      {permission !== "granted" ? (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
          <p className="text-sm text-gray-600 mb-3">
            期限の前日にブラウザ通知でお知らせします。
            通知の許可が必要です。
          </p>
          <button
            onClick={handleRequestPermission}
            className="w-full bg-amber-400 hover:bg-amber-500 text-white rounded-xl py-3 text-sm font-medium transition-colors min-h-[44px]"
          >
            通知を許可する
          </button>
          {permission === "denied" && (
            <p className="text-xs text-red-500 mt-2">
              通知がブロックされています。ブラウザの設定から許可してください。
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-1.5">
          {remindableItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleToggle(item)}
              className={`w-full flex items-center gap-3 border rounded-2xl p-3.5 text-left transition-all min-h-[44px] ${
                reminderStates[item.id]
                  ? "bg-amber-50 border-amber-200"
                  : "bg-white border-gray-100 shadow-sm hover:shadow-md"
              }`}
            >
              {reminderStates[item.id] ? (
                <Bell className="w-5 h-5 text-amber-500 flex-shrink-0" />
              ) : (
                <BellOff className="w-5 h-5 text-gray-300 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-700 truncate block">
                  {item.title}
                </span>
                <span className="text-xs text-gray-400">{item.date}</span>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  reminderStates[item.id]
                    ? "bg-amber-200 text-amber-700"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {reminderStates[item.id] ? "ON" : "OFF"}
              </span>
            </button>
          ))}
          <p className="text-xs text-gray-400 mt-2 pl-1">
            前日と当日にブラウザ通知が届きます（アプリを開いているとき）
          </p>
        </div>
      )}
    </div>
  );
}
