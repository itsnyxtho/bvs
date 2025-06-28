// @ts-nocheck
// ==UserScript==
// @name         Cosplay Parts + Combo Table
// @namespace    bvs
// @icon         https://github.com/itsnyxtho/bvs/blob/main/other/images/anime_cubed-icon.png?raw=true
// @version      1.0.7
// @author       itsnyxtho
// @description  Replaces cosplay checklist with styled part/combo tables
// @include        http*://*animecubed*/billy/bvs/billycon.html
// @grant        none
// ==/UserScript==

(function () {
  const hotBlue = "#0A3C69";
  const setNameBG = "#0F67B7";
  const textColor = "#121212";
  const eggshell = "#FDF8E4";
  const hotPink = "#FF69B4";
  const hotOrange = "#FFB347";
  const border = `1px solid ${hotBlue}`;

  const style = document.createElement("style");
  style.textContent = `
    .bvs-table {
      font-family: monospace;
      font-size: 10.5px;
      background: ${eggshell};
      color: ${textColor};
      border-collapse: collapse;
      width: 100%;
      margin-bottom: 2em;
    }

    .bvs-table.condensed td {
        padding: 0;
    }

    .bvs-table th {
      background: ${hotBlue};
      color: white;
      font-size: 12px;
      padding: 0 4px;
      border: ${border};
      vertical-align: middle;
      padding: 4px;
      cursor: pointer;
    }
    .bvs-table td {
      background: ${eggshell};
      border: ${border};
      vertical-align: middle;
      padding: 4px;
      cursor: default;
    }
    .bvs-table td.set-name {
      background: ${setNameBG};
      color: white;
      text-align: right;
      padding: 4px;
      font-weight: 600;
    }
    .bvs-table .part-cell {
      cursor: pointer;
    }
    .bvs-table .part-cell:hover {
      filter: brightness(0.94);
    }
    .bvs-table .part-cell > div {
      display: grid;
      grid-template-columns: 70px 15px;
      align-items: center;
      margin: 4px;
      text-align: left;
    }
    .bvs-table.condensed .part-cell > div {
      grid-template-columns: 50px 15px;
    }
    .bvs-table .dice-sub {
      display: block;
      font-size: 9px;
      white-space: pre;
      text-align: left;
      margin-right: 4px;
    }
    .bvs-table icon {
      font-size: 11px;
      display: flex;
      align-items: center;
      justify-items: center;
      justify-content: center;
      height: 15px;
      min-width: 15px;
      background: white;
      border-radius: 3px;
      box-shadow: #637a82 inset 0 0 3px;
      color: green;
      font-weight: 600;
    }
    .bvs-table .part-cell icon::before {
      content: "";
    }
    .bvs-table .part-cell.selected icon::before {
      content: "\\2714";
    }
    .bvs-table td.align-num {
      text-align: right;
      font-variant-numeric: tabular-nums;
      font-feature-settings: 'tnum';
    }
    .bvs-table td.centered {
      text-align: center;
      font-feature-settings: 'tnum';
    }
    .hi-avg { background: ${hotOrange} !important; }
    .hi-range { background: ${hotPink} !important; }
    .hi-both { background: linear-gradient(135deg, ${hotPink} 40%, ${hotOrange} 60%) !important; }
    .bvs-controls {
      display: flex;
      justify-content: end;
      align-items: center;
      margin: 4px;
    }
    .bvs-controls button {
      margin-right: 0.5em;
      padding: 4px 8px;
      font-size: 11px;
      font-family: monospace;
      font-weight: 600;
      border: 1px solid ${hotBlue};
      background: ${hotBlue};
      color: white;
      cursor: pointer;
      border: none;
    }
    .bvs-controls button:hover {
      filter: brightness(0.95);
    }
  `;
  document.head.appendChild(style);

  const formatDice = (str) => str.replace(/([+\-])(\d+)/g, " $1 $2");

  const parseDice = (str) => {
    const match = str.match(/(\d+)d(\d+)([ +-]+\d+)?/);
    if (!match) return [null, null, null];
    const [_, n, d, mod] = match;

    const num = parseInt(n),
      die = parseInt(d),
      offset = parseInt(mod?.replace(/[ +]/g, "") || 0);
    const min = num * 1 + offset;
    const max = num * die + offset;
    const avg = Math.round(((num * (1 + die)) / 2 + offset) * 100) / 100;

    return [min, max, avg];
  };

  const checklist = document.querySelector("ul.checklist.cl3");
  if (!checklist) return;
  checklist.style.display = "none";

  const form = document.forms.conroom;
  const rows = form.querySelectorAll('label[for^="cpp"]');
  const parts = {};

  for (const label of rows) {
    const input = document.getElementById(label.htmlFor);
    const text = label.textContent.trim();
    const match = text.match(/(.+?) (Head|Body|Prop) \(([^)]+)\) \(Full set bonus ([^)]+)\)/);
    if (!match) continue;
    const [_, setName, slot, dice, bonus] = match;
    if (!parts[setName]) parts[setName] = { setName, Head: null, Body: null, Prop: null, bonus: formatDice(bonus) };
    parts[setName][slot] = { dice: formatDice(dice), input };
  }

  const controls = document.createElement("div");
  controls.className = "bvs-controls";
  controls.innerHTML = `
  <button type="button" id="condenseBtn" title="Condense Checklist" style="background: ${hotBlue}">Condense</button>
  <button type="button" id="selectMaxBtn" title="Select Max Range Value Set" style="background: ${hotPink}">Select MRV Set</button>
  <button type="button" id="selectAvgBtn" title="Select Max Average Value Set" style="background: ${hotOrange}">Select MAV Set</button>
  <button type="button" id="clearBtn" title="Clear Selections">Clear</button>
  `;
  checklist.parentElement.insertBefore(controls, checklist);

  const partTable = document.createElement("table");
  partTable.className = "bvs-table";

  const headers = ["Set Name", "Head", "Body", "Prop", "Full Set Bonus"];
  const thead = partTable.createTHead();
  const hrow = thead.insertRow();
  headers.forEach((h) => {
    const th = document.createElement("th");
    th.textContent = h;
    hrow.appendChild(th);
  });

  const tbody = partTable.createTBody();
  const allParts = { Head: [], Body: [], Prop: [] };

  for (const set of Object.values(parts)) {
    const row = tbody.insertRow();
    const nameCell = row.insertCell();
    nameCell.className = "set-name";
    nameCell.textContent = set.setName;

    ["Head", "Body", "Prop"].forEach((slot) => {
      const td = row.insertCell();
      const data = set[slot];
      if (data) {
        const [min, max, avg] = parseDice(data.dice);
        td.className = "part-cell";
        td.dataset.slot = slot;
        td.dataset.set = set.setName;
        td.dataset.min = min;
        td.dataset.max = max;
        td.dataset.avg = avg;
        td.dataset.input = data.input.id;
        td.innerHTML = `
          <div>
            <div>
              ${data.dice}
              <span class="dice-sub">Rng: <b>${min} - ${max}</b>\nAvg: <b>${avg}</b></span>
            </div>
            <icon></icon>
          </div>
        `;
        if (data.input.checked) td.classList.add("selected");
        allParts[slot].push({ td, max, avg });
        td.addEventListener("click", () => {
          data.input.checked = !data.input.checked;
          td.classList.toggle("selected", data.input.checked);
          updateUsedSpace();
          updateCombos();
        });
      } else {
        td.textContent = "";
        td.style.cursor = "default";
      }
    });

    const bonusCell = row.insertCell();
    bonusCell.className = "centered";
    bonusCell.textContent = set.bonus;
  }

  ["Head", "Body", "Prop"].forEach((slot) => {
    const group = allParts[slot];
    const maxRange = Math.max(...group.map((p) => +p.max));
    const maxAvg = Math.max(...group.map((p) => +p.avg));
    group.forEach((p) => {
      const isR = +p.max === maxRange;
      const isA = +p.avg === maxAvg;
      if (isR && isA) p.td.classList.add("hi-both");
      else if (isR) p.td.classList.add("hi-range");
      else if (isA) p.td.classList.add("hi-avg");
    });
  });

  checklist.parentElement.insertBefore(partTable, checklist);

  const comboTable = document.createElement("table");
  comboTable.className = "bvs-table";
  const comboThead = comboTable.createTHead();
  const crow = comboThead.insertRow();
  ["Head", "Body", "Prop", "Range", "Average"].forEach((h) => {
    const th = document.createElement("th");
    th.textContent = h;
    crow.appendChild(th);
  });
  const comboTbody = comboTable.createTBody();
  checklist.parentElement.insertBefore(comboTable, checklist.nextSibling);

  // Step 7: Calculate used space (Extras + Cosplay)
  function updateUsedSpace() {
    console.log("Updating used space...");
    // Get number of checked checkboxes and values of extras inputs x their size
    const used = Array.from(form.querySelectorAll('input[type="checkbox"]:checked')).length;
    const extrasInputs = form.querySelectorAll('input[type="number"]');
    let extraUsed = 0;
    extrasInputs.forEach((input) => {
      const count = parseInt(input.value, 10) || 0;
      const size = form.querySelector(`#bvs-extra-size-${input.id}`)?.textContent || "2";
      extraUsed += count * size;
    });
    const totalUsed = used + extraUsed;
    const maxSpaces = parseInt(form.querySelector("#bvs-max-spaces")?.textContent, 10) || 0;
    const usedDisplay = form.querySelector("#bvs-space-used");
    if (usedDisplay) {
      usedDisplay.textContent = `${totalUsed}`;
      usedDisplay.style.color = totalUsed > maxSpaces ? "red" : "#ffffff";
    }
  }

  function updateCombos() {
    comboTbody.innerHTML = "";
    const heads = Array.from(document.querySelectorAll('[data-slot="Head"].selected'));
    const bodies = Array.from(document.querySelectorAll('[data-slot="Body"].selected'));
    const props = Array.from(document.querySelectorAll('[data-slot="Prop"].selected'));
    if (!heads.length || !bodies.length || !props.length) {
      heads.splice(0, heads.length, ...document.querySelectorAll('[data-slot="Head"]'));
      bodies.splice(0, bodies.length, ...document.querySelectorAll('[data-slot="Body"]'));
      props.splice(0, props.length, ...document.querySelectorAll('[data-slot="Prop"]'));
      heads.length = 1;
      bodies.length = 1;
      props.length = 1;
    }
    for (const h of heads) {
      for (const b of bodies) {
        for (const p of props) {
          const setIds = [h.dataset.set, b.dataset.set, p.dataset.set];
          if (new Set(setIds).size < 3) continue;
          const row = comboTbody.insertRow();
          row.insertCell().textContent = h.dataset.set;
          row.insertCell().textContent = b.dataset.set;
          row.insertCell().textContent = p.dataset.set;
          const min = +h.dataset.min + +b.dataset.min + +p.dataset.min;
          const max = +h.dataset.max + +b.dataset.max + +p.dataset.max;
          const avg = (+h.dataset.avg + +b.dataset.avg + +p.dataset.avg).toFixed(2);
          const rangeCell = row.insertCell();
          rangeCell.className = "align-num";
          rangeCell.textContent = `${min} - ${max}`;
          const avgCell = row.insertCell();
          avgCell.className = "align-num";
          avgCell.textContent = avg;
        }
      }
    }
  }

  document.getElementById("condenseBtn").addEventListener("click", function () {
    // Select all .dice-sub elements and toggle their display
    const diceSubs = document.querySelectorAll(".dice-sub");
    diceSubs.forEach((sub) => {
      sub.style.display = sub.style.display === "none" ? "block" : "none";
    });
    // Toggle the button text
    this.textContent = this.textContent === "Condense" ? "Expand" : "Condense";
    // Toggle .condensed class on the table
    partTable.classList.toggle("condensed");
  });

  document.getElementById("clearBtn").addEventListener("click", () => {
    document.querySelectorAll(".part-cell.selected").forEach((cell) => {
      const input = document.getElementById(cell.dataset.input);
      if (input) input.checked = false;
      cell.classList.remove("selected");
    });
    updateCombos();
  });

  document.getElementById("selectMaxBtn").addEventListener("click", () => {
    selectBest("max");
  });

  document.getElementById("selectAvgBtn").addEventListener("click", () => {
    selectBest("avg");
  });

  function selectBest(type) {
    const slots = ["Head", "Body", "Prop"];
    slots.forEach((slot) => {
      let best = null;
      document.querySelectorAll(`.part-cell[data-slot="${slot}"]`).forEach((cell) => {
        const val = +cell.dataset[type];
        if (!best || val > +best.dataset[type]) {
          best = cell;
        } else if (val === +best.dataset[type]) {
          // Tie-breaker: prefer higher min value
          if (+cell.dataset.min > +best.dataset.min) {
            best = cell;
          }
        }
      });
      if (best) {
        const input = document.getElementById(best.dataset.input);
        if (input) input.checked = true;
        best.classList.add("selected");
      }
    });
    updateCombos();
    updateUsedSpace();
  }

  updateCombos();
  updateUsedSpace();
})();

