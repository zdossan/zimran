import type { MetadataRoute } from "next";

// Lets phones "Add to Home Screen" with the Owen icon (icons from the brand pack in public/).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Owen — your student loan guardian",
    short_name: "Owen",
    description: "See your cheapest legal student-loan repayment plan in 60 seconds, then check your servicer's statements for errors. No login.",
    start_url: "/",
    display: "standalone",
    background_color: "#F5F6FB",
    theme_color: "#4840BB",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
