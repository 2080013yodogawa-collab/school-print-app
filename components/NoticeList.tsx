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
        className="w-full text-lg font-bold text-gray-800 mb-3 flex items-center gap-2"
      >
        <MessageCircle className="w-5 h-5 text-purple-500" />
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
              className="bg-purple-50 border border-purple-100 rounded-xl p-4"
            >
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {notice}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
