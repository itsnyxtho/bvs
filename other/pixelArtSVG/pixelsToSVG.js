(() => {
  // -----------------------------
  // 1) State & DOM
  // -----------------------------
  const el = {
    imgLoader: document.getElementById("imgLoader"),
    svgPreview: document.getElementById("svgPreview"),
    bgColor: document.getElementById("bgColor"),
    bgTransparent: document.getElementById("bgTransparent"),
    bgAlpha: document.getElementById("bgAlpha"),
    fileName: document.getElementById("fileName"),
    opacity: document.getElementById("opacity"),
    scale: document.getElementById("scale"),
    simplify: document.getElementById("simplify"),
    downloadRaw: document.getElementById("downloadRaw"),
    // optional (only if you added them in HTML)
    copyPngBtn: document.getElementById("copyPngBtn"),
    downloadPngBtn: document.getElementById("downloadPngBtn"),
  };

  const State = {
    lastImage: null,
    lastBaseName: "image",
    baseSVG: "", // raw pixel-art SVG (with optional background), no credit
    baseSize: { w: 0, h: 0 }, // parsed width/height from baseSVG
  };

  // -----------------------------
  // 2) Utils
  // -----------------------------
  const Utils = {
    clamp(n, lo, hi) {
      return Math.max(lo, Math.min(hi, n));
    },
    debounce(fn, ms = 60) {
      let t;
      return (...a) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...a), ms);
      };
    },
    sanitizeName(s) {
      return String(s || "image")
        .replace(/\s+/g, "_")
        .replace(/[^\w\-.]+/g, "");
    },
    buildExportFilename() {
      const bgColor = el.bgTransparent.checked ? "transparent" : el.bgColor.value;
      const alphaHex = Math.round(parseFloat(el.bgAlpha.value || "1") * 255)
        .toString(16)
        .padStart(2, "0");
      const bgTag = bgColor === "transparent" ? "transparent" : bgColor + alphaHex;
      const opacity = Utils.clamp(parseInt(el.opacity.value || "100", 10), 0, 100);
      const scale = parseFloat(el.scale.value || "1"); // keep fractional
      const simplify = el.simplify.checked ? "_S" : "";
      const date = new Date().toLocaleDateString(undefined, { month: "2-digit", day: "2-digit", year: "numeric" }).replace(/\//g, "-");
      const base = State.lastBaseName;
      return `${base}_B${bgTag}_O${opacity}_X${scale}${simplify}_D${date}.svg`;
    },
    parseSvgSize(svgString) {
      // Try DOM first (most robust)
      try {
        const doc = new DOMParser().parseFromString(svgString, "image/svg+xml");
        const svg = doc.documentElement;
        let w = parseFloat((svg.getAttribute("width") || "").replace("px", ""));
        let h = parseFloat((svg.getAttribute("height") || "").replace("px", ""));
        // Fallback to viewBox if width/height missing
        if (!(w > 0) || !(h > 0)) {
          const vb = (svg.getAttribute("viewBox") || "").trim().split(/\s+/).map(Number);
          if (vb.length === 4 && vb.every((n) => Number.isFinite(n))) {
            w = vb[2];
            h = vb[3];
          }
        }
        if (w > 0 && h > 0) return { w, h };
      } catch (_) {
        /* ignore and fall through to regex */
      }

      // Regex fallback (order-agnostic)
      const wm = svgString.match(/width="(\d+(?:\.\d+)?)(?:px)?"/i);
      const hm = svgString.match(/height="(\d+(?:\.\d+)?)(?:px)?"/i);
      if (wm && hm) return { w: +wm[1], h: +hm[1] };

      const vb = svgString.match(/viewBox="(?:[-\d.]+\s+){2}([-\d.]+)\s+([-\d.]+)"/i);
      if (vb) return { w: +vb[1], h: +vb[2] };

      return { w: 0, h: 0 };
    },
  };

  // -----------------------------
  // 3) SVG Builder (paths in unit grid → clean fractional scaling)
  // -----------------------------
  const SVGBuilder = {
    /**
     * Build pixel-art SVG using paths in unit-pixel coordinates.
     * - When simplify=true, emits one <path> per 8-connected color component (from edge stitching).
     * - When simplify=false, emits one multi-subpath <path> containing 1×1 squares for all pixels.
     * - The SVG uses viewBox in unit grid and scales by width/height attributes, so any fractional
     *   output size is crisp (vector).
     */
    pixelsToSVG({ data, width, height, scale, opacity, simplify, bg }) {
      // fractional scale is allowed
      scale = Math.max(0.25, Number(scale) || 1);
      opacity = Math.max(0, Math.min(100, Number(opacity) || 100));

      const N = width * height;
      const keyArr = new Array(N);
      const hexArr = new Array(N);
      const alArr = new Float32Array(N);

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          const i = idx * 4;
          const r = data[i],
            g = data[i + 1],
            b = data[i + 2],
            a = data[i + 3];
          if (!a) {
            keyArr[idx] = null;
            continue;
          }
          const finalAlpha = (a / 255) * (opacity / 100);
          if (finalAlpha <= 0) {
            keyArr[idx] = null;
            continue;
          }
          const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
          const al = +finalAlpha.toFixed(3);
          keyArr[idx] = `${hex}|${al}`;
          hexArr[idx] = hex;
          alArr[idx] = al;
        }
      }

      const out = [];

      // Background (unit grid path)
      if (!bg.transparent) {
        const a = Math.max(0, Math.min(1, +bg.alpha || 0));
        // Rect: (0,0)→(width,height) in unit grid
        const d = `M0 0H${width}V${height}H0Z`;
        out.push(`<path d="${d}" fill="${bg.color}" fill-opacity="${a.toFixed(3)}"/>`);
      }

      if (!simplify) {
        // One <path> per color for cache/locality (reduces attribute churn).
        const byColor = new Map(); // key -> array of pixel indices
        for (let i = 0; i < N; i++) {
          const key = keyArr[i];
          if (!key) continue;
          let arr = byColor.get(key);
          if (!arr) byColor.set(key, (arr = []));
          arr.push(i);
        }

        for (const [key, indices] of byColor.entries()) {
          const [hex, alStr] = key.split("|");
          const al = +alStr;
          // Build a single path with multiple 1×1 subpaths
          // Each pixel square in unit grid: Mx y h1 v1 h-1 z
          let d = "";
          for (const idx of indices) {
            const x = idx % width;
            const y = (idx - x) / width;
            d += `M${x} ${y}h1v1h-1Z`;
          }
          out.push(`<path d="${d}" fill="${hex}" fill-opacity="${al}" shape-rendering="crispEdges"/>`);
        }

        return this._wrapSVG(out.join(""), width, height, scale);
      }

      // ---- Simplify path mode: reuse your 8-connected boundary stitch ----
      // Build buckets by color to find 8-connected components quickly
      const buckets = new Map(); // key -> Set of indices
      for (let idx = 0; idx < N; idx++) {
        const key = keyArr[idx];
        if (!key) continue;
        let set = buckets.get(key);
        if (!set) buckets.set(key, (set = new Set()));
        set.add(idx);
      }

      const neighbors8 = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ];

      // For each color, emit one or more component paths (unit grid coords)
      for (const [key, remaining] of buckets.entries()) {
        while (remaining.size) {
          // ---- Collect component via DFS (8-connected) ----
          const start = remaining.values().next().value;
          remaining.delete(start);
          const comp = [];
          const stack = [start];
          while (stack.length) {
            const idx = stack.pop();
            comp.push(idx);
            const x = idx % width,
              y = (idx - x) / width;
            for (const [dx, dy] of neighbors8) {
              const nx = x + dx,
                ny = y + dy;
              if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
              const nIdx = ny * width + nx;
              if (!remaining.has(nIdx)) continue;
              remaining.delete(nIdx);
              stack.push(nIdx);
            }
          }

          // ---- Boundary stitch (cancel internal edges, keep outer) ----
          const pixSet = new Set(
            comp.map((i) => {
              const x = i % width,
                y = (i - x) / width;
              return `${x},${y}`;
            }),
          );
          const hasPix = (x, y) => pixSet.has(`${x},${y}`);

          const edges = [];
          const undirected = new Map();
          const addE = (x1, y1, x2, y2) => {
            const u = x1 < x2 || (x1 === x2 && y1 < y2) ? `${x1},${y1}|${x2},${y2}` : `${x2},${y2}|${x1},${y1}`;
            undirected.set(u, (undirected.get(u) || 0) + 1);
            edges.push([x1, y1, x2, y2]);
          };

          for (const i of comp) {
            const px = i % width,
              py = (i - px) / width;
            if (!hasPix(px, py - 1)) addE(px, py, px + 1, py); // top
            if (!hasPix(px + 1, py)) addE(px + 1, py, px + 1, py + 1); // right
            if (!hasPix(px, py + 1)) addE(px + 1, py + 1, px, py + 1); // bottom
            if (!hasPix(px - 1, py)) addE(px, py + 1, px, py); // left
          }

          const boundary = edges.filter(([x1, y1, x2, y2]) => {
            const u = x1 < x2 || (x1 === x2 && y1 < y2) ? `${x1},${y1}|${x2},${y2}` : `${x2},${y2}|${x1},${y1}`;
            return undirected.get(u) === 1;
          });

          // ---- Stitch edges into closed loops ----
          const ptKey = (x, y) => `${x},${y}`;
          const adj = new Map();
          const eKey = (e) => `${e[0]},${e[1]}|${e[2]},${e[3]}`;

          for (const e of boundary) {
            const k = ptKey(e[0], e[1]);
            let arr = adj.get(k);
            if (!arr) adj.set(k, (arr = []));
            arr.push(e);
          }

          const used = new Set();
          const loops = [];
          for (const e of boundary) {
            if (used.has(eKey(e))) continue;
            const loop = [];
            let cur = e;
            used.add(eKey(cur));
            loop.push([cur[0], cur[1]]);
            let cx = cur[2],
              cy = cur[3];
            while (true) {
              loop.push([cx, cy]);
              const outs = adj.get(ptKey(cx, cy)) || [];
              let next = null;
              for (const cand of outs) {
                if (!used.has(eKey(cand))) {
                  next = cand;
                  break;
                }
              }
              if (!next) break;
              used.add(eKey(next));
              cx = next[2];
              cy = next[3];
            }
            // Ensure closure
            const [sx, sy] = loop[0];
            const [lx, ly] = loop[loop.length - 1];
            if (sx !== lx || sy !== ly) loop.push([sx, sy]);
            loops.push(loop);
          }

          // Emit a single <path> (unit grid coords) with evenodd fill
          const [hex, alStr] = key.split("|");
          const al = +alStr;
          const d = loops
            .map((path) => {
              let s = "";
              for (let i = 0; i < path.length; i++) {
                const [x, y] = path[i];
                s += i === 0 ? `M${x} ${y}` : `L${x} ${y}`;
              }
              return s + "Z";
            })
            .join("");
          if (d) out.push(`<path d="${d}" fill="${hex}" fill-opacity="${al}" fill-rule="evenodd" shape-rendering="crispEdges"/>`);
        }
      }

      return this._wrapSVG(out.join(""), width, height, scale);
    },

    _wrapSVG(inner, unitW, unitH, scale) {
      // Scale purely via width/height against a unit viewBox
      const outW = unitW * scale;
      const outH = unitH * scale;
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${unitW} ${unitH}" width="${outW}" height="${outH}" shape-rendering="crispEdges">${inner}</svg>`;
    },
  };

  // -----------------------------
  // 4) Preview & IO
  // -----------------------------
  const Preview = {
    renderBase(svgString) {
      State.baseSVG = svgString;
      State.baseSize = Utils.parseSvgSize(svgString);

      // Let SVG dictate its intrinsic size (no CSS stretching)
      el.svgPreview.innerHTML = svgString || "";
      el.svgPreview.style.background = "transparent";
      el.svgPreview.style.opacity = "1";
    },
  };

  const IO = {
    async loadImageFile(file) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });
    },
    toCanvas(img) {
      const c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;
      c.getContext("2d").drawImage(img, 0, 0);
      return c;
    },
    download(filename, text, mime = "image/svg+xml") {
      const blob = new Blob([text], { type: mime });
      const a = Object.assign(document.createElement("a"), {
        href: URL.createObjectURL(blob),
        download: filename,
      });
      document.body.appendChild(a);
      a.click();
      a.remove();
    },
    svgToPngBlob(svgString) {
      return new Promise((resolve, reject) => {
        const { w, h } = Utils.parseSvgSize(svgString);
        if (!(w > 0) || !(h > 0)) return reject(new Error("Invalid SVG size."));
        const W = Math.max(1, Math.round(w));
        const H = Math.max(1, Math.round(h));

        const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = W;
          canvas.height = H;
          const ctx = canvas.getContext("2d");
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(img, 0, 0, W, H);
          canvas.toBlob((pngBlob) => {
            URL.revokeObjectURL(url);
            if (!pngBlob) return reject(new Error("PNG conversion failed."));
            resolve(pngBlob);
          }, "image/png");
        };
        img.onerror = (e) => reject(e);
        img.src = url;
      });
    },

    async copySvgAsPng(svgString) {
      const pngBlob = await IO.svgToPngBlob(svgString);
      const item = new ClipboardItem({ "image/png": pngBlob });
      await navigator.clipboard.write([item]);
    },
  };

  // -----------------------------
  // 5) Core regenerate pipeline
  // -----------------------------
  const regenerate = () => {
    if (!State.lastImage) return;

    const scale = Math.max(0.25, parseFloat(el.scale.value || "1"));

    // Reflect the cleaned-up value back to the input (UX clarity)
    if (String(scale) !== el.scale.value) el.scale.value = String(scale);

    const opacity = parseInt(el.opacity.value || "100", 10);
    const simplify = !!el.simplify.checked;

    const bg = {
      transparent: !!el.bgTransparent.checked,
      color: el.bgColor.value || "#000000",
      alpha: Utils.clamp(parseFloat(el.bgAlpha.value || "1"), 0, 1),
    };

    const canvas = IO.toCanvas(State.lastImage);
    const { data, width, height } = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);

    const baseSVG = SVGBuilder.pixelsToSVG({ data, width, height, scale, opacity, simplify, bg });
    Preview.renderBase(baseSVG);
  };

  const debouncedRegen = Utils.debounce(regenerate, 50);

  // -----------------------------
  // 6) Events
  // -----------------------------
  el.imgLoader.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const name = file.name;
    State.lastBaseName = Utils.sanitizeName(name.replace(/\.\w+$/, ""));
    const img = await IO.loadImageFile(file);
    State.lastImage = img;
    regenerate();
    el.fileName.value = State.lastBaseName;
  });

  // Click preview → download configured SVG (base)
  el.svgPreview.addEventListener("click", () => {
    if (!State.baseSVG) return;
    const finalNameBase = Utils.sanitizeName(el.fileName.value || State.lastBaseName) || "image";
    const fileName = Utils.buildExportFilename().replace(/^image/, finalNameBase);
    IO.download(fileName, State.baseSVG, "image/svg+xml");
  });

  // "Download Raw SVG" → base SVG
  el.downloadRaw?.addEventListener("click", () => {
    if (!State.baseSVG) return;
    const base = Utils.sanitizeName(el.fileName.value || State.lastBaseName) || "image";
    IO.download(`${base}.svg`, State.baseSVG, "image/svg+xml");
  });

  // Copy to Clipboard (PNG)
  el.copyPngBtn?.addEventListener("click", async () => {
    if (!State.baseSVG) return;
    try {
      await IO.copySvgAsPng(State.baseSVG);
    } catch (e) {
      console.error(e);
    }
  });

  // Download PNG
  el.downloadPngBtn?.addEventListener("click", async () => {
    if (!State.baseSVG) return;
    try {
      const pngBlob = await IO.svgToPngBlob(State.baseSVG);
      const a = document.createElement("a");
      const base = Utils.sanitizeName(el.fileName.value || State.lastBaseName) || "image";
      a.href = URL.createObjectURL(pngBlob);
      a.download = `${base}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error(e);
    }
  });

  // Live updates
  ["bgColor", "bgAlpha", "bgTransparent", "opacity", "scale", "simplify"].forEach((id) => {
    el[id]?.addEventListener("input", debouncedRegen);
    el[id]?.addEventListener("change", debouncedRegen);
  });

  // -----------------------------
  // 7) Expose safe globals for inline usage / debugging
  // -----------------------------
  window.PAS = { el, State, regenerate };
  // Back-compat for any inline onclick="copySvgToClipboard(...)"
  window.copySvgToClipboard = (/* optional svgElement */) => {
    if (!State.baseSVG) return;
    IO.copySvgAsPng(State.baseSVG).catch(() => {});
  };
})();
