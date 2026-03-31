"use client";

import { useState } from "react";
import { Users, Plus, X, Pencil, Trash2, Check } from "lucide-react";
import type { Child } from "@/lib/types";
import { CHILD_COLORS, addChild, updateChild, deleteChild, saveChildren } from "@/lib/storage";

interface ChildSettingsProps {
  children: Child[];
  onClose: () => void;
  onUpdate: () => void;
}

export default function ChildSettings({ children, onClose, onUpdate }: ChildSettingsProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState(CHILD_COLORS[0].hex);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(CHILD_COLORS[children.length % CHILD_COLORS.length].hex);

  const handleAdd = () => {
    if (!newName.trim()) return;
    addChild({
      id: `child-${Date.now()}`,
      name: newName.trim(),
      color: newColor,
    });
    setNewName("");
    setNewColor(CHILD_COLORS[(children.length + 1) % CHILD_COLORS.length].hex);
    setIsAdding(false);
    onUpdate();
  };

  const handleStartEdit = (child: Child) => {
    setEditingId(child.id);
    setEditName(child.name);
    setEditColor(child.color);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editName.trim()) return;
    updateChild(editingId, { name: editName.trim(), color: editColor });
    setEditingId(null);
    onUpdate();
  };

  const handleDelete = (id: string) => {
    deleteChild(id);
    onUpdate();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl animate-fade-in max-h-[80vh] overflow-y-auto">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sky-100 rounded-xl flex items-center justify-center">
              <Users className="w-4 h-4 text-sky-500" />
            </div>
            <h3 className="font-bold text-gray-800">子どもの設定</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-2">
          {children.length === 0 && !isAdding && (
            <p className="text-sm text-gray-400 text-center py-4">
              お子さんを登録すると、プリントを子どもごとに管理できます
            </p>
          )}

          {/* Existing children */}
          {children.map((child) => (
            <div key={child.id}>
              {editingId === child.id ? (
                <div className="bg-gray-50 rounded-2xl p-3.5 space-y-3">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-sky-300 min-h-[44px]"
                    placeholder="名前"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    {CHILD_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => setEditColor(c.hex)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          editColor === c.hex ? "border-gray-800 scale-110" : "border-transparent"
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 bg-gray-100 text-gray-500 rounded-xl py-2 text-sm min-h-[44px]"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      className="flex-1 bg-sky-500 text-white rounded-xl py-2 text-sm min-h-[44px]"
                    >
                      保存
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: child.color }}
                  >
                    {child.name.charAt(0)}
                  </div>
                  <span className="flex-1 font-medium text-gray-700">{child.name}</span>
                  <button
                    onClick={() => handleStartEdit(child)}
                    className="text-gray-300 hover:text-gray-500 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(child.id)}
                    className="text-gray-300 hover:text-red-400 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Add new child */}
          {isAdding ? (
            <div className="bg-gray-50 rounded-2xl p-3.5 space-y-3">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-sky-300 min-h-[44px]"
                placeholder="お子さんの名前"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
              <div className="flex gap-2">
                {CHILD_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setNewColor(c.hex)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      newColor === c.hex ? "border-gray-800 scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsAdding(false)}
                  className="flex-1 bg-gray-100 text-gray-500 rounded-xl py-2 text-sm min-h-[44px]"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!newName.trim()}
                  className="flex-1 bg-sky-500 hover:bg-sky-600 disabled:bg-gray-200 text-white rounded-xl py-2 text-sm min-h-[44px]"
                >
                  追加
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-2xl py-3 text-sm text-gray-400 hover:text-sky-500 hover:border-sky-300 transition-colors min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              子どもを追加
            </button>
          )}
        </div>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-2xl py-3.5 text-sm font-medium transition-colors min-h-[44px]"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
