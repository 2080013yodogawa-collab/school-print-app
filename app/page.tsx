"use client";

import { useState } from "react";
import PhotoUploader from "@/components/PhotoUploader";
import EventList from "@/components/EventList";
import CheckList from "@/components/CheckList";
import CalendarSync from "@/components/CalendarSync";
import NoticeList from "@/components/NoticeList";
import type { AnalysisResult } from "@/lib/types";
import { ArrowLeft } from "lucide-react";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (image: string, mimeType: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, mimeType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "解析に失敗しました");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleItem = (id: string) => {
    if (!result) return;
    setResult({
      ...result,
      items: result.items.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ),
    });
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          {result && (
            <button
              onClick={handleReset}
              className="text-gray-500 hover:text-gray-700 -ml-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-lg font-bold text-gray-800">
            おたより読み取り
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {!result ? (
          <>
            {/* Upload Section */}
            <div className="text-center mb-6">
              <p className="text-2xl mb-2">📋</p>
              <p className="text-gray-600 text-sm">
                学校のプリントを撮影すると
                <br />
                予定と持ち物を自動で整理します
              </p>
            </div>
            <PhotoUploader onAnalyze={handleAnalyze} isLoading={isLoading} />
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
                {error}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Results */}
            <EventList events={result.events} />
            <CheckList items={result.items} onToggle={handleToggleItem} />
            <NoticeList notices={result.notices} />
            <CalendarSync events={result.events} />

            {/* Scan Another */}
            <div className="pt-4">
              <button
                onClick={handleReset}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl py-3 text-sm font-medium transition-colors"
              >
                別のプリントを読み取る
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
