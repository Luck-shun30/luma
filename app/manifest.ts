import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Luma",
    short_name: "Luma",
    description: "AI-first wardrobe planning for phones.",
    scope: "/",
    start_url: "/today",
    display: "standalone",
    orientation: "portrait",
    background_color: "#091117",
    theme_color: "#f3b34c",
    categories: ["lifestyle", "productivity", "utilities"],
    prefer_related_applications: false,
    icons: [
      {
        src: "/icon?size=192",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon?size=512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
