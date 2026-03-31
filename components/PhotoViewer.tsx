"use client";

import { useState } from "react";
import { Image as ImageIcon, ChevronLeft, ChevronRight, X } from "lucide-react";

interface PhotoViewerProps {
  images: string[];
}

export default function PhotoViewer({ images }: PhotoViewerProps) {
  const [expanded, setExpanded] = useState<number | null>(null);

  if (images.length === 0) return null;

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
        <ImageIcon className="w-5 h-5 text-sky-500" />
        元のプリント
        <span className="text-sm font-normal text-gray-400">{images.length}枚</span>
      </h2>

      {/* Thumbnail grid */}
      <div className="grid grid-cols-3 gap-2">
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => setExpanded(i)}
            className="rounded-xl overflow-hidden border-2 border-gray-200 aspect-[3/4] hover:border-sky-300 transition-colors"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`プリント ${i + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Fullscreen viewer */}
      {expanded !== null && (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
          <div className="flex items-center justify-between p-4">
            <span className="text-white text-sm">
              {expanded + 1} / {images.length}
            </span>
            <button
              onClick={() => setExpanded(null)}
              className="text-white/70 hover:text-white p-1"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center px-4 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[expanded]}
              alt={`プリント ${expanded + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            {images.length > 1 && (
              <>
                {expanded > 0 && (
                  <button
                    onClick={() => setExpanded(expanded - 1)}
                    className="absolute left-2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}
                {expanded < images.length - 1 && (
                  <button
                    onClick={() => setExpanded(expanded + 1)}
                    className="absolute right-2 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
