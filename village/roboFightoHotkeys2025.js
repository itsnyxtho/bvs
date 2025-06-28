// ==UserScript==
// @name         BvS ROBO FIGHTO Hotkeys (2025)
// @namespace    bvs
// @version      1.0.0
// @description  Hotkeys for ROBO FIGHTO.
// @author       itsnyxtho
// @include      http*://*animecubed*/billy/bvs/villagerobofighto.html
// @icon         https://github.com/itsnyxtho/bvs/blob/main/other/images/anime_cubed-icon.png?raw=true
// @grant        none
// ==/UserScript==

// Register hotkeys for Hotkey Reference Box
(function registerHotkeys() {
  const HOTKEY_STORAGE_KEY = "bvs-hotkeys_robofighto";

  const hotkeys = [
    { keyCombination: "Enter / E", description: "Submit 'enterfight' form", ownerScript: "BvS ROBO FIGHTO Hotkeys" },
    { keyCombination: "Q / V", description: "Submit 'govillage' form", ownerScript: "BvS ROBO FIGHTO Hotkeys" },
    { keyCombination: "C", description: "Submit 'popchat' form", ownerScript: "BvS ROBO FIGHTO Hotkeys" },
    { keyCombination: "P / D", description: "Submit 'top(p|n)pushfight#' form", ownerScript: "BvS ROBO FIGHTO Hotkeys" },
    { keyCombination: "W", description: "Toggle or submit 'wipetournies'", ownerScript: "BvS ROBO FIGHTO Hotkeys" },
    { keyCombination: "Shift + L", description: "Toggle 'lockconfirm' checkbox", ownerScript: "BvS ROBO FIGHTO Hotkeys" },
    { keyCombination: "Ctrl + L", description: "Submit 'clockfight#' form", ownerScript: "BvS ROBO FIGHTO Hotkeys" },
    { keyCombination: "Ctrl + Shift + L", description: "Toggle and submit 'clockfight#'", ownerScript: "BvS ROBO FIGHTO Hotkeys" },
    { keyCombination: "Shift + U", description: "Toggle 'unlockconfirm' checkbox", ownerScript: "BvS ROBO FIGHTO Hotkeys" },
    { keyCombination: "Ctrl + U", description: "Submit 'cunlockfight#' form", ownerScript: "BvS ROBO FIGHTO Hotkeys" },
    { keyCombination: "Ctrl + Shift + U", description: "Toggle and submit 'cunlockfight#'", ownerScript: "BvS ROBO FIGHTO Hotkeys" },
    { keyCombination: "1–0", description: "Select tournament radio [1–10]", ownerScript: "BvS ROBO FIGHTO Hotkeys" },
    { keyCombination: "Shift/Ctrl/Alt + 1–0", description: "Select extended tournament radios", ownerScript: "BvS ROBO FIGHTO Hotkeys" },
    { keyCombination: "# + (U / L / P)", description: "Submit unlock/lock/push fight for radio value", ownerScript: "BvS ROBO FIGHTO Hotkeys" },
    { keyCombination: "Shift + H", description: "Toggle Tournament Hotkey Help Box", ownerScript: "BvS ROBO FIGHTO Hotkeys" },
  ];

  localStorage.setItem(
    HOTKEY_STORAGE_KEY,
    JSON.stringify({
      locations: {
        include: ["http*://*animecubed*/billy/bvs/villagerobofighto.html"],
        exclude: [],
      },
      hotkeys,
    }),
  );
})();

