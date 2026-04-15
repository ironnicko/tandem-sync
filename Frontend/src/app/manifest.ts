import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TandemSync",
    short_name: "TandemSync",
    description: "Ride-Coordination Made Simple.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/logo.svg",
        sizes: "192x192",
        type: "image/svg",
      },
      {
        src: "/logo.svg",
        sizes: "512x512",
        type: "image/svg",
      },
    ],
    // @ts-ignore - protocol_handlers and launch_handler are valid Web Manifest fields but may not be in the the current Next.js type.
    protocol_handlers: [
      {
        protocol: "web+tandem",
        url: "/join?code=%s",
      },
    ],
    launch_handler: {
      client_mode: ["focus-existing", "auto"],
    },
  };
}
