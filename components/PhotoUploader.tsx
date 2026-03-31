"use client";

import { Camera, Upload, X, Loader2 } from "lucide-react";
import { useRef, useState } from "react";

interface PhotoUploaderProps {
  onAnalyze: (image: string, mimeType: string) => void;
  isLoading: boolean;
}

export default function PhotoUploader({ onAnalyze, isLoading }: PhotoUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<{ base64: string; mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      const base64 = result.split(",")[1];
      setImageData({ base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setPreview(null);
    setImageData(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleAnalyze = () => {
    if (imageData) {
      onAnalyze(imageData.base64, imageData.mimeType);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {!preview ? (
        <div className="space-y-3">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl py-4 px-6 text-lg font-medium transition-colors"
          >
            <Camera className="w-6 h-6" />
            カメラで撮影
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 rounded-xl py-4 px-6 text-lg font-medium transition-colors"
          >
            <Upload className="w-6 h-6" />
            写真を選択
          </button>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="プリントのプレビュー" className="w-full" />
            <button
              onClick={handleClear}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white rounded-xl py-4 px-6 text-lg font-medium transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                解析中...
              </>
            ) : (
              "プリントを解析する"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
