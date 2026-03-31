"use client";

import { Calendar, Clock, MapPin } from "lucide-react";
import type { SchoolEvent } from "@/lib/types";

interface EventListProps {
  events: SchoolEvent[];
}

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
      <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-blue-500" />
        予定・行事
      </h2>
      <div className="space-y-2">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
          >
            <h3 className="font-bold text-gray-800">{event.title}</h3>
            <div className="mt-1 space-y-0.5 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-400" />
                {formatDate(event.date)}
              </div>
              {event.time && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-400" />
                  {event.time}
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  {event.location}
                </div>
              )}
            </div>
            {event.description && (
              <p className="mt-2 text-sm text-gray-500">{event.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
