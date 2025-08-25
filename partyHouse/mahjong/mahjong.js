// ==UserScript==
// @name         BvS Mahjong Hand Exporter
// @namespace    bvs
// @version      1.3.0
// @description  Extract hand string, copy to clipboard, show Remaining Tiles, Tenhou preview, and rich References.
// @include      http*://*animecubedgaming*/billy/bvs/partyhouse-mahjongplay.html
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  /** --- CONSTANTS --- */
  const honorNames = ["East", "South", "West", "North", "White", "Green", "Red"];
  const suitInitial = { Man: "m", Pin: "p", Sou: "s", Honor: "z" };

  /* -------------------------- Demo Hand Utilities -------------------------- */

  function TILESRC(id) {
    return `/billy/layout/mjtiles/tileset/T${id}.gif`;
  }

  const ID = {
    num: function (suit, num) {
      if (suit === "m") return num - 1;
      if (suit === "p") return 8 + num;
      if (suit === "s") return 17 + num;
      throw new Error("bad suit");
    },
    honor: function (key) {
      const map = { E: 27, S: 28, W: 29, N: 30, H: 31, G: 32, R: 33 };
      return map[key];
    },
  };

  function makeTileImg(id) {
    const img = document.createElement("img");
    img.className = "tile";
    img.width = 22;
    img.height = 32;
    img.src = TILESRC(id);
    return img;
  }

  function makeBackImg() {
    return makeTileImg(34);
  }

  // helpers to build set & draw boxes
  function makeSetBox(set) {
    const box = document.createElement("div");
    box.className = `set-box ${set.status ? `set-${set.status}` : "set-either"}`;
    (set.tiles || []).forEach((id) => box.appendChild(makeTileImg(id)));
    const lbl = document.createElement("span");
    lbl.className = "set-label";
    lbl.textContent = set.label || "";
    box.appendChild(lbl);
    box.title = set.status === "hidden" ? "Concealed only" : set.status === "open" ? "Called (open) only" : "Open or concealed";
    return box;
  }

  function makeDrawBox(draw) {
    const box = document.createElement("div");
    box.className = `draw-box ${draw.type ? `draw-${draw.type}` : "draw-either"}`;
    box.appendChild(makeTileImg(draw.tileId));
    const t = document.createElement("span");
    t.textContent = draw.note || "Winning tile";
    box.appendChild(t);
    return box;
  }

  injectStyle();

  const form = document.forms.namedItem("discard");
  if (!form) return;
  const prevTable = findPreviousTable(form);
  if (!prevTable) return;

  const { seen, hiddenCount, wallCount } = scanSeenTiles(prevTable);
  const buckets = extractHandBuckets(form);
  const handString = buildHandString(buckets);

  console.log("Mahjong hand:", handString);
  navigator.clipboard.writeText(handString).catch(() => {});

  addCopyBox(form, handString);
  addRemainingTilesUI(form, prevTable, seen, buckets, hiddenCount, wallCount, handString);

  /* ---------------------------------------------------------------------- */
  /** ------------------------- HELPER FUNCTIONS -------------------------- */
  /* ---------------------------------------------------------------------- */

  /** Inject Dracula Pro–style theme + UI CSS */
  function injectStyle() {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600&display=swap');

      :root {
        /* Dracula Pro-ish palette (approx) */
        --dp-bg:        #282a36;
        --dp-surface:   #2d3042;
        --dp-surface-2: #232536;
        --dp-surface-3: #1e2030;
        --dp-fore:      #f8f8f2;
        --dp-gray:      #44475a;
        --dp-purple:    #bd93f9;
        --dp-pink:      #ff79c6;
        --dp-cyan:      #8be9fd;
        --dp-green:     #50fa7b;
        --dp-yellow:    #f1fa8c;
        --dp-orange:    #ffb86c;
        --dp-red:       #ff5555;

        /* translucent fills */
        --a-red:    rgba(255,85,85,.14);
        --a-yellow: rgba(241,250,140,.14);
        --a-orange: rgba(255,184,108,.14);
        --a-green:  rgba(80,250,123,.10);
        --a-gray:   rgba(68,71,90,.25);
      }

      .mjtracker-font { font-family: 'Fira Code', monospace !important; }
      [class*="mjtracker"], [class*="mjtracker"] * { box-sizing: border-box; }

      /* Cards / headers */
      .mjtracker-card { background: var(--dp-surface); color: var(--dp-fore); border-radius: 8px; box-shadow: 0 6px 14px rgba(0,0,0,.35); border: 1px solid var(--dp-gray); }
      .mjtracker-hdr  { margin:0;padding:8px 10px;background: var(--dp-surface-2); border-radius:8px 8px 0 0; font-weight:600; color:var(--dp-fore); }
      .mjtracker-body { padding:10px; }
      .mjtracker-chip {
        display:inline-block;
        margin:0;
        padding:4px 8px;
        border:1px solid var(--dp-gray);
        border-radius:12px;
        font-size:12px;
        cursor:pointer;
        background: var(--dp-surface-3);
        color: var(--dp-fore);
      }
      .mjtracker-text-chip {
        display:inline-block;
        margin:0;
        padding:4px 8px;
        border:1px solid var(--dp-gray);
        border-radius:12px;
        font-size:12px;
        background: var(--dp-surface-3);
        color: var(--dp-fore);
        user-select: none;
      }
      .mjtracker-chip:hover { background: var(--dp-purple); color:#0b0b0f; }
      .mjtracker-list {
        display:grid;
        grid-template-columns:repeat(auto-fill,minmax(max-content, calc(20% - 4px)));
        gap: 4px
      }
      .mjtracker-text-list {
        display:grid;
        gap: 4px;
        grid-auto-flow: column;
      }
      .mjtracker-badge { font-size:11px;opacity:0.9;margin-left:6px; padding:2px 8px; border:1px solid var(--dp-gray); border-radius:10px; display:inline-block; background: var(--dp-surface-2); }

      /* Layout row (remaining tiles + tenhou) */
      .mjtracker-row { display:flex;justify-content:center;align-items:flex-start;gap:12px;margin:6px; }

      /* Copy box */
      #mjtracker-copy-hand { background: var(--dp-surface-2) !important; color: var(--dp-fore) !important; border:1px solid var(--dp-gray); }

      /* Remaining tiles grid */
      #mjtracker-remaining-tiles .mjtracker-hdr { background: var(--dp-surface-2); }
      #mjtracker-remaining-tiles-grid { background: var(--dp-surface-3); }

      /* Demo hand */
      #mjtracker-demo-hand { margin-top:10px; border:1px solid var(--dp-gray); }
      #mjtracker-demo-hand .title { padding:8px 10px; border-bottom:1px solid var(--dp-gray); font-weight:600; }
      #mjtracker-demo-hand .subtitle { opacity:0.85; font-size:12px; margin-left:6px; }
      #mjtracker-demo-hand .sets { display:flex; flex-wrap:wrap; gap:8px; padding:10px; }
      #mjtracker-demo-hand .set-box { display:flex; align-items:center; gap:4px; padding:6px; border-radius:8px; border:1px solid var(--dp-gray); min-height:44px; }
      #mjtracker-demo-hand .set-label { font-size:11px; opacity:0.85; margin-left:4px; }
      #mjtracker-demo-hand .tile { width:22px; height:32px; }
      #mjtracker-demo-hand .info { padding:8px 10px; border-top:1px solid var(--dp-gray); display:flex; flex-wrap:wrap; gap:6px; }

      /* set statuses */
      .set-hidden { background: var(--a-red);    border-color: var(--dp-red); }
      .set-open   { background: var(--a-yellow); border-color: var(--dp-yellow); }
      .set-either { background: var(--a-orange); border-color: var(--dp-orange); }

      /* hand-level state */
      .hand-closed { background: var(--a-gray);   }
      .hand-open   { background: var(--a-green);  }

      /* special draw/wait box */
      .draw-box { padding:6px 8px; border-radius:8px; border:2px dashed var(--dp-purple); display:flex; align-items:center; gap:6px; }
      .draw-tsumo { border-color: var(--dp-green); }
      .draw-ron   { border-color: var(--dp-pink);  }
      .draw-either{ border-color: var(--dp-purple);}
      .draw-tanki { border-color: var(--dp-orange);}

      /* Tenhou frame */
      .mjtracker-tenhou { border:1px solid var(--dp-gray); background:#fff; border-radius:8px; box-shadow: 0 4px 10px rgba(0,0,0,.35); }

      .mjtracker-toggle {
        background: var(--dp-surface-3);
        color: var(--dp-fore);
        border: 1px solid var(--dp-gray);
        border-radius: 8px;
        padding: 2px 8px;
        font-size: 12px;
        cursor: pointer;
        overflow: hidden;
      }

      .mjtracker-hdr.mjtracker-collapsed {
        border-radius: 8px;
      }

      .mjtracker-toggle:hover{ background: var(--dp-purple); color:#0b0b0f; }

    `;
    document.head.append(style);
  }

  function attachToggle(containerEl, headerEl, bodyEl, startCollapsed = true, labels) {
    const collapsedText = (labels && labels.collapsed) || "Show ▼";
    const expandedText = (labels && labels.expanded) || "Hide ▲";

    // make header a flex row with a right-aligned button
    headerEl.style.display = "flex";
    headerEl.style.alignItems = "center";
    headerEl.style.justifyContent = "space-between";

    // preserve the original title text
    const titleSpan = document.createElement("span");
    titleSpan.textContent = headerEl.textContent;
    headerEl.textContent = "";
    headerEl.classList.add("mjtracker-collapsed");
    headerEl.appendChild(titleSpan);

    // toggle button
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mjtracker-toggle";
    headerEl.appendChild(btn);

    const set = (collapsed) => {
      bodyEl.style.display = collapsed ? "none" : "";
      btn.textContent = collapsed ? collapsedText : expandedText;
      headerEl.classList.toggle("mjtracker-collapsed", collapsed);
      headerEl.setAttribute("aria-expanded", collapsed ? "false" : "true");
    };

    // initial state (collapsed)
    set(!!startCollapsed);

    btn.addEventListener("click", () => {
      const collapsed = bodyEl.style.display === "none";
      set(!collapsed);
    });

    // also toggle on header click (excluding the button itself)
    headerEl.addEventListener("click", (e) => {
      if (e.target === btn) return;
      btn.click();
    });

    // keyboard accessibility
    headerEl.tabIndex = 0;
    headerEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        btn.click();
      }
    });
  }

  /**
   * Walks backwards from the form to find the previous table.
   * @param {HTMLFormElement} form
   * @returns {HTMLTableElement|null}
   */
  function findPreviousTable(form) {
    let node = form.previousSibling;
    while (node && (node.nodeType !== 1 || node.tagName !== "TABLE")) {
      node = node.previousSibling;
    }
    return node || null;
  }

  /**
   * Scans the table for seen tiles, hidden tiles, and wall count.
   * @param {HTMLTableElement} table
   * @returns {{seen: Object, hiddenCount: number, wallCount: number}}
   */
  function scanSeenTiles(table) {
    const seen = {};
    const kans = new Set();
    let hiddenCount = 0;

    table.querySelectorAll('img[src*="/mjtiles/tileset/T"]').forEach((img) => {
      const m = img.src.match(/T(\d+)\.gif$/);
      if (!m) return;
      const id = +m[1];
      const td = img.closest("td");
      if (!td) return;

      const imgsTd = Array.from(td.querySelectorAll('img[src*="/mjtiles/tileset/T"]'));
      if (imgsTd.length === 4) {
        const ids = imgsTd.map((i) => +(i.src.match(/T(\d+)\.gif$/) || [])[1]);
        if (ids[0] === 34 && ids[3] === 34 && ids[1] === ids[2] && !kans.has(ids[1])) {
          kans.add(ids[1]);
          seen[ids[1]] = 4;
          return;
        }
      }

      if (id === 34) hiddenCount++;
      else if (!kans.has(id)) seen[id] = (seen[id] || 0) + 1;
    });

    let wallCount = 0;
    const wm = table.textContent.match(/\((\d+)\s+Tiles Left\)/);
    if (wm) wallCount = +wm[1];

    return { seen, hiddenCount, wallCount };
  }

  function extractHandBuckets(form) {
    const buckets = { Man: [], Pin: [], Sou: [], Honor: [] };
    form.querySelectorAll('img[src*="/mjtiles/tileset/T"]').forEach((img) => {
      const m = img.src.match(/T(\d+)x?\.gif$/);
      if (!m) return;
      const id = +m[1];
      if (id <= 8) buckets.Man.push(id + 1);
      else if (id <= 17) buckets.Pin.push(id - 8);
      else if (id <= 26) buckets.Sou.push(id - 17);
      else if (id <= 33) buckets.Honor.push(id - 26);
    });
    return buckets;
  }

  function buildHandString(buckets) {
    const makePart = (arr, key) => (arr.length ? arr.sort((a, b) => a - b).join("") + suitInitial[key] : "");
    return makePart(buckets.Man, "Man") + makePart(buckets.Pin, "Pin") + makePart(buckets.Sou, "Sou") + makePart(buckets.Honor, "Honor");
  }

  function addCopyBox(form, handString) {
    const copyDiv = document.createElement("div");
    copyDiv.textContent = "📋 Copy hand: " + handString;
    copyDiv.classList.add("mjtracker-font");
    copyDiv.id = "mjtracker-copy-hand";
    Object.assign(copyDiv.style, {
      margin: "8px 0",
      padding: "6px 10px",
      cursor: "pointer",
      borderRadius: "8px",
      width: "max-content",
      boxShadow: "0 4px 10px rgba(0,0,0,0.35)",
    });

    function resetCopyDivText() {
      copyDiv.textContent = "📋 Copy hand: " + handString;
    }

    copyDiv.addEventListener("click", () => {
      navigator.clipboard.writeText(handString).then(() => {
        copyDiv.textContent = "✅ Copied! " + handString;
        setTimeout(resetCopyDivText, 1500);
      });
    });

    const handTable = form.querySelector("table");
    handTable?.parentNode?.insertBefore(copyDiv, handTable.nextSibling || null);
  }

  function addRemainingTilesUI(form, prevTable, seen, buckets, hiddenCount, wallCount, handString) {
    const remainingTilesContainer = document.createElement("div");
    remainingTilesContainer.classList.add("mjtracker-font", "mjtracker-card");
    remainingTilesContainer.id = "mjtracker-remaining-tiles";
    Object.assign(remainingTilesContainer.style, { maxWidth: "max-content", overflow: "hidden" });

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.textContent = "Show tile counts ▼";
    toggle.classList.add("mjtracker-font", "mjtracker-hdr");
    Object.assign(toggle.style, { display: "block", margin: "0", width: "100%", cursor: "pointer", border: "none", textAlign: "left" });
    remainingTilesContainer.appendChild(toggle);

    const grid = createGrid();
    grid.id = "mjtracker-remaining-tiles-grid";
    remainingTilesContainer.appendChild(grid);

    const iframe = createTenhouIframe(handString);

    const row = document.createElement("div");
    row.classList.add("mjtracker-row");
    row.id = "mjtracker-remaining-tiles-row";
    row.append(remainingTilesContainer, iframe);

    toggle.addEventListener("click", () => {
      const isShown = grid.style.display !== "none";
      grid.style.display = isShown ? "none" : "grid";
      toggle.textContent = isShown ? "Show tile counts ▼" : "Hide tile counts ▲";
    });

    populateGrid(grid, seen, buckets, hiddenCount, wallCount);

    const copyDiv = form.querySelector("#mjtracker-copy-hand");
    copyDiv?.parentNode?.insertBefore(row, copyDiv.nextSibling || null);

    // const waitingFor = buildWaitingForSection(seen, buckets);
    // row.insertAdjacentElement("afterend", waitingFor);

    addReferencesSection(form);
  }

  function createGrid() {
    const grid = document.createElement("div");
    grid.classList.add("mjtracker-font");
    Object.assign(grid.style, {
      gridTemplateColumns: "repeat(9,28px)",
      gap: "4px",
      padding: "6px",
      display: "grid",
      width: "300px",
      justifyContent: "center",
    });
    return grid;
  }

  function createTenhouIframe(handString) {
    const iframe = document.createElement("iframe");
    iframe.src = `https://tenhou.net/2/?q=${encodeURIComponent(handString)}#m2`;
    iframe.width = "300";
    iframe.height = "255";
    iframe.loading = "lazy";
    iframe.title = "Tenhou Hand Viewer";
    iframe.className = "mjtracker-tenhou";
    return iframe;
  }

  function populateGrid(grid, seen, buckets, hiddenCount, wallCount) {
    for (let id = 0; id < 34; id++) {
      const seenPrev = seen[id] || 0;
      const inHand = countTilesInHand(buckets, id);
      const totalSeen = Math.min(4, seenPrev + inHand);
      const unseen = Math.max(0, 4 - totalSeen);
      appendCell(grid, id, unseen, `${idToName(id)} — seen:${totalSeen}, unseen:${unseen}`);
    }
    appendCell(grid, 34, hiddenCount, `Hidden Back — hidden tiles in hands: ${hiddenCount}`, "H");
    appendCell(grid, 34, wallCount, `Wall Back — hidden tiles in wall: ${wallCount}`, "W");
  }

  function countTilesInHand(buckets, id) {
    let num;
    if (id <= 8) num = id + 1;
    else if (id <= 17) num = id - 8;
    else if (id <= 26) num = id - 17;
    else num = 0;
    let key;
    if (id <= 8) key = "Man";
    else if (id <= 17) key = "Pin";
    else if (id <= 26) key = "Sou";
    else key = "Honor";
    return buckets[key].filter((n) => n === num).length;
  }

  function idToName(id) {
    if (id <= 8) return `${id + 1}-Man`;
    if (id <= 17) return `${id - 8}-Pin`;
    if (id <= 26) return `${id - 17}-Sou`;
    if (id <= 33) return honorNames[id - 27];
    return "Tile Back";
  }

  function appendCell(grid, id, count, title, letter) {
    const cell = document.createElement("div");
    cell.classList.add("mjtracker-font");
    Object.assign(cell.style, { position: "relative", display: "grid", justifyContent: "center", alignItems: "center" });

    const img = document.createElement("img");
    img.src = `/billy/layout/mjtiles/tileset/T${id}.gif`;
    img.width = 22;
    img.height = 32;
    cell.append(img);

    const lbl = document.createElement("div");
    lbl.textContent = count;
    Object.assign(lbl.style, { fontSize: "0.8em", color: "#fff" });
    cell.append(lbl);

    if (letter) {
      const badge = document.createElement("div");
      badge.textContent = letter;
      badge.classList.add("mjtracker-font");
      Object.assign(badge.style, {
        position: "absolute",
        top: "calc(50% - 7px - 12px)",
        right: "calc(50% - 7px)",
        background: "var(--dp-red)",
        color: "var(--dp-fore)",
        fontSize: "0.7em",
        width: "14px",
        height: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "2px",
        fontWeight: "600",
      });
      cell.append(badge);
    }

    cell.title = title;
    grid.append(cell);
  }

  /* ===================== Waiting For ===================== */
  function buildWaitingForSection(seen, buckets) {
    const section = document.createElement("div");
    section.classList.add("mjtracker-font", "mjtracker-card");
    section.id = "mjtracker-waiting-for";
    section.style.marginTop = "8px";

    const hdr = document.createElement("div");
    hdr.className = "mjtracker-hdr";
    hdr.textContent = "Waiting For";
    section.appendChild(hdr);

    const body = document.createElement("div");
    body.className = "mjtracker-body";
    section.appendChild(body);

    attachToggle(section, hdr, body, /* startCollapsed */ true, {
      collapsed: "Show ▼",
      expanded: "Hide ▲",
    });

    const groups = { Man: [], Pin: [], Sou: [], Honor: [] };

    for (let id = 0; id < 34; id++) {
      const seenPrev = seen[id] || 0;
      const inHand = countTilesInHand(buckets, id);
      const totalSeen = Math.min(4, seenPrev + inHand);
      const unseen = Math.max(0, 4 - totalSeen);
      if (id <= 33 && unseen > 0) {
        const key = id <= 8 ? "Man" : id <= 17 ? "Pin" : id <= 26 ? "Sou" : "Honor";
        const label = key === "Honor" ? `${honorNames[id - 27]}` : `${id <= 8 ? id + 1 : id <= 17 ? id - 8 : id - 17}${suitInitial[key]}`;
        groups[key].push({ label, unseen });
      }
    }

    const makeRow = (title, items) => {
      const row = document.createElement("div");
      row.style.marginBottom = "6px";
      const h = document.createElement("div");
      h.textContent = title;
      h.style.fontWeight = "bold";
      h.style.margin = "4px 0";
      row.appendChild(h);
      if (items.length === 0) {
        const none = document.createElement("div");
        none.textContent = "— none —";
        none.style.opacity = "0.8";
        row.appendChild(none);
      } else {
        const wrap = document.createElement("div");
        items.sort((a, b) => a.label.localeCompare(b.label));
        items.forEach(({ label, unseen }) => {
          const chip = document.createElement("span");
          chip.className = "mjtracker-chip";
          chip.textContent = `${label} ×${unseen}`;
          chip.title = "Tiles still available (not seen/held)";
          wrap.appendChild(chip);
        });
        row.appendChild(wrap);
      }
      return row;
    };

    body.appendChild(makeRow("Manzu (Characters)", groups.Man));
    body.appendChild(makeRow("Pinzu (Dots)", groups.Pin));
    body.appendChild(makeRow("Souzu (Bamboos)", groups.Sou));
    body.appendChild(makeRow("Honors (Kazehai & San-genpai)", groups.Honor));

    const note = document.createElement("div");
    note.className = "mjtracker-badge";
    note.textContent = "Note: This is availability, not exact uke-ire/shanten.";
    body.appendChild(note);

    return section;
  }

  // Random helpers
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = (arr) => arr[rand(0, arr.length - 1)];
  function ensure14(arr) {
    while (arr.length < 14) arr.push(arr[arr.length - 1]);
    return arr.slice(0, 14);
  }

  // ===== Example hand generators now return: { sets:[{tiles, status:'hidden'|'open'|'either', label}], draw?, closedNote, winNote, tiles } =====
  const YAKU_GENERATORS = {
    // 1 Han
    Riichi: () => {
      const suit = pick(["m", "p", "s"]);
      const seqs = [
        [2, 3, 4],
        [3, 4, 5],
        [5, 6, 7],
        [6, 7, 8],
      ].map((a) => a.map((n) => ID.num(suit, n)));
      const pairNum = pick([2, 3, 4, 6, 7, 8]);
      const sets = seqs.map((t, i) => ({ tiles: t, status: "hidden", label: `Chi ${i + 1}` })).concat([{ tiles: [ID.num(suit, pairNum), ID.num(suit, pairNum)], status: "hidden", label: "Pair" }]);
      return pack(sets, "Closed only", "Ron / Tsumo");
    },
    Tsumo: () => {
      const suit = pick(["m", "p", "s"]);
      const sets = [
        [2, 3, 4],
        [3, 4, 5],
        [5, 6, 7],
      ].map((a) => ({ tiles: a.map((n) => ID.num(suit, n)), status: "hidden", label: "Chi" }));
      sets.push({ tiles: [ID.num(suit, 7), ID.num(suit, 7), ID.num(suit, 7)], status: "hidden", label: "Pon" });
      sets.push({ tiles: [ID.num(suit, 2), ID.num(suit, 2)], status: "hidden", label: "Pair" });
      return pack(sets, "Closed only", "Tsumo only");
    },
    Pinfu: () => YAKU_GENERATORS.Riichi(),
    Tanyao: () => {
      const suit = pick(["m", "p", "s"]);
      const mk = () => pick([2, 3, 4, 5, 6, 7, 8]);
      const sets = [
        { tiles: [mk(), mk(), mk()].map((n) => ID.num(suit, n)), status: "either", label: "Chi" },
        { tiles: [mk(), mk(), mk()].map((n) => ID.num(suit, n)), status: "either", label: "Chi" },
        { tiles: [mk(), mk(), mk()].map((n) => ID.num(suit, n)), status: "either", label: "Chi" },
        { tiles: [mk(), mk(), mk()].map((n) => ID.num(suit, n)), status: "either", label: "Chi" },
        { tiles: [ID.num(suit, mk()), ID.num(suit, mk())], status: "either", label: "Pair" },
      ];
      return pack(sets, Math.random() < 0.5 ? "Open or Closed" : "Closed only", "Ron / Tsumo");
    },
    Iipeikō: () => {
      const suit = pick(["m", "p", "s"]);
      const a = pick([1, 2, 3, 4, 5, 6, 7].filter((x) => x <= 7));
      const sets = [
        { tiles: [a, a + 1, a + 2].map((n) => ID.num(suit, n)), status: "hidden", label: "Chi A" },
        { tiles: [a, a + 1, a + 2].map((n) => ID.num(suit, n)), status: "hidden", label: "Chi A" },
        { tiles: [5, 6, 7].map((n) => ID.num(suit, n)), status: "hidden", label: "Chi B" },
        { tiles: [6, 7, 8].map((n) => ID.num(suit, n)), status: "hidden", label: "Chi C" },
        { tiles: [ID.num(suit, 2), ID.num(suit, 2)], status: "hidden", label: "Pair" },
      ];
      return pack(sets, "Closed only", "Ron / Tsumo");
    },
    "Yakuhai (Kaze)": () => {
      const honor = pick(["E", "S", "W", "N"]);
      const suit = pick(["m", "p", "s"]);
      const sets = [
        { tiles: [ID.honor(honor), ID.honor(honor), ID.honor(honor)], status: "either", label: "Pon (Wind)" },
        { tiles: [1, 2, 3].map((n) => ID.num(suit, n)), status: "either", label: "Chi" },
        { tiles: [4, 5, 6].map((n) => ID.num(suit, n)), status: "either", label: "Chi" },
        { tiles: [7, 8, 9].map((n) => ID.num(suit, n)), status: "either", label: "Chi" },
        { tiles: [ID.num(suit, 1), ID.num(suit, 1)], status: "either", label: "Pair" },
      ];
      return pack(sets, "Open or Closed", "Ron / Tsumo");
    },
    "Yakuhai (Sangen)": () => {
      const drag = pick(["H", "G", "R"]);
      const suit = pick(["m", "p", "s"]);
      const sets = [
        { tiles: [ID.honor(drag), ID.honor(drag), ID.honor(drag)], status: "either", label: "Pon (Dragon)" },
        { tiles: [1, 2, 3].map((n) => ID.num(suit, n)), status: "either", label: "Chi" },
        { tiles: [4, 5, 6].map((n) => ID.num(suit, n)), status: "either", label: "Chi" },
        { tiles: [7, 8, 9].map((n) => ID.num(suit, n)), status: "either", label: "Chi" },
        { tiles: [ID.num(suit, 1), ID.num(suit, 1)], status: "either", label: "Pair" },
      ];
      return pack(sets, "Open or Closed", "Ron / Tsumo");
    },

    // 2 Han
    "Sanshoku Dōjun": () => {
      const n = pick([2, 3, 4, 5, 6]);
      const sets = [
        { tiles: [ID.num("m", n), ID.num("m", n + 1), ID.num("m", n + 2)], status: "either", label: "Chi (Man)" },
        { tiles: [ID.num("p", n), ID.num("p", n + 1), ID.num("p", n + 2)], status: "either", label: "Chi (Pin)" },
        { tiles: [ID.num("s", n), ID.num("s", n + 1), ID.num("s", n + 2)], status: "either", label: "Chi (Sou)" },
        { tiles: [ID.num("m", 1), ID.num("m", 1)], status: "either", label: "Pair" },
        { tiles: [ID.num("m", 2), ID.num("m", 3), ID.num("m", 4)], status: "either", label: "Chi" },
      ];
      return pack(sets, "Open or Closed", "Ron / Tsumo");
    },
    Ittsū: () => {
      const suit = pick(["m", "p", "s"]);
      const sets = [
        { tiles: [1, 2, 3].map((n) => ID.num(suit, n)), status: "either", label: "123" },
        { tiles: [4, 5, 6].map((n) => ID.num(suit, n)), status: "either", label: "456" },
        { tiles: [7, 8, 9].map((n) => ID.num(suit, n)), status: "either", label: "789" },
        { tiles: [ID.num("p", 1), ID.num("p", 1)], status: "either", label: "Pair" },
        { tiles: [ID.num("s", 2), ID.num("s", 2)], status: "either", label: "Pair" },
      ];
      return pack(sets, "Open or Closed (value varies)", "Ron / Tsumo");
    },
    "Chii-toitsu": () => {
      const suit = pick(["m", "p", "s"]);
      const pairs = [1, 3, 4, 6, 7].map((n) => [ID.num(suit, n), ID.num(suit, n)]).flat();
      const sets = [
        { tiles: [ID.honor("H"), ID.honor("H")], status: "hidden", label: "Pair" },
        { tiles: [ID.honor("R"), ID.honor("R")], status: "hidden", label: "Pair" },
        { tiles: pairs.slice(0, 2), status: "hidden", label: "Pair" },
        { tiles: pairs.slice(2, 4), status: "hidden", label: "Pair" },
        { tiles: pairs.slice(4, 6), status: "hidden", label: "Pair" },
        { tiles: pairs.slice(6, 8), status: "hidden", label: "Pair" },
        { tiles: pairs.slice(8, 10), status: "hidden", label: "Pair" },
      ];
      return pack(sets, "Closed only", "Ron / Tsumo");
    },
    Toitoi: () => {
      const suit = pick(["m", "p", "s"]);
      const n1 = pick([2, 3, 4, 6, 7, 8]),
        n2 = pick([1, 3, 5, 7, 9].filter((x) => x !== n1)),
        n3 = pick([1, 2, 4, 6, 8, 9].filter((x) => x !== n1 && x !== n2));
      const sets = [
        { tiles: [ID.num(suit, n1), ID.num(suit, n1), ID.num(suit, n1)], status: "either", label: "Pon" },
        { tiles: [ID.num(suit, n2), ID.num(suit, n2), ID.num(suit, n2)], status: "either", label: "Pon" },
        { tiles: [ID.num(suit, n3), ID.num(suit, n3), ID.num(suit, n3)], status: "either", label: "Pon" },
        { tiles: [ID.honor("R"), ID.honor("R"), ID.honor("R")], status: "either", label: "Pon" },
        { tiles: [ID.num(suit, 2), ID.num(suit, 2)], status: "either", label: "Pair" },
      ];
      return pack(sets, "Open or Closed", "Ron / Tsumo");
    },
    "San An Kō": () => {
      const suit = pick(["m", "p", "s"]);
      const sets = [
        { tiles: [2, 2, 2].map((n) => ID.num(suit, n)), status: "hidden", label: "Pon (concealed)" },
        { tiles: [5, 5, 5].map((n) => ID.num(suit, n)), status: "hidden", label: "Pon (concealed)" },
        { tiles: [8, 8, 8].map((n) => ID.num(suit, n)), status: "hidden", label: "Pon (concealed)" },
        { tiles: [3, 4, 5].map((n) => ID.num(suit, n)), status: "either", label: "Chi" },
        { tiles: [ID.honor("H"), ID.honor("H")], status: "either", label: "Pair" },
      ];
      return pack(sets, "Usually Closed (3 concealed)", "Ron / Tsumo");
    },

    // Moar Yaku
    Honitsu: () => {
      const suit = pick(["m", "p", "s"]);
      const sets = [
        { tiles: [1, 1, 1].map((n) => ID.num(suit, n)), status: "either", label: "Pon" },
        { tiles: [7, 8, 9].map((n) => ID.num(suit, n)), status: "either", label: "Chi" },
        { tiles: [3, 4, 5].map((n) => ID.num(suit, n)), status: "either", label: "Chi" },
        { tiles: [ID.honor("E"), ID.honor("E")], status: "either", label: "Pair" },
        { tiles: [ID.honor("R"), ID.honor("R"), ID.honor("R")], status: "either", label: "Pon" },
      ];
      return pack(sets, "Open or Closed", "Ron / Tsumo");
    },
    Chinitsu: () => {
      const suit = pick(["m", "p", "s"]);
      const sets = [
        { tiles: [1, 2, 3].map((n) => ID.num(suit, n)), status: "either", label: "Chi" },
        { tiles: [3, 4, 5].map((n) => ID.num(suit, n)), status: "either", label: "Chi" },
        { tiles: [7, 8, 9].map((n) => ID.num(suit, n)), status: "either", label: "Chi" },
        { tiles: [2, 2].map((n) => ID.num(suit, n)), status: "either", label: "Pair" },
        { tiles: [5, 5].map((n) => ID.num(suit, n)), status: "either", label: "Pair" },
      ];
      return pack(sets, "Usually Closed", "Ron / Tsumo");
    },
    Ryanpeikō: () => {
      const suit = pick(["m", "p", "s"]);
      const a = 2,
        b = 5;
      const sets = [
        { tiles: [a, a + 1, a + 2].map((n) => ID.num(suit, n)), status: "hidden", label: "Chi A" },
        { tiles: [a, a + 1, a + 2].map((n) => ID.num(suit, n)), status: "hidden", label: "Chi A" },
        { tiles: [b, b + 1, b + 2].map((n) => ID.num(suit, n)), status: "hidden", label: "Chi B" },
        { tiles: [b, b + 1, b + 2].map((n) => ID.num(suit, n)), status: "hidden", label: "Chi B" },
        { tiles: [ID.num(suit, 8), ID.num(suit, 8)], status: "hidden", label: "Pair" },
      ];
      return pack(sets, "Closed only", "Ron / Tsumo");
    },
    "Sanshoku Dōkō": () => {
      const n = pick([2, 3, 4, 6, 7, 8]);
      const sets = [
        { tiles: [ID.num("m", n), ID.num("m", n), ID.num("m", n)], status: "either", label: "Pon (Man)" },
        { tiles: [ID.num("p", n), ID.num("p", n), ID.num("p", n)], status: "either", label: "Pon (Pin)" },
        { tiles: [ID.num("s", n), ID.num("s", n), ID.num("s", n)], status: "either", label: "Pon (Sou)" },
        { tiles: [ID.honor("H"), ID.honor("H")], status: "either", label: "Pair" },
        { tiles: [ID.num("m", 1), ID.num("m", 1)], status: "either", label: "Pair" },
      ];
      return pack(sets, "Open or Closed", "Ron / Tsumo");
    },
    "Shō San Gen": () => {
      const sets = [
        { tiles: [ID.honor("H"), ID.honor("H"), ID.honor("H")], status: "either", label: "Pon (Haku)" },
        { tiles: [ID.honor("G"), ID.honor("G"), ID.honor("G")], status: "either", label: "Pon (Hatsu)" },
        { tiles: [ID.honor("R"), ID.honor("R")], status: "either", label: "Pair (Chūn)" },
        { tiles: [ID.num("m", 2), ID.num("m", 3), ID.num("m", 4)], status: "either", label: "Chi" },
        { tiles: [ID.num("p", 2), ID.num("p", 3), ID.num("p", 4)], status: "either", label: "Chi" },
      ];
      return pack(sets, "Open or Closed", "Ron / Tsumo");
    },

    // Yakuman
    "Kokushi Musō": () => {
      const terms = [ID.num("m", 1), ID.num("m", 9), ID.num("p", 1), ID.num("p", 9), ID.num("s", 1), ID.num("s", 9), ID.honor("E"), ID.honor("S"), ID.honor("W"), ID.honor("N"), ID.honor("H"), ID.honor("G"), ID.honor("R")];
      const pair = pick(terms);
      const sets = [
        { tiles: terms, status: "hidden", label: "Orphans" },
        { tiles: [pair, pair], status: "hidden", label: "Pair" },
      ];
      return pack(sets, "Closed only", "Ron / Tsumo");
    },
    "Suu An Kō": () => {
      const suit = pick(["m", "p", "s"]);
      const sets = [
        { tiles: [2, 2, 2].map((n) => ID.num(suit, n)), status: "hidden", label: "Pon" },
        { tiles: [5, 5, 5].map((n) => ID.num(suit, n)), status: "hidden", label: "Pon" },
        { tiles: [7, 7, 7].map((n) => ID.num(suit, n)), status: "hidden", label: "Pon" },
        { tiles: [9, 9, 9].map((n) => ID.num(suit, n)), status: "hidden", label: "Pon" },
        { tiles: [3, 3].map((n) => ID.num(suit, n)), status: "hidden", label: "Pair" },
      ];
      return pack(sets, "Closed only", "Tsumo / Ron (tanki only)");
    },
    Daisangen: () => {
      const sets = [
        { tiles: [ID.honor("H"), ID.honor("H"), ID.honor("H")], status: "either", label: "Haku" },
        { tiles: [ID.honor("G"), ID.honor("G"), ID.honor("G")], status: "either", label: "Hatsu" },
        { tiles: [ID.honor("R"), ID.honor("R"), ID.honor("R")], status: "either", label: "Chūn" },
        { tiles: [ID.num("p", 2), ID.num("p", 3), ID.num("p", 4)], status: "either", label: "Chi" },
        { tiles: [ID.num("s", 5), ID.num("s", 5)], status: "either", label: "Pair" },
      ];
      return pack(sets, "Open or Closed", "Ron / Tsumo");
    },
    "Shō Suu Shii": () => {
      const sets = [
        { tiles: [ID.honor("E"), ID.honor("E"), ID.honor("E")], status: "either", label: "East" },
        { tiles: [ID.honor("S"), ID.honor("S"), ID.honor("S")], status: "either", label: "South" },
        { tiles: [ID.honor("W"), ID.honor("W"), ID.honor("W")], status: "either", label: "West" },
        { tiles: [ID.honor("N"), ID.honor("N")], status: "either", label: "North Pair" },
        { tiles: [ID.num("m", 2), ID.num("m", 3), ID.num("m", 4)], status: "either", label: "Chi" },
      ];
      return pack(sets, "Open or Closed", "Ron / Tsumo");
    },
    Tsuuiisō: () => {
      const winds = ["E", "S", "W", "N"],
        d = pick(["H", "G", "R"]);
      const w = pick(winds),
        w2 = pick(winds.filter((x) => x !== w));
      const sets = [
        { tiles: [ID.honor(w), ID.honor(w), ID.honor(w)], status: "either", label: "Pon (Wind)" },
        { tiles: [ID.honor(w2), ID.honor(w2), ID.honor(w2)], status: "either", label: "Pon (Wind)" },
        { tiles: [ID.honor(d), ID.honor(d), ID.honor(d)], status: "either", label: "Pon (Dragon)" },
        { tiles: [ID.honor("E"), ID.honor("E")], status: "either", label: "Pair" },
        { tiles: [ID.honor("R"), ID.honor("R")], status: "either", label: "Pair" },
      ];
      return pack(sets, "Open or Closed", "Ron / Tsumo");
    },
    Ryuisō: () => {
      const G = ID.honor("G");
      const sets = [
        { tiles: [ID.num("s", 2), ID.num("s", 3), ID.num("s", 4)], status: "either", label: "Chi" },
        { tiles: [ID.num("s", 6), ID.num("s", 6), ID.num("s", 6)], status: "either", label: "Pon" },
        { tiles: [ID.num("s", 8), ID.num("s", 8), ID.num("s", 8)], status: "either", label: "Pon" },
        { tiles: [G, G, G], status: "either", label: "Pon (Hatsu)" },
        { tiles: [ID.num("s", 4), ID.num("s", 4)], status: "either", label: "Pair" },
      ];
      return pack(sets, "Open or Closed", "Ron / Tsumo");
    },

    // Double Yakuman
    "Dai Suu Shii": () => {
      const sets = [
        { tiles: [ID.honor("E"), ID.honor("E"), ID.honor("E")], status: "either", label: "East" },
        { tiles: [ID.honor("S"), ID.honor("S"), ID.honor("S")], status: "either", label: "South" },
        { tiles: [ID.honor("W"), ID.honor("W"), ID.honor("W")], status: "either", label: "West" },
        { tiles: [ID.honor("N"), ID.honor("N"), ID.honor("N")], status: "either", label: "North" },
        { tiles: [ID.honor("R"), ID.honor("R")], status: "either", label: "Pair" },
      ];
      return pack(sets, "Open or Closed", "Ron / Tsumo");
    },
    "Suu An Kō Tanki": () => {
      const suit = pick(["m", "p", "s"]);
      const pairNum = 5;
      const sets = [
        { tiles: [2, 2, 2].map((n) => ID.num(suit, n)), status: "hidden", label: "Pon" },
        { tiles: [4, 4, 4].map((n) => ID.num(suit, n)), status: "hidden", label: "Pon" },
        { tiles: [6, 6, 6].map((n) => ID.num(suit, n)), status: "hidden", label: "Pon" },
        { tiles: [8, 8, 8].map((n) => ID.num(suit, n)), status: "hidden", label: "Pon" },
        { tiles: [pairNum, pairNum].map((n) => ID.num(suit, n)), status: "hidden", label: "Pair (tanki)" },
      ];
      // specific drawn tile box (tanki wait)
      const draw = { tileId: ID.num(suit, pairNum), type: "tanki", note: "Single-wait winning tile (Ron/Tsumo)" };
      return pack(sets, "Closed only", "Ron (tanki) / Tsumo", draw);
    },
    Chinrōto: () => {
      const suit = pick(["m", "p", "s"]);
      const sets = [
        { tiles: [1, 1, 1].map((n) => ID.num(suit, n)), status: "either", label: "Pon 1" },
        { tiles: [9, 9, 9].map((n) => ID.num(suit, n)), status: "either", label: "Pon 9" },
        { tiles: [1, 1, 1].map((n) => ID.num(suit, n)), status: "either", label: "Pon 1" },
        { tiles: [9, 9, 9].map((n) => ID.num(suit, n)), status: "either", label: "Pon 9" },
        { tiles: [1, 1].map((n) => ID.num(suit, n)), status: "either", label: "Pair" },
      ];
      return pack(sets, "Open or Closed", "Ron / Tsumo");
    },
  };

  // package helper to build final structure
  function pack(sets, closedNote, winNote, draw) {
    const tiles = ensure14(sets.flatMap((s) => s.tiles));
    return { sets, draw, tiles, closedNote, winNote };
  }

  /* -------------------- References (with Demo Hand + Waiting Patterns) -------------------- */

  function addReferencesSection(form) {
    if (document.getElementById("mjtracker-references")) return;

    const ref = document.createElement("div");
    ref.classList.add("mjtracker-font", "mjtracker-card");
    ref.id = "mjtracker-references";
    ref.style.margin = "8px";

    const hdr = document.createElement("div");
    hdr.className = "mjtracker-hdr";
    hdr.textContent = "References";
    ref.appendChild(hdr);

    const body = document.createElement("div");
    body.className = "mjtracker-body";
    ref.appendChild(body);

    attachToggle(ref, hdr, body, /* startCollapsed */ true, {
      collapsed: "Show ▼",
      expanded: "Hide ▲",
    });

    const section = (titleText) => {
      const s = document.createElement("div");
      s.style.margin = "8px 0 12px";
      const t = document.createElement("div");
      t.style.fontWeight = "600";
      t.style.marginBottom = "6px";
      t.textContent = titleText;
      s.appendChild(t);
      return {
        root: s,
        list: null,
        finalize() {
          body.appendChild(s);
        },
      };
    };

    const chips = (container, isTextChip = false) => {
      const ul = document.createElement("div");
      ul.className = isTextChip ? "mjtracker-text-list" : "mjtracker-list";

      if (isTextChip) {
        ul.style.gridTemplateRows = "1fr 1fr";
        ul.style.gridTemplateColumns = "repeat(auto-fill, minmax(max-content, 1fr))";
      }

      container.root.appendChild(ul);
      container.list = ul;
      return (romanji, english, onClick) => {
        const item = document.createElement("span");
        // If Dora or Tile Reference, use text chip style, else use default chip style.
        item.className = isTextChip ? "mjtracker-text-chip" : "mjtracker-chip";
        item.textContent = romanji;
        item.title = english;
        if (typeof onClick === "function") item.addEventListener("click", onClick);
        ul.appendChild(item);
      };
    };

    // Dora
    {
      const s = section("Dōra (Dora) Order");
      const add = chips(s, true);
      add("1 → 2 → … → 9 → 1 (Man)", "Dora indicator numeric sequence for Manzu");
      add("Ton → Nan → Sha → Pei", "East → South → West → North");
      add("1 → 2 → … → 9 → 1 (Pin)", "Dora indicator numeric sequence for Pinzu");
      add("Haku → Hatsu → Chūn", "White → Green → Red → White dragons");
      add("1 → 2 → … → 9 → 1 (Sou)", "Dora indicator numeric sequence for Souzu");
      s.finalize();

      // Demo hand block (starts with backs)
      body.appendChild(buildDemoHandBlock());
    }

    // 1 Han Yaku
    {
      const s = section("1 Han Yaku");
      const add = chips(s);
      add("Riichi", "Ready hand (closed)", () => showYakuExample("Riichi"));
      add("Tsumo", "Self-draw win (closed)", () => showYakuExample("Tsumo"));
      add("Pinfu", "All sequences, no points hand", () => showYakuExample("Pinfu"));
      add("Tanyao", "All simples (2–8 only)", () => showYakuExample("Tanyao"));
      add("Iipeikō", "One set of identical sequences (closed)", () => showYakuExample("Iipeikō"));
      add("Yakuhai (Kaze)", "Value/seat wind triplet", () => showYakuExample("Yakuhai (Kaze)"));
      add("Yakuhai (Sangen)", "Dragon triplet", () => showYakuExample("Yakuhai (Sangen)"));
      s.finalize();
    }

    // 2 Han Yaku
    {
      const s = section("2 Han Yaku");
      const add = chips(s);
      add("Sanshoku Dōjun", "Mixed triple sequence", () => showYakuExample("Sanshoku Dōjun"));
      add("Ittsū", "Pure straight (1-9 same suit)", () => showYakuExample("Ittsū"));
      add("Chii-toitsu", "Seven pairs", () => showYakuExample("Chii-toitsu"));
      add("Toitoi", "All triplets", () => showYakuExample("Toitoi"));
      add("San An Kō", "Three concealed triplets", () => showYakuExample("San An Kō"));
      s.finalize();
    }

    // Moar Yaku
    {
      const s = section("Moar Yaku");
      const add = chips(s);
      add("Honitsu", "Half flush (one suit + honors)", () => showYakuExample("Honitsu"));
      add("Chinitsu", "Full flush (one suit)", () => showYakuExample("Chinitsu"));
      add("Ryanpeikō", "Two sets of identical sequences (closed)", () => showYakuExample("Ryanpeikō"));
      add("Sanshoku Dōkō", "Three triplets of same number", () => showYakuExample("Sanshoku Dōkō"));
      add("Shō San Gen", "Little three dragons", () => showYakuExample("Shō San Gen"));
      s.finalize();
    }

    // Yakuman
    {
      const s = section("Yakuman");
      const add = chips(s);
      add("Kokushi Musō", "Thirteen orphans", () => showYakuExample("Kokushi Musō"));
      add("Suu An Kō", "Four concealed triplets", () => showYakuExample("Suu An Kō"));
      add("Daisangen", "Big three dragons", () => showYakuExample("Daisangen"));
      add("Shō Suu Shii", "Little four winds", () => showYakuExample("Shō Suu Shii"));
      add("Tsuuiisō", "All honors", () => showYakuExample("Tsuuiisō"));
      add("Ryuisō", "All green", () => showYakuExample("Ryuisō"));
      s.finalize();
    }

    // Double Yakuman
    {
      const s = section("Double Yakuman");
      const add = chips(s);
      add("Dai Suu Shii", "Big four winds", () => showYakuExample("Dai Suu Shii"));
      add("Suu An Kō Tanki", "Four concealed triplets (single wait)", () => showYakuExample("Suu An Kō Tanki"));
      add("Chinrōto", "All terminals triplets + pair", () => showYakuExample("Chinrōto"));
      s.finalize();
    }

    // Mini Tile Reference
    {
      const s = section("Mini Tile Reference");
      const ul = document.createElement("div");
      ul.className = "mjtracker-text-list";
      s.root.appendChild(ul);

      const addMini = (romanji, english) => {
        const item = document.createElement("span");
        item.className = "mjtracker-text-chip";
        item.textContent = romanji;
        item.title = english;
        ul.appendChild(item);
      };

      addMini("Manzu", "Character suit (wan)");
      addMini("Pinzu", "Circle/Dot suit (pin)");
      addMini("Souzu", "Bamboo suit (sou)");
      addMini("Rōtōhai", "Terminals (1 & 9)");
      addMini("Kazehai", "Winds (Ton, Nan, Sha, Pei)");
      addMini("Sangenpai", "Dragons (Haku, Hatsu, Chūn)");
      s.finalize();
    }

    // insert into form after #mjtracker-remaining-tiles-row
    const mjtrtRow = document.getElementById("mjtracker-remaining-tiles-row");
    if (mjtrtRow) {
      mjtrtRow.insertAdjacentElement("afterend", ref);
    }

    body.appendChild(buildWaitPatternsBlock());

    // --- builders used above ---
    function buildDemoHandBlock() {
      const card = document.createElement("div");
      card.className = "mjtracker-card hand-open";
      card.id = "mjtracker-demo-hand";

      const title = document.createElement("div");
      title.className = "title";
      title.innerHTML = `Demo Hand <span class="subtitle">(click a Yaku below)</span>`;
      card.appendChild(title);

      const setsWrap = document.createElement("div");
      setsWrap.className = "sets";
      // initial: 5 boxes of backs
      for (let i = 0; i < 5; i++) {
        const sb = document.createElement("div");
        sb.className = "set-box set-either";
        for (let t = 0; t < (i === 4 ? 2 : 3); t++) sb.appendChild(makeBackImg());
        const lbl = document.createElement("span");
        lbl.className = "set-label";
        lbl.textContent = i === 4 ? "Pair" : "Set";
        sb.appendChild(lbl);
        setsWrap.appendChild(sb);
      }
      card.appendChild(setsWrap);

      const info = document.createElement("div");
      info.className = "info";
      info.appendChild(makeBadge("Click a Yaku below to preview.", "Information"));
      card.appendChild(info);

      card._setsWrap = setsWrap;
      card._info = info;
      return card;
    }

    function buildWaitPatternsBlock() {
      const block = document.createElement("div");
      block.className = "mjtracker-card";
      const h = document.createElement("div");
      h.className = "mjtracker-hdr";
      h.textContent = "Waiting Patterns";
      block.appendChild(h);

      const body2 = document.createElement("div");
      body2.className = "mjtracker-body";
      const desc = document.createElement("div");
      desc.textContent = "Common waits that complete hands:";
      desc.style.marginBottom = "6px";
      body2.appendChild(desc);

      const patterns = [
        { name: "Ryanmen (Open Wait)", tiles: [ID.num("m", 2), ID.num("m", 3)], note: "Wait on 1m or 4m" },
        { name: "Kanchan (Closed Wait)", tiles: [ID.num("p", 2), ID.num("p", 4)], note: "Wait on 3p only" },
        { name: "Penchan (Edge Wait)", tiles: [ID.num("s", 1), ID.num("s", 2)], note: "Wait on 3s only (or 7 on 8-9)" },
        { name: "Shanpon (Pair Wait)", tiles: [ID.honor("E"), ID.honor("E"), ID.honor("S"), ID.honor("S")], note: "Complete either pair" },
        { name: "Tanki (Single Wait)", tiles: [ID.honor("R")], note: "Wait on single tile" },
      ];

      patterns.forEach((p) => {
        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.alignItems = "center";
        row.style.margin = "4px 0";
        p.tiles.forEach((t) => row.appendChild(makeTileImg(t)));
        const lab = document.createElement("span");
        lab.textContent = ` – ${p.name} (${p.note})`;
        lab.style.marginLeft = "8px";
        row.appendChild(lab);
        body2.appendChild(row);
      });

      block.appendChild(body2);

      attachToggle(block, h, body2, /* startCollapsed */ true, {
        collapsed: "Show ▼",
        expanded: "Hide ▲",
      });

      return block;
    }

    function makeBadge(text, title) {
      const b = document.createElement("span");
      b.className = "mjtracker-badge";
      b.textContent = text;
      if (title) b.title = title;
      return b;
    }

    function showYakuExample(romanji) {
      const card = document.getElementById("mjtracker-demo-hand");
      if (!card) return;
      const gen = YAKU_GENERATORS[romanji];
      const data = gen ? gen() : null;

      // safety: if no data, show backs
      card._setsWrap.innerHTML = "";
      if (!data) {
        for (let i = 0; i < 5; i++) {
          const sb = document.createElement("div");
          sb.className = "set-box set-either";
          for (let t = 0; t < (i === 4 ? 2 : 3); t++) sb.appendChild(makeBackImg());
          const lbl = document.createElement("span");
          lbl.className = "set-label";
          lbl.textContent = i === 4 ? "Pair" : "Set";
          sb.appendChild(lbl);
          card._setsWrap.appendChild(sb);
        }
      } else {
        // render sets with status colors
        (data.sets || []).forEach((set) => card._setsWrap.appendChild(makeSetBox(set)));
        // special draw/wait box if present
        if (data.draw) card._setsWrap.appendChild(makeDrawBox(data.draw));
      }

      // hand-level tint
      const tsumoOnly = /tsumo only/i.test(data?.winNote || "");
      card.classList.toggle("hand-closed", tsumoOnly);
      card.classList.toggle("hand-open", !tsumoOnly);

      // badges
      card._info.innerHTML = "";
      card._info.appendChild(makeBadge(romanji, "Selected Yaku"));
      card._info.appendChild(makeBadge(data?.closedNote || "Varies", "Closed/Open requirement"));
      card._info.appendChild(makeBadge(data?.winNote || "Ron / Tsumo", "Winning method limits"));
    }
  }
})();
