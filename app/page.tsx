"use client";

import { useState, useEffect, useCallback } from "react";
import PhotoUploader from "@/components/PhotoUploader";
import type { ImageData } from "@/components/PhotoUploader";
import EventList from "@/components/EventList";
import CheckList from "@/components/CheckList";
import CalendarSync from "@/components/CalendarSync";
import NoticeList from "@/components/NoticeList";
import ReminderSetting from "@/components/ReminderSetting";
import PhotoViewer from "@/components/PhotoViewer";
import type { AnalysisResult, PrintRecord } from "@/lib/types";
import { loadRecords, addRecord, updateRecord, deleteRecord } from "@/lib/storage";
import { checkAndNotify } from "@/lib/reminder";
import { ArrowLeft, Trash2, Clock, X } from "lucide-react";

type View = "home" | "detail";

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [isLoading, setIsLoading] = useState(false);
  const [records, setRecords] = useState<PrintRecord[]>([]);
  const [activeRecord, setActiveRecord] = useState<PrintRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    setRecords(loadRecords());
    // Check reminders on load and every minute
    checkAndNotify();
    const interval = setInterval(checkAndNotify, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleAnalyze = async (images: ImageData[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: images.map((img) => ({ base64: img.base64, mimeType: img.mimeType })),
        }),
      });

      const data: AnalysisResult = await response.json();

      if (!response.ok) {
        throw new Error((data as unknown as { error: string }).error || "解析に失敗しました");
      }

      const record: PrintRecord = {
        id: `print-${Date.now()}`,
        title: data.events[0]?.title || data.notices[0]?.slice(0, 20) || "プリント",
        createdAt: new Date().toISOString(),
        result: data,
        images: images.map((img) => img.dataUrl),
      };

      addRecord(record);
      setRecords(loadRecords());
      setActiveRecord(record);
      setView("detail");
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleItem = useCallback((id: string) => {
    if (!activeRecord) return;
    const updated: PrintRecord = {
      ...activeRecord,
      result: {
        ...activeRecord.result,
        items: activeRecord.result.items.map((item) =>
          item.id === id ? { ...item, checked: !item.checked } : item
        ),
      },
    };
    updateRecord(activeRecord.id, updated);
    setActiveRecord(updated);
    setRecords(loadRecords());
  }, [activeRecord]);

  const handleOpenRecord = (record: PrintRecord) => {
    setActiveRecord(record);
    setView("detail");
  };

  const handleDeleteRecord = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteTarget(id);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteRecord(deleteTarget);
    setRecords(loadRecords());
    if (activeRecord?.id === deleteTarget) {
      setActiveRecord(null);
      setView("home");
    }
    setDeleteTarget(null);
  };

  const handleBack = () => {
    setActiveRecord(null);
    setView("home");
    setError(null);
  };

  function formatDate(iso: string) {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center gap-3">
          {view === "detail" && (
            <button
              onClick={handleBack}
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
        {view === "home" ? (
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

            {/* History */}
            {records.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-gray-500 mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  保存済みのプリント
                </h2>
                <div className="space-y-2">
                  {records.map((record) => {
                    const itemCount = record.result.items.length;
                    const checkedCount = record.result.items.filter((i) => i.checked).length;
                    return (
                      <button
                        key={record.id}
                        onClick={() => handleOpenRecord(record)}
                        className="w-full bg-white border border-gray-200 rounded-xl p-3.5 shadow-sm text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">
                            {record.title}
                          </p>
                          <div className="flex gap-3 mt-0.5 text-xs text-gray-400">
                            <span>{formatDate(record.createdAt)}</span>
                            <span>{record.result.events.length}件の予定</span>
                            {itemCount > 0 && (
                              <span>
                                持ち物 {checkedCount}/{itemCount}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDeleteRecord(record.id, e)}
                          className="text-gray-300 hover:text-red-400 p-1 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : activeRecord ? (
          <>
            {/* Original photos */}
            {activeRecord.images && activeRecord.images.length > 0 && (
              <PhotoViewer images={activeRecord.images} />
            )}

            {/* Results */}
            <EventList events={activeRecord.result.events} />
            <CheckList items={activeRecord.result.items} onToggle={handleToggleItem} />
            <NoticeList notices={activeRecord.result.notices} />
            <CalendarSync events={activeRecord.result.events} />
            <ReminderSetting
              events={activeRecord.result.events}
              items={activeRecord.result.items}
            />

            {/* Scan Another */}
            <div className="pt-4">
              <button
                onClick={handleBack}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl py-3 text-sm font-medium transition-colors"
              >
                別のプリントを読み取る
              </button>
            </div>
          </>
        ) : null}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
            <div className="p-5 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">削除しますか？</h3>
              <p className="text-sm text-gray-500">
                このプリントの解析結果が削除されます。
                <br />
                この操作は取り消せません。
              </p>
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl py-3 text-sm font-medium transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-3 text-sm font-medium transition-colors"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
