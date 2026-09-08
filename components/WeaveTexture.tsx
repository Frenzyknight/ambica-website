import type { CSSProperties } from "react";

/**
 * Tiled woven-fabric overlay shared across sections. Draws `texture-tile.webp`
 * (a small, seamless tile) as a repeating background at the given size, opacity
 * and blend mode. Replaces the near-identical inline blocks that each loaded
 * the full-resolution texture.
 */
export default function WeaveTexture({
  size = 480,
  opacity = 0.09,
  blend = "screen",
  className = "",
}: {
  size?: number;
  opacity?: number;
  blend?: CSSProperties["mixBlendMode"];
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        backgroundImage: "url(/texture-tile.webp)",
        backgroundSize: `${size}px`,
        backgroundRepeat: "repeat",
        opacity,
        mixBlendMode: blend,
      }}
    />
  );
}
