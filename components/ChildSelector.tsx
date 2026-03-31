"use client";

import { Check } from "lucide-react";
import type { Child } from "@/lib/types";

interface ChildSelectorProps {
  children: Child[];
  selected: string | null;
  onSelect: (childId: string | null) => void;
}

export default function ChildSelector({ children, selected, onSelect }: ChildSelectorProps) {
  if (children.length === 0) return null;

  return (
    <div className="bg-gray-100 rounded-2xl p-1 flex gap-1">
      {children.map((child) => {
        const isSelected = selected === child.id;
        return (
          <button
            key={child.id}
            onClick={() => onSelect(child.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all min-h-[44px] ${
              isSelected
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <span
              className="w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center flex-shrink-0 text-white"
              style={{ backgroundColor: child.color }}
            >
              {isSelected ? <Check className="w-3.5 h-3.5" /> : child.name.charAt(0)}
            </span>
            {child.name}
          </button>
        );
      })}
    </div>
  );
}
