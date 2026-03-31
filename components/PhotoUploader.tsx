"use client";

import { Camera, Upload, X, Plus } from "lucide-react";
import { useRef, useState } from "react";

export interface ImageData {
  base64: string;
  mimeType: string;
  dataUrl: string;
}

interface PhotoUploaderProps {
  onAnalyze: (images: ImageData[]) => void;
  isLoading: boolean;
}

function compressImage(file: File, maxWidth = 1600, quality = 0.7): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      const base64 = dataUrl.split(",")[1];
      resolve({ base64, mimeType: "image/jpeg", dataUrl });
    };
    img.onerror = () => reject(new Error("画像の読み込みに失敗しました"));
    img.src = URL.createObjectURL(file);
  });
}

export default function PhotoUploader({ onAnalyze, isLoading }: PhotoUploaderProps) {
  const [images, setImages] = useState<ImageData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const addFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: ImageData[] = [];
    for (const file of Array.from(files)) {
      try {
        const compressed = await compressImage(file);
        newImages.push(compressed);
      } catch {
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        newImages.push({
          base64: dataUrl.split(",")[1],
          mimeType: file.type,
          dataUrl,
        });
      }
    }
    setImages((prev) => [...prev, ...newImages]);
    e.target.value = "";
  };

  const handleRemove = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setImages([]);
  };

  const handleAnalyze = () => {
    if (images.length > 0) {
      onAnalyze(images);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {images.length === 0 ? (
        <div className="space-y-3">
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-3 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl py-4 px-6 text-lg font-medium transition-colors min-h-[56px] shadow-sm shadow-sky-200"
          >
            <Camera className="w-6 h-6" />
            カメラで撮影
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-600 border-2 border-gray-200 border-dashed rounded-2xl py-4 px-6 text-lg font-medium transition-colors min-h-[56px]"
          >
            <Upload className="w-6 h-6" />
            写真を選択（複数可）
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
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative rounded-2xl overflow-hidden border-2 border-gray-100 aspect-[3/4] shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.dataUrl} alt={`プリント ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => handleRemove(i)}
                  className="absolute top-2 right-2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
                <span className="absolute bottom-2 left-2 bg-black/40 text-white text-xs px-2.5 py-1 rounded-full">
                  {i + 1}枚目
                </span>
              </div>
            ))}
            <button
              onClick={() => addFileInputRef.current?.click()}
              className="rounded-2xl border-2 border-dashed border-gray-200 aspect-[3/4] flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-sky-500 hover:border-sky-300 transition-colors"
            >
              <Plus className="w-8 h-8" />
              <span className="text-xs">追加</span>
            </button>
          </div>
          <input
            ref={addFileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          <p className="text-center text-sm text-gray-400">{images.length}枚の写真を選択中</p>

          <div className="flex gap-2">
            <button
              onClick={handleClearAll}
              className="flex-shrink-0 bg-white hover:bg-gray-50 text-gray-500 border border-gray-200 rounded-2xl py-3 px-4 text-sm font-medium transition-colors min-h-[44px]"
            >
              クリア
            </button>
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-3 bg-mint-500 hover:bg-mint-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-2xl py-3 px-6 text-lg font-medium transition-colors min-h-[44px] shadow-sm shadow-green-200"
            >
              まとめて解析する
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
