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
//   node scripts/optimize-media.mjs [--video]
//
// Source files are deleted after a successful conversion so `public/` shrinks.
// The video re-encode is behind `--video` because its output is lossy and is
// committed — re-running it unprompted would degrade the shipped file.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, renameSync, rmSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = path.join(root, "public");

const WEBP = { quality: 82, effort: 6 };

// [source (relative to public/), max render width in device px, output path].
// Tiers mirror each call site's `sizes` prop; the largest use of an image wins.
// The catalogue shots land in collection/ under the fabric name they belong to,
// replacing the generator's timestamped filenames.
const CARD_W = 1200; // FabricCatalog cards: 33vw at >=1024px, 50vw / 100vw below.

const IMAGES = [
  ["Shirt_product_photoshoot_on_model_2K_20260911001258.jpeg", CARD_W, "collection/dusty-windowpane-model.webp"],
  ["Fabric_product_showcase_layout_2K_20260911001251.jpeg", CARD_W, "collection/dusty-windowpane-fabric.webp"],
  ["Model_wearing_shirt_product_photo_2K_20260911001427.jpeg", CARD_W, "collection/rose-windowpane-model.webp"],
  ["Fabrics_laid_out_for_showcase_2K_20260911001423.jpeg", CARD_W, "collection/rose-windowpane-fabric.webp"],
  ["Planning_male_model_product_shoot_2K_20260911001239.jpeg", CARD_W, "collection/blush-tartan-model.webp"],
  ["Fabrics_laid_out_for_showcase_2K_20260911001229.jpeg", CARD_W, "collection/blush-tartan-fabric.webp"],
  ["Planning_male_model_product_shoot_2K_20260911001308.jpeg", CARD_W, "collection/crimson-tartan-model.webp"],
  ["Fabrics_stacked_on_plane_background_2K_20260911001325.jpeg", CARD_W, "collection/crimson-tartan-fabric.webp"],
  ["Model_wearing_printed_shirt_2K_20260911001503.jpeg", CARD_W, "collection/ikat-check-model.webp"],
  ["Fabrics_stacked_on_plane_background_2K_20260911001458.jpeg", CARD_W, "collection/ikat-check-fabric.webp"],
  ["Product_photoshoot_for_male_shirt_2K_20260911001406.jpeg", CARD_W, "collection/pencil-stripe-model.webp"],
  ["Fabrics_stacked_on_plane_background_2K_20260911001402.jpeg", CARD_W, "collection/pencil-stripe-fabric.webp"],
  ["Male_model_product_photo_shoot_2K_20260911001217.jpeg", CARD_W, "collection/poppy-bloom-model.webp"],
  ["Fabrics_laid_on_plane_background_2K_20260911001221.jpeg", CARD_W, "collection/poppy-bloom-fabric.webp"],
  ["Product_photoshoot_male_model_shirt_2K_20260911001247.jpeg", CARD_W, "collection/branch-floral-model.webp"],
  ["Fabrics_laid_out_for_showcase_2K_20260911001243.jpeg", CARD_W, "collection/branch-floral-fabric.webp"],
  ["Model_wearing_shirt_product_photo_2K_20260911001417.jpeg", CARD_W, "collection/hibiscus-trail-model.webp"],
  ["Fabrics_laid_out_for_showcase_2K_20260911001413.jpeg", CARD_W, "collection/hibiscus-trail-fabric.webp"],
  ["Product_photo_shoot_for_shirt_2K_20260911001216.jpeg", CARD_W, "collection/mist-floral-model.webp"],
  ["Fabrics_laid_out_for_showcase_2K_20260911001506.jpeg", CARD_W, "collection/mist-floral-fabric.webp"],
  ["Planning_male_model_product_shoot_2K_20260911001512.jpeg", CARD_W, "collection/climbing-vine-model.webp"],
  ["Fabrics_laid_out_product_showcase_2K_20260911001302.jpeg", CARD_W, "collection/climbing-vine-fabric.webp"],
  ["Fabrics_stacked_on_plane_background_2K_20260911001355.jpeg", CARD_W, "collection/chrysanthemum-oak-fabric.webp"],
  ["Product_photoshoot_with_male_model_2K_20260911001455.jpeg", CARD_W, "collection/mandala-burst-model.webp"],
  ["Fabrics_stacked_on_plane_background_2K_20260911001445.jpeg", CARD_W, "collection/mandala-burst-fabric.webp"],
  ["Male_model_shirt_product_shoot_2K_20260911001339.jpeg", CARD_W, "collection/brush-leaf-model.webp"],
  ["Fabrics_laid_out_for_showcase_2K_20260911001332.jpeg", CARD_W, "collection/brush-leaf-fabric.webp"],
  ["Planning_male_model_product_shoot_2K_20260911001440.jpeg", CARD_W, "collection/veined-leaf-model.webp"],
  ["Fabrics_laid_out_for_showcase_2K_20260911001432.jpeg", CARD_W, "collection/veined-leaf-fabric.webp"],
  ["Man_modeling_shirt_product_photo_2K_20260911001329.jpeg", CARD_W, "collection/canopy-leaf-model.webp"],
  ["Fabrics_stacked_on_plane_background_2K_20260911001212.jpeg", CARD_W, "collection/canopy-leaf-fabric.webp"],
  ["Model_wearing_shirt_product_photo_2K_20260911001317.jpeg", CARD_W, "collection/hatch-block-model.webp"],
  ["Fabrics_laid_on_plane_background_2K_20260911001322.jpeg", CARD_W, "collection/hatch-block-fabric.webp"],
  ["Planning_product_photo_shoot_shirt_2K_20260911001351.jpeg", CARD_W, "collection/lattice-bloom-model.webp"],
  ["Fabrics_laid_out_for_showcase_2K_20260911001343.jpeg", CARD_W, "collection/lattice-bloom-fabric.webp"],
  ["Product_photoshoot_on_male_model_2K_20260911001359.jpeg", CARD_W, "collection/neat-geometric-model.webp"],
];

// Generated but never referenced by the site — deleted outright.
const UNUSED = [
  "Edit_photo_for_professional_look_2K_20260913124314.jpeg",
  "Edit_photo_to_professional_suit_2K_20260913125112.jpeg",
  "Edit_photo_with_lighting_2K_20260913124116.jpeg",
  "Fabrics_laid_out_product_showcase_2K_20260913130032.jpeg",
  "Replace_with_warm_background_2K_20260913134326.jpeg",
];

const kb = (bytes) => `${(bytes / 1024).toFixed(0)}KB`;

async function convertImage(rel, width, outRel) {
  const src = path.join(pub, rel);
  if (!existsSync(src)) {
    console.warn(`skip (missing): ${rel}`);
    return;
  }
  const out = outRel
    ? path.join(pub, outRel)
    : src.replace(/\.(jpe?g|png)$/i, ".webp");
  mkdirSync(path.dirname(out), { recursive: true });
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

function removeUnused() {
  for (const rel of UNUSED) {
    const p = path.join(pub, rel);
    if (!existsSync(p)) continue;
    const before = statSync(p).size;
    rmSync(p);
    console.log(`unused ${rel}  -${kb(before)}`);
  }
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
  for (const [rel, width, outRel] of IMAGES) {
    await convertImage(rel, width, outRel);
  }
  removeUnused();
  await makeTextureTile();
  // Opt-in: the committed video is already encoded, and running this again
  // would transcode lossy output a second time.
  if (process.argv.includes("--video")) await encodeVideo();
  console.log("done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
