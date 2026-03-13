import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TandemSync",
    short_name: "TandemSync",
    description: "A Progressive Web App built with Next.js",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: '/vercel.svg',
        sizes: '192x192',
        type: 'image/svg',
      },
      {
        src: '/vercel.svg',
        sizes: '512x512',
        type: 'image/svg',
      },
    ],
  };
}
