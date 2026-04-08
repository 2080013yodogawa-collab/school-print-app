"use client";

import { useState } from "react";
import { CalendarPlus, Check, ExternalLink } from "lucide-react";
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
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());

  if (events.length === 0) return null;

  const handleMarkRegistered = (id: string) => {
    setRegisteredIds((prev) => new Set(prev).add(id));
  };

  const allRegistered = registeredIds.size === events.length;
  const registeredCount = registeredIds.size;

  return (
    <div className="w-full max-w-md mx-auto space-y-2">
      <h2 className="text-base font-bold text-gray-700 mb-1 flex items-center gap-2">
        <div className="w-7 h-7 bg-mint-100 rounded-lg flex items-center justify-center">
          <CalendarPlus className="w-4 h-4 text-mint-500" />
        </div>
        Googleカレンダーに登録
      </h2>
      <p className="text-xs text-gray-400 mb-3">
        タップするとGoogleカレンダーが開きます。保存すればパパとも共有されます。
      </p>

      {/* Progress */}
      {registeredCount > 0 && (
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-mint-500 rounded-full transition-all duration-500"
              style={{ width: `${(registeredCount / events.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 flex-shrink-0">
            {registeredCount}/{events.length}
          </span>
        </div>
      )}

      {/* Event links */}
      <div className="space-y-1.5">
        {events.map((event) => {
          const isRegistered = registeredIds.has(event.id);
          return (
            <a
              key={event.id}
              href={buildGoogleCalendarUrl(event, childName)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => handleMarkRegistered(event.id)}
              className={`block rounded-2xl p-3.5 border transition-all min-h-[44px] ${
                isRegistered
                  ? "bg-mint-50 border-mint-200"
                  : "bg-white border-gray-100 hover:bg-sky-50 hover:border-sky-200 active:bg-sky-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isRegistered ? "bg-mint-500" : "bg-sky-500"
                  }`}
                >
                  {isRegistered ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <ExternalLink className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isRegistered ? "text-gray-400" : "text-gray-800"}`}>
                    {event.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDateJP(event.date)}
                    {event.time ? ` ${event.time}` : "（終日）"}
                    {event.location ? ` / ${event.location}` : ""}
                  </p>
                </div>
                <span className={`text-xs font-medium flex-shrink-0 ${
                  isRegistered ? "text-mint-600" : "text-sky-500"
                }`}>
                  {isRegistered ? "登録済み" : "登録 →"}
                </span>
              </div>
            </a>
          );
        })}
      </div>

      {allRegistered && (
        <div className="bg-mint-50 border border-mint-200 rounded-2xl p-3 text-center">
          <p className="text-sm text-mint-600 font-medium">
            ✨ すべての予定を登録しました！
          </p>
        </div>
      )}
    </div>
  );
}
