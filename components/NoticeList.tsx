"use client";

import { useState } from "react";
import { MessageCircle, ChevronDown, ChevronUp } from "lucide-react";

interface NoticeListProps {
  notices: string[];
}

export default function NoticeList({ notices }: NoticeListProps) {
  const [expanded, setExpanded] = useState(true);

  if (notices.length === 0) return null;

  return (
    <div className="w-full max-w-md mx-auto">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-base font-bold text-gray-700 mb-3 flex items-center gap-2 min-h-[44px]"
      >
        <div className="w-7 h-7 bg-lavender-100 rounded-lg flex items-center justify-center">
          <MessageCircle className="w-4 h-4 text-lavender-500" />
        </div>
        連絡事項
        <span className="text-sm font-normal text-gray-400 ml-1">{notices.length}件</span>
        <span className="ml-auto">
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </span>
      </button>
      {expanded && (
        <div className="space-y-2">
          {notices.map((notice, i) => (
            <div
              key={i}
              className="bg-lavender-50 border border-lavender-100 rounded-2xl p-4"
            >
              <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                {notice}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
