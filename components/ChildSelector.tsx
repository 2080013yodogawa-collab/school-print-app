"use client";

import type { Child } from "@/lib/types";

interface ChildSelectorProps {
  children: Child[];
  selected: string | null; // childId or null for "全員"
  onSelect: (childId: string | null) => void;
  showAll?: boolean;
}

export default function ChildSelector({ children, selected, onSelect, showAll = true }: ChildSelectorProps) {
  if (children.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {showAll && (
        <button
          onClick={() => onSelect(null)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all min-h-[44px] ${
            selected === null
              ? "bg-gray-800 text-white shadow-sm"
              : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          全員
        </button>
      )}
      {children.map((child) => (
        <button
          key={child.id}
          onClick={() => onSelect(child.id)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all min-h-[44px] ${
            selected === child.id
              ? "text-white shadow-sm"
              : "bg-white border border-gray-200 hover:bg-gray-50"
          }`}
          style={
            selected === child.id
              ? { backgroundColor: child.color }
              : { color: child.color }
          }
        >
          <span
            className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center flex-shrink-0 ${
              selected === child.id ? "bg-white/30 text-white" : "text-white"
            }`}
            style={selected !== child.id ? { backgroundColor: child.color } : {}}
          >
            {child.name.charAt(0)}
          </span>
          {child.name}
        </button>
      ))}
    </div>
  );
}
