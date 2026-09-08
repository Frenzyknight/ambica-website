// One-shot media optimizer.
//
// Converts the site's used raster assets to right-sized WebP and re-encodes the
// showcase video to WebM/VP9 + MP4/H.264 with a WebP poster. Each image is
// downscaled to the widest size it can actually be served at (derived from its
// `sizes` prop) before encoding, so we never ship pixels the layout can't use.
//
// Uses `sharp` (bundled by Next, includes mozjpeg/libwebp) and the system
// `ffmpeg` (needs libvpx-vp9 + libx264). Run once from the repo root:
//
//   node scripts/optimize-media.mjs
//
// Source files are deleted after a successful conversion so `public/` shrinks.

import { execFileSync } from "node:child_process";
import { existsSync, renameSync, rmSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = path.join(root, "public");

const WEBP = { quality: 82, effort: 6 };

// image src (relative to public/) -> max render width in device px.
// Tiers mirror each call site's `sizes` prop; the largest use of an image wins.
const IMAGES = [
  // 2560w — full-bleed PageHero (sizes="100vw")
  ["hero-about.jpeg", 2560],
  ["subsidiaries-hero.jpeg", 2560],
  ["cotton.jpeg", 2560],

  // 1920w — half-width (50vw / 100vw)
  ["about-mill-floor.jpeg", 1920],
  ["about-yarn.jpeg", 1920],
  ["square-2.jpeg", 1920],
  ["ntm-hero.jpeg", 1920],
  ["dtm-image.jpeg", 1920],
  ["timeline-1992.jpeg", 1920],
  ["timeline-2001.jpeg", 1920],
  ["timeline-2014.jpeg", 1920],
  ["timeline-2023.jpeg", 1920],
  ["timeline-2026.jpeg", 1920],

  // 1200w — cards (33vw / 50vw / 84vw)
  ["collection/awning-stripe-fabric.jpeg", 1200],
  ["collection/awning-stripe-model.jpeg", 1200],
  ["collection/brushstroke-fabric.jpeg", 1200],
  ["collection/brushstroke-model.jpeg", 1200],
  ["collection/fractured-marble-fabric.jpeg", 1200],
  ["collection/fractured-marble-model.jpeg", 1200],
  ["collection/inkwash-maple-fabric.jpeg", 1200],
  ["collection/inkwash-maple-model.jpeg", 1200],
  ["collection/leaf-fabric.jpeg", 1200],
  ["collection/leaf-model.jpeg", 1200],
  ["collection/letterpress-fabric.jpeg", 1200],
  ["collection/letterpress-model.jpeg", 1200],
  ["collection/lotus-fabric.jpeg", 1200],
  ["collection/lotus-model.jpeg", 1200],
  ["collection/mudcloth-fabric.jpeg", 1200],
  ["collection/mudcloth-model.jpeg", 1200],
  ["collection/pinstripe-fabric.jpeg", 1200],
  ["collection/pinstripe-model.jpeg", 1200],
  ["collection/textured-linen-fabric.jpeg", 1200],
  ["collection/textured-linen-model.jpeg", 1200],
  ["team/Manav.jpeg", 1200],
  ["team/anand.jpeg", 1200],
  ["team/dharun.jpeg", 1200],
  ["team/nirbhay.jpeg", 1200],
  ["team/pawan.jpeg", 1200],
  ["team/pramod.jpeg", 1200],
  ["Procurement.jpeg", 1200],
  ["Processing.jpeg", 1200],
  ["Packaging.jpeg", 1200],
  ["export.jpeg", 1200],
  ["shirting-product.jpeg", 1200],
  ["casual-bottoms.jpeg", 1200],
  ["printed.jpeg", 1200],

  // 512w — rendered small, keep alpha
  ["shuttle-old.png", 512],
  ["ambica-logo-light.png", 512],

  // 288w — logos rendered at 144px / 80px, currently 2048x2048
  ["ntm-final.png", 288],
  ["dtm-final.png", 288],
];

const kb = (bytes) => `${(bytes / 1024).toFixed(0)}KB`;

async function convertImage(rel, width) {
  const src = path.join(pub, rel);
  if (!existsSync(src)) {
    console.warn(`skip (missing): ${rel}`);
    return;
  }
  const out = src.replace(/\.(jpe?g|png)$/i, ".webp");
  const before = statSync(src).size;
  await sharp(src)
    .resize({ width, withoutEnlargement: true })
    .webp(WEBP)
    .toFile(out);
  const after = statSync(out).size;
  rmSync(src);
  console.log(
    `image  ${rel} -> ${path.relative(pub, out)}  ${kb(before)} -> ${kb(after)} (w<=${width})`,
  );
}

async function makeTextureTile() {
  const src = path.join(pub, "texture-final.jpg");
  if (!existsSync(src)) {
    console.warn("skip (missing): texture-final.jpg");
    return;
  }
  const out = path.join(pub, "texture-tile.webp");
  const before = statSync(src).size;
  // Only ever drawn as a tiled 480px CSS background and as the WebGL weave
  // luminance source. 1024px covers a 480px tile at 2x DPR with room to spare.
  await sharp(src)
    .resize({ width: 1024, withoutEnlargement: true })
    .webp({ quality: 80, effort: 6 })
    .toFile(out);
  const after = statSync(out).size;
  rmSync(src);
  console.log(`tile   texture-final.jpg -> texture-tile.webp  ${kb(before)} -> ${kb(after)}`);
}

function ff(args) {
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], {
    stdio: "inherit",
  });
}

