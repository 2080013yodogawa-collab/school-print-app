"use client";

import { useState } from "react";
import { CalendarPlus, Download, Check, X } from "lucide-react";
import type { SchoolEvent } from "@/lib/types";

interface CalendarSyncProps {
  events: SchoolEvent[];
}

function formatDateJP(dateStr: string): string {
  try {
    const date = new Date(dateStr + "T00:00:00");
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    const weekday = weekdays[date.getDay()];
    return `${month}/${day}（${weekday}）`;
  } catch {
    return dateStr;
  }
}

function generateICSContent(events: SchoolEvent[]): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//School Print App//JP",
    "CALSCALE:GREGORIAN",
  ];

  for (const event of events) {
    const dateFormatted = event.date.replace(/-/g, "");
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${event.id}@school-print-app`);

    if (event.time) {
      const timeFormatted = event.time.replace(":", "") + "00";
      lines.push(`DTSTART;TZID=Asia/Tokyo:${dateFormatted}T${timeFormatted}`);
      const [h, m] = event.time.split(":").map(Number);
      const endH = String(h + 1).padStart(2, "0");
      const endTime = `${endH}${String(m).padStart(2, "0")}00`;
      lines.push(`DTEND;TZID=Asia/Tokyo:${dateFormatted}T${endTime}`);
    } else {
      lines.push(`DTSTART;VALUE=DATE:${dateFormatted}`);
      const nextDay = new Date(event.date + "T00:00:00");
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString().split("T")[0].replace(/-/g, "");
      lines.push(`DTEND;VALUE=DATE:${nextDayStr}`);
    }

    lines.push(`SUMMARY:${event.title}`);
    if (event.location) lines.push(`LOCATION:${event.location}`);
    if (event.description) lines.push(`DESCRIPTION:${event.description}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function downloadICS(events: SchoolEvent[]) {
  const content = generateICSContent(events);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "school-events.ics";
  a.click();
  URL.revokeObjectURL(url);
}

function buildGoogleCalendarUrl(event: SchoolEvent): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
  });

  if (event.time) {
    const startDate = event.date.replace(/-/g, "");
    const startTime = event.time.replace(":", "") + "00";
    const [h, m] = event.time.split(":").map(Number);
    const endH = String(h + 1).padStart(2, "0");
    const endTime = `${endH}${String(m).padStart(2, "0")}00`;
    params.set("dates", `${startDate}T${startTime}/${startDate}T${endTime}`);
  } else {
    const startDate = event.date.replace(/-/g, "");
    const nextDay = new Date(event.date + "T00:00:00");
    nextDay.setDate(nextDay.getDate() + 1);
    const endDate = nextDay.toISOString().split("T")[0].replace(/-/g, "");
    params.set("dates", `${startDate}/${endDate}`);
  }

  params.set("ctz", "Asia/Tokyo");
  if (event.location) params.set("location", event.location);
  if (event.description) params.set("details", event.description);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default function CalendarSync({ events }: CalendarSyncProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());

  if (events.length === 0) return null;

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === events.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(events.map((e) => e.id)));
    }
  };

  const selectedEvents = events.filter((e) => selected.has(e.id));

  const handleRegister = () => {
    if (selectedEvents.length === 0) return;
    setShowConfirm(true);
  };

  const handleMarkRegistered = (id: string) => {
    setRegisteredIds((prev) => new Set(prev).add(id));
  };

  const handleCloseConfirm = () => {
    setShowConfirm(false);
    setRegisteredIds(new Set());
    if (registeredIds.size > 0) {
      setSelected(new Set());
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-2">
      <h2 className="text-base font-bold text-gray-700 mb-3 flex items-center gap-2">
        <div className="w-7 h-7 bg-mint-100 rounded-lg flex items-center justify-center">
          <CalendarPlus className="w-4 h-4 text-mint-500" />
        </div>
        Googleカレンダーに登録
      </h2>

      <button
        onClick={selectAll}
        className="text-sm text-sky-500 hover:text-sky-600 font-medium mb-1 min-h-[44px]"
      >
        {selected.size === events.length ? "すべて解除" : "すべて選択"}
      </button>

      <div className="space-y-1.5">
        {events.map((event) => (
          <button
            key={event.id}
            onClick={() => toggleSelect(event.id)}
            className={`w-full flex items-center gap-3 border rounded-2xl p-3.5 text-left transition-all min-h-[44px] ${
              selected.has(event.id)
                ? "bg-mint-50 border-mint-500/30 shadow-sm"
                : "bg-white border-gray-100 hover:shadow-md"
            }`}
          >
            <div
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                selected.has(event.id)
                  ? "bg-mint-500 border-mint-500"
                  : "border-gray-300"
              }`}
            >
              {selected.has(event.id) && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">{event.title}</p>
              <p className="text-xs text-gray-400">
                {formatDateJP(event.date)}
                {event.time ? ` ${event.time}` : "（終日）"}
              </p>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={handleRegister}
        disabled={selected.size === 0}
        className="w-full flex items-center justify-center gap-2 bg-mint-500 hover:bg-mint-600 disabled:bg-gray-100 disabled:text-gray-400 text-white rounded-2xl py-3.5 px-4 text-sm font-medium transition-colors mt-3 min-h-[44px] shadow-sm shadow-green-200"
      >
        <CalendarPlus className="w-4 h-4" />
        選択した予定をGoogleカレンダーに登録（{selected.size}件）
      </button>

      <button
        onClick={() => downloadICS(selected.size > 0 ? selectedEvents : events)}
        className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 rounded-2xl py-3.5 px-4 text-sm font-medium transition-colors min-h-[44px]"
      >
        <Download className="w-4 h-4" />
        .icsファイルでダウンロード
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl animate-fade-in">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Googleカレンダーに登録</h3>
              <button
                onClick={handleCloseConfirm}
                className="text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-sm text-gray-400 mb-3">
                各予定のリンクをタップしてGoogleカレンダーに登録してください：
              </p>
              {selectedEvents.map((event) => (
                <a
                  key={event.id}
                  href={buildGoogleCalendarUrl(event)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleMarkRegistered(event.id)}
                  className={`block rounded-2xl p-3.5 border transition-all min-h-[44px] ${
                    registeredIds.has(event.id)
                      ? "bg-mint-50 border-mint-200"
                      : "bg-white border-gray-100 hover:bg-sky-50 hover:border-sky-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        registeredIds.has(event.id)
                          ? "bg-mint-500"
                          : "bg-sky-500"
                      }`}
                    >
                      {registeredIds.has(event.id) ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <CalendarPlus className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-800">{event.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDateJP(event.date)}
                        {event.time ? ` ${event.time}` : "（終日予定）"}
                        {event.location ? ` / ${event.location}` : ""}
                      </p>
                    </div>
                    <span className={`text-xs font-medium ${
                      registeredIds.has(event.id) ? "text-mint-600" : "text-sky-500"
                    }`}>
                      {registeredIds.has(event.id) ? "済" : "登録"}
                    </span>
                  </div>
                </a>
              ))}
            </div>
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={handleCloseConfirm}
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-2xl py-3.5 text-sm font-medium transition-colors min-h-[44px]"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
