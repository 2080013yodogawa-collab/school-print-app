"use client";

export default function SkeletonLoader() {
  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-fade-in">
      {/* Header skeleton */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 skeleton mx-auto rounded-2xl" />
        <div className="w-48 h-4 skeleton mx-auto" />
        <div className="w-32 h-3 skeleton mx-auto" />
      </div>

      {/* Scanning animation */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center">
            <span className="text-sky-500 text-sm animate-pulse">📷</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">解析中...</p>
            <p className="text-xs text-gray-400">プリントの内容を読み取っています</p>
          </div>
        </div>

        {/* Fake print outline */}
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 space-y-3">
          <div className="w-3/4 h-4 skeleton" />
          <div className="w-full h-3 skeleton" />
          <div className="w-full h-3 skeleton" />
          <div className="w-2/3 h-3 skeleton" />
          <div className="mt-4 w-1/2 h-4 skeleton" />
          <div className="w-full h-3 skeleton" />
          <div className="w-4/5 h-3 skeleton" />
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mt-4">
          <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>

      {/* Result skeleton cards */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 skeleton rounded-lg" />
          <div className="w-24 h-5 skeleton" />
        </div>
        {[1, 2].map((i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-2">
            <div className="w-2/3 h-4 skeleton" />
            <div className="w-1/3 h-3 skeleton" />
          </div>
        ))}
      </div>
    </div>
  );
}
