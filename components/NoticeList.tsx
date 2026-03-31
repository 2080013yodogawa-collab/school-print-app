"use client";

import { MessageCircle } from "lucide-react";

interface NoticeListProps {
  notices: string[];
}

export default function NoticeList({ notices }: NoticeListProps) {
  if (notices.length === 0) return null;

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-purple-500" />
        連絡事項
      </h2>
      <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 space-y-2">
        {notices.map((notice, i) => (
          <p key={i} className="text-sm text-gray-700">
            {notice}
          </p>
        ))}
      </div>
    </div>
  );
}
