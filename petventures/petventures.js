// @ts-nocheck
(() => {
  // Get the player name and password from the page
  const name = document.querySelector('input[name="player"]')?.value;
  const pwd = document.querySelector('input[name="pwd"]')?.value;
  if (!name || !pwd) {
    console.error("Player name or password not found.");
    return;
  }

  const form = document.forms.petventurestrt;
  const checkboxes = [...form.querySelectorAll('input[type="checkbox"][name^="petbro-"]')];
  const allAttrs = new Set();

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
  table.className = "bvscss--table";
  table.border = "1";

  const thead = table.createTHead();
  const headRow = thead.insertRow();
  headRow.className = "bvscss--header-row";
  const headers = ["Name", ...attrList, "Select"];
  headers.forEach((header, i) => {
    const th = document.createElement("th");
    th.className = "bvscss--th";
    th.textContent = header;
    th.style.cursor = "pointer";
    th.addEventListener("click", () => sortTableByColumn(i));
    headRow.appendChild(th);
  });

  const tbody = table.createTBody();
  tbody.className = "bvscss--tbody";

  function populateTable(data) {
    tbody.innerHTML = "";
    data.forEach((char) => {
      const row = tbody.insertRow();
      row.className = "bvscss--row";

      const nameCell = row.insertCell();
      nameCell.className = "bvscss--cell-name";
      nameCell.textContent = char.name;

      attrList.forEach((attr) => {
        const cell = row.insertCell();
        cell.className = `bvscss--cell-attr bvscss--attr-${attr.toLowerCase()}`;
        const value = char.attributes[attr];
        cell.textContent = value != null ? value : "-";
      });

      const selectCell = row.insertCell();
      selectCell.className = "bvscss--cell-select";
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
  locationSelect.className = "bvscss--select-location";
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
  locationWrapper.className = "bvscss--location-wrapper";
  locationWrapper.innerHTML = `<b class="bvscss--location-label">Adventure Location:</b><br>`;
  locationWrapper.appendChild(locationSelect);

  // Bonus checkboxes
  const bonusWrapper = document.createElement("div");
  bonusWrapper.className = "bvscss--bonus-wrapper";
  bonusWrapper.innerHTML = `<b class="bvscss--bonus-label">Optional Bonuses:</b><br>`;
  const bonusCheckboxes = [...form.querySelectorAll('input[type="checkbox"]')].filter((cb) => !cb.name.startsWith("petbro-"));
  bonusCheckboxes.forEach((cb) => {
    const label = cb.nextSibling;
    cb.classList.add("bvscss--bonus-checkbox");
    bonusWrapper.appendChild(cb);
    bonusWrapper.appendChild(label);
    bonusWrapper.appendChild(document.createElement("br"));
  });

  // Action buttons
  const buttonWrapper = document.createElement("div");
  buttonWrapper.className = "bvscss--button-wrapper";

  const startBtn = document.createElement("button");
  startBtn.className = "bvscss--btn bvscss--btn-start";
  startBtn.textContent = "Start PetVenture";
  startBtn.onclick = () => form.submit();

  const resetBtn = document.createElement("button");
  resetBtn.className = "bvscss--btn bvscss--btn-reset";
  resetBtn.textContent = "Reset Fields";
  resetBtn.type = "reset";

  buttonWrapper.appendChild(startBtn);
  buttonWrapper.appendChild(resetBtn);

  // Replace form content and restore hidden fields
  form.innerHTML = "";
  form.classList.add("bvscss--form");

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