async function encodeVideo() {
  const src = path.join(pub, "video-showcase.mp4");
  if (!existsSync(src)) {
    console.warn("skip (missing): video-showcase.mp4");
    return;
  }
  const before = statSync(src).size;
  const webm = path.join(pub, "video-showcase.webm");
  const mp4Tmp = path.join(pub, "video-showcase.opt.mp4");
  const poster = path.join(pub, "video-showcase-poster.webp");
  const posterTmp = path.join(pub, "video-showcase-poster.png");
  const passlog = path.join(pub, "ffvp9pass");

  // Poster: first frame, 1280w. ffmpeg has no WebP encoder here, so extract a
  // PNG frame and let sharp produce the WebP.
  ff(["-i", src, "-frames:v", "1", "-vf", "scale=1280:-2", posterTmp]);
  await sharp(posterTmp).webp({ quality: 78, effort: 6 }).toFile(poster);
  rmSync(posterTmp);

  // WebM VP9 two-pass, ~1.4 Mbps, Opus audio.
  ff([
    "-i", src, "-c:v", "libvpx-vp9", "-b:v", "1400k", "-pass", "1",
    "-passlogfile", passlog, "-an", "-f", "null", "/dev/null",
  ]);
  ff([
    "-i", src, "-c:v", "libvpx-vp9", "-b:v", "1400k", "-pass", "2",
    "-passlogfile", passlog, "-row-mt", "1", "-c:a", "libopus", "-b:a", "96k",
    webm,
  ]);

  // MP4 H.264 fallback, CRF 24, faststart for progressive download.
  ff([
    "-i", src, "-c:v", "libx264", "-crf", "24", "-preset", "slow",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    "-c:a", "aac", "-b:a", "96k", mp4Tmp,
  ]);

  rmSync(src);
  renameSync(mp4Tmp, src);
  for (const f of [`${passlog}-0.log`, `${passlog}-0.log.mbtree`, passlog]) {
    if (existsSync(f)) rmSync(f);
  }

  console.log(
    `video  ${kb(before)} -> webm ${kb(statSync(webm).size)}, mp4 ${kb(
      statSync(src).size,
    )}, poster ${kb(statSync(poster).size)}`,
  );
}

async function main() {
  for (const [rel, width] of IMAGES) {
    await convertImage(rel, width);
  }
  await makeTextureTile();
  await encodeVideo();
  console.log("done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
