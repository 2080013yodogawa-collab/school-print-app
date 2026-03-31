import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "おたよりカレンダー",
    short_name: "おたより",
    description: "学校のおたよりを撮影するだけで、予定や持ち物を自動で整理。家族のスケジュール管理をもっと楽に。",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafb",
    theme_color: "#0ea5e9",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
