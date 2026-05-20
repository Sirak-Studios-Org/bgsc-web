import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bad Girl Strength Club",
    short_name: "BGSC",
    description: "Your strength training membership portal",
    start_url: "/portal",
    display: "standalone",
    background_color: "#0D0D0D",
    theme_color: "#8F0000",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
