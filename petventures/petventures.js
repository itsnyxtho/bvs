// @ts-nocheck
// ==UserScript==
// @name         BvS Petventures Helper
// @author       itsnyxtho
// @namespace    bvs
// @version      1.0.1
// @description  A helper for BvS Petventures pages.
// @icon         https://github.com/itsnyxtho/bvs/blob/main/other/images/anime_cubed-icon.png?raw=true
// @match        http*://*animecubed*/billy/bvs/petventures.html
// @icon         https://www.google.com/s2/favicons?sz=64&domain=animecubedgaming.com
// @require      https://raw.githubusercontent.com/itsnyxtho/bvs/refs/heads/main/petventures/petventures.js
// @resource css https://raw.githubusercontent.com/itsnyxtho/bvs/refs/heads/main/petventures/petventures.css
// @grant        GM_getResourceText
// @grant        GM_addStyle
// ==/UserScript==

(() => {
  // Check if the page has the form, if not, bail
  const form = document.forms.petventurestrt;
  if (!form) return;

  // Get the player name and password from the page
  const name = document.querySelector('input[name="player"]')?.value;
  const pwd = document.querySelector('input[name="pwd"]')?.value;
  if (!name || !pwd) {
    return;
  }

  let css = GM_getResourceText("css");
  GM_addStyle(css);

  form.id = "bvs-petventures--form";
  const checkboxes = [...form.querySelectorAll('input[type="checkbox"][name^="petbro-"]')];
  const allAttrs = new Set();
  const allAttributes = new Set();

  // Find <br> elements in the form and remove them
  const brElements = form.querySelectorAll("br");
  brElements.forEach((br) => {
    br.remove();
  });

  // Get the parent <table> element of the <form>.
  const containerTable = form.closest("table");
  let containerTableParentCell;
  if (containerTable) {
    containerTable.id = "bvs-petventures--container";
    containerTable.classList.add("bvs-petventures--container");
    containerTable.removeAttribute("style");
    containerTableParentCell = containerTable.parentElement;
    if (containerTableParentCell) {
      containerTableParentCell.removeAttribute("style");
      containerTableParentCell.classList.add("bvs-petventures--parent-container-cell");
    }
  }

  // Parse character data
  const characterData = checkboxes.map((cb) => {
    const label = form.querySelector(`label[for="${cb.id}"]`);
    const match = label?.innerHTML.match(/<b>(.*?)<\/b>\s+\((.*?)\)/);
    const name = match?.[1] ?? "Unknown";
    const attributes = {};

    if (match?.[2]) {
      match[2].split(",").forEach((attr) => {
        const [key, val] = attr.trim().split(" +");
        attributes[key] = parseInt(val, 10);
        allAttrs.add(key.trim().substring(0, 3).toUpperCase());
        allAttributes.add(key.trim());
      });
    }

    return { name, attributes, checkbox: cb };
  });

  const attrList = Array.from(allAttrs).sort();
  const attributesList = Array.from(allAttributes).sort();

  // Build table
  const table = document.createElement("table");
  table.className = "bvs-petventures--table";
  table.id = "bvs-petventures--table";
  table.border = "1";

  const thead = table.createTHead();
  const headRow = thead.insertRow();
  headRow.className = "bvs-petventures--header-row";
  const headers = [...attrList, "Name", "Select"];
  const tooltips = [...attributesList, "Name", "Select"];
  headers.forEach((header, i) => {
    const th = document.createElement("th");
    th.className = "bvs-petventures--th";
    th.textContent = header;
    th.title = tooltips[i] || "";
    th.style.cursor = "pointer";
    th.addEventListener("click", () => sortTableByColumn(i));
    headRow.appendChild(th);
  });

  const tbody = table.createTBody();
  tbody.className = "bvs-petventures--tbody";

  function populateTable(data) {
    tbody.innerHTML = "";
    data.forEach((char) => {
      const row = tbody.insertRow();
      row.className = "bvs-petventures--row";

      attributesList.forEach((attr) => {
        const cell = row.insertCell();
        cell.className = `bvs-petventures--cell-attr bvs-petventures--attr-${attr.toLowerCase()}`;
        const value = char.attributes[attr];
        cell.textContent = value != null ? value : "-";
      });

      const nameCell = row.insertCell();
      nameCell.className = "bvs-petventures--cell-name";
      nameCell.textContent = char.name;

      const selectCell = row.insertCell();
      selectCell.className = "bvs-petventures--cell-select";
      selectCell.appendChild(char.checkbox);
    });
  }

  populateTable(characterData);

  // Sort helper
  let sortDirection = 1;
  function sortTableByColumn(index) {
    const key = headers[index];
    const sorted = [...characterData].sort((a, b) => {
      if (key === "Name") {
        return sortDirection * a.name.localeCompare(b.name);
      } else if (key === "Select") {
        return 0;
      }
      const valA = a.attributes[key] || 0;
      const valB = b.attributes[key] || 0;
      return sortDirection * (valA - valB);
    });
    sortDirection *= -1;
    populateTable(sorted);
  }

  // Enhance location select
  const locationSelect = form.querySelector('select[name="goloc"]');
  locationSelect.className = "bvs-petventures--select-location";
  const specialties = {
    "Ramen Shop": "Sniffing",
    "Training Grounds": "Bopping",
    "Genin Schoolyard": "Fancy",
    "Storage Room": "Flops",
  };

  [...locationSelect.options].forEach((opt) => {
    const name = opt.textContent.split("::")[1]?.trim();
    if (name && specialties[name]) {
      opt.textContent += ` (${specialties[name]})`;
    }
  });

  const locationWrapper = document.createElement("div");
  locationWrapper.className = "bvs-petventures--location-wrapper";
  locationWrapper.innerHTML = `<b class="bvs-pets--location-label">Adventure Location:</b><br>`;
  locationWrapper.appendChild(locationSelect);

  // Bonus checkboxes
  const bonusWrapper = document.createElement("div");
  bonusWrapper.className = "bvs-petventures--bonus-wrapper";
  bonusWrapper.innerHTML = `<b class="bvs-petventures--bonus-label">Optional Bonuses:</b><br>`;
  const bonusCheckboxes = [...form.querySelectorAll('input[type="checkbox"]')].filter((cb) => !cb.name.startsWith("petbro-"));
  bonusCheckboxes.forEach((cb) => {
    const label = cb.nextSibling;
    cb.classList.add("bvs-petventures--bonus-checkbox");
    bonusWrapper.appendChild(cb);
    bonusWrapper.appendChild(label);
    bonusWrapper.appendChild(document.createElement("br"));
  });

  // Action buttons
  const buttonWrapper = document.createElement("div");
  buttonWrapper.className = "bvs-petventures--button-wrapper";

  const resetBtn = document.createElement("button");
  resetBtn.className = "bvs-petventures--btn bvs-petventures--btn-reset";
  resetBtn.textContent = "Reset Fields";
  resetBtn.type = "reset";

  const startBtn = document.createElement("button");
  startBtn.className = "bvs-petventures--btn bvs-petventures--btn-start";
  startBtn.textContent = "Start PetVenture";
  startBtn.onclick = () => form.submit();

  buttonWrapper.appendChild(resetBtn);
  buttonWrapper.appendChild(startBtn);

  // Replace form content and restore hidden fields
  form.innerHTML = "";
  form.classList.add("bvs-petventures--form");

  const hiddenFields = [
    { name: "player", value: name },
    { name: "pwd", value: pwd },
    { name: "petventurego", value: "1" },
    { name: "petvlocpick", value: "1" },
    { name: "endpetv", value: "1" },
  ];
  hiddenFields.forEach((field) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = field.name;
    input.value = field.value;
    form.appendChild(input);
  });

  form.appendChild(table);
  form.appendChild(locationWrapper);
  form.appendChild(document.createElement("br"));
  form.appendChild(bonusWrapper);
  form.appendChild(buttonWrapper);
})();
