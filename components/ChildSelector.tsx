"use client";

import { Check } from "lucide-react";
import type { Child } from "@/lib/types";

interface ChildSelectorProps {
  children: Child[];
  selected: string | null;
  onSelect: (childId: string | null) => void;
  showAll?: boolean;
  label?: string;
}

export default function ChildSelector({ children, selected, onSelect, showAll = true, label }: ChildSelectorProps) {
  if (children.length === 0) return null;

  return (
    <div>
      {label && (
        <p className="text-sm font-bold text-gray-600 mb-2">{label}</p>
      )}
      <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1">
        {showAll && (
          <button
            onClick={() => onSelect(null)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all min-h-[48px] ${
              selected === null
                ? "bg-gray-800 text-white shadow-md ring-2 ring-gray-800 ring-offset-2"
                : "bg-white text-gray-400 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            全員
          </button>
        )}
        {children.map((child) => {
          const isSelected = selected === child.id;
          return (
            <button
              key={child.id}
              onClick={() => onSelect(child.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all min-h-[48px] ${
                isSelected
                  ? "text-white"
                  : "bg-white border border-gray-200 hover:bg-gray-50 opacity-60 hover:opacity-100"
              }`}
              style={
                isSelected
                  ? { backgroundColor: child.color, boxShadow: `0 4px 12px ${child.color}40, 0 0 0 2px white, 0 0 0 4px ${child.color}` }
                  : {}
              }
            >
              <span
                className={`w-7 h-7 rounded-xl text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                  isSelected ? "bg-white/30 text-white" : "text-white"
                }`}
                style={!isSelected ? { backgroundColor: child.color } : {}}
              >
                {isSelected ? <Check className="w-4 h-4" /> : child.name.charAt(0)}
              </span>
              {child.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
