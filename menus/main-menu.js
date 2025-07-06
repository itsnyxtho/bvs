// @ts-nocheck
// ==UserScript==
// @name         BvS Menu Bar Facelift (Stylized, Grouped, Persistent)
// @namespace    BvS
// @version      0.0.4
// @description  Combines and styles BvS minimenu into grouped, collapsible, persistent buttons with hide support per section and screen
// @include      http*://*animecubed*/billy/bvs/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=animecubedgaming.com
// @grant        none
// ==/UserScript==

(function () {
  const removeElement = (selector) => {
    const element = document.querySelector(selector);
    if (element) {
      element.remove();
    }
  };

  // If sovrn-overlay-footer or evolve_footer, remove it.
  removeElement("#sovrn-overlay-footer");
  removeElement("#evolve_footer");

  // === ✏️ normalize customButtons ===
  const customButtons = [
    { label: "Breakfast", id: "btn-breakfast", action: "/billy/bvs/breakfast.html" },
    { label: "[V] Zombjas", id: "village-btn-zombjas", action: "/billy/bvs/zombjas.html" },
    { label: "[V] Billy Con", id: "village-btn-billy-con", action: "/billy/bvs/billycon-register.html" },
    { label: "[V] Village Spy", id: "village-btn-village-spy", action: "/billy/bvs/villagespy.html" },
    { label: "[V] Bingo Book", id: "village-btn-bingo-book", action: "/billy/bvs/bingo.html" },
    { label: "[V] Marketplace", id: "village-btn-marketplace", action: "/billy/bvs/villagemarketplace.html" },
    { label: "[V] Jutsu Enhancement", id: "village-btn-jutsu-enhancement", action: "/billy/bvs/villagejenhance.html" },
    { label: "[V] ROBO FIGHTO", id: "village-btn-robo-fighto", action: "/billy/bvs/villagerobofighto.html" },
    { label: "[V] Storehouse", id: "village-btn-storehouse", action: "/billy/bvs/villagestorehouse.html" },
    { label: "[V] Vacation!", id: "village-btn-vacation", action: "/billy/bvs/villagebeach.html" },
    { label: "[V] Tattoo Parlor", id: "village-btn-tattoo-parlor", action: "/billy/bvs/villagetattoo.html" },
    { label: "[V] El Diablo Supreme!", id: "village-btn-el-diablo", action: "/billy/bvs/villagediablo.html" },
    { label: "[V] Field Menu", id: "village-btn-field-menu", action: "/billy/bvs/villagefields.html" },
    { label: "[V] Z-Rewards", id: "village-btn-z-rewards", action: "/billy/bvs/zombjarewards.html" },
    { label: "[V] Snow Day!", id: "village-btn-snow-day", action: "/billy/bvs/villagesnowday.html" },
    { label: "[V] Petition Day!", id: "village-btn-petition-day", action: "/billy/bvs/villagepetition.html" },

    { label: "Retail", id: "btn-retail", action: "/billy/bvs/shop-retail.html" },
    { label: "The Daily Fail", id: "btn-daily-fail", action: "/billy/bvs/dailyfail.html" },
    { label: "Themes & Crank", id: "btn-themes-crank", action: "/billy/bvs/themesdifficulty.html" },
    { label: "Workshop", id: "btn-workshop", action: "/billy/bvs/workshop.html" },
    { label: "Account", id: "btn-account", action: "/billy/bvs/changeinfo.html" },
    { label: "Eye of the Storm", id: "btn-eye-of-the-storm", action: "/billy/bvs/sandstorm.html" },
    { label: "Reaper Blood", id: "btn-reaper-blood", action: "/billy/bvs/reaper.html" },
    { label: "Tiny Bee Vault", id: "btn-tiny-bee-vault", action: "/billy/bvs/tinybees.html" },
    { label: "Pets", id: "btn-pets", action: "/billy/bvs/pets.html" },
    { label: "Trophy Room", id: "btn-trophy-room", action: "/billy/bvs/trophyroom.html" },
    { label: "Petventures", id: "btn-petventures", action: "/billy/bvs/petventures.html" },
    { label: "Scuffles", id: "btn-scuffles", action: "/billy/bvs/wotageddon.html" },
    { label: "ThankYou", id: "btn-thankyou", action: "/billy/bvs/thankyou.html" },
    { label: "ThankYou Survey", id: "btn-thankyou-survey", action: "/billy/bvs/thankyousurvey.html" },
    { label: "[BC] Waxing", id: "btn-waxing", action: "/billy/bvs/bc_fun_wax.html" },
    {
      label: "Tip Line",
      id: "phminimenu-tip-line",
      action: "/billy/bvs/partyhouse.html",
      method: "post",
      hiddenFields: [
        {
          name: "game_played",
          value: "hintline",
        },
      ],
    },
    {
      label: "[V] Paperwork",
      id: "village-btn-paperwork",
      action: "village.html",
      method: "post",
      hiddenFields: [
        {
          name: "helpvillage",
          value: "paperwork",
        },
      ],
    },
    {
      label: "[V] Patrol",
      id: "village-btn-patrol",
      action: "village.html",
      method: "post",
      hiddenFields: [
        {
          name: "helpvillage",
          value: "patrol",
        },
      ],
    },
    {
      label: "[V] Collect Resources",
      id: "village-btn-collect-resources",
      action: "village.html",
      method: "post",
      hiddenFields: [
        {
          name: "helpvillage",
          value: "collect",
        },
      ],
    },
    {
      label: "'Juice' Bar",
      id: "phminimenu-juice-bar",
      action: "/billy/bvs/partyhouse.html",
      method: "post",
      hiddenFields: [
        {
          name: "game_played",
          value: "juice",
        },
      ],
    },
    {
      label: "First Loser",
      id: "phminimenu-first-loser",
      action: "/billy/bvs/partyhouse.html",
      method: "post",
      hiddenFields: [
        {
          name: "game_played",
          value: "loser",
        },
      ],
    },
    {
      label: "Wheel",
      id: "phminimenu-wheel",
      action: "/billy/bvs/partyhouse.html",
      method: "post",
      hiddenFields: [
        {
          name: "game_played",
          value: "wheel",
        },
      ],
    },
    {
      label: "Jackpot",
      id: "phminimenu-jackpot",
      action: "/billy/bvs/partyhouse.html",
      method: "post",
      hiddenFields: [
        {
          name: "game_played",
          value: "jackpot",
        },
      ],
    },
    {
      label: "Lottery",
      id: "phminimenu-lottery",
      action: "/billy/bvs/partyhouse.html",
      method: "post",
      hiddenFields: [
        {
          name: "game_played",
          value: "lottery",
        },
      ],
    },
    {
      label: "Big Board",
      id: "phminimenu-big-board",
      action: "/billy/bvs/partyhouse.html",
      method: "post",
      hiddenFields: [
        {
          name: "game_played",
          value: "bigboard",
        },
      ],
    },
    {
      label: "Scratchies",
      id: "phminimenu-scratchies",
      action: "/billy/bvs/partyhouse.html",
      method: "post",
      hiddenFields: [
        {
          name: "game_played",
          value: "scratch",
        },
      ],
    },
    {
      label: "Darts",
      id: "phminimenu-darts",
      action: "/billy/bvs/partyhouse.html",
      method: "post",
      hiddenFields: [
        {
          name: "game_played",
          value: "darts",
        },
      ],
    },
    {
      label: "Party Room",
      id: "phminimenu-party-room",
      action: "/billy/bvs/partyhouse.html",
      method: "post",
      hiddenFields: [
        {
          name: "game_played",
          value: "party",
        },
      ],
    },
    {
      label: "Crane",
      id: "phminimenu-crane",
      action: "/billy/bvs/partyhouse.html",
      method: "post",
      hiddenFields: [
        {
          name: "game_played",
          value: "crane",
        },
      ],
    },
    {
      label: "Over 11K",
      id: "phminimenu-over-11k",
      action: "/billy/bvs/partyhouse.html",
      method: "post",
      hiddenFields: [
        {
          name: "game_played",
          value: "over11",
        },
      ],
    },
    {
      label: "SNAKEMAN",
      id: "phminimenu-snakeman",
      action: "/billy/bvs/partyhouse.html",
      method: "post",
      hiddenFields: [
        {
          name: "game_played",
          value: "snake",
        },
      ],
    },
    {
      label: "Roulette",
      id: "phminimenu-roulette",
      action: "/billy/bvs/partyhouse-roulette.html",
      method: "post",
      hiddenFields: [
        {
          name: "game_played",
          value: "roulette",
        },
      ],
    },
    {
      label: "Mahjong",
      id: "phminimenu-mahjong",
      action: "/billy/bvs/partyhouse-mahjong.html",
      method: "post",
      hiddenFields: [
        {
          name: "game_played",
          value: "mahjong",
        },
      ],
    },
    {
      label: "SUPERFAIL",
      id: "phminimenu-superfail",
      action: "/billy/bvs/partyhouse-superfail.html",
      method: "post",
      hiddenFields: [
        {
          name: "game_played",
          value: "superfail",
        },
      ],
    },
    {
      label: "Pigeons",
      id: "phminimenu-pigeons",
      action: "/billy/bvs/partyhouse-keno.html",
      method: "post",
      hiddenFields: [
        {
          name: "game_played",
          value: "keno",
        },
      ],
    },
    {
      label: "Hanafuda",
      id: "phminimenu-hanafuda",
      action: "/billy/bvs/partyhouse-hanafuda.html",
      method: "post",
      hiddenFields: [
        {
          name: "game_played",
          value: "hanafuda",
        },
        {
          name: "hf_skip",
          value: "1",
        },
      ],
    },
    {
      label: "Pachinko",
      id: "phminimenu-pachinko",
      action: "/billy/bvs/partyhouse-pachinko.html",
      method: "post",
      hiddenFields: [
        {
          name: "game_played",
          value: "pachinko",
        },
      ],
    },
    {
      label: "Mini Coliseum",
      id: "btn-minicoliseum",
      action: "/billy/bvs/minicoli.html",
      method: "post",
      hiddenFields: [
        {
          name: "playcoli",
          value: "1",
        },
      ],
    },
  ];

  // === 🗺️ Section Map by ID ===
  const sectionMap = {
    sectionsOrder: ["", "Settings", "Daily", "Village", "Items", "Combat", "Games", "Pets", "BvS", "Other", "Links", "Hidden"], // Order of sections in the menu
    // TOP LEVEL
    "minimenu-main": { section: "", order: 1 }, // Main Page
    "minimenu-village": { section: "", order: 2 }, // Village
    "minimenu-party-house": { section: "", order: 3 }, // Party House
    "minimenu-team": { section: "", order: 4 }, // Team
    "minimenu-missions": { section: "", order: 5 }, // Missions
    "minimenu-quests": { section: "", order: 6 }, // Quests
    "btn-trophy-room": { section: "", order: 7 }, // Trophy Room
    // SETTINGS
    "minimenu-summons": { section: "Settings", order: 1 }, // Summons
    "btn-themes-crank": { section: "Settings", order: 2 }, // Themes & Crank
    "btn-eye-of-the-storm": { section: "Settings", order: 3 }, // Eye of the Storm
    "btn-reaper-blood": { section: "Settings", order: 4 }, // Reaper Blood
    "minimenu-jutsu": { section: "Settings", order: 5 }, // Jutsu
    // DAILY
    "btn-daily-fail": { section: "Daily", order: 1 }, // The Daily Fail
    "btn-breakfast": { section: "Daily", order: 2 }, // Breakfast
    "village-btn-paperwork": { section: "Daily", order: 3 }, // Paperwork
    "village-btn-patrol": { section: "Daily", order: 4 }, // Patrol
    "village-btn-collect-resources": { section: "Daily", order: 5 }, // Collect Resources
    // VILLAGE
    "village-btn-zombjas": { section: "Village", order: 1 }, // Zombjas
    "village-btn-billy-con": { section: "Village", order: 2 }, // Billy Con
    "village-btn-village-spy": { section: "Village", order: 3 }, // Village Spy
    "village-btn-bingo-book": { section: "Village", order: 4 }, // Bingo Book
    "village-btn-marketplace": { section: "Village", order: 5 }, // Marketplace
    "village-btn-jutsu-enhancement": { section: "Village", order: 6 }, // Jutsu Enhancement
    "village-btn-robo-fighto": { section: "Village", order: 7 }, // ROBO FIGHTO
    "village-btn-storehouse": { section: "Village", order: 8 }, // Storehouse
    "village-btn-vacation": { section: "Village", order: 9 }, // Vacation!
    "village-btn-tattoo-parlor": { section: "Village", order: 10 }, // Tattoo Parlor
    "village-btn-el-diablo": { section: "Village", order: 11 }, // El Diablo Supreme!
    "village-btn-field-menu": { section: "Village", order: 12 }, // Field Menu
    "village-btn-z-rewards": { section: "Village", order: 13 }, // Z-Rewards
    "village-btn-snow-day": { section: "Village", order: 14 }, // Snow Day!
    "village-btn-petition-day": { section: "Village", order: 15 }, // Petition Day!
    // ITEMS
    "minimenu-shop": { section: "Items", order: 1 }, // Shop
    "minimenu-consumables": { section: "Items", order: 2 }, // Consumables
    "phminimenu-juice-bar": { section: "Games", order: 2 }, // Juice Bar
    "minimenu-workshop": { section: "Items", order: 3 }, // Workshop
    "btn-tiny-bee-vault": { section: "Items", order: 4 }, // Tiny Bee Vault
    "minimenu-bucket": { section: "Items", order: 5 }, // Bucket
    // COMBAT
    "minimenu-number-one": { section: "Combat", order: 1 }, // Number One
    "minimenu-arena": { section: "Combat", order: 2 }, // Arena
    "btn-scuffles": { section: "Combat", order: 3 }, // Scuffles
    "minimenu-worldkaiju": { section: "Combat", order: 4 }, // World Kaiju
    "minimenu-spar": { section: "Combat", order: 5 }, // Spar
    "btn-minicoliseum": { section: "Combat", order: 6 }, // Mini Coliseum
    // GAMES
    "btn-retail": { section: "Games", order: 0 }, // Retail
    "phminimenu-darts": { section: "Games", order: 1 }, // Darts
    "phminimenu-first-loser": { section: "Games", order: 2 }, // First Loser
    "phminimenu-big-board": { section: "Games", order: 3 }, // Big Board
    "phminimenu-superfail": { section: "Games", order: 4 }, // Superfail
    "phminimenu-over-11k": { section: "Games", order: 5 }, // Over 11K
    "phminimenu-pachinko": { section: "Games", order: 6 }, // Pachinko
    "phminimenu-mahjong": { section: "Games", order: 7 }, // Mahjong
    "phminimenu-hanafuda": { section: "Games", order: 8 }, // Hanafuda
    "phminimenu-wheel": { section: "Games", order: 9 }, // Wheel
    "phminimenu-jackpot": { section: "Games", order: 10 }, // Jackpot
    "phminimenu-lottery": { section: "Games", order: 11 }, // Lottery
    "phminimenu-scratchies": { section: "Games", order: 12 }, // Scratchies
    "phminimenu-pigeons": { section: "Games", order: 13 }, // Pigeons
    "phminimenu-snakeman": { section: "Games", order: 14 }, // Snakeman
    "phminimenu-roulette": { section: "Games", order: 15 }, // Roulette
    "phminimenu-crane": { section: "Games", order: 16 }, // Crane
    // PETS
    "btn-pets": { section: "Pets", order: 1 }, // Pets
    "btn-petventures": { section: "Pets", order: 2 }, // Petventures
    // BVS
    "btn-account": { section: "BvS", order: 1 }, // Account
    "minimenu-karma": { section: "BvS", order: 2 }, // Karma
    "minimenu-billyclub": { section: "BvS", order: 3 }, // Billy Club
    "btn-thankyou": { section: "BvS", order: 4 }, // Thank You
    "btn-thankyou-survey": { section: "BvS", order: 5 }, // Thank You Survey
    "btn-waxing": { section: "BvS", order: 6 }, // Waxing
    // OTHER
    "phminimenu-tip-line": { section: "Other", order: 1 }, // Tip Line
    "phminimenu-party-room": { section: "Other", order: 2 }, // Party Room
    // LINKS
    // HIDDEN
  };

  document.body.style.overflow = "hidden";
  document.body.style.height = "100vh";
  document.body.style.width = "100vw";

  let topContainer = document.getElementById("container");
  if (topContainer) {
    topContainer.style.height = "100%";
    topContainer.style.width = "100%";
  }

  const menuTables = [...document.querySelectorAll(".minimenu, .minimenub")];
  if (menuTables.length === 0) return;

  const STORAGE_KEY = "bvs-menu-hidden";
  const COLLAPSE_KEY = "bvs-menu-collapsed";

  if (!localStorage.getItem(COLLAPSE_KEY)) {
    const initialCollapsed = ["section-Settings", "section-Daily", "section-Village", "section-Items", "section-Combat", "section-Games", "section-Pets", "section-BvS", "section-Other", "section-Links", "section-Hidden"];
    localStorage.setItem(COLLAPSE_KEY, JSON.stringify(initialCollapsed));
  }

  const hiddenButtons = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
  const collapsedSections = new Set(JSON.parse(localStorage.getItem(COLLAPSE_KEY) || "[]"));

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...hiddenButtons]));
    localStorage.setItem(COLLAPSE_KEY, JSON.stringify([...collapsedSections]));
  }

  function createSectionRow(title, sectionId, isCollapsed, buttonRows) {
    const headerRow = document.createElement("tr");
    const headerCell = document.createElement("td");
    headerCell.colSpan = 2;
    headerCell.style.display = "block";
    headerCell.style.cursor = "pointer";
    headerCell.style.padding = "4px 6px";
    headerCell.style.background = "#400";
    headerCell.style.color = "#fff";
    headerCell.style.fontWeight = "bold";
    headerCell.style.fontFamily = "Verdana, sans-serif";
    headerCell.style.fontSize = "10.5px";
    headerCell.textContent = `${isCollapsed ? "⮞" : "⮟"} ${title}`;
    headerCell.title = title;
    headerCell.style.borderBottom = "1px solid #631E02";

    const bodyRow = document.createElement("tr");
    const bodyCell = document.createElement("td");
    bodyCell.colSpan = 2;
    bodyCell.style.padding = "0";
    bodyCell.style.transition = "height 0.3s ease";
    bodyCell.style.overflow = "hidden";

    const wrapper = document.createElement("div");
    wrapper.style.display = "grid";
    wrapper.style.gridTemplateColumns = "1fr";
    wrapper.style.gap = "0";
    wrapper.style.overflow = "hidden";
    wrapper.style.transition = "height 0.3s ease";

    for (const row of buttonRows) wrapper.appendChild(row);
    bodyCell.appendChild(wrapper);
    bodyRow.appendChild(bodyCell);

    if (isCollapsed) {
      requestAnimationFrame(() => {
        const fullHeight = wrapper.scrollHeight;
        wrapper.style.height = "0px";
      });
    } else {
      wrapper.style.height = "auto";
    }

    headerCell.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const collapsed = collapsedSections.has(sectionId);

      if (collapsed) {
        // EXPANDING
        collapsedSections.delete(sectionId);

        // Force current height to 0 to prepare for transition
        wrapper.style.height = "0px";

        // Wait a frame, then expand to scrollHeight
        requestAnimationFrame(() => {
          const targetHeight = wrapper.scrollHeight + "px";
          wrapper.style.height = targetHeight;

          wrapper.addEventListener(
            "transitionend",
            () => {
              wrapper.style.height = "auto"; // Unlock height for fluidity
            },
            { once: true },
          );
        });
      } else {
        // COLLAPSING
        collapsedSections.add(sectionId);

        // Set explicit height to current height (needed to transition from known height to 0)
        const currentHeight = wrapper.scrollHeight + "px";
        wrapper.style.height = currentHeight;

        requestAnimationFrame(() => {
          wrapper.style.height = "0px";
        });
      }

      headerCell.textContent = `${collapsed ? "⮟" : "⮞"} ${headerCell.title}`;
      saveState();
    });

    headerRow.appendChild(headerCell);
    return { headerRow, bodyRow };
  }

  function getSectionBg(section) {
    switch ((section || "").toLowerCase()) {
      case "games":
        return "/billy/layout/scrollteal.jpg";
      case "village":
        return "/billy/layout/scrollbg.jpg";
      case "":
        return "/billy/layout/scrolldark.jpg";
      default:
        return "/billy/layout/scrolldark2.jpg";
    }
  }

  function renderButtons(buttons, unifiedForm) {
    const existingIds = new Set();
    const grouped = {};
    for (const btn of buttons) {
      if (existingIds.has(btn.id)) continue;
      existingIds.add(btn.id);
      if (!grouped[btn.section]) grouped[btn.section] = [];
      grouped[btn.section].push(btn);
    }

    const buttonTable = document.createElement("table");
    buttonTable.style.borderCollapse = "collapse";
    buttonTable.style.width = "100%";
    const tbody = document.createElement("tbody");
    buttonTable.appendChild(tbody);

    for (const section of sectionMap.sectionsOrder) {
      const group = grouped[section];
      if (!group) continue;

      const sectionId = `section-${section || "root"}`;
      const collapsed = collapsedSections.has(sectionId);
      const visibleButtons = group.filter((btn) => !hiddenButtons.has(btn.id));
      const hiddenGroup = group.filter((btn) => hiddenButtons.has(btn.id));
      if (visibleButtons.length === 0 && hiddenGroup.length === 0) continue;
      let cell;
      if (section === "") {
        for (const btn of visibleButtons) {
          if (document.getElementById(btn.id)) continue;

          const row = document.createElement("tr");
          const cell = document.createElement("td");
          cell.style.padding = "0";

          const button = document.createElement("button");
          button.id = btn.id;
          button.type = "button";
          button.style.width = "100%";
          button.style.height = "24px";
          button.style.padding = "4px 8px";
          button.style.background = `#833102 url(${getSectionBg(btn.section)})`;
          button.style.backgroundSize = "cover";
          button.style.fontSize = "10px";
          button.style.fontFamily = "Verdana, sans-serif";
          button.style.textAlign = "left";
          button.style.border = "none";
          button.style.borderBottom = "1px solid #631E02";
          button.style.color = "#fff";
          button.style.position = "relative";
          button.style.fontWeight = "bold";
          button.style.cursor = "pointer";

          const labelSpan = document.createElement("span");
          labelSpan.textContent = btn.label;
          labelSpan.style.position = "relative";
          labelSpan.style.zIndex = "1";
          button.appendChild(labelSpan);

          button.addEventListener("click", () => {
            [...unifiedForm.querySelectorAll(".custom-field")].forEach((el) => el.remove());
            for (const { name, value } of btn.fields || []) {
              const input = document.createElement("input");
              input.type = "hidden";
              input.name = name;
              input.value = value;
              input.classList.add("custom-field");
              unifiedForm.appendChild(input);
            }
            unifiedForm.action = btn.action;
            unifiedForm.method = btn.method;
            unifiedForm.submit();
          });

          const hideBtn = document.createElement("span");
          hideBtn.textContent = "⮽";
          hideBtn.title = "Hide this button";
          hideBtn.style.float = "right";
          hideBtn.style.cursor = "pointer";
          hideBtn.style.fontSize = "12px";
          hideBtn.style.fontWeight = "bold";
          hideBtn.style.paddingLeft = "6px";
          hideBtn.style.color = "#fff";
          hideBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            hiddenButtons.add(btn.id);
            saveState();
            renderButtons(buttons, unifiedForm);
          });
          button.appendChild(hideBtn);

          cell.appendChild(button);
          row.appendChild(cell);
          tbody.appendChild(row);
        }

        continue; // Skip the rest of the section rendering logic
      }

      const buttonRows = [];

      for (const btn of visibleButtons) {
        if (document.getElementById(btn.id)) continue;

        const row = document.createElement("div");
        const button = document.createElement("button");
        button.id = btn.id;
        button.type = "button";
        button.style.width = "100%";
        button.style.height = "24px";
        button.style.padding = "4px 8px";
        button.style.background = `${btn.section === "" ? "#833102" : "#444"} url(${getSectionBg(btn.section)})`;
        button.style.backgroundSize = "cover";
        button.style.fontSize = "10px";
        button.style.fontFamily = "Verdana, sans-serif";
        button.style.textAlign = "left";
        button.style.border = "none";
        button.style.borderBottom = "1px solid #631E02";
        button.style.color = btn.section === "Village" ? "#121212" : "#fff";
        button.style.position = "relative";
        button.style.fontWeight = "bold";
        button.style.cursor = "pointer";

        const labelSpan = document.createElement("span");
        labelSpan.textContent = btn.label;
        labelSpan.style.position = "relative";
        labelSpan.style.zIndex = "1";
        button.appendChild(labelSpan);

        button.addEventListener("click", () => {
          [...unifiedForm.querySelectorAll(".custom-field")].forEach((el) => el.remove());
          for (const { name, value } of btn.fields || []) {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = name;
            input.value = value;
            input.classList.add("custom-field");
            unifiedForm.appendChild(input);
          }
          unifiedForm.action = btn.action;
          unifiedForm.method = btn.method;
          unifiedForm.submit();
        });

        const hideBtn = document.createElement("span");
        hideBtn.textContent = "⮽";
        hideBtn.title = "Hide this button";
        hideBtn.style.float = "right";
        hideBtn.style.cursor = "pointer";
        hideBtn.style.fontSize = "12px";
        hideBtn.style.fontWeight = "bold";
        hideBtn.style.paddingLeft = "6px";
        hideBtn.style.color = btn.section === "Village" ? "#121212" : "#fff";
        hideBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          hiddenButtons.add(btn.id);
          saveState();
          renderButtons(buttons, unifiedForm);
        });
        button.appendChild(hideBtn);

        row.appendChild(button);
        buttonRows.push(row);
      }

      const { headerRow, bodyRow } = createSectionRow(section, sectionId, collapsed, buttonRows);
      tbody.appendChild(headerRow);
      tbody.appendChild(bodyRow);
    }

    // Remove only old button table, preserve base hidden fields
    const oldTable = unifiedForm.querySelector("table");
    if (oldTable) oldTable.remove();
    unifiedForm.appendChild(buttonTable);
  }

  // === 🧲 extract menuItems ===
  const menuItems = menuTables.flatMap((table) => {
    const forms = table.querySelectorAll("form");
    return [...forms]
      .map((form) => {
        const action = form.getAttribute("action");
        const method = form.getAttribute("method") || "post";
        const label = form.querySelector("a")?.textContent.trim();
        const id = "minimenu-" + label.replace(/[^a-z0-9]/gi, "-").toLowerCase();
        const fields = [...form.querySelectorAll('input[type="hidden"]')].map((i) => ({ name: i.name, value: i.value }));
        return { id, label, action, method, fields };
      })
      .filter((i) => i.label && i.action);
  });

  const normalizedCustomButtons = customButtons.map((btn) => ({
    ...btn,
    method: btn.method || "post",
    fields: btn.hiddenFields || [],
    section: sectionMap[btn.id]?.section || btn.section || "",
    order: sectionMap[btn.id]?.order || btn.order || 0,
  }));

  // === 🔀 filter + merge ===
  const filteredMenuItems = menuItems.filter((item) => !normalizedCustomButtons.some((c) => c.label === item.label && c.action === item.action));
  const allButtons = [...filteredMenuItems, ...normalizedCustomButtons].map((btn) => ({
    ...btn,
    section: sectionMap[btn.id]?.section || btn.section || "",
    order: sectionMap[btn.id]?.order || btn.order || 0,
  }));

  // === 🧱 create floating panel ===
  const navContainer = document.createElement("div");
  navContainer.style.position = "sticky";
  navContainer.style.background = "#111";
  navContainer.style.top = "0px";
  navContainer.style.right = "0px";
  navContainer.style.border = "1px solid #631E02";
  navContainer.style.borderTop = "none";
  navContainer.style.borderBottom = "none";
  navContainer.style.fontFamily = "Verdana, sans-serif";
  navContainer.style.fontSize = "12px";
  navContainer.style.color = "#fff";
  navContainer.style.height = "100vh";
  navContainer.style.width = "190px";
  navContainer.style.gridColumn = "2";
  navContainer.style.gridRow = "1 / 4";
  navContainer.style.justifySelf = "end";
  navContainer.style.display = "grid";
  navContainer.style.gridTemplateRows = "auto 1fr";

  const navHeader = document.createElement("div");

  // Add Reset Button to Navigation Header
  function createNavHeader() {
    const header = document.createElement("div");
    header.style.background = "#300";
    header.style.cursor = "pointer";
    header.style.padding = "4px 8px";
    header.style.userSelect = "none";
    header.style.display = "grid";
    header.style.gridTemplateColumns = "1fr 25px 25px";
    header.style.gridTemplateRows = "1fr";
    header.style.gap = "2px";
    header.style.alignItems = "center";
    header.style.alignContent = "center";
    header.style.justifyContent = "center";
    header.style.justifyItems = "center";

    const title = document.createElement("span");
    title.textContent = "Navigation";
    title.style.width = "100%";
    title.style.fontWeight = "900";
    title.style.fontVariant = "small-caps";
    header.appendChild(title);

    const reset = document.createElement("button");
    reset.textContent = "🔄";
    reset.title = "Reset navigation to show hidden buttons";
    reset.style.marginLeft = "8px";
    reset.style.padding = "0";
    reset.style.width = "25px";
    reset.style.height = "25px";
    reset.style.border = "none";
    reset.style.background = "#ffffff40";
    reset.style.fontSize = "14px";
    reset.style.fontWeight = "900";
    reset.style.cursor = "pointer";
    reset.addEventListener("click", (e) => {
      e.stopPropagation();
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(COLLAPSE_KEY);
      location.reload();
    });

    // Add a hide button to the header
    const hideButton = document.createElement("button");
    hideButton.textContent = "⛔";
    hideButton.title = "Hide/Show Navigation";
    hideButton.style.border = "none";
    hideButton.style.background = "#ffffff40";
    hideButton.style.marginLeft = "8px";
    hideButton.style.padding = "0";
    hideButton.style.fontSize = "14px";
    hideButton.style.width = "25px";
    hideButton.style.height = "25px";
    hideButton.style.fontWeight = "900";
    hideButton.style.cursor = "pointer";
    hideButton.addEventListener("click", (e) => {
      e.stopPropagation();
      // If "Hide" shrink navContainer to height of Header and position absolute (top 0, right 0). Change column template of outerWrapper to 1fr.
      if (navContainer.style.height === "100vh") {
        hideButton.textContent = "👀";
        navContainer.style.height = "35px"; // Shrink to header height
        navContainer.style.position = "absolute";
        navContainer.style.top = "0";
        navContainer.style.right = "0";
        navContainer.style.overflow = "hidden";
        outerWrapper.style.gridTemplateColumns = "1fr";
      } else {
        hideButton.textContent = "⛔";
        navContainer.style.height = "100vh"; // Restore full height
        navContainer.style.position = "sticky";
        outerWrapper.style.gridTemplateColumns = "1fr max-content"; // Restore original layout
        navContainer.style.overflow = "hidden auto"; // Restore overflow
      }
      
    });

    header.appendChild(title);
    header.appendChild(reset);
    header.appendChild(hideButton);

    return header;
  }

  navHeader.appendChild(createNavHeader());

  const navBody = document.createElement("div");
  navBody.id = "bvs-nav-body";
  navBody.style.height = "100%";
  navBody.style.overflowX = "hidden";
  navBody.style.overflowY = "auto";

  // === 🧾 setup unified form ===
  const unifiedForm = document.createElement("form");
  unifiedForm.method = "post";
  unifiedForm.style.margin = "0";
  unifiedForm.style.padding = "0";
  for (const { name, value } of menuItems[0]?.fields || []) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    unifiedForm.appendChild(input);
  }

  navContainer.appendChild(navHeader);
  navContainer.appendChild(navBody);
  renderButtons(allButtons, unifiedForm);
  navBody.appendChild(unifiedForm);
  let outerWrapper = document.getElementById("wrapper") || document.body;
  if (outerWrapper) {
    outerWrapper.appendChild(navContainer);
    outerWrapper.style.gridTemplateRows = "1fr max-content";
    outerWrapper.style.display = "grid";
    outerWrapper.style.justifyContent = "space-between";
    outerWrapper.style.justifyItems = "center";
    outerWrapper.style.height = "100%";
    outerWrapper.style.width = "100%";
    outerWrapper.style.gridTemplateColumns = "1fr max-content";
    outerWrapper.style.overflow = "hidden";
    if (outerWrapper.children.length > 0) {
      outerWrapper.children[0].style.overflow = "auto";
      outerWrapper.children[0].style.height = "100%";
      outerWrapper.children[0].style.width = "100%";
    }
  }

  // — State & Load Dark Hour tokens —
  let is24 = true;
  let darkTokens = JSON.parse(localStorage.getItem("bvs-dark-hours") || "[]");
  if (location.pathname.includes("/billy/bvs/pages/main.html")) {
    const hoursEl = document.querySelector("span#hours");
    if (hoursEl) {
      darkTokens = [...hoursEl.textContent.matchAll(/\d{1,2}(?::\d{2})?\s*(?:AM|PM)/gi)].map((m) => m[0]);
      localStorage.setItem("bvs-dark-hours", JSON.stringify(darkTokens));
    }
  }

  // — Helpers —
  function two(n) {
    return n < 10 ? "0" + n : "" + n;
  }
  function msToHMS(ms) {
    let s = Math.max(0, Math.ceil(ms / 1000));
    const h = Math.floor(s / 3600);
    s %= 3600;
    const m = Math.floor(s / 60);
    s %= 60;
    return `${two(h)}:${two(m)}:${two(s)}`;
  }
  function fmtDate(d, useUTC, _is24Override) {
    d = new Date(d);
    if (isNaN(d.getTime())) {
      console.error("Invalid Date");
      return `00:00:00`;
    }
    const H = useUTC ? d.getUTCHours() : d.getHours();
    const M = useUTC ? d.getUTCMinutes() : d.getMinutes();
    const S = useUTC ? d.getUTCSeconds() : d.getSeconds();
    if (_is24Override !== undefined ? _is24Override : is24) {
      return `${two(H)}:${two(M)}:${two(S)} H `;
    } else {
      const suffix = H >= 12 ? "PM" : "AM";
      const h12 = H % 12 || 12;
      return `${two(h12)}:${two(M)}:${two(S)} ${suffix}`;
    }
  }

  // — Compute “now” in BvS server time (UTC−05:00) —
  function getServerDate() {
    const now = new Date();
    const utcMs = now.getTime();
    return utcMs - 5 * 3600000;
  }

  // — Dark Hour logic —
  function parseTokens(tokens, base) {
    base = new Date(base);
    return tokens
      .map((tok) => {
        const m = tok.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
        if (!m) return null;
        let h = +m[1],
          min = m[2] ? +m[2] : 0;
        const ampm = m[3].toUpperCase();
        if (ampm === "PM" && h < 12) h += 12;
        if (ampm === "AM" && h === 12) h = 0;
        const d = new Date(base.getTime());
        d.setUTCHours(h, min, 0, 0);
        return d;
      })
      .filter(Boolean)
      .sort((a, b) => a - b);
  }

  function getNextDarkHour() {
    const srvNow = getServerDate();
    const list = parseTokens(darkTokens, srvNow);
    for (const d of list) if (d > srvNow) return d;
    return list[0] ? new Date(list[0].getTime() + 24 * 60 * 60 * 1000) : null;
  }

  // — Dayroll at 05:10 server time —
  function getNextDayroll() {
    const srvNow = new Date(getServerDate());
    const dr = new Date(srvNow.getTime());
    dr.setUTCHours(5, 10, 0, 0);
    if (dr <= srvNow) dr.setUTCDate(dr.getUTCDate() + 1);
    return dr;
  }

  // — Build Clock Box —
  const box = document.createElement("div");
  box.id = "bvs-clock-box";
  Object.assign(box.style, {
    borderTop: "1px solid #631E02",
    padding: "8px",
    fontFamily: "monospace",
    fontSize: "10px",
    color: "#00ff00bb",
    textAlign: "right",
    cursor: "pointer",
  });
  // 5 rows: server, local, utc, dayroll, dark hour
  const [srvEl, locEl, utcEl, drEl, dhEl] = Array(5)
    .fill()
    .map(() => {
      const d = document.createElement("div");
      d.style.whiteSpace = "pre";
      d.style.padding = "0 4px";
      box.appendChild(d);
      return d;
    });
  // click to toggle 24h/12h
  box.addEventListener("click", () => (is24 = !is24));
  navContainer.appendChild(box);

  // Insert <hr> before Dayroll and <hr> before Dark Hour
  const hr1 = document.createElement("hr");
  hr1.style.borderColor = "#631E0260";
  hr1.style.borderStyle = "ridge";
  hr1.style.borderWidth = "2px 0 0 0";
  box.insertBefore(hr1, drEl);
  const hr2 = document.createElement("hr");
  hr2.style.borderColor = "#631E0260";
  hr2.style.borderStyle = "ridge";
  hr2.style.borderWidth = "2px 0 0 0";
  box.insertBefore(hr2, dhEl);

  // — Update Loop —
  (function update() {
    const now = new Date();
    const srvNow = getServerDate();
    srvEl.textContent = `Server Time: ${fmtDate(srvNow, true)}`;
    locEl.textContent = `Local Time: ${fmtDate(now, false)}`;
    utcEl.textContent = `UTC Time: ${fmtDate(now, true)}`;

    const nextDH = getNextDarkHour();
    // Format Dark Hour as XX AM/PM or XX:00 H
    const dhTime = nextDH ? fmtDate(nextDH, true, false) : "—";
    dhEl.textContent = nextDH ? `Next Dark Hour: ${dhTime.replaceAll(":00", "")}      \nNDH Countdown: ${msToHMS(nextDH - srvNow)}   ` : `Next Dark Hour: —`;

    const nextDR = getNextDayroll();
    drEl.textContent = `Dayroll in: ${msToHMS(nextDR - srvNow)}   `;

    setTimeout(update, 1000);
  })();
})();
