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
import SkeletonLoader from "@/components/SkeletonLoader";
import ChildSettings from "@/components/ChildSettings";
import ChildSelector from "@/components/ChildSelector";
import type { AnalysisResult, PrintRecord, Child } from "@/lib/types";
import {
  loadRecords, addRecord, updateRecord, deleteRecord,
  loadChildren, getLastChildId, setLastChildId,
} from "@/lib/storage";
import { checkAndNotify } from "@/lib/reminder";
import { ArrowLeft, Trash2, Clock, Settings, Users } from "lucide-react";

type View = "home" | "detail";

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [isLoading, setIsLoading] = useState(false);
  const [records, setRecords] = useState<PrintRecord[]>([]);
  const [activeRecord, setActiveRecord] = useState<PrintRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [children, setChildrenState] = useState<Child[]>([]);
  const [showChildSettings, setShowChildSettings] = useState(false);
  const [filterChildId, setFilterChildId] = useState<string | null>(null);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  useEffect(() => {
    setRecords(loadRecords());
    setChildrenState(loadChildren());
    const lastChild = getLastChildId();
    if (lastChild) setSelectedChildId(lastChild);
    checkAndNotify();
    const interval = setInterval(checkAndNotify, 60000);
    return () => clearInterval(interval);
  }, []);

  const refreshChildren = () => {
    setChildrenState(loadChildren());
  };

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

      const childId = selectedChildId || undefined;
      if (childId) setLastChildId(childId);

      const record: PrintRecord = {
        id: `print-${Date.now()}`,
        title: data.events[0]?.title || data.notices[0]?.slice(0, 20) || "プリント",
        createdAt: new Date().toISOString(),
        result: data,
        images: images.map((img) => img.dataUrl),
        childId,
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

  function getChildForRecord(record: PrintRecord): Child | undefined {
    if (!record.childId) return undefined;
    return children.find((c) => c.id === record.childId);
  }

  const filteredRecords = filterChildId
    ? records.filter((r) => r.childId === filterChildId)
    : records;

  return (
    <div className="min-h-screen bg-[#f8fafb]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3.5 flex items-center gap-3">
          {view === "detail" && (
            <button
              onClick={handleBack}
              className="text-gray-400 hover:text-gray-600 -ml-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xl">📅</span>
            <h1 className="text-lg font-bold text-sky-600">
              おたよりカレンダー
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {isLoading ? (
          <SkeletonLoader />
        ) : view === "home" ? (
          <>
            {/* Upload Section */}
            <div className="text-center mb-4 animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-50 rounded-2xl mb-3">
                <span className="text-3xl">📅</span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                学校のおたよりを撮影するだけで
                <br />
                予定や持ち物を自動で整理。
                <br />
                <span className="text-sky-500 font-medium">家族のスケジュール管理をもっと楽に。</span>
              </p>
            </div>

            {/* Child segment control */}
            <div className="animate-fade-in">
              {children.length > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <ChildSelector
                      children={children}
                      selected={selectedChildId}
                      onSelect={setSelectedChildId}
                    />
                  </div>
                  <button
                    onClick={() => setShowChildSettings(true)}
                    className="text-gray-300 hover:text-gray-500 min-h-[44px] min-w-[44px] flex items-center justify-center flex-shrink-0"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowChildSettings(true)}
                  className="w-full flex items-center justify-center gap-2 bg-white border-2 border-dashed border-gray-200 rounded-2xl py-3 text-sm text-gray-400 hover:text-sky-500 hover:border-sky-300 transition-colors min-h-[44px]"
                >
                  <Users className="w-4 h-4" />
                  兄弟がいる場合はここで子どもを追加
                </button>
              )}
            </div>

            <div className="animate-fade-in-delay-1">
              <PhotoUploader onAnalyze={handleAnalyze} isLoading={isLoading} />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-600 animate-fade-in">
                {error}
              </div>
            )}

            {/* History */}
            {records.length > 0 && (
              <div className="animate-fade-in-delay-2">
                <h2 className="text-sm font-bold text-gray-400 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
                  <Clock className="w-4 h-4" />
                  保存済みのプリント
                </h2>

                {/* Child filter chips */}
                {children.length > 0 && (
                  <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                    <button
                      onClick={() => setFilterChildId(null)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all min-h-[32px] ${
                        filterChildId === null
                          ? "bg-gray-800 text-white"
                          : "bg-white text-gray-400 border border-gray-200"
                      }`}
                    >
                      全員
                    </button>
                    {children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => setFilterChildId(child.id)}
                        className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all min-h-[32px] ${
                          filterChildId === child.id
                            ? "text-white"
                            : "bg-white border border-gray-200 opacity-60 hover:opacity-100"
                        }`}
                        style={filterChildId === child.id ? { backgroundColor: child.color } : { color: child.color }}
                      >
                        {child.name}
                      </button>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  {filteredRecords.map((record, idx) => {
                    const itemCount = record.result.items.length;
                    const checkedCount = record.result.items.filter((i) => i.checked).length;
                    const child = getChildForRecord(record);
                    return (
                      <button
                        key={record.id}
                        onClick={() => handleOpenRecord(record)}
                        className="w-full bg-white border rounded-2xl p-4 shadow-sm text-left hover:shadow-md transition-all flex items-center gap-3 min-h-[44px]"
                        style={{
                          borderColor: child ? child.color + "40" : undefined,
                          borderLeftWidth: child ? "4px" : undefined,
                          borderLeftColor: child ? child.color : undefined,
                        }}
                      >
                        <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-lg">📄</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-800 truncate">
                              {record.title}
                            </p>
                            {child && (
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white flex-shrink-0"
                                style={{ backgroundColor: child.color }}
                              >
                                {child.name}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2 mt-0.5 text-xs text-gray-400">
                            <span>{formatDate(record.createdAt)}</span>
                            {record.result.events.length > 0 && (
                              <span className="bg-sky-50 text-sky-600 px-1.5 py-0.5 rounded-full">
                                {record.result.events.length}件の予定
                              </span>
                            )}
                            {itemCount > 0 && (
                              <span className="bg-peach-50 text-peach-500 px-1.5 py-0.5 rounded-full">
                                持ち物 {checkedCount}/{itemCount}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDeleteRecord(record.id, e)}
                          className="text-gray-200 hover:text-red-400 p-2 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </button>
                    );
                  })}
                  {filteredRecords.length === 0 && filterChildId && (
                    <p className="text-sm text-gray-400 text-center py-6">
                      この子のプリントはまだありません
                    </p>
                  )}
                </div>
              </div>
            )}
          </>
        ) : activeRecord ? (
          <>
            {/* Child badge in detail */}
            {(() => {
              const child = getChildForRecord(activeRecord);
              return child ? (
                <div className="animate-fade-in flex items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full text-white"
                    style={{ backgroundColor: child.color }}
                  >
                    <span className="w-5 h-5 bg-white/30 rounded-full text-[10px] font-bold flex items-center justify-center">
                      {child.name.charAt(0)}
                    </span>
                    {child.name}のプリント
                  </span>
                </div>
              ) : null;
            })()}

            {/* Original photos */}
            {activeRecord.images && activeRecord.images.length > 0 && (
              <div className="animate-fade-in">
                <PhotoViewer images={activeRecord.images} />
              </div>
            )}

            {/* Results */}
            <div className="animate-fade-in-delay-1">
              <EventList events={activeRecord.result.events} childName={getChildForRecord(activeRecord)?.name} />
            </div>
            <div className="animate-fade-in-delay-2">
              <CheckList items={activeRecord.result.items} onToggle={handleToggleItem} />
            </div>
            <div className="animate-fade-in-delay-3">
              <NoticeList notices={activeRecord.result.notices} />
            </div>
            <div className="animate-fade-in-delay-3">
              <CalendarSync events={activeRecord.result.events} childName={getChildForRecord(activeRecord)?.name} />
            </div>
            <div className="animate-fade-in-delay-3">
              <ReminderSetting
                events={activeRecord.result.events}
                items={activeRecord.result.items}
              />
            </div>

            {/* Scan Another */}
            <div className="pt-4 animate-fade-in-delay-3">
              <button
                onClick={handleBack}
                className="w-full bg-white hover:bg-gray-50 text-gray-500 border border-gray-200 rounded-2xl py-3.5 text-sm font-medium transition-colors min-h-[44px]"
              >
                別のプリントを読み取る
              </button>
            </div>
          </>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="max-w-md mx-auto px-4 py-6 text-center">
        <p className="text-xs text-gray-300">
          © 2026 おたよりカレンダー
        </p>
      </footer>

      {/* Child Settings Modal */}
      {showChildSettings && (
        <ChildSettings
          children={children}
          onClose={() => setShowChildSettings(false)}
          onUpdate={refreshChildren}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl animate-fade-in">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-red-400" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-1">削除しますか？</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                このプリントの解析結果が削除されます。
                <br />
                この操作は取り消せません。
              </p>
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-2xl py-3.5 text-sm font-medium transition-colors min-h-[44px]"
              >
                キャンセル
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-2xl py-3.5 text-sm font-medium transition-colors min-h-[44px]"
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
