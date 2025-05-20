// @ts-nocheck
// partyHouseMenu()
(() => {
  "use strict";

  // Get username and password elements.
  const usernameElement = document.querySelector('input[name="player"]');
  const passwordElement = document.querySelector('input[name="pwd"]');
  if (!usernameElement || !passwordElement) {
    console.error("Username or password not found.");
    return;
  }
  const username = usernameElement.value;
  const password = passwordElement.value;

  // Get the menu container by class name "phminimenu".
  const menuContainers = document.querySelectorAll(".phminimenu");
  if (!menuContainers.length > 0) {
    console.error("Menu container for Party House menu not found. Nothing to do here.");
    return;
  }

  // Initialize variables.
  const action = "/billy/bvs/partyhouse.html";
  const menuContainer = menuContainers[0];

  // Set properties of the menu container (table).
  menuContainer.id = "phminimenu";
  menuContainer.className = "ph-minimenu--table";
  menuContainer.removeAttribute("style");

  // Add styling CSS to the page.
  try {
    const css = GM_getResourceText("css");
    GM_addStyle(css);
  } catch (error) {
    console.error("Error adding CSS:", error);
  }

  // Define menu elements.
  const menuElements = [];
  const gameplayedIcons = {
    hintline: "🕿",
    juice: "🍹",
    loser: "🥈",
    wheel: "ⴲ",
    jackpot: "🎰",
    lottery: "💸",
    bigboard: "🏹",
    scratch: "🪙",
    darts: "🎯",
    party: "🎉",
    crane: "🧸",
    over11: "⑪",
    snake: "🪆",
    roulette: "⛁",
    mahjong: "🀄",
    superfail: "🎲",
    keno: "▦",
    hanafuda: "🎴",
    pachinko: "⚪",
  };

  // Get all gameplayed values from the page.
  const gameplayedElements = document.querySelectorAll('input[name="game_played"]');
  const gameplayedValues = Array.from(gameplayedElements).map((el) => el.value);
  const gameplayedSet = new Set(gameplayedValues);
  const gameplayedArray = Array.from(gameplayedSet);

  // Add a menu element for each game where "label" is the inner text of the input element's <a> sibling and "id" is the number parsed from the <a> element's href value (i.e., "javascript:document.pminim2.submit();" => id = 2).
  gameplayedElements.forEach((game_played) => {
    const a = game_played.nextElementSibling;
    const id = parseInt(a.href.match(/javascript:document.pminim(\d+).submit/)[1], 10);
    const label = a.innerText;
    let tempObject = { id, label, action, game_played };

    // Check if there are any "extra" hidden inputs in the form.
    const form = game_played.closest("form");
    const hiddenInputs = form.querySelectorAll('input[type="hidden"]');
    hiddenInputs.forEach((input) => {
      const name = input.name;
      const value = input.value;
      if (name !== "player" && name !== "pwd" && name !== "game_played") {
        tempObject[name] = value;
      }
    });
    menuElements.push(tempObject);
  });

  // Sort menu elements by id.
  menuElements.sort((a, b) => a.id - b.id);

  // Log the menu elements to the console.
  console.log("Generating Menu Elements:\n", menuElements);

  // Define menu template.
  const inputTemplate = `<input type="hidden" name="{{name}}" value="{{value}}">`;
  const usernameInput = inputTemplate.replace("{{name}}", "player").replace("{{value}}", username);
  const passwordInput = inputTemplate.replace("{{name}}", "pwd").replace("{{value}}", password);
  const gamePlayInput = inputTemplate.replace("{{name}}", "game_played").replace("{{value}}", "{{game_played}}");
  const menuForm = `
  <td class="ph-minimenu--cell minimenut">
    <form method="post" name="pminim{{#}}" action="${action}">
      ${usernameInput}
      ${passwordInput}
      ${gamePlayInput}
      {{extra}}
      <input type="submit" class="ph-minimenu--button" value="{{label}}">
    </form>
  </td>`;

  // Remove the old menu elements and extra menu tables.
  for (let table of menuContainers) {
    if (table.id !== "phminimenu") {
      table.remove();
    }
  }

  const menuContainerRow = menuContainer.querySelector("tr");
  if (menuContainerRow) {
    menuContainerRow.remove();
  }

  // Create a new row for the menu elements.
  const newRow = document.createElement("tr");
  newRow.className = "ph-minimenu--row";
  menuContainer.appendChild(newRow);

  // Create new menu elements an₫ add them to the menu container.
  menuElements.forEach((menuElement) => {
    const { id, label, game_played, ...extraInputs } = menuElement;
    const extraInputsHTML = Object.entries(extraInputs)
      .map(([name, value]) => inputTemplate.replace("{{name}}", name).replace("{{value}}", value))
      .join("");
    const menuItemHTML = menuForm.replace("{{#}}", id).replace("{{label}}", label).replace("{{game_played}}", game_played.value).replace("{{extra}}", extraInputsHTML);
    newRow.insertAdjacentHTML("beforeend", menuItemHTML);
  });

  // If there is a "bvsOptionsBox" element, add a Party House section to it.
  const optionsBox = document.getElementById("bvsOptionsBox");
  if (optionsBox) {
    const partyHouseSection = document.createElement("div");
    partyHouseSection.id = "partyHouseOptions";
    partyHouseSection.innerHTML = `<h3>Party House Options</h3>`;
    partyHouseSection.style = "display: flex; flex-wrap: wrap; gap: 4px;";

    // Add a form to the Party House section.
    const partyHouseForm = document.createElement("form");
    partyHouseForm.style = "display: flex; flex-wrap: wrap; gap: 4px;";
    partyHouseForm.method = "post";
    partyHouseForm.name = "partyHouseForm";
    partyHouseForm.action = action;
    partyHouseForm.innerHTML = `
      ${usernameInput}
      ${passwordInput}
      ${gamePlayInput}
    `;

    // For each menu element, add a 32x32 button to the Party House form with an onclick event that sets the game_played value and submits the form and the text is from the gameplayedIcons object.
    gameplayedArray.forEach((game_played) => {
      const gamePlayedValue = game_played;
      const icon = gameplayedIcons[game_played] || "❓";
      const button = document.createElement("button");
      button.type = "button";
      button.style = "height: 32px; width: 32px; "
      button.className = "partyHouseButton";
      button.innerHTML = `${icon}`;
      button.onclick = () => {
        partyHouseForm.querySelector('input[name="game_played"]').value = gamePlayedValue;
        partyHouseForm.submit();
      };
      partyHouseForm.appendChild(button);
    });
    partyHouseSection.appendChild(partyHouseForm);

    optionsBox.appendChild(partyHouseSection);
  }
})();
