// @ts-nocheck
// @require https://raw.githubusercontent.com/itsnyxtho/bvs/refs/heads/main/petventures/petventures.js
(() => {
  // Get the player name and password from the page
  const name = document.querySelector('input[name="player"]')?.value;
  const pwd = document.querySelector('input[name="pwd"]')?.value;
  if (!name || !pwd) {
    console.error("Player name or password not found.");
    return;
  }

  GM_addStyle(css);

  const form = document.forms.petventurestrt;
  form.id = "petventures-form";
  const checkboxes = [...form.querySelectorAll('input[type="checkbox"][name^="petbro-"]')];
  const allAttrs = new Set();

  // Find <br> elements in the form and remove them
  const brElements = form.querySelectorAll("br");
  brElements.forEach((br) => {
    br.remove();
  });

  // Get the parent <table> element of the <form>.
  const containerTable = form.closest("table");
  if (containerTable) {
    containerTable.id = "petventures-container";
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
        allAttrs.add(key);
      });
    }

    return { name, attributes, checkbox: cb };
  });

  const attrList = Array.from(allAttrs).sort();

  // Build table
  const table = document.createElement("table");
  table.className = "bvs-pets--table";
  table.id = "petventures-pets-table";
  table.border = "1";

  const thead = table.createTHead();
  const headRow = thead.insertRow();
  headRow.className = "bvs-pets--header-row";
  const headers = ["Name", ...attrList, "Select"];
  headers.forEach((header, i) => {
    const th = document.createElement("th");
    th.className = "bvs-pets--th";
    th.textContent = header;
    th.style.cursor = "pointer";
    th.addEventListener("click", () => sortTableByColumn(i));
    headRow.appendChild(th);
  });

  const tbody = table.createTBody();
  tbody.className = "bvs-pets--tbody";

  function populateTable(data) {
    tbody.innerHTML = "";
    data.forEach((char) => {
      const row = tbody.insertRow();
      row.className = "bvs-pets--row";

      const nameCell = row.insertCell();
      nameCell.className = "bvs-pets--cell-name";
      nameCell.textContent = char.name;

      attrList.forEach((attr) => {
        const cell = row.insertCell();
        cell.className = `bvs-pets--cell-attr bvs-pets--attr-${attr.toLowerCase()}`;
        const value = char.attributes[attr];
        cell.textContent = value != null ? value : "-";
      });

      const selectCell = row.insertCell();
      selectCell.className = "bvs-pets--cell-select";
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
  locationSelect.className = "bvs-pets--select-location";
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
  locationWrapper.className = "bvs-pets--location-wrapper";
  locationWrapper.innerHTML = `<b class="bvs-pets--location-label">Adventure Location:</b><br>`;
  locationWrapper.appendChild(locationSelect);

  // Bonus checkboxes
  const bonusWrapper = document.createElement("div");
  bonusWrapper.className = "bvs-pets--bonus-wrapper";
  bonusWrapper.innerHTML = `<b class="bvs-pets--bonus-label">Optional Bonuses:</b><br>`;
  const bonusCheckboxes = [...form.querySelectorAll('input[type="checkbox"]')].filter((cb) => !cb.name.startsWith("petbro-"));
  bonusCheckboxes.forEach((cb) => {
    const label = cb.nextSibling;
    cb.classList.add("bvs-pets--bonus-checkbox");
    bonusWrapper.appendChild(cb);
    bonusWrapper.appendChild(label);
    bonusWrapper.appendChild(document.createElement("br"));
  });

  // Action buttons
  const buttonWrapper = document.createElement("div");
  buttonWrapper.className = "bvs-pets--button-wrapper";

  const startBtn = document.createElement("button");
  startBtn.className = "bvs-pets--btn bvs-pets--btn-start";
  startBtn.textContent = "Start PetVenture";
  startBtn.onclick = () => form.submit();

  const resetBtn = document.createElement("button");
  resetBtn.className = "bvs-pets--btn bvs-pets--btn-reset";
  resetBtn.textContent = "Reset Fields";
  resetBtn.type = "reset";

  buttonWrapper.appendChild(startBtn);
  buttonWrapper.appendChild(resetBtn);

  // Replace form content and restore hidden fields
  form.innerHTML = "";
  form.classList.add("bvs-pets--form");

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
