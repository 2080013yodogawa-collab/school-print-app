"use client";

import { useState } from "react";
import { Users, Copy, Check, LogOut, Link2, RefreshCw } from "lucide-react";

interface FamilyCodeProps {
  familyCode: string | null;
  onCreateFamily: () => Promise<void>;
  onJoinFamily: (code: string) => Promise<boolean>;
  onLeaveFamily: () => void;
  onSync: () => Promise<void>;
  isSyncing: boolean;
}

export default function FamilyCode({
  familyCode,
  onCreateFamily,
  onJoinFamily,
  onLeaveFamily,
  onSync,
  isSyncing,
}: FamilyCodeProps) {
  const [mode, setMode] = useState<"idle" | "join">("idle");
  const [inputCode, setInputCode] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    await onCreateFamily();
    setIsCreating(false);
  };

  const handleJoin = async () => {
    setError("");
    if (inputCode.trim().length !== 6) {
      setError("6文字のコードを入力してください");
      return;
    }
    const ok = await onJoinFamily(inputCode.trim());
    if (!ok) {
      setError("コードが見つかりません。確認してください。");
    } else {
      setMode("idle");
      setInputCode("");
    }
  };

  const handleCopy = async () => {
    if (!familyCode) return;
    await navigator.clipboard.writeText(familyCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Connected state
  if (familyCode) {
    return (
      <div className="bg-white rounded-2xl border border-mint-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 bg-mint-100 rounded-lg flex items-center justify-center">
            <Link2 className="w-4 h-4 text-mint-500" />
          </div>
          <span className="text-sm font-bold text-gray-700">家族で共有中</span>
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="ml-auto text-xs text-sky-500 hover:text-sky-600 flex items-center gap-1 min-h-[32px] px-2"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "同期中..." : "同期"}
          </button>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3">
          <span className="text-lg font-mono font-bold tracking-[0.3em] text-gray-800 flex-1 text-center">
            {familyCode}
          </span>
          <button
            onClick={handleCopy}
            className="text-gray-400 hover:text-sky-500 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            {copied ? (
              <Check className="w-4 h-4 text-mint-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-2 text-center">
          このコードをパパに伝えて、アプリで入力してもらえばデータを共有できます
        </p>

        <button
          onClick={onLeaveFamily}
          className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs text-gray-400 hover:text-red-400 transition-colors min-h-[36px]"
        >
          <LogOut className="w-3 h-3" />
          共有を解除
        </button>
      </div>
    );
  }

  // Join mode
  if (mode === "join") {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-sky-100 rounded-lg flex items-center justify-center">
            <Users className="w-4 h-4 text-sky-500" />
          </div>
          <span className="text-sm font-bold text-gray-700">家族コードを入力</span>
        </div>

        <input
          type="text"
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value.toUpperCase().slice(0, 6))}
          placeholder="例: ABC123"
          className="w-full text-center text-xl font-mono font-bold tracking-[0.3em] border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 transition-all"
          maxLength={6}
        />

        {error && <p className="text-xs text-red-400 mt-2 text-center">{error}</p>}

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => { setMode("idle"); setError(""); setInputCode(""); }}
            className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-xl py-3 text-sm font-medium transition-colors min-h-[44px]"
          >
            戻る
          </button>
          <button
            onClick={handleJoin}
            className="flex-1 bg-sky-500 hover:bg-sky-600 text-white rounded-xl py-3 text-sm font-bold transition-colors min-h-[44px]"
          >
            参加する
          </button>
        </div>
      </div>
    );
  }

  // Default: choose create or join
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 bg-sky-100 rounded-lg flex items-center justify-center">
          <Users className="w-4 h-4 text-sky-500" />
        </div>
        <span className="text-sm font-bold text-gray-700">パパと共有</span>
      </div>
      <p className="text-xs text-gray-400 mb-3">
        家族コードを作成して、プリントの内容をパパと共有できます
      </p>

      <div className="flex gap-2">
        <button
          onClick={handleCreate}
          disabled={isCreating}
          className="flex-1 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white rounded-xl py-3 text-sm font-bold transition-all min-h-[44px] disabled:opacity-50"
        >
          {isCreating ? "作成中..." : "コードを作成"}
        </button>
        <button
          onClick={() => setMode("join")}
          className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl py-3 text-sm font-medium transition-colors min-h-[44px]"
        >
          コードで参加
        </button>
      </div>
    </div>
  );
}
