import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Luma",
    short_name: "Luma",
    description: "AI-first wardrobe planning for phones.",
    start_url: "/today",
    display: "standalone",
    background_color: "#091117",
    theme_color: "#f3b34c",
    icons: [
      {
        src: "/icon?size=192",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon?size=512",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
