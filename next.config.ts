import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF first (smaller), WebP fallback. Sources are already WebP, but the
    // optimizer can still transcode to AVIF for browsers that support it.
    formats: ["image/avif", "image/webp"],
    qualities: [75],
    minimumCacheTTL: 2678400, // 31 days
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
