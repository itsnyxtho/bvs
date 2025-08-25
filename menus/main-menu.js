// @ts-nocheck
// ==UserScript==
// @name         BvS Menu Bar Facelift
// @namespace    BvS
// @version      0.0.4
// @description  Combines and styles BvS minimenu into grouped, collapsible, persistent buttons with hide support per section and screen
// @include      http*://*animecubed*/billy/bvs/*
// @exclude      http*://*animecubed*/billy/bvs/zombjasonar.html
// @exclude      http*://*animecubed*/billy/bvs/loop.html
// @icon         https://github.com/itsnyxtho/bvs/blob/main/other/images/anime_cubed-icon.png?raw=true
// @grant        none
// ==/UserScript==

(function () {
  const menuTables = [...document.querySelectorAll(".minimenu, .minimenub")];
  if (menuTables.length === 0) return;

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
    sectionsOrder: ["Root", "Settings", "Daily", "Village", "Items", "Combat", "Games", "Pets", "BvS", "Other", "Links", "Hidden"], // Order of sections in the menu
    // TOP LEVEL
    "minimenu-main": { section: "Root", order: 1 }, // Main Page
    "minimenu-village": { section: "Root", order: 2 }, // Village
    "minimenu-party-house": { section: "Root", order: 3 }, // Party House
    "minimenu-team": { section: "Root", order: 4 }, // Team
    "minimenu-missions": { section: "Root", order: 5 }, // Missions
    "minimenu-quests": { section: "Root", order: 6 }, // Quests
    "btn-trophy-room": { section: "Root", order: 7 }, // Trophy Room
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

  // Styles
  const style = document.createElement("style");
  style.textContent = `
    .bvs-nav-body::-webkit-scrollbar {
      display: none; /* Hides the scrollbar */
    }
    .bvs-nav-body {
      scrollbar-width: none; /* Hides the scrollbar for Firefox */
      -ms-overflow-style: none; /* Hides the scrollbar for IE and Edge */
    }
  `;
  document.head.appendChild(style);

  let topContainer = document.getElementById("container");
  if (topContainer) {
    topContainer.style.height = "100%";
    topContainer.style.width = "100%";
  }

  // -STR- Styling Helper Functions -----
  function getSectionBg(section) {
    switch ((section || "Root").toLowerCase()) {
      case "games":
        return `url("/billy/layout/scrollteal.jpg")`;
      case "special":
        return `url("/billy/layout/scrolldark.jpg")`;
      case "root":
        return `url("/billy/layout/scrolldark2.jpg")`;
      default:
        return `url("/billy/layout/scrollbg.jpg")`;
    }
  }

  function getSectionColor(section) {
    switch ((section || "Root").toLowerCase()) {
      case "games":
      case "special":
      case "root":
        return "#fff";
      default:
        return "#121212";
    }
  }
  // -END- Styling Helper Functions -----

  // -STR- Additional Buttons Handling -----
  // Additional forms to be added as buttons to the menu, section Daily, if they exist on the current page.
  const additionalDailyFormsNames = ["videochallenge", "givefood", "bonusget"];

  // These forms are not included in the customButtons array because they require special handling:
  // - Video Challenge: Button text is to be "CATS!". Requires the `videoroll` input to be set to "yes" before submission.
  // - Give Food: Button text is to be "FOOD!". Requires the page `https://thehungersite.greatergood.com/clicktogive/ths/home` to be opened in a new tab
  //   before submission.
  // - Bonus Get: Button text is to be "CODE!". Requires a code from `https://www.animecubed.com/index.shtml` to be extracted and set in the `bonusget` input field
  //   Code is parsed from text `Billy Vs. SNAKEMAN Bonus Code: #####`, found on the index page.

  // Video Challenge Answer
  const videoChallengeAnswer = "yes";

  // Give Food URL
  const foodURL = `https://thehungersite.greatergood.com/clicktogive/ths/home`;

  // Code URL
  const codeURL = `https://www.animecubed.com/index.shtml`;

  // Function to extract the bonus code from the index page through a proxy url.
  let retries = 0;
  const maxRetries = 3;
  const fetchBonusCode = async () => {
    const proxyUrl = "https://api.allorigins.win/raw?url=" + encodeURIComponent(codeURL);

    fetch(proxyUrl)
      .then((response) => response.text())
      .then((html) => {
        const match = html.match(/Billy Vs\. SNAKEMAN Bonus Code:\s*(\d+)/i);
        if (match) {
          window.open(codeURL, "_blank");
          const inputField = document.querySelector('input[name="bonusget"]');
          inputField.value = match[1];
          document.bonusget.submit();
        } else {
          console.log("Bonus Code not found. Trying again...");
          // Retry if the code is not found, maximum of 3 retries.
          if (retries < maxRetries) {
            retries++;
            setTimeout(fetchBonusCode, 3000);
          } else {
            console.log("Max retries reached. Giving up.");
          }
        }
      })
      .catch(console.error);
  };

  // Iterate through additionalDailyFormsNames to create a <div> that contains the three buttons in a row. This <div> is then added to the start of the daily section.
  const additionalDailyButtons = () => {
    const dailySection = document.getElementById("sectionDailyBtnWrapper");
    if (!dailySection) return;

    const buttonContainer = document.createElement("div");
    buttonContainer.style.display = "flex";

    additionalDailyFormsNames.forEach((formName) => {
      const form = document.forms[formName];
      if (!form) return;

      const button = document.createElement("button");
      button.textContent = formName === "videochallenge" ? "CATS!" : formName === "givefood" ? "FOOD!" : "CODE!";

      button.id = formName === "videochallenge" ? "videoChallengeBtn" : formName === "givefood" ? "giveFoodBtn" : "bonusGetBtn";
      button.type = "button";
      button.style.width = "100%";
      button.style.height = "24px";
      button.style.padding = "4px 8px";
      button.style.background = `${getSectionBg("special")} no-repeat center center`;
      button.style.backgroundSize = "cover";
      button.style.fontSize = "10px";
      button.style.fontFamily = "Verdana, sans-serif";
      button.style.textAlign = "center";
      button.style.border = "none";
      button.style.borderRight = formName === "videochallenge" || formName === "givefood" ? "1px solid #631E02" : "none";
      button.style.borderBottom = "1px solid #631E02";
      button.style.color = getSectionColor("special");
      button.style.position = "relative";
      button.style.fontWeight = "bold";
      button.style.cursor = "pointer";

      if (formName === "videochallenge") {
        // Set the input value to 'yes' before submitting
        button.addEventListener("click", () => {
          form.videoroll.value = videoChallengeAnswer;
          form.submit();
        });
      } else if (formName === "givefood") {
        // Open the food URL in a new tab before submitting
        button.addEventListener("click", () => {
          window.open(foodURL, "_blank");
          form.submit();
        });
      } else if (formName === "bonusget") {
        // Fetch the bonus code and submit the form
        fetchBonusCode();
      }

      buttonContainer.appendChild(button);
    });

    dailySection.insertBefore(buttonContainer, dailySection.firstChild);
  };
  // - END - Additional Buttons Handling -----

  const STORAGE_KEY = "bvs-menu-hidden";
  const COLLAPSE_KEY = "bvs-menu-collapsed";
  const SIDE_KEY = "bvs-nav-side";
  const VISIBLE_KEY = "bvs-nav-visible";

  if (!localStorage.getItem(COLLAPSE_KEY)) {
    const initialCollapsed = ["sectionSettings", "sectionDaily", "sectionVillage", "sectionItems", "sectionCombat", "sectionGames", "sectionPets", "sectionBvS", "sectionOther", "sectionLinks", "sectionHidden"];
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
    headerRow.id = sectionId;
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
    bodyRow.id = `${sectionId}Body`;
    const bodyCell = document.createElement("td");
    bodyCell.colSpan = 2;
    bodyCell.style.padding = "0";
    bodyCell.style.transition = "height 0.3s ease";
    bodyCell.style.overflow = "hidden";

    const wrapper = document.createElement("div");
    wrapper.id = `${sectionId}BtnWrapper`;
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

  function renderButtons(buttons, unifiedForm) {
    const grouped = groupButtonsBySection(buttons);

    const buttonTable = document.createElement("table");
    buttonTable.style.borderCollapse = "collapse";
    buttonTable.style.width = "100%";
    const tbody = document.createElement("tbody");
    buttonTable.appendChild(tbody);

    for (const section of sectionMap.sectionsOrder) {
      const group = grouped[section];
      if (!group) continue;

      const sectionId = `section${section}`;
      const collapsed = collapsedSections.has(sectionId);
      const visibleButtons = group.filter((btn) => !hiddenButtons.has(btn.id));
      const hiddenGroup = group.filter((btn) => hiddenButtons.has(btn.id));
      if (visibleButtons.length === 0 && hiddenGroup.length === 0) continue;

      if (section === "Root") {
        renderRootButtons(visibleButtons, tbody, unifiedForm, buttons);
        continue;
      }

      const buttonRows = renderSectionButtons(visibleButtons, unifiedForm, buttons);
      const { headerRow, bodyRow } = createSectionRow(section, sectionId, collapsed, buttonRows);
      tbody.appendChild(headerRow);
      tbody.appendChild(bodyRow);
    }

    // Remove only old button table, preserve base hidden fields
    const oldTable = unifiedForm.querySelector("table");
    if (oldTable) oldTable.remove();
    unifiedForm.appendChild(buttonTable);
  }

  function groupButtonsBySection(buttons) {
    const existingIds = new Set();
    const grouped = {};
    for (const btn of buttons) {
      if (existingIds.has(btn.id)) continue;
      existingIds.add(btn.id);
      if (!grouped[btn.section]) grouped[btn.section] = [];
      grouped[btn.section].push(btn);
    }
    return grouped;
  }

  function renderRootButtons(visibleButtons, tbody, unifiedForm, allButtons) {
    for (const btn of visibleButtons) {
      if (document.getElementById(btn.id)) continue;

      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.style.padding = "0";

      const button = createButtonElement(btn, unifiedForm, allButtons, getSectionBg(btn.section), getSectionColor(btn.section));
      cell.appendChild(button);
      row.appendChild(cell);
      tbody.appendChild(row);
    }
  }

  function renderSectionButtons(visibleButtons, unifiedForm, allButtons) {
    const buttonRows = [];
    for (const btn of visibleButtons) {
      if (document.getElementById(btn.id)) continue;

      const row = document.createElement("div");
      const button = createButtonElement(btn, unifiedForm, allButtons, getSectionBg(btn.section), getSectionColor(btn.section));
      row.appendChild(button);
      buttonRows.push(row);
    }
    return buttonRows;
  }

  function createButtonElement(btn, unifiedForm, allButtons, bg, textColor) {
    const button = document.createElement("button");
    button.id = btn.id;
    button.type = "button";
    button.style.width = "100%";
    button.style.height = "24px";
    button.style.padding = "4px 8px";
    button.style.background = `${bg} no-repeat center center`;
    button.style.backgroundSize = "cover";
    button.style.fontSize = "10px";
    button.style.fontFamily = "Verdana, sans-serif";
    button.style.textAlign = "left";
    button.style.border = "none";
    button.style.borderBottom = "1px solid #631E02";
    button.style.color = textColor;
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
    hideBtn.style.color = textColor;
    hideBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      hiddenButtons.add(btn.id);
      saveState();
      renderButtons(allButtons, unifiedForm);
    });
    button.appendChild(hideBtn);

    return button;
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
    section: sectionMap[btn.id]?.section || btn.section || "Root",
    order: sectionMap[btn.id]?.order || btn.order || 0,
  }));

  // === 🔀 filter + merge ===
  const filteredMenuItems = menuItems.filter((item) => !normalizedCustomButtons.some((c) => c.label === item.label && c.action === item.action));
  const allButtons = [...filteredMenuItems, ...normalizedCustomButtons].map((btn) => ({
    ...btn,
    section: sectionMap[btn.id]?.section || btn.section || "Root",
    order: sectionMap[btn.id]?.order || btn.order || 0,
  }));

  // Restore stored states
  let side = localStorage.getItem(SIDE_KEY) === "1";
  let isVisible = localStorage.getItem(VISIBLE_KEY) !== "0";

  // Get Elements
  let outerWrapper = document.getElementById("wrapper") || document.body;

  const navContainerConfig = {
    defaults: {
      position: "sticky",
      boxSizing: "border-box",
      background: "#111",
      border: "1px solid #631E02",
      borderTop: "none",
      borderBottom: "none",
      fontFamily: "Verdana, sans-serif",
      fontSize: "12px",
      color: "#fff",
      height: "100vh",
      width: "192px",
      gridColumn: "2",
      gridRow: "1",
      overflow: "hidden auto",
      display: "grid",
      gridTemplateRows: "auto 1fr max-content",
    },
    collapsed: {
      height: "35px",
      position: "absolute",
      overflow: "hidden",
      gridTemplateRows: "35px 0 0",
    },
    left: {
      top: "0px",
      left: "0px",
    },
    right: {
      top: "0px",
      right: "0px",
    },
  };
  navContainerConfig.left = {
    gridColumn: "1",
  };
  navContainerConfig.right = {
    gridColumn: "2",
  };

  const headerBoxConfig = {
    background: "#300",
    padding: "4px 8px",
    userSelect: "none",
    display: "grid",
    gridTemplateColumns: "1fr 25px 25px 25px",
    gridTemplateRows: "1fr",
    gap: "2px",
    alignItems: "center",
    alignContent: "center",
    justifyContent: "center",
    justifyItems: "center",
  };

  const navButtonConfig = {
    defaults: {
      border: "none",
      background: "#ffffff1a",
      borderRadius: "4px",
      marginLeft: "8px",
      padding: "0",
      fontSize: "14px",
      width: "25px",
      height: "25px",
      fontWeight: "900",
      cursor: "pointer",
    },
    resetButton: {
      title: "Reset Navigation",
      textContent: "🔄",
    },
    hideButton: {
      show: {
        textContent: "👁️",
        title: "Show Navigation",
      },
      hide: {
        textContent: "⛔",
        title: "Hide Navigation",
      },
    },
    switchButton: {
      left: {
        textContent: "⏭️",
        title: "Switch Navigation to the Right Side",
      },
      right: {
        textContent: "⏮️",
        title: "Switch Navigation to the Left Side",
      },
    },
  };

  const navBodyConfig = {};

  const outerWrapperConfig = {
    defaults: {
      display: "grid",
      height: "100vh",
      width: "100vw",
      overflow: "hidden",
      margin: "0",
      padding: "0",
    },
    collapsed: {
      gridTemplateColumns: "1fr",
    },
    left: {
      gridTemplateColumns: "1fr " + navContainerConfig.defaults.width,
    },
    right: {
      gridTemplateColumns: navContainerConfig.defaults.width + " 1fr",
    },
  };

  // === 🧱 create floating panel ===
  const navContainer = document.createElement("div");
  // Apply default styles
  Object.assign(navContainer.style, navContainerConfig.defaults);

  // Hide scrollbars while allowing scrolling in the navigation container
  const navHeader = document.createElement("div");

  // Add Reset Button to Navigation Header
  function createNavHeader() {
    // Create the header container
    const headerBox = document.createElement("div");
    // Apply header styles
    Object.assign(headerBox.style, headerBoxConfig);

    // Add a title to the header
    const headerText = document.createElement("span");
    headerText.textContent = "Navigation";
    headerText.style.width = "100%";
    headerText.style.fontWeight = "900";
    headerText.style.fontVariant = "small-caps";
    headerBox.appendChild(headerText);

    // Add a Reset button to the header
    const resetButton = document.createElement("button");
    // Apply button defaults
    Object.assign(resetButton.style, navButtonConfig.defaults);

    // Apply reset button defaults
    Object.assign(resetButton, navButtonConfig.resetButton);

    resetButton.addEventListener("click", (e) => {
      e.stopPropagation();
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(COLLAPSE_KEY);
      localStorage.removeItem(SIDE_KEY);
      localStorage.removeItem(VISIBLE_KEY);
      location.reload();
    });

    // Add a Hide button to the header
    const hideButton = document.createElement("button");

    // Apply button defaults
    Object.assign(hideButton.style, navButtonConfig.defaults);

    // Add a Switch Sides button to the header
    const switchSides = document.createElement("button");

    // Function to toggle visibility
    const toggleVisibility = (show) => {
      show = show !== undefined ? show : true;
      if (!show) {
        switchSides.disabled = true;
        switchSides.style.cursor = "not-allowed";

        // Apply hide defaults
        Object.assign(hideButton, navButtonConfig.hideButton.show);

        // Apply collapsed styles
        Object.assign(navContainer.style, navContainerConfig.collapsed);
        Object.assign(outerWrapper.style, outerWrapperConfig.collapsed);

        // Apply side
        if (side) {
          Object.assign(navContainer.style, navContainerConfig.right);
        } else {
          Object.assign(navContainer.style, navContainerConfig.left);
        }
      } else {
        switchSides.disabled = false;
        switchSides.style.cursor = "pointer";

        // Apply show defaults
        Object.assign(hideButton, navButtonConfig.hideButton.hide);

        // Restore styles
        Object.assign(navContainer.style, navContainerConfig.defaults);

        // Restore side
        if (side) {
          Object.assign(navContainer.style, navContainerConfig.right);
          Object.assign(outerWrapper.style, outerWrapperConfig.left);
        } else {
          Object.assign(navContainer.style, navContainerConfig.left);
          Object.assign(outerWrapper.style, outerWrapperConfig.right);
        }
      }
    };

    // Set initial visibility based on localStorage
    toggleVisibility(isVisible);

    hideButton.addEventListener("click", (e) => {
      e.stopPropagation();

      // Toggle visibility
      const isCurrentlyVisible = navContainer.style.height === "100vh";
      toggleVisibility(!isCurrentlyVisible);

      // Store the visibility state in localStorage
      localStorage.setItem("bvs-nav-visible", navContainer.style.height === "100vh" ? "1" : "0");
    });

    // Apply button defaults
    Object.assign(switchSides.style, navButtonConfig.defaults);

    const switchSidesHandler = (toSide) => {
      toSide = toSide !== undefined ? toSide : side || false;
      if (!toSide) {
        // Apply left side defaults
        Object.assign(switchSides, navButtonConfig.switchButton.left);
        // Restore container for left side
        Object.assign(navContainer.style, navContainerConfig.left);
        // Restore outer wrapper for right side
        Object.assign(outerWrapper.style, outerWrapperConfig.right);
      } else {
        // Apply right side defaults
        Object.assign(switchSides, navButtonConfig.switchButton.right);
        // Restore container for right side
        Object.assign(navContainer.style, navContainerConfig.right);
        // Restore outer wrapper for left side
        Object.assign(outerWrapper.style, outerWrapperConfig.left);
      }
      side = toSide;
    };

    switchSidesHandler(side);

    switchSides.addEventListener("click", (e) => {
      e.stopPropagation();

      let currentSide = localStorage.getItem(SIDE_KEY);
      // Convert to boolean: "1" is true (right), "0" is false (left), fallback to side or false
      if (currentSide === "1") {
        currentSide = true;
      } else if (currentSide === "0") {
        currentSide = false;
      } else {
        currentSide = !!side;
      }

      switchSidesHandler(!currentSide);

      // Store the side in localStorage ("1" for right, "0" for left)
      localStorage.setItem(SIDE_KEY, !currentSide ? "1" : "0");
    });

    // Append elements to the header
    headerBox.appendChild(resetButton);
    headerBox.appendChild(switchSides);
    headerBox.appendChild(hideButton);

    return headerBox;
  }

  navHeader.appendChild(createNavHeader());

  const navBody = document.createElement("div");
  navBody.id = "bvs-nav-body";
  navBody.className = "bvs-nav-body";
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

  if (outerWrapper) {
    outerWrapper.appendChild(navContainer);
    // Apply outer wrapper defaults
    Object.assign(outerWrapper.style, outerWrapperConfig.defaults);
    if (outerWrapper.children.length > 0) {
      outerWrapper.children[0].style.overflow = "auto";
      outerWrapper.children[0].style.height = "100%";
      outerWrapper.children[0].style.width = "100%";
    }
  }

  // Get and append the additional daily buttons
  additionalDailyButtons();

  // ----- CLOCK BOX SECTION -----
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
  function two00(n) {
    return n < 10 ? "0" + n : "" + n;
  }
  function two_(n) {
    return n < 10 ? " " + n : "" + n;
  }

  // — Format milliseconds to HH:MM:SS —
  function msToHMS(ms) {
    let s = Math.max(0, Math.ceil(ms / 1000));
    const h = Math.floor(s / 3600);
    s %= 3600;
    const m = Math.floor(s / 60);
    s %= 60;
    return `${two_(h)}:${two00(m)}:${two00(s)}`;
  }

  // — Format Date to HH:MM:SS with optional 24h/12h format —
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
      return `${two00(H)}:${two00(M)}:${two00(S)} H `;
    } else {
      const suffix = H >= 12 ? "PM" : "AM";
      const h12 = H % 12 || 12;
      return `${two_(h12)}:${two00(M)}:${two00(S)} ${suffix}`;
    }
  }

  // — Compute “now” in BvS server time (UTC−05:00) —
  function getServerDate() {
    const now = new Date();
    const utcMs = now.getTime();
    return utcMs - 5 * 3600000;
  }

  // - Get is24 preference from localStorage or default to false -
  is24 = localStorage.getItem("bvs-clock-24h") === "1";

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

  // — Get next Dark Hour from tokens —
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
  box.addEventListener("click", () => {
    is24 = !is24;
    // Save the preference in localStorage
    localStorage.setItem("bvs-clock-24h", is24 ? "1" : "0");
  });

  // - Append the Clock Box to the Navigation Container -
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

  // — Clock Update Loop —
  (function update() {
    const now = new Date();
    const srvNow = getServerDate();
    srvEl.textContent = `   Server Time:  ${fmtDate(srvNow, true)}`;
    locEl.textContent = `    Local Time:  ${fmtDate(now, false)}`;
    utcEl.textContent = `      UTC Time:  ${fmtDate(now, true)}`;

    const nextDH = getNextDarkHour();
    // Format Dark Hour as XX AM/PM or XX:00 H
    const dhTime = nextDH ? fmtDate(nextDH, true, false) : "—";
    dhEl.textContent = nextDH ? `Next Dark Hour:  ${dhTime.replaceAll(":00", "")}\n        NDH in:  ${msToHMS(nextDH - srvNow)}` : `Next Dark Hour:  —`;

    const nextDR = getNextDayroll();
    drEl.textContent = `    Dayroll in:  ${msToHMS(nextDR - srvNow)}   `;

    setTimeout(update, 1000);
  })();
  // -END- CLOCK BOX SECTION -----
})();
