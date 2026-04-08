"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Calendar, Package, MessageCircle, Clock, MapPin, CalendarPlus, ExternalLink } from "lucide-react";
import { decodeShareData } from "@/lib/share";
import type { SchoolEvent } from "@/lib/types";

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

function buildGoogleCalendarUrl(event: SchoolEvent, childName?: string): string {
  const title = childName ? `【${childName}】${event.title}` : event.title;
  const params = new URLSearchParams({ action: "TEMPLATE", text: title });

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

function ShareContent() {
  const searchParams = useSearchParams();
  const encoded = searchParams.get("d");

  if (!encoded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <p className="text-gray-500 text-lg">共有データが見つかりません</p>
          <p className="text-gray-400 text-sm mt-2">リンクが正しいか確認してください</p>
        </div>
      </div>
    );
  }

  const data = decodeShareData(encoded);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <p className="text-gray-500 text-lg">データの読み込みに失敗しました</p>
          <p className="text-gray-400 text-sm mt-2">リンクが破損している可能性があります</p>
        </div>
      </div>
    );
  }

  const { title, childName, result } = data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <span className="text-lg">📅</span>
          <h1 className="text-base font-bold text-sky-600">おたよりカレンダー</h1>
          <span className="text-xs bg-sky-100 text-sky-600 px-2 py-0.5 rounded-full ml-auto">共有</span>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Title card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          {childName && (
            <span className="inline-block mt-1 text-xs font-medium bg-sky-100 text-sky-600 px-2 py-0.5 rounded-full">
              {childName}
            </span>
          )}
          <p className="text-xs text-gray-400 mt-2">
            ママがおたよりから読み取った内容です
          </p>
        </div>

        {/* Events */}
        {result.events.length > 0 && (
          <section className="animate-fade-in">
            <h2 className="text-base font-bold text-gray-700 mb-3 flex items-center gap-2">
              <div className="w-7 h-7 bg-sky-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-sky-500" />
              </div>
              予定・行事
              <span className="text-sm font-normal text-gray-400">{result.events.length}件</span>
            </h2>
            <div className="space-y-2">
              {result.events.map((event) => {
                const badge = classifyEvent(event);
                return (
                  <div key={event.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
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
          </section>
        )}

        {/* Google Calendar links */}
        {result.events.length > 0 && (
          <section className="animate-fade-in animation-delay-100">
            <h2 className="text-base font-bold text-gray-700 mb-1 flex items-center gap-2">
              <div className="w-7 h-7 bg-mint-100 rounded-lg flex items-center justify-center">
                <CalendarPlus className="w-4 h-4 text-mint-500" />
              </div>
              Googleカレンダーに登録
            </h2>
            <p className="text-xs text-gray-400 mb-3">
              タップするとGoogleカレンダーが開きます
            </p>
            <div className="space-y-1.5">
              {result.events.map((event) => (
                <a
                  key={event.id}
                  href={buildGoogleCalendarUrl(event, childName)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-2xl p-3.5 border bg-white border-gray-100 hover:bg-sky-50 hover:border-sky-200 active:bg-sky-100 transition-all min-h-[44px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-sky-500">
                      <ExternalLink className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-gray-800">{event.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDate(event.date)}
                        {event.time ? ` ${event.time}` : "（終日）"}
                      </p>
                    </div>
                    <span className="text-xs font-medium flex-shrink-0 text-sky-500">登録 →</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Items */}
        {result.items.length > 0 && (
          <section className="animate-fade-in animation-delay-200">
            <h2 className="text-base font-bold text-gray-700 mb-3 flex items-center gap-2">
              <div className="w-7 h-7 bg-peach-100 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-peach-500" />
              </div>
              持ち物・準備するもの
              <span className="text-sm font-normal text-gray-400">{result.items.length}件</span>
            </h2>
            <div className="space-y-1.5">
              {result.items.map((item) => (
                <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm">
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <div className="flex gap-2 mt-1">
                    {item.deadline && (
                      <span className="text-xs text-peach-500 font-medium bg-peach-50 px-1.5 py-0.5 rounded-full">
                        {(() => {
                          try {
                            const d = new Date(item.deadline + "T00:00:00");
                            return `${d.getMonth() + 1}/${d.getDate()}まで`;
                          } catch { return item.deadline; }
                        })()}
                      </span>
                    )}
                    {item.note && <span className="text-xs text-gray-400">{item.note}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Notices */}
        {result.notices.length > 0 && (
          <section className="animate-fade-in animation-delay-300">
            <h2 className="text-base font-bold text-gray-700 mb-3 flex items-center gap-2">
              <div className="w-7 h-7 bg-lavender-100 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-lavender-500" />
              </div>
              連絡事項
              <span className="text-sm font-normal text-gray-400">{result.notices.length}件</span>
            </h2>
            <div className="space-y-2">
              {result.notices.map((notice, i) => (
                <div key={i} className="bg-lavender-50 border border-lavender-100 rounded-2xl p-4">
                  <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{notice}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center pt-4 pb-8">
          <p className="text-xs text-gray-300">© 2026 おたよりカレンダー</p>
        </footer>
      </main>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    }>
      <ShareContent />
    </Suspense>
  );
}
