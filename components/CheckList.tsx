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

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
        <Package className="w-5 h-5 text-orange-500" />
        持ち物・準備するもの
        <span className="text-sm font-normal text-gray-400">
          {checkedCount}/{items.length}
        </span>
      </h2>
      <div className="space-y-1.5">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onToggle(item.id)}
            className="w-full flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-3.5 shadow-sm text-left transition-colors hover:bg-gray-50"
          >
            <div
              className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                item.checked
                  ? "bg-green-500 border-green-500"
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
                  <span className="text-xs text-orange-500 font-medium">
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
