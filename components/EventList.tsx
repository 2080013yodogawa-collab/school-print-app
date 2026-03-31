"use client";

import { Calendar, Clock, MapPin } from "lucide-react";
import type { SchoolEvent } from "@/lib/types";

interface EventListProps {
  events: SchoolEvent[];
}

type BadgeType = "行事" | "集金" | "持参" | "予定";

function classifyEvent(event: SchoolEvent): BadgeType {
  const text = `${event.title} ${event.description || ""}`;
  if (/集金|お金|費|円|支払/.test(text)) return "集金";
  if (/持っ|持参|提出|持ち物/.test(text)) return "持参";
  if (/遠足|運動会|発表会|参観|懇談|式|大会|祭|見学|プール|合宿/.test(text)) return "行事";
  return "予定";
}

const badgeStyles: Record<BadgeType, string> = {
  行事: "bg-sky-100 text-sky-700",
  集金: "bg-amber-100 text-amber-700",
  持参: "bg-peach-100 text-peach-500",
  予定: "bg-mint-100 text-mint-600",
};

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr + "T00:00:00");
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    const weekday = weekdays[date.getDay()];
    return `${month}月${day}日（${weekday}）`;
  } catch {
    return dateStr;
  }
}

export default function EventList({ events }: EventListProps) {
  if (events.length === 0) return null;

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-base font-bold text-gray-700 mb-3 flex items-center gap-2">
        <div className="w-7 h-7 bg-sky-100 rounded-lg flex items-center justify-center">
          <Calendar className="w-4 h-4 text-sky-500" />
        </div>
        予定・行事
        <span className="text-sm font-normal text-gray-400">{events.length}件</span>
      </h2>
      <div className="space-y-2">
        {events.map((event) => {
          const badge = classifyEvent(event);
          return (
            <div
              key={event.id}
              className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-2">
                <h3 className="font-bold text-gray-800 flex-1">{event.title}</h3>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${badgeStyles[badge]}`}>
                  {badge}
                </span>
              </div>
              <div className="mt-2 space-y-1 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-400" />
                  <span className="font-medium text-gray-600">{formatDate(event.date)}</span>
                </div>
                {event.time && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    {event.time}
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-sky-400" />
                    {event.location}
                  </div>
                )}
              </div>
              {event.description && (
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">{event.description}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
