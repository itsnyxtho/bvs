// @ts-nocheck
// ==UserScript==
// @name         BvS Actions Collector
// @namespace    bvs
// @version      0.1
// @description  Collect form actions on Billy vs. Snakeman pages.
// @author       itsnyxtho
// @include      http*://*animecubed*.com/billy/*
// @icon         https://github.com/itsnyxtho/bvs/blob/main/other/images/anime_cubed-icon.png?raw=true
// @grant        none
// ==/UserScript==

(function () {
  const STORAGE_KEY = "actionsDB";
  const CURRENT_KEY = "currentDB";

  const stripSensitiveData = (data) => {
    if (!Array.isArray(data)) {
      console.warn("[data] Invalid data format, expected an array.");
      return data;
    }
    data = data.map((entry) => {
      const cleaned = JSON.parse(JSON.stringify(entry));
      if (cleaned.hiddenFields) {
        delete cleaned.hiddenFields.player;
        delete cleaned.hiddenFields.pwd;
      }
      if (cleaned.options) {
        delete cleaned.options.player;
        delete cleaned.options.pwd;
      }
      return cleaned;
    });
    return data;
  };

  const getLabelText = (el, form) => {
    const id = el.id;
    let labelEl = null;

    if (id) {
      labelEl = form.querySelector(`label[for="${id}"]`);
    }

    if (!labelEl) {
      let parent = el.parentElement;
      while (parent) {
        if (parent.tagName === "LABEL") {
          labelEl = parent;
          break;
        }
        parent = parent.parentElement;
      }
    }

    if (labelEl) {
      return labelEl.firstElementChild ? labelEl.firstElementChild.innerText.trim() : labelEl.innerText.trim();
    }

    return "[unlabeled]";
  };

  const mergeEntries = (existingEntry, newEntry) => {
    const mergeObjects = (a = {}, b = {}) => {
      const merged = { ...a };
      for (const [key, val] of Object.entries(b)) {
        if (typeof val === "object" && !Array.isArray(val) && val !== null) {
          merged[key] = mergeObjects(a[key], val);
        } else {
          merged[key] = val;
        }
      }
      return merged;
    };

    existingEntry.hiddenFields = mergeObjects(existingEntry.hiddenFields, newEntry.hiddenFields);
    existingEntry.options = mergeObjects(existingEntry.options, newEntry.options);
  };

  const formsData = Array.from(document.forms).map((form) => {
    const elements = Array.from(form.elements);

    const hiddenFields = elements
      .filter((el) => el.tagName === "INPUT" && el.type === "hidden" && el.name)
      .reduce((acc, el) => {
        acc[el.name] = el.value;
        return acc;
      }, {});

    const options = {};

    elements.forEach((el) => {
      const name = el.name;
      const type = el.type;
      const tag = el.tagName;

      if (!name) return;

      if (!options[name]) options[name] = {};

      const labelText = getLabelText(el, form);

      if (tag === "SELECT") {
        Array.from(el.options).forEach((opt) => {
          options[name][opt.label || opt.text || opt.value] = opt.value;
        });
      } else if (type === "radio" || type === "checkbox") {
        options[name][labelText] = el.value;
      } else if (tag === "TEXTAREA" || type === "text" || type === "number") {
        options[name][labelText] = el.value;
      }
    });

    const action = form.action || "";
    const targetMatch = action.match(/\/([^/?#]+)\.[a-z]+(?:\?.*)?$/i);
    const target = targetMatch ? targetMatch[1] : null;

    return {
      name: form.name || null,
      action,
      target,
      hiddenFields,
      options,
    };
  });

  // Save current page forms data to localStorage
  localStorage.setItem(CURRENT_KEY, JSON.stringify(formsData, null, 2));

  const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  let changed = false;

  for (const newEntry of formsData) {
    const match = existing.find((e) => e.name === newEntry.name && e.action === newEntry.action && e.target === newEntry.target);
    if (match) {
      mergeEntries(match, newEntry);
      changed = true;
    } else {
      existing.push(newEntry);
      changed = true;
    }
  }

  if (changed) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing, null, 2));
    console.log(`[Actions DB] Updated: ${existing.length} total entries`);
  } else {
    console.log("[Actions DB] No changes needed.");
  }

  // UI
  if (!document.getElementById("actionsDB-download-box")) {
    const box = document.createElement("div");
    box.id = "actionsDB-download-box";
    box.style = `
      position: fixed;
      bottom: 10px;
      right: 10px;
      background: black;
      color: white;
      border: 2px solid red;
      font-family: monospace;
      padding: 10px;
      z-index: 9999;
      border-radius: 2px;
      display: grid;
      justify-content: flex-start;
      align-items: center;
      grid-template-rows: 15px 30px 30px;
      grid-template-columns: 1fr 60px 30px;
      gap: 8px 12px;
      box-sizing: border-box;
    `;

    const countDisplay = document.createElement("div");
    countDisplay.id = "actionsDB-count";
    countDisplay.style = `
      grid-column: 1 / 3;
      grid-row: 1;
      width: 100%;
      display: flex;
      justify-content: flex-start;
      align-items: center;
    `;
    countDisplay.textContent = `Stored actions: ${existing.length}`;

    const checkboxContainer = document.createElement("div");
    checkboxContainer.style = `
      height: 100%;
      width: 100%;
      grid-row: 2;
      grid-column: 1 / 3;
      display: flex;
      justify-content: flex-start;
      align-items: center;`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "__stripSensitive__";
    checkbox.style = "";
    checkbox.checked = true; // Default to checked

    const label = document.createElement("label");
    label.htmlFor = "__stripSensitive__";
    label.textContent = "Remove sensitive information";
    label.style = `
      font-size: 13px;
      display: inline-block;
      margin-left: 6px;
    `;

    checkboxContainer.appendChild(checkbox);
    checkboxContainer.appendChild(label);

    const downloadButton = document.createElement("button");
    downloadButton.textContent = "Download Actions DB";
    downloadButton.style = `
      background: red;
      color: white;
      border: none;
      cursor: pointer;
      font-family: monospace;
      grid-row: 3;
      grid-column: 1;
      border-radius: 2px;
      display: flex;
      justify-content: center;
      align-items: center;
      line-height: 1;
      padding: 0 12px;
      height: 100%;
      width: 100%;
    `;
    downloadButton.onclick = () => {
      let data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

      if (checkbox.checked) {
        data = stripSensitiveData(data);
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });

      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "actionsDB.json";
      a.click();
    };

    const clearButton = document.createElement("button");
    clearButton.textContent = "Clear DB";
    clearButton.style = `
      background: darkred;
      color: white;
      border: none;
      padding: 0 6px;
      cursor: pointer;
      font-family: monospace;
      grid-row: 3;
      grid-column: 2 / 4;
      height: 100%;
      width: 100%;
      border-radius: 2px;
      display: flex;
      justify-content: center;
      align-items: center;
      line-height: 1;
    `;
    clearButton.onclick = () => {
      if (confirm("Clear all actions from actionsDB?")) {
        localStorage.setItem(STORAGE_KEY, "[]");
        document.getElementById("actionsDB-count").textContent = "Stored actions: 0";
        console.log("[Actions DB] Cleared.");
      }
    };

    const outputConsole = document.createElement("button");
    outputConsole.title = "Output to Console";
    outputConsole.textContent = "🧾";
    outputConsole.style = `
      background: crimson;
      color: white;
      border: none;
      height: 30px;
      width: 100%;
      cursor: pointer;
      font-family: monospace;
      grid-row: 1 / 3;
      grid-column: 3;
      border-radius: 2px;
      display: flex;
      justify-content: center;
      align-items: center;
      line-height: 1;
    `;
    outputConsole.onclick = () => {
      let data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      let page = JSON.parse(localStorage.getItem(CURRENT_KEY) || "[]");

      if (data.length === 0) {
        console.warn("[Actions DB] No entries found.");
        return;
      }

      const stripCheckbox = document.getElementById("__stripSensitive__");

      if (stripCheckbox.checked) {
        data = stripSensitiveData(data);
        page = stripSensitiveData(page);
      }

      console.log("[Actions DB] Current Page entries:", page);
      console.log("[Actions DB] All Database entries:", data);
    };

    box.appendChild(countDisplay);
    box.appendChild(outputConsole);
    box.appendChild(checkboxContainer);
    box.appendChild(downloadButton);
    box.appendChild(clearButton);
    document.body.appendChild(box);
  } else {
    document.getElementById("actionsDB-count").textContent = `Stored actions: ${JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]").length}`;
  }
})();
