import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF first (smaller), WebP fallback. Sources are already WebP, but the
    // optimizer can still transcode to AVIF for browsers that support it.
    formats: ["image/avif", "image/webp"],
    qualities: [75],
    minimumCacheTTL: 2678400, // 31 days
    // Widest source in public/ is 2560px, so the default 3840 bucket only ever
    // re-serves the 2560 render under a second URL — it costs an extra srcset
    // entry on every image and splits the CDN cache for nothing.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2560],
  },
  async headers() {
    return [
      {
        // The only assets served raw from /public rather than through
        // /_next/image. Their contents are immutable for a given filename.
        source:
          "/:file(texture-tile.webp|video-showcase.webm|video-showcase.mp4|video-showcase-poster.webp)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
