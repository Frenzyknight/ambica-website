"use client";

import { useEffect, useRef } from "react";

/**
 * Full-bleed fabric drape rendered with WebGL2 — fully GPU-simulated.
 *
 * Passes:
 *  1. Sim pass — an anisotropic *relaxation* heightfield (ping-pong RG16F
 *     framebuffers). Unlike a wave equation, there is no velocity/inertia,
 *     so the surface never oscillates or throws off concentric rings the way
 *     water does. The cursor presses the cloth *in* along its path, leaving a
 *     dimple that spreads mostly *along the drape* (anisotropic diffusion)
 *     and relaxes back toward rest — reading as a crease, not a droplet.
 *     The same shader is run twice with different tuning:
 *       • Crease field — grain-aligned, quick to spring back (the live dent).
 *       • Wrinkle field — path-aligned, barely diffuses, decays slowly, so a
 *         drag leaves a trailing wrinkle that lingers a second or two.
 *  2. Render pass — a dense grid displaced by procedural drape folds plus
 *     both heightfields. Normals are computed per-pixel from the combined
 *     height, so lighting stays perfectly smooth (no visible triangulation)
 *     and every crease and wrinkle catches the light.
 */
export default function ClothCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // No MSAA: lighting is per-pixel on a plane, so there are no visible
    // geometric edges, and skipping it saves a lot of fill rate.
    const gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    if (!gl) return;

    let disposed = false;

    const floatExt = !!(
      gl.getExtension("EXT_color_buffer_float") ||
      gl.getExtension("EXT_color_buffer_half_float")
    );
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    // Without float render targets there is no ripple sim; render a still.
    const staticScene = reducedMotion || !floatExt;

    // ------------------------------------------------------------- shaders
    // Drape folds shared by the sim-independent height function. uv.y = 1 is
    // the (pinned) top, so fold amplitude grows toward the hem.
    const foldsGlsl = `
      float folds(vec2 uv, float t) {
        float x = uv.x;
        float y = uv.y;
        float f = 0.0;
        f += sin(x * 12.0 + sin(y * 3.0 + t * 0.35) * 1.1 + t * 0.14) * 0.55;
        f += sin(x * 21.0 - y * 2.5 - t * 0.22 + 1.7) * 0.30;
        f += sin(x * 38.0 + y * 6.0 + t * 0.4 + 4.2) * 0.14;
        f += sin(x * 64.0 - y * 3.0 - t * 0.3 + 0.8) * 0.05;
        f += sin(x * 5.5 - t * 0.18 + 2.3) * 0.42;
        return f * mix(1.0, 0.22, y);
      }
    `;

    const quadVs = `#version 300 es
      layout(location = 0) in vec2 aPos;
      out vec2 vUv;
      void main() {
        vUv = aPos * 0.5 + 0.5;
        gl_Position = vec4(aPos, 0.0, 1.0);
      }`;

    const simFs = `#version 300 es
      precision highp float;
      in vec2 vUv;
      uniform sampler2D uField;   // r = displacement (into the cloth)
      uniform vec2 uTexel;
      uniform float uAspect;
      uniform vec2 uMouseA;       // segment start (uv)
      uniform vec2 uMouseB;       // segment end (uv)
      uniform float uForce;       // press strength this frame
      uniform float uBrush;       // brush radius (uv, aspect-scaled)
      uniform float uAnisoY;      // <1 elongates the brush footprint in y
      uniform vec2  uDiff;        // diffusion spread (x = cross-grain, y = along)
      uniform float uDecay;       // relaxation back toward rest (no bounce)
      out vec4 outField;

      float sdSegment(vec2 p, vec2 a, vec2 b) {
        vec2 pa = p - a;
        vec2 ba = b - a;
        float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-8), 0.0, 1.0);
        return length(pa - ba * h);
      }

      void main() {
        float h = texture(uField, vUv).r;

        float l = texture(uField, vUv - vec2(uTexel.x, 0.0)).r;
        float r = texture(uField, vUv + vec2(uTexel.x, 0.0)).r;
        float d = texture(uField, vUv - vec2(0.0, uTexel.y)).r;
        float u = texture(uField, vUv + vec2(0.0, uTexel.y)).r;

        // Anisotropic diffusion: no velocity term, so the surface can never
        // overshoot its rest position — it only smooths and settles. Spreading
        // mainly along y drags the dimple into a fold-aligned crease.
        h += uDiff.x * (l + r - 2.0 * h) + uDiff.y * (u + d - 2.0 * h);

        // Cursor: press the fabric in along the pointer's path. Compressing y
        // turns the footprint into a streak rather than a circle.
        vec2 metric = vec2(uAspect, uAnisoY);
        float dist = sdSegment(vUv * metric, uMouseA * metric, uMouseB * metric);
        float brush = exp(-(dist * dist) / (uBrush * uBrush));
        h -= brush * uForce;

        // Relax back to flat. Cloth is heavily damped — it settles, it doesn't
        // ring, so this decay is the whole restoring behavior.
        h *= uDecay;

        // Let creases die out toward the borders so nothing piles up at edges.
        float edge = smoothstep(0.0, 0.06, vUv.x) *
                     smoothstep(0.0, 0.06, 1.0 - vUv.x) *
                     smoothstep(0.0, 0.06, vUv.y) *
                     smoothstep(0.0, 0.06, 1.0 - vUv.y);
        h *= mix(0.88, 1.0, edge);

        outField = vec4(h, 0.0, 0.0, 1.0);
      }`;

    const renderVs = `#version 300 es
      precision highp float;
      layout(location = 0) in vec2 aUv;
      uniform sampler2D uField;
      uniform sampler2D uWrinkle;
      uniform mat4 uProj;
      uniform float uCamZ;
      uniform vec2 uWorld;      // world width/height of the cloth plane
      uniform float uTime;
      uniform float uFoldAmp;
      uniform float uRippleAmp;
      uniform float uWrinkleAmp;
      out vec2 vUv;
      out vec3 vPos;
      ${foldsGlsl}
      void main() {
        vUv = aUv;
        float z = folds(aUv, uTime) * uFoldAmp
                + texture(uField, aUv).r * uRippleAmp
                + texture(uWrinkle, aUv).r * uWrinkleAmp;
        vec3 p = vec3((aUv.x - 0.5) * uWorld.x, (aUv.y - 0.5) * uWorld.y, z);
        vPos = p;
        gl_Position = uProj * vec4(p.x, p.y, p.z - uCamZ, 1.0);
      }`;

    const renderFs = `#version 300 es
      precision highp float;
      in vec2 vUv;
      in vec3 vPos;
      uniform sampler2D uField;
      uniform sampler2D uWrinkle;
      uniform sampler2D uCloth;  // linen weave scan (albedo + bump source)
      uniform float uCamZ;
      uniform vec2 uWorld;
      uniform float uTime;
      uniform float uFoldAmp;
      uniform float uRippleAmp;
      uniform float uWrinkleAmp;
      uniform vec3 uMouse;      // world x, y, strength
      out vec4 outColor;

      // Warm neutral highlight — matches the beige cloth, no brand green.
      const vec3 GLOW = vec3(0.92, 0.86, 0.74);
      ${foldsGlsl}

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      // Combined crease + wrinkle displacement (world-z units), with the
      // derivative exaggerated so shallow disturbances still catch the light.
      float disp(vec2 uv) {
        return (texture(uField, uv).r * uRippleAmp
              + texture(uWrinkle, uv).r * uWrinkleAmp) * 2.2;
      }

      float H(vec2 uv) {
        return folds(uv, uTime) * uFoldAmp + disp(uv);
      }

      float lum(vec2 uv) {
        return dot(texture(uCloth, uv).rgb, vec3(0.299, 0.587, 0.114));
      }

      void main() {
        // Forward differences over the combined disturbance field.
        vec2 e = vec2(1.0 / 384.0, 0.0);
        float ripple = texture(uField, vUv).r + texture(uWrinkle, vUv).r;
        float hc = H(vUv);
        float hr = H(vUv + e.xy);
        float hu = H(vUv + e.yx);
        vec3 n = normalize(vec3(
          -(hr - hc) / (e.x * uWorld.x),
          -(hu - hc) / (e.x * uWorld.y),
          1.0
        ));

        // Weave micro-bump: derive a gradient from the linen scan's
        // luminance (bright = raised thread) and tilt the normal with it.
        vec2 wuv = vUv * uWorld * 1.15;
        float wl = lum(wuv);
        vec2 we = vec2(0.0012, 0.0);
        vec2 grad = vec2(lum(wuv + we.xy) - wl, lum(wuv + we.yx) - wl);
        n = normalize(vec3(n.xy - grad * 1.6, n.z));

        vec3 viewDir = normalize(vec3(0.0, 0.0, uCamZ) - vPos);

        // Albedo: warm beige tinted by the scan's thread structure. The scan
        // is near-neutral, so only its variation matters, not its color.
        float weave = smoothstep(0.55, 1.0, wl);
        vec3 albedo = vec3(0.62, 0.46, 0.16) * mix(0.8, 1.28, weave);

        // Key light: warm, grazing from the upper-left.
        vec3 keyDir = normalize(vec3(-0.68, 0.34, 0.45));
        float ndk = max(dot(n, keyDir), 0.0);
        vec3 col = albedo * (0.12 + ndk * vec3(1.0, 0.94, 0.84) * 1.5);

        // Soft warm fill from below-right.
        vec3 fillDir = normalize(vec3(0.6, -0.4, 0.5));
        col += albedo * max(dot(n, fillDir), 0.0) * GLOW * 0.10;

        // Crease occlusion: recessed cloth falls into shadow.
        float depth = folds(vUv, uTime) * uFoldAmp;
        col *= mix(0.36, 1.18, smoothstep(-0.24, 0.26, depth));

        // Satin sheen along fold crests — broad glancing band plus a
        // tighter hot streak, both modulated by the weave.
        vec3 hv = normalize(keyDir + viewDir);
        float ndh = max(dot(n, hv), 0.0);
        col += pow(ndh, 24.0) * vec3(0.95, 0.80, 0.48) * 0.22;
        col += pow(ndh, 90.0) * vec3(1.0, 0.88, 0.55) * (0.45 + 0.35 * weave);

        // Cursor: warm neutral light that rides with the pointer.
        vec3 lightPos = vec3(uMouse.xy, 0.5);
        vec3 toLight = lightPos - vPos;
        float atten = uMouse.z / (1.0 + 18.0 * dot(toLight, toLight));
        vec3 ld = normalize(toLight);
        col += GLOW * max(dot(n, ld), 0.0) * atten * 1.3;
        vec3 hm = normalize(ld + viewDir);
        col += GLOW * pow(max(dot(n, hm), 0.0), 70.0) * atten * 2.2;

        // Creases catch a faint warm glow along their depth (tied to the
        // cursor light so it reads as fresh disturbance, not standing waves).
        col += GLOW * clamp(abs(ripple) * 1.5, 0.0, 0.3) * (0.15 + atten);

        // Rim on fold edges.
        float rim = pow(1.0 - max(dot(n, viewDir), 0.0), 4.0);
        col += GLOW * rim * 0.14;

        // Vignette + grain.
        float vig = 1.0 - 0.34 * pow(length(vUv - 0.5) * 1.4, 2.0);
        col *= vig;
        col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0;

        col = pow(max(col, 0.0), vec3(1.0 / 2.2));
        outColor = vec4(col, 1.0);
      }`;

    function compile(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) {
        console.error(gl!.getShaderInfoLog(s));
      }
      return s;
    }
    function link(vs: string, fs: string) {
      const p = gl!.createProgram()!;
      gl!.attachShader(p, compile(gl!.VERTEX_SHADER, vs));
      gl!.attachShader(p, compile(gl!.FRAGMENT_SHADER, fs));
      gl!.linkProgram(p);
      if (!gl!.getProgramParameter(p, gl!.LINK_STATUS)) {
        console.error(gl!.getProgramInfoLog(p));
      }
      return p;
    }

    const simProgram = link(quadVs, simFs);
    const renderProgram = link(renderVs, renderFs);

    const su = {
      field: gl.getUniformLocation(simProgram, "uField"),
      texel: gl.getUniformLocation(simProgram, "uTexel"),
      aspect: gl.getUniformLocation(simProgram, "uAspect"),
      mouseA: gl.getUniformLocation(simProgram, "uMouseA"),
      mouseB: gl.getUniformLocation(simProgram, "uMouseB"),
      force: gl.getUniformLocation(simProgram, "uForce"),
      brush: gl.getUniformLocation(simProgram, "uBrush"),
      anisoY: gl.getUniformLocation(simProgram, "uAnisoY"),
      diff: gl.getUniformLocation(simProgram, "uDiff"),
      decay: gl.getUniformLocation(simProgram, "uDecay"),
    };
    const ru = {
      field: gl.getUniformLocation(renderProgram, "uField"),
      wrinkle: gl.getUniformLocation(renderProgram, "uWrinkle"),
      cloth: gl.getUniformLocation(renderProgram, "uCloth"),
      proj: gl.getUniformLocation(renderProgram, "uProj"),
      camZ: gl.getUniformLocation(renderProgram, "uCamZ"),
      world: gl.getUniformLocation(renderProgram, "uWorld"),
      time: gl.getUniformLocation(renderProgram, "uTime"),
      foldAmp: gl.getUniformLocation(renderProgram, "uFoldAmp"),
      rippleAmp: gl.getUniformLocation(renderProgram, "uRippleAmp"),
      wrinkleAmp: gl.getUniformLocation(renderProgram, "uWrinkleAmp"),
      mouse: gl.getUniformLocation(renderProgram, "uMouse"),
    };

    // ------------------------------------------------- geometry & targets
    const CAM_Z = 2.2;
    const FOV = (34 * Math.PI) / 180;
    const FOLD_AMP = 0.2;
    const RIPPLE_AMP = 0.035;
    const WRINKLE_AMP = 0.05;

    // Per-field sim tuning. The crease is the live, grain-aligned dent that
    // springs back quickly; the wrinkle barely diffuses and decays slowly, so
    // a drag leaves a trailing fold that lingers ~1–2s.
    const CREASE_SIM = { anisoY: 0.34, diff: [0.1, 0.3], decay: 0.965 };
    const WRINKLE_SIM = { anisoY: 0.85, diff: [0.03, 0.05], decay: 0.996 };

    // Fullscreen triangle for the sim pass.
    const quadVao = gl.createVertexArray();
    gl.bindVertexArray(quadVao);
    const quadBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // Dense grid for the render pass (uv-only; height comes from textures).
    const GRID_X = 220;
    const GRID_Y = 132;
    const gridVao = gl.createVertexArray();
    gl.bindVertexArray(gridVao);
    const gridBuf = gl.createBuffer();
    const gridIdx = gl.createBuffer();
    {
      const uvs = new Float32Array(GRID_X * GRID_Y * 2);
      for (let y = 0; y < GRID_Y; y++) {
        for (let x = 0; x < GRID_X; x++) {
          const i = (y * GRID_X + x) * 2;
          uvs[i] = x / (GRID_X - 1);
          uvs[i + 1] = y / (GRID_Y - 1);
        }
      }
      const idx = new Uint32Array((GRID_X - 1) * (GRID_Y - 1) * 6);
      let k = 0;
      for (let y = 0; y < GRID_Y - 1; y++) {
        for (let x = 0; x < GRID_X - 1; x++) {
          const i = y * GRID_X + x;
          idx[k++] = i;
          idx[k++] = i + 1;
          idx[k++] = i + GRID_X;
          idx[k++] = i + 1;
          idx[k++] = i + GRID_X + 1;
          idx[k++] = i + GRID_X;
        }
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, gridBuf);
      gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gridIdx);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    }
    const gridIndexCount = (GRID_X - 1) * (GRID_Y - 1) * 6;

    // Linen weave scan. Starts as a 1x1 placeholder so the first frames
    // render, then upgrades when the image decodes. MIRRORED_REPEAT hides
    // any seams in the scan when it tiles.
    const clothTex = gl.createTexture()!;
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, clothTex);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGB,
      1,
      1,
      0,
      gl.RGB,
      gl.UNSIGNED_BYTE,
      new Uint8Array([216, 214, 210])
    );
    let clothUploaded = false;
    function uploadCloth(img: HTMLImageElement) {
      // Guard against late callbacks firing after teardown or a double upload
      // (e.g. both decode() and the onload fallback resolving).
      if (clothUploaded || disposed || !img.naturalWidth) return;
      clothUploaded = true;
      gl!.activeTexture(gl!.TEXTURE1);
      gl!.bindTexture(gl!.TEXTURE_2D, clothTex);
      gl!.texImage2D(
        gl!.TEXTURE_2D,
        0,
        gl!.RGB,
        gl!.RGB,
        gl!.UNSIGNED_BYTE,
        img
      );
      gl!.generateMipmap(gl!.TEXTURE_2D);
      gl!.texParameteri(
        gl!.TEXTURE_2D,
        gl!.TEXTURE_MIN_FILTER,
        gl!.LINEAR_MIPMAP_LINEAR
      );
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
      gl!.texParameteri(
        gl!.TEXTURE_2D,
        gl!.TEXTURE_WRAP_S,
        gl!.MIRRORED_REPEAT
      );
      gl!.texParameteri(
        gl!.TEXTURE_2D,
        gl!.TEXTURE_WRAP_T,
        gl!.MIRRORED_REPEAT
      );
      const aniso = gl!.getExtension("EXT_texture_filter_anisotropic");
      if (aniso) {
        gl!.texParameterf(
          gl!.TEXTURE_2D,
          aniso.TEXTURE_MAX_ANISOTROPY_EXT,
          Math.min(
            8,
            gl!.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)
          )
        );
      }
      // A still scene only draws on demand, so it must be redrawn once the
      // weave arrives; the animated loop picks it up on its next frame.
      if (staticScene) renderPass();
    }

    const clothImg = new Image();
    // onload fires for both fresh and cached responses, so it is the reliable
    // path. decode() is a nice-to-have that avoids a hitch when it works, but
    // it can reject on cached images (common when arriving via client-side
    // navigation), so we must never depend on it alone.
    clothImg.onload = () => uploadCloth(clothImg);
    clothImg.src = "/texture-final.jpg";
    clothImg
      .decode()
      .then(() => uploadCloth(clothImg))
      .catch(() => {
        // Fall back to onload / a completed cache hit.
        if (clothImg.complete) uploadCloth(clothImg);
      });

    // Ping-pong sim targets. Two independent fields (crease + wrinkle), each a
    // ping-pong pair, share the same shader with different tuning uniforms.
    type Field = {
      pair: { tex: WebGLTexture; fbo: WebGLFramebuffer }[];
      read: number;
    };
    const SIM_W = 384;
    let simH = 216;
    const creaseF: Field = { pair: [], read: 0 };
    const wrinkleF: Field = { pair: [], read: 0 };

    function makeField(fld: Field) {
      fld.pair.forEach((f) => {
        gl!.deleteTexture(f.tex);
        gl!.deleteFramebuffer(f.fbo);
      });
      fld.pair = [];
      for (let i = 0; i < 2; i++) {
        const tex = gl!.createTexture()!;
        gl!.bindTexture(gl!.TEXTURE_2D, tex);
        gl!.texImage2D(
          gl!.TEXTURE_2D,
          0,
          gl!.RG16F,
          SIM_W,
          simH,
          0,
          gl!.RG,
          gl!.HALF_FLOAT,
          null
        );
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
        gl!.texParameteri(
          gl!.TEXTURE_2D,
          gl!.TEXTURE_WRAP_S,
          gl!.CLAMP_TO_EDGE
        );
        gl!.texParameteri(
          gl!.TEXTURE_2D,
          gl!.TEXTURE_WRAP_T,
          gl!.CLAMP_TO_EDGE
        );
        const fbo = gl!.createFramebuffer()!;
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, fbo);
        gl!.framebufferTexture2D(
          gl!.FRAMEBUFFER,
          gl!.COLOR_ATTACHMENT0,
          gl!.TEXTURE_2D,
          tex,
          0
        );
        gl!.clearColor(0, 0, 0, 1);
        gl!.clear(gl!.COLOR_BUFFER_BIT);
        fld.pair.push({ tex, fbo });
      }
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
      fld.read = 0;
    }

    function makeSimTargets() {
      makeField(creaseF);
      makeField(wrinkleF);
    }

    // ------------------------------------------------------------- layout
    let worldW = 0;
    let worldH = 0;
    let aspect = 1;

    function layout() {
      // Cap the backing resolution: per-pixel cloth shading at full retina
      // DPR is the single biggest cost, and 1.5 is visually indistinguishable.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = canvas!.clientWidth;
      const h = canvas!.clientHeight;
      canvas!.width = Math.max(1, Math.round(w * dpr));
      canvas!.height = Math.max(1, Math.round(h * dpr));

      aspect = w / Math.max(1, h);
      const halfH = Math.tan(FOV / 2) * CAM_Z;
      const halfW = halfH * aspect;
      // Slightly oversized so edges never show.
      worldW = halfW * 2 * 1.1;
      worldH = halfH * 2 * 1.1;

      simH = Math.max(128, Math.min(384, Math.round(SIM_W / aspect)));
      makeSimTargets();

      const f = 1 / Math.tan(FOV / 2);
      const near = 0.1;
      const far = 10;
      const proj = new Float32Array([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) / (near - far), -1,
        0, 0, (2 * far * near) / (near - far), 0,
      ]);
      gl!.useProgram(renderProgram);
      gl!.uniformMatrix4fv(ru.proj, false, proj);
      gl!.uniform1f(ru.camZ, CAM_Z);
      gl!.uniform2f(ru.world, worldW, worldH);
      gl!.uniform1f(ru.foldAmp, FOLD_AMP);
      gl!.uniform1f(ru.rippleAmp, RIPPLE_AMP);
      gl!.uniform1f(ru.wrinkleAmp, WRINKLE_AMP);
    }

    // -------------------------------------------------------- interaction
    const mouse = {
      u: 0.5,
      v: 0.5,
      pu: 0.5,
      pv: 0.5,
      moved: false,
      down: false,
      pressed: false,
      on: false,
    };
    let mouseStrength = 0;
    let time = 0;

    function toUv(clientX: number, clientY: number) {
      const rect = canvas!.getBoundingClientRect();
      return {
        u: (clientX - rect.left) / rect.width,
        v: 1 - (clientY - rect.top) / rect.height,
      };
    }

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas!.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const { u, v } = toUv(e.clientX, e.clientY);
      mouse.u = u;
      mouse.v = v;
      mouse.moved = true;
      mouse.on = true;
    };
    const onPointerDown = (e: PointerEvent) => {
      const { u, v } = toUv(e.clientX, e.clientY);
      mouse.u = u;
      mouse.v = v;
      mouse.pu = u;
      mouse.pv = v;
      mouse.down = true;
      mouse.pressed = true;
      mouse.on = true;
    };
    const onPointerUp = () => {
      mouse.pressed = false;
    };
    const onPointerLeave = () => {
      mouse.on = false;
    };
    const onResize = () => layout();

    // --------------------------------------------------------------- loop
    const DT = 1 / 60;
    const SUBSTEPS = 2;

    type SimTune = { anisoY: number; diff: number[]; decay: number };

    function simStep(
      fld: Field,
      tune: SimTune,
      force: number,
      brush: number
    ) {
      gl!.useProgram(simProgram);
      gl!.bindVertexArray(quadVao);
      gl!.viewport(0, 0, SIM_W, simH);
      gl!.activeTexture(gl!.TEXTURE0);
      gl!.uniform1i(su.field, 0);
      gl!.uniform2f(su.texel, 1 / SIM_W, 1 / simH);
      gl!.uniform1f(su.aspect, aspect);
      gl!.uniform2f(su.mouseA, mouse.pu, mouse.pv);
      gl!.uniform2f(su.mouseB, mouse.u, mouse.v);
      gl!.uniform1f(su.force, force);
      gl!.uniform1f(su.brush, brush);
      gl!.uniform1f(su.anisoY, tune.anisoY);
      gl!.uniform2f(su.diff, tune.diff[0], tune.diff[1]);
      gl!.uniform1f(su.decay, tune.decay);

      for (let i = 0; i < SUBSTEPS; i++) {
        const write = 1 - fld.read;
        gl!.bindFramebuffer(gl!.FRAMEBUFFER, fld.pair[write].fbo);
        gl!.bindTexture(gl!.TEXTURE_2D, fld.pair[fld.read].tex);
        gl!.drawArrays(gl!.TRIANGLES, 0, 3);
        fld.read = write;
        // Only inject the impulse on the first substep.
        gl!.uniform1f(su.force, 0);
      }
      gl!.bindFramebuffer(gl!.FRAMEBUFFER, null);
    }

    function renderPass() {
      gl!.useProgram(renderProgram);
      gl!.bindVertexArray(gridVao);
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
      gl!.activeTexture(gl!.TEXTURE0);
      gl!.bindTexture(gl!.TEXTURE_2D, creaseF.pair[creaseF.read].tex);
      gl!.activeTexture(gl!.TEXTURE1);
      gl!.bindTexture(gl!.TEXTURE_2D, clothTex);
      gl!.activeTexture(gl!.TEXTURE2);
      gl!.bindTexture(gl!.TEXTURE_2D, wrinkleF.pair[wrinkleF.read].tex);
      gl!.uniform1i(ru.field, 0);
      gl!.uniform1i(ru.cloth, 1);
      gl!.uniform1i(ru.wrinkle, 2);
      gl!.uniform1f(ru.time, time);

      mouseStrength += ((mouse.on ? 1 : 0) - mouseStrength) * 0.08;
      const mx = (mouse.u - 0.5) * worldW;
      const my = (mouse.v - 0.5) * worldH;
      gl!.uniform3f(ru.mouse, mx, my, mouseStrength);

      gl!.clearColor(0.055, 0.053, 0.05, 1);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.drawElements(gl!.TRIANGLES, gridIndexCount, gl!.UNSIGNED_INT, 0);
    }

    function frameStep() {
      time += DT;

      let force = 0;
      let brush = 0.02;
      let dragSpeed = 0;
      // Only disturb the cloth while the pointer is held (dragging) — not hover.
      if (mouse.moved && mouse.pressed) {
        const du = (mouse.u - mouse.pu) * aspect;
        const dv = mouse.v - mouse.pv;
        dragSpeed = Math.sqrt(du * du + dv * dv);
        force = Math.min(0.28, dragSpeed * 8 + 0.02);
      }
      if (mouse.down) {
        force = Math.max(force, 0.55);
        brush = 0.04;
        mouse.down = false;
      }

      // Crease: the live, responsive dent.
      simStep(creaseF, CREASE_SIM, force, brush);

      // Wrinkle: only laid down by actual dragging (a poke leaves no trail),
      // with a finer brush so it reads as a thin fold running along the path.
      const wrinkleForce = Math.min(0.22, dragSpeed * 7);
      simStep(wrinkleF, WRINKLE_SIM, wrinkleForce, 0.020);

      mouse.pu = mouse.u;
      mouse.pv = mouse.v;
      mouse.moved = false;
    }

    // ------------------------------------------------------------ lifecycle
    layout();

    let raf = 0;
    let visible = true;
    let accumulator = 0;
    let lastT = performance.now();

    function frame(now: number) {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      // Clamp catch-up to 2 steps so slow frames never spiral into more work.
      accumulator = Math.min(
        accumulator + (now - lastT) / 1000,
        DT * 2
      );
      lastT = now;
      let stepped = false;
      while (accumulator >= DT) {
        frameStep();
        accumulator -= DT;
        stepped = true;
      }
      if (stepped) renderPass();
    }

    if (staticScene) {
      time = 4;
      renderPass();
    } else {
      lastT = performance.now();
      raf = requestAnimationFrame(frame);

      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerdown", onPointerDown, { passive: true });
      window.addEventListener("pointerup", onPointerUp, { passive: true });
      window.addEventListener("pointercancel", onPointerUp, { passive: true });
      document.addEventListener("pointerleave", onPointerLeave);
    }
    window.addEventListener("resize", onResize);

    const onVisibility = () => {
      visible = !document.hidden;
      lastT = performance.now();
    };
    document.addEventListener("visibilitychange", onVisibility);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && !document.hidden;
      lastT = performance.now();
    });
    io.observe(canvas);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      document.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      gl.deleteProgram(simProgram);
      gl.deleteProgram(renderProgram);
      gl.deleteBuffer(quadBuf);
      gl.deleteBuffer(gridBuf);
      gl.deleteBuffer(gridIdx);
      gl.deleteVertexArray(quadVao);
      gl.deleteVertexArray(gridVao);
      gl.deleteTexture(clothTex);
      [creaseF, wrinkleF].forEach((fld) =>
        fld.pair.forEach((f) => {
          gl.deleteTexture(f.tex);
          gl.deleteFramebuffer(f.fbo);
        })
      );
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}
