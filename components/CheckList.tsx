"use client";

import { Package, Check } from "lucide-react";
import type { SchoolItem } from "@/lib/types";

interface CheckListProps {
  items: SchoolItem[];
  onToggle: (id: string) => void;
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr + "T00:00:00");
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}まで`;
  } catch {
    return dateStr;
  }
}

export default function CheckList({ items, onToggle }: CheckListProps) {
  if (items.length === 0) return null;

  const checkedCount = items.filter((i) => i.checked).length;
  const progress = Math.round((checkedCount / items.length) * 100);

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-base font-bold text-gray-700 mb-3 flex items-center gap-2">
        <div className="w-7 h-7 bg-peach-100 rounded-lg flex items-center justify-center">
          <Package className="w-4 h-4 text-peach-500" />
        </div>
        持ち物・準備するもの
        <span className="text-sm font-normal text-gray-400">
          {checkedCount}/{items.length}
        </span>
      </h2>

      {/* Progress bar */}
      <div className="mb-3 bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-peach-500 to-amber-400 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-1.5">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onToggle(item.id)}
            className={`w-full flex items-start gap-3 border rounded-2xl p-3.5 text-left transition-all min-h-[44px] ${
              item.checked
                ? "bg-gray-50 border-gray-100"
                : "bg-white border-gray-100 shadow-sm hover:shadow-md"
            }`}
          >
            <div
              className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                item.checked
                  ? "bg-mint-500 border-mint-500 scale-110"
                  : "border-gray-300"
              }`}
            >
              {item.checked && <Check className="w-4 h-4 text-white" />}
            </div>
            <div className="flex-1">
              <span
                className={`font-medium ${
                  item.checked ? "text-gray-400 line-through" : "text-gray-800"
                }`}
              >
                {item.name}
              </span>
              <div className="flex gap-2 mt-0.5">
                {item.deadline && (
                  <span className="text-xs text-peach-500 font-medium bg-peach-50 px-1.5 py-0.5 rounded-full">
                    {formatDate(item.deadline)}
                  </span>
                )}
                {item.note && (
                  <span className="text-xs text-gray-400">{item.note}</span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
