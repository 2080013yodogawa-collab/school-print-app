"use client";

import { CalendarPlus, ExternalLink, Download } from "lucide-react";
import type { SchoolEvent } from "@/lib/types";

interface CalendarSyncProps {
  events: SchoolEvent[];
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
      lines.push(`DTEND;TZID=Asia/Tokyo:${dateFormatted}T${timeFormatted}`);
    } else {
      lines.push(`DTSTART;VALUE=DATE:${dateFormatted}`);
      lines.push(`DTEND;VALUE=DATE:${dateFormatted}`);
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

function openGoogleCalendar(event: SchoolEvent) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: event.time
      ? `${event.date.replace(/-/g, "")}T${event.time.replace(":", "")}00/${event.date.replace(/-/g, "")}T${event.time.replace(":", "")}00`
      : `${event.date.replace(/-/g, "")}/${event.date.replace(/-/g, "")}`,
    ctz: "Asia/Tokyo",
  });
  if (event.location) params.set("location", event.location);
  if (event.description) params.set("details", event.description);

  window.open(
    `https://calendar.google.com/calendar/render?${params.toString()}`,
    "_blank"
  );
}

export default function CalendarSync({ events }: CalendarSyncProps) {
  if (events.length === 0) return null;

  return (
    <div className="w-full max-w-md mx-auto space-y-2">
      <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
        <CalendarPlus className="w-5 h-5 text-green-500" />
        カレンダーに登録
      </h2>

      {/* Individual Google Calendar links */}
      <div className="space-y-1.5">
        {events.map((event) => (
          <button
            key={event.id}
            onClick={() => openGoogleCalendar(event)}
            className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-xl p-3 shadow-sm text-left hover:bg-blue-50 transition-colors"
          >
            <span className="text-sm font-medium text-gray-700">{event.title}</span>
            <ExternalLink className="w-4 h-4 text-blue-400 flex-shrink-0" />
          </button>
        ))}
      </div>

      {/* Download ICS file */}
      <button
        onClick={() => downloadICS(events)}
        className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl py-3 px-4 text-sm font-medium transition-colors mt-3"
      >
        <Download className="w-4 h-4" />
        まとめてダウンロード (.ics)
      </button>
    </div>
  );
}