// ----------------------------------------------------------------------- //
(function () {
  const form = document.forms.conroom;
  if (!form) return;

  // Create style element for custom styles
  const style = document.createElement("style");
  style.textContent = `
    td.space-used-cell {
      font-weight: bold;
      font-size: 14px;
      color: #ffffff;
      background: #0A3C69;
      padding: 4px;
    }

    .bvs-extras-table {
      margin: 0;
      height: 100%;
    }

    .bvs-reference-card {
      margin: 0;
      height: 100%;
    }

    .bvs-extras-table-body tr>td:first-child {
      text-align: right;
      font-variant-numeric: tabular-nums;
      font-feature-settings: 'tnum';
    }

  `;
  document.head.appendChild(style);

  // Find max allowed spaces
  const maxMatch = document.body.innerText.match(/up to (\d+) Spaces'/i);
  const maxSpaces = maxMatch ? +maxMatch[1] : 0;

  // Step 1: Collect Extras info
  const extras = [];
  const inputs = form.querySelectorAll('input[type="text"]');
  let i = 1;
  inputs.forEach((input) => {
    const parent = input.parentNode;
    const siblings = Array.from(parent.childNodes);
    const inputIdx = siblings.indexOf(input);
    const maxNode = siblings[inputIdx + 1];
    const nameNode = siblings[inputIdx + 2];
    const sizeNode = siblings[inputIdx + 3];
    const sizeText = sizeNode?.textContent || "";
    const effectNode = siblings[inputIdx + 5];
    const brNodes = [siblings[inputIdx + 4], siblings[inputIdx + 6], siblings[inputIdx + 7]]; // Extra nodes to remove

    if (!input.name.startsWith("pack-") || !maxNode || !nameNode || !effectNode || nameNode.tagName !== "B" || effectNode.tagName !== "I") return;

    const max = parseInt(maxNode.textContent.trim(), 10);
    const name = nameNode.textContent.trim();
    const size = parseInt(/\(Size:\s*(\d+)\)/i.exec(sizeText)?.[1] || "1", 10);
    const effect = effectNode.textContent.trim();

    const inputContainer = document.createElement("div");
    parent.insertBefore(inputContainer, input);
    inputContainer.className = "bvs-extras-container";
    inputContainer.id = `bvs-extras-${i++}`;
    inputContainer.appendChild(input);
    inputContainer.appendChild(maxNode);
    inputContainer.appendChild(nameNode);
    inputContainer.appendChild(sizeNode);
    inputContainer.appendChild(effectNode);
    inputContainer.style.display = "none";

    // For brNodes, if <br> then remove them.
    brNodes.forEach((br) => {
      if (br && br.nodeName === "BR") {
        br.remove();
      }
    });

    extras.push({ input, name, max, size, effect });
  });

  // Step 2: Remove the original rules text (siblings before the form)
  let el = form.previousSibling;
  while (el && el !== form.parentNode.firstChild) {
    const prev = el.previousSibling;
    el.remove();
    el = prev;
  }

  // Select and style the <b> element after the last .bvs-extras-container
  const extrasContainers = form.querySelectorAll('[id^="bvs-extras-"]');
  const lastContainer = extrasContainers[extrasContainers.length - 1];
  const cosplayHeader = lastContainer ? lastContainer.nextElementSibling : null;
  if (cosplayHeader && cosplayHeader.tagName === "B") {
    // Create container for cosplay header
    const cosplayHeaderContainer = document.createElement("div");
    cosplayHeaderContainer.id = "bvs-cosplay-header";

    // Insert the container after the last extras container
    lastContainer.parentNode.insertBefore(cosplayHeaderContainer, cosplayHeader.nextSibling);

    // Get header text.
    const headerText = cosplayHeader.textContent.trim();

    // Remove the original header element
    cosplayHeader.remove();

    // Set the new header text: "Cosplay Parts<br>(Size per Part: 1)"
    cosplayHeaderContainer.innerHTML = `<h1 style="margin: 0; color: #0A3C69; font-size: 18px; display: inline-block;">Cosplay Parts</h1><h5 style="font-style:italic; margin:0; font-size: 10.5px; color: #121212; display: inline-block; margin: 0 8px;">(Size Per Part: 1)</h5>`;

    // If the header container's next sibling is a <br>, remove it
    if (cosplayHeaderContainer.nextSibling && cosplayHeaderContainer.nextSibling.nodeName === "BR") {
      cosplayHeaderContainer.nextSibling.remove();
    }
  }

  // Step 3: Create new layout container
  const container = document.createElement("div");
  container.style.display = "grid";
  container.style.gridTemplateColumns = "1fr 1fr";
  container.style.gap = "12px";

  // Step 4: Create Reference Card column
  const refCard = document.createElement("div");
  refCard.className = "bvs-table";
  refCard.style.padding = "4px";
  refCard.innerHTML = `
    <table class="bvs-table bvs-reference-card">
      <thead><tr><th>Reference Card</th></tr></thead>
      <tbody>
        <tr><td>✔️ Click a part to select/unselect it</td></tr>
        <tr><td>🟪 Full Set Bonus shown if all 3 slots match</td></tr>
        <tr><td>🟧 Highest average score highlighted</td></tr>
        <tr><td>🩷 Highest range value highlighted</td></tr>
        <tr><td>🟨 Gradient = both max avg + max range</td></tr>
      </tbody>
    </table>
  `;

  // Step 5: Create Extras Table
  const extrasDiv = document.createElement("div");
  extrasDiv.className = "bvs-table";
  extrasDiv.style.padding = "4px";
  extrasDiv.innerHTML = `
    <table class="bvs-table bvs-extras-table">
      <thead><tr><th>Max</th><th>Extra</th><th>Size</th><th>Qty</th></tr></thead>
      <tbody id="bvs-extras-body" class="bvs-extras-table-body"></tbody>
      <tfoot><tr><td colspan="4" class="centered space-used-cell">Used: <span id="bvs-space-used">0</span> / <span id="bvs-max-spaces">${maxSpaces}</span> spaces</td></tr></tfoot>
    </table>
  `;

  // Append both to container
  container.append(refCard, extrasDiv);
  form.insertBefore(container, form.firstChild);

  // Step 6: Populate Extras Table
  const tbody = extrasDiv.querySelector("#bvs-extras-body");
  const usedDisplay = extrasDiv.querySelector("#bvs-space-used");

  extras.forEach(({ input, name, max, size, effect }) => {
    const row = document.createElement("tr");

    const maxTd = document.createElement("td");
    maxTd.textContent = max;

    const nameTd = document.createElement("td");
    nameTd.innerHTML = `<label for="${input.name}">${name}</label><div style="font-size:9px; font-style:italic;">${effect}</div>`;

    const sizeTd = document.createElement("td");
    sizeTd.id = `bvs-extra-size-${input.id}`;
    sizeTd.textContent = size;
    sizeTd.style.textAlign = "right";

    const inputTd = document.createElement("td");
    const newInput = document.createElement("input");
    newInput.type = "number";
    newInput.min = "0";
    newInput.max = max;
    newInput.value = input.value || "0";
    newInput.name = input.name;
    newInput.id = input.id;
    newInput.size = 2;
    newInput.style.width = "3em";

    newInput.addEventListener("input", () => {
      input.value = newInput.value;
      updateUsedSpace();
    });

    inputTd.appendChild(newInput);
    row.append(maxTd, nameTd, sizeTd, inputTd);
    tbody.appendChild(row);

    // Store size info on input for calculations
    input.dataset.extraSize = size;
  });

  // Step 7: Calculate used space (Extras + Cosplay)
  function updateUsedSpace() {
    console.log("Updating used space...");
    // Get number of checked checkboxes and values of extras inputs x their size
    const used = Array.from(form.querySelectorAll('input[type="checkbox"]:checked')).length;
    const extrasInputs = form.querySelectorAll('input[type="number"]');
    let extraUsed = 0;
    extrasInputs.forEach((input) => {
      const count = parseInt(input.value, 10) || 0;
      const size = form.querySelector(`#bvs-extra-size-${input.id}`)?.textContent || "2";
      extraUsed += count * size;
    });
    const totalUsed = used + extraUsed;
    const maxSpaces = parseInt(form.querySelector("#bvs-max-spaces")?.textContent, 10) || 0;
    const usedDisplay = form.querySelector("#bvs-space-used");
    if (usedDisplay) {
      usedDisplay.textContent = `${totalUsed}`;
      usedDisplay.style.color = totalUsed > maxSpaces ? "red" : "#ffffff";
    }
  }

  updateUsedSpace();
})();
