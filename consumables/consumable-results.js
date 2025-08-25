const fontHandler = (doc) => {
  const fontEls = Array.from(doc.querySelectorAll("b font"));
  const fontTexts = fontEls.map((el) => (el.textContent || "").trim()).filter(Boolean);
  const counts = {};
  for (const text of fontTexts) {
    counts[text] = (counts[text] || 0) + 1;
  }
  return { counts, fontTexts };
};

const potatoHandler = (doc) => {
  const potatoNodes = Array.from(document.querySelectorAll("#pitem > b"));
  const potatoSuccesses = potatoNodes.filter((b) => /\b20\s*\/\s*20:/i.test(b.textContent || "")).length;
  const potatoNames = potatoNodes.map((node) => {
    const text = (node.textContent || "").trim();
    const m = text.match(/\b20\s*\/\s*20:\s*([^\s:!,.]+)/i);
    return m ? m[1] : "(unknown)";
  });
  // total offered potatoes (fallback from text)
  const potatoResults = doc.textContent?.replace("Sneaky Potato Used!", "").replace("No one this time.. ", "").split(/,|  /g).filter(Boolean) || [];
  const potatoCounts = potatoResults.length + "";
  return { potatoSuccesses, potatoNames, potatoCounts };
};

const getResultCounts = (doc) => {
  if (!doc || !(doc instanceof Element)) {
    console.warn("getResultCounts: provided doc is missing or not an Element.");
    return;
  }

  // Detect special Sneaky Potato block via its text
  const isSneakyPotatoContext = doc && /Sneaky Potato Used!/i.test(doc.textContent || "");

  // Data holders
  let counts = {};
  let fontTexts = [];
  let potatoSuccesses = 0;
  let potatoNames = [];
  let potatoCounts = "0";

  if (!isSneakyPotatoContext) {
    ({ counts, fontTexts } = fontHandler(doc));
  } else {
    ({ potatoSuccesses, potatoNames, potatoCounts } = potatoHandler(doc));
    counts = {}; // clear any font counts when in potato context
  }

  // Build displayCounts
  let displayCounts = { ...counts };
  if (isSneakyPotatoContext) {
    displayCounts = { ["Sneaky Potato Successes"]: potatoSuccesses };
  }

  // Console output
  const consoleRows = [];
  if (isSneakyPotatoContext) {
    consoleRows.push({
      Text: "Sneaky Potato Successes",
      Count: potatoSuccesses,
    });
    consoleRows.push({
      Text: "Sneaky Potato Success Names",
      Count: potatoNames.length ? [...new Set(potatoNames)].join(", ") : "None",
    });
  } else {
    for (const [Text, Count] of Object.entries(displayCounts)) {
      consoleRows.push({ Text, Count });
    }
  }
  console.table(consoleRows);

  // Ensure Fira Code is loaded once
  if (!document.getElementById("fira-code-google-font")) {
    const link = document.createElement("link");
    link.id = "fira-code-google-font";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&display=swap";
    document.head.appendChild(link);
  }

  // Remove existing card if present to refresh
  const EXISTING_ID = "result-counts-floating-card";
  const old = document.getElementById(EXISTING_ID);
  if (old) old.remove();

  // Create floating card container
  const card = document.createElement("div");
  card.id = EXISTING_ID;
  card.setAttribute(
    "style",
    [
      "position:fixed",
      "top:20px",
      "right:26px",
      "max-width:420px",
      "z-index:99999",
      "background:#1e1e2e",
      "color:#f0f0f5",
      "font-family:'Fira Code', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      "border-radius:12px",
      "box-shadow:0 20px 40px -10px rgba(0,0,0,0.5)",
      "backdrop-filter:blur(6px)",
      "overflow:hidden",
      "display:flex",
      "flex-direction:column",
      "gap:0",
    ].join(";"),
  );

  // Header with title and close button
  const header = document.createElement("div");
  header.setAttribute(
    "style",
    ["display:flex", "align-items:center", "justify-content:space-between", "padding:8px 12px", "background:rgba(255,255,255,0.03)", "border-bottom:1px solid rgba(255,255,255,0.08)", "font-size:16px", "font-weight:600", "gap:8px"].join(";"),
  );
  const title = document.createElement("div");
  title.textContent = "Consumable Result Counts";
  title.style.userSelect = "none";
  const closeBtn = document.createElement("button");
  closeBtn.innerHTML = "✕";
  closeBtn.setAttribute("aria-label", "Close result counts box");
  closeBtn.setAttribute(
    "style",
    ["background:transparent", "border:none", "cursor:pointer", "font-size:14px", "line-height:1", "padding:4px", "color:inherit", "display:flex", "align-items:center", "justify-content:center", "user-select: none"].join("; "),
  );
  closeBtn.addEventListener("click", () => card.remove());
  header.append(title, closeBtn);

  // Body with table
  const body = document.createElement("div");
  body.setAttribute("style", ["padding:8px 12px", "overflow:auto", "max-height:360px", "font-size:13px", "color:#f0f0f5"].join(";"));

  const table = document.createElement("table");
  table.setAttribute("style", ["width:100%", "border-collapse:collapse", "font-size:12px", "margin:0", "color:#f0f0f5"].join(";"));

  // Header row
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  ["Text", "Count"].forEach((h) => {
    const th = document.createElement("th");
    th.textContent = h;
    th.setAttribute("style", ["text-align:left", "padding:6px 8px", "border-bottom:1px solid rgba(255,255,255,0.15)", "font-weight:700", "position:sticky", "top:0", "background:rgba(30,30,46,0.95)", "color:#f0f0f5", "user-select: none"].join("; "));
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Body rows
  const tbody = document.createElement("tbody");
  const sortedEntries = Object.entries(displayCounts).sort((a, b) => {
    if (a[0] === "Sneaky Potato Successes") return -1;
    if (b[0] === "Sneaky Potato Successes") return 1;
    return b[1] - a[1];
  });
  const extra = document.createElement("div");
  sortedEntries.forEach(([text, count]) => {
    const tr = document.createElement("tr");
    tr.setAttribute("style", ["border-bottom:1px solid rgba(255,255,255,0.08)"].join(";"));
    const tdText = document.createElement("td");
    tdText.textContent = text;
    tdText.setAttribute("style", "padding:6px 8px; vertical-align:top; word-break:break-word; color:#f0f0f5;");

    const tdCount = document.createElement("td");
    tdCount.setAttribute("style", "padding:6px 8px; vertical-align:top; word-break:break-word; text-align:right;");

    if (text === "Sneaky Potato Successes") {
      tdCount.textContent = count;
      extra.setAttribute("style", "margin-top: 8px; font-size: 12px; opacity: 0.85; color: #f0f0f5;");
      extra.innerHTML = potatoNames.length
        ? `<b>Shift Givers</b>:<br><ul style="margin: 0; padding: 4px 30px;"><li style="color:#f0f0f5; font-size: 11px; font-family: 'Fira Code', system-ui, -apple-system, BlinkMacSystemFont, sans-serif">${[...new Set(potatoNames)].join(
            `</li><li style="color:#f0f0f5; font-size: 11px; font-family: 'Fira Code', system-ui, -apple-system, BlinkMacSystemFont, sans-serif">`,
          )}</li></ul>`
        : "Names: None";
      tdText.appendChild(extra);
    } else {
      tdCount.textContent = count;
    }

    tr.append(tdText, tdCount);
    tbody.appendChild(tr);
  });

  // Fallback names row if no success row exists
  if (isSneakyPotatoContext && !displayCounts["Sneaky Potato Successes"]) {
    const tr = document.createElement("tr");
    tr.setAttribute("style", ["border-bottom:1px solid rgba(255,255,255,0.08)"].join(";"));
    const tdText = document.createElement("td");
    tdText.textContent = "Sneaky Potato Success Names";
    tdText.setAttribute("style", "padding:6px 8px; vertical-align:top; word-break:break-word;");
    const tdDetail = document.createElement("td");
    tdDetail.setAttribute("style", "padding:6px 8px; vertical-align:top; word-break:break-word; text-align:right;");
    tdDetail.textContent = potatoNames.length ? [...new Set(potatoNames)].join(", ") : "None";
    tr.append(tdText, tdDetail);
    tbody.appendChild(tr);
  }

  table.appendChild(tbody);
  body.appendChild(table);

  // If extra has content, add it to the body
  if (extra.textContent?.trim()) {
    body.appendChild(extra);
  }

  // Footer summary (font-based only)
  const footer = document.createElement("div");
  footer.setAttribute(
    "style",
    ["padding:6px 12px", "font-size:11px", "background:rgba(255,255,255,0.02)", "border-top:1px solid rgba(255,255,255,0.08)", "display:flex", "justify-content:space-between", "gap:6px", "color:#f0f0f5", "user-select: none"].join("; "),
  );
  const uniqueCount = Object.keys(counts).length;
  const total = isSneakyPotatoContext ? potatoCounts : fontTexts.length;
  const summaryLeft = document.createElement("div");
  summaryLeft.textContent = isSneakyPotatoContext ? `` : `Unique Results: ${uniqueCount}`;
  const summaryRight = document.createElement("div");
  summaryRight.textContent = isSneakyPotatoContext ? `Potatoes Offered: ${total}` : `Total Results: ${total}`;
  footer.append(summaryLeft, summaryRight);

  // Assemble and inject
  card.append(header, body, footer);
  document.body.appendChild(card);
};

// Usage: pass an element that contains the relevant content
getResultCounts(document.querySelector("#pitem"));