(() => {
  const referenceBoxId = "tourney-hotkey-help";
  let wipeArmed = false;
  let wipeReady = false;
  let hotkeyChain = null;

  function getForm(name) {
    return document.forms.namedItem(name);
  }

  function submitForm(name) {
    const form = getForm(name);
    if (form) form.submit();
  }

  function findFormStartingWith(prefix) {
    return Array.from(document.forms).find((f) => f.name?.startsWith(prefix));
  }

  function getTournamentRadios(includeDisabled = false) {
    return Array.from(document.querySelectorAll(`input[type="radio"][name="entry_id"]${includeDisabled ? "" : ":not([disabled])"}`));
  }

  function selectTournamentByValue(value) {
    const radios = getTournamentRadios();
    const match = radios.find((r) => r.value == value);
    if (match) {
      match.checked = true;
      console.log(`[Hotkey] Selected tournament radio value ${value}`);
    }
  }

  function formatHotkeyLabel(value) {
    if (value <= 10) {
      return `[ ${value === 10 ? 0 : value} ]`;
    }
    const base = ((value - 1) % 10) + 1;
    if (value <= 20) return `[Shift + ${base}]`;
    if (value <= 30) return `[Ctrl + ${base}]`;
    return `[Alt + ${base}]`;
  }

  function getTournamentLabel(value) {
    const radio = document.querySelector(`input[type="radio"][name="entry_id"][value="${value}"]`);
    if (!radio) return null;
    const tr = radio.closest("tr");
    const label = tr?.querySelectorAll("td")[1]?.querySelector("b")?.innerText?.trim() || "Unknown";
    const cost = tr?.querySelectorAll("td")[6]?.innerText?.trim() || "???";
    return `${label} (${cost} Ryo)`;
  }

  function showHelpBox() {
    if (document.getElementById(referenceBoxId)) return;

    const box = document.createElement("div");
    box.id = referenceBoxId;
    box.style = `
      position: fixed;
      bottom: 10px;
      left: 10px;
      background: black;
      color: white;
      border: 2px solid red;
      font-family: monospace;
      padding: 10px;
      z-index: 9999;
      border-radius: 6px;
      white-space: pre-wrap;
      max-width: 600px;
      line-height: 1.4;
    `;

    const hotkeyLines = [
      "BvS Tournament Hotkeys – Quick Ref",
      "",
      "[Enter] or [E] – Submit 'enterfight'",
      "[Q] or [V] – Go to village",
      "[C] – Open chat",
      "[P] or [D] – Submit first 'toppushfight#' or 'topnewfight#' form",
      "[W] – Toggle wipetournies, press again after 1s to submit",
      "[Shift + L] – Toggle 'lockconfirm' checkbox",
      "[Ctrl + L] – Submit 'clockfight#' form",
      "[Ctrl + Shift + L] – Toggle and submit 'clockfight#'",
      "[Shift + U] – Toggle 'unlockconfirm' checkbox",
      "[Ctrl + U] – Submit 'cunlockfight#' form",
      "[Ctrl + Shift + U] – Toggle and submit 'cunlockfight#'",
      "",
      "Tournament Entry Hotkeys:",
    ];

    const enabledRadios = getTournamentRadios();
    for (let i = 1; i <= 40; i++) {
      const radio = enabledRadios.find((r) => parseInt(r.value) === i);
      if (!radio) continue;

      const label = getTournamentLabel(i);
      if (!label) continue;

      hotkeyLines.push(`${formatHotkeyLabel(i)} – ${label}`);
    }

    hotkeyLines.push("", "Lock / Unlock / Push Hotkeys:");
    for (let i = 1; i <= 40; i++) {
      const unlock = getForm(`unlockfight${i}`);
      const lock = getForm(`lockfight${i}`);
      const push = getForm(`pushfight${i}`);

      if (unlock || lock || push) {
        const base = formatHotkeyLabel(i);
        const label = getTournamentLabel(i) || "(unknown tournament)";
        const lines = [];

        if (unlock) lines.push(`→ Unlockfight: [${i}U] or [${i}X]`);
        if (lock && !unlock) lines.push(`→ Lockfight: [${i}L] or [${i}S]`);
        if (push && !unlock) lines.push(`→ Pushfight: [${i}P] or [${i}D]`);

        if (lines.length) {
          hotkeyLines.push(`${base} – ${label}`);
          lines.forEach((l) => hotkeyLines.push(`   ${l}`));
        }
      }
    }

    box.innerText = hotkeyLines.join("\n");
    document.body.appendChild(box);
  }

  function toggleHelpBox() {
    const box = document.getElementById(referenceBoxId);
    if (box) {
      box.remove();
    } else {
      showHelpBox();
    }
  }

  function handleWipetournies() {
    const form = getForm("wipetournies");
    if (!form) return;

    const checkbox = form.querySelector('input[type="checkbox"][name="wipetournies"]');
    if (!checkbox) return;

    if (!wipeArmed) {
      checkbox.checked = true;
      wipeArmed = true;
      wipeReady = false;
      setTimeout(() => (wipeReady = true), 1000);
    } else if (wipeReady) {
      form.submit();
      wipeArmed = false;
      wipeReady = false;
    } else {
      console.log("[wipetournies] Press again after 1s to submit.");
    }
  }

  const baseKeyMap = {
    49: 1,
    50: 2,
    51: 3,
    52: 4,
    53: 5,
    54: 6,
    55: 7,
    56: 8,
    57: 9,
    48: 10,
  };

  document.addEventListener("keydown", (event) => {
    if (event.shiftKey && event.keyCode === 72) {
      event.preventDefault();
      toggleHelpBox();
      return;
    }

    if (event.keyCode === 13 || event.keyCode === 69) {
      event.preventDefault();
      submitForm("enterfight");
      console.log("[Hotkey] Submitted form: enterfight");
      return;
    }

    if (event.keyCode === 81 || event.keyCode === 86) {
      event.preventDefault();
      submitForm("govillage");
      console.log("[Hotkey] Submitted form: govillage");
      return;
    }

    if (event.keyCode === 67) {
      event.preventDefault();
      submitForm("popchat");
      console.log("[Hotkey] Submitted form: popchat");
      return;
    }

    if (event.keyCode === 87) {
      event.preventDefault();
      handleWipetournies();
      console.log("[Hotkey] Toggled or submitted wipetournies");
      return;
    }

    if (baseKeyMap[event.keyCode]) {
      const value = baseKeyMap[event.keyCode];
      const hotkeyValue = event.ctrlKey ? value + 20 : event.altKey ? value + 30 : event.shiftKey ? value + 10 : value;
      hotkeyChain = hotkeyValue;
      console.log(`[Hotkey] Chain set to value: ${hotkeyChain}`);
      return;
    }
  });

  document.addEventListener("keyup", (event) => {
    if (hotkeyChain != null) {
      const value = hotkeyChain;
      const code = event.keyCode;

      const unlock = getForm(`unlockfight${value}`);
      const lock = getForm(`lockfight${value}`);
      const push = getForm(`pushfight${value}`);

      if ((code === 85 || code === 88) && unlock) {
        unlock.submit();
        console.log(`[Hotkey] Submitted unlockfight${value}`);
      } else if ((code === 76 || code === 83) && lock && !unlock) {
        lock.submit();
        console.log(`[Hotkey] Submitted lockfight${value}`);
      } else if ((code === 80 || code === 68) && push && !unlock) {
        push.submit();
        console.log(`[Hotkey] Submitted pushfight${value}`);
      }

      hotkeyChain = null;
    }

    if (event.keyCode === 80 || event.keyCode === 68) {
      const form = findFormStartingWith("toppushfight") || findFormStartingWith("topnewfight");
      if (form) {
        form.submit();
        console.log("[Hotkey] Submitted top(p|n)pushfight# form");
      }
    }

    if (event.ctrlKey && event.keyCode === 76) {
      const box = document.querySelector('input[type="checkbox"][name="lockconfirm"]');
      if (box && event.shiftKey) box.checked = true;
      const form = findFormStartingWith("clockfight");
      if (form) {
        form.submit();
        console.log("[Hotkey] Submitted clockfight form");
      }
    }

    if (event.ctrlKey && event.keyCode === 85) {
      const box = document.querySelector('input[type="checkbox"][name="unlockconfirm"]');
      if (box && event.shiftKey) box.checked = true;
      const form = findFormStartingWith("cunlockfight");
      if (form) {
        form.submit();
        console.log("[Hotkey] Submitted cunlockfight form");
      }
    }

    if (event.shiftKey && !event.ctrlKey && event.keyCode === 76) {
      const box = document.querySelector('input[type="checkbox"][name="lockconfirm"]');
      if (box) {
        box.checked = !box.checked;
        console.log("[Hotkey] Toggled lockconfirm");
      }
    }

    if (event.shiftKey && !event.ctrlKey && event.keyCode === 85) {
      const box = document.querySelector('input[type="checkbox"][name="unlockconfirm"]');
      if (box) {
        box.checked = !box.checked;
        console.log("[Hotkey] Toggled unlockconfirm");
      }
    }
  });
})();
