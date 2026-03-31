"use client";

import { useState } from "react";
import { CalendarPlus, Download, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import type { SchoolEvent } from "@/lib/types";

interface CalendarSyncProps {
  events: SchoolEvent[];
  childName?: string;
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

function generateICSContent(events: SchoolEvent[], childName?: string): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Otayori Calendar//JP",
    "CALSCALE:GREGORIAN",
  ];

  for (const event of events) {
    const dateFormatted = event.date.replace(/-/g, "");
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${event.id}-${Date.now()}@otayori-calendar`);

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

    const summary = childName ? `【${childName}】${event.title}` : event.title;
    lines.push(`SUMMARY:${summary}`);
    if (event.location) lines.push(`LOCATION:${event.location}`);
    if (event.description) lines.push(`DESCRIPTION:${event.description}`);
    lines.push("END:VEVENT");
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function downloadICS(events: SchoolEvent[], childName?: string) {
  const content = generateICSContent(events, childName);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "school-events.ics";
  a.click();
  URL.revokeObjectURL(url);
}

function buildGoogleCalendarUrl(event: SchoolEvent, childName?: string): string {
  const title = childName ? `【${childName}】${event.title}` : event.title;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
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

export default function CalendarSync({ events, childName }: CalendarSyncProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showIndividual, setShowIndividual] = useState(false);
  const [done, setDone] = useState(false);

  if (events.length === 0) return null;

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setDone(false);
  };

  const selectAll = () => {
    if (selected.size === events.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(events.map((e) => e.id)));
    }
    setDone(false);
  };

  const selectedEvents = events.filter((e) => selected.has(e.id));

  const handleBulkRegister = () => {
    const eventsToRegister = selected.size > 0 ? selectedEvents : events;
    downloadICS(eventsToRegister, childName);
    setDone(true);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-2">
      <h2 className="text-base font-bold text-gray-700 mb-3 flex items-center gap-2">
        <div className="w-7 h-7 bg-mint-100 rounded-lg flex items-center justify-center">
          <CalendarPlus className="w-4 h-4 text-mint-500" />
        </div>
        カレンダーに登録
      </h2>

      {/* Select all toggle */}
      <button
        onClick={selectAll}
        className="text-sm text-sky-500 hover:text-sky-600 font-medium mb-1 min-h-[44px]"
      >
        {selected.size === events.length ? "すべて解除" : "すべて選択"}
      </button>

      {/* Event checkboxes */}
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

      {/* Primary: Bulk register via .ics */}
      <button
        onClick={handleBulkRegister}
        className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 px-4 text-sm font-medium transition-colors mt-3 min-h-[44px] ${
          done
            ? "bg-mint-50 text-mint-600 border-2 border-mint-300"
            : "bg-mint-500 hover:bg-mint-600 text-white shadow-sm shadow-green-200"
        }`}
      >
        {done ? (
          <>
            <Check className="w-4 h-4" />
            ダウンロード済み — ファイルを開いて登録してください
          </>
        ) : (
          <>
            <CalendarPlus className="w-4 h-4" />
            {selected.size > 0
              ? `選択した${selected.size}件をまとめてカレンダーに登録`
              : `全${events.length}件をまとめてカレンダーに登録`
            }
          </>
        )}
      </button>

      {done && (
        <p className="text-xs text-gray-400 text-center leading-relaxed">
          ダウンロードされた .ics ファイルを開くと
          <br />
          カレンダーアプリにまとめて追加されます
        </p>
      )}

      {/* Secondary: Individual Google Calendar links */}
      <button
        onClick={() => setShowIndividual(!showIndividual)}
        className="w-full flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-gray-500 py-2 min-h-[44px]"
      >
        1件ずつGoogle Calendarに登録する場合
        {showIndividual ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {showIndividual && (
        <div className="space-y-1.5">
          {events.map((event) => (
            <a
              key={event.id}
              href={buildGoogleCalendarUrl(event, childName)}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl p-3 border border-gray-100 hover:bg-sky-50 hover:border-sky-200 transition-all min-h-[44px]"
            >
              <div className="flex items-center gap-3">
                <CalendarPlus className="w-4 h-4 text-sky-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">{event.title}</p>
                  <p className="text-xs text-gray-400">
                    {formatDateJP(event.date)}
                    {event.time ? ` ${event.time}` : "（終日）"}
                  </p>
                </div>
                <span className="text-xs text-sky-500">登録</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
