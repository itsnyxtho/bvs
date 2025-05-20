// @ts-nocheck
"use strict";
console.info("BvS CSS script loaded.");
if (typeof BvS === "undefined") {
  window.BvS = {};
}

BvS.pageNames = [];
// Include fonts.
let fonts = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Amaranth:ital,wght@0,400;0,700;1,400;1,700&family=Amatic+SC:wght@400;700&family=Amita:wght@400;700&family=Berkshire+Swash&family=Bree+Serif&family=Bungee&family=Bytesized&family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&family=Creepster&family=Crete+Round:ital@0;1&family=Handlee&family=Josefin+Slab:ital,wght@0,100..700;1,100..700&family=Julius+Sans+One&family=Just+Another+Hand&family=Kreon:wght@300..700&family=Leckerli+One&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Permanent+Marker&family=Poiret+One&family=Press+Start+2P&family=Roboto+Mono:ital,wght@0,100..700;1,100..700&family=Roboto:ital,wght@0,100..900;1,100..900&family=Rochester&family=Rock+Salt&family=Sacramento&family=Silkscreen:wght@400;700&family=Six+Caps&family=Special+Elite&family=Titan+One&family=Winky+Sans:ital,wght@0,300..900;1,300..900&display=swap" rel="stylesheet">
  `;

// Append fonts to the document head.
document.head.innerHTML += fonts;

// Create an object to hold the name conversions between attributes and style properties.
let attributeToStyle = {
  bgcolor: "background-color",
  align: "text-align",
  valign: "vertical-align",
  width: "width",
  height: "height",
  cellpadding: "padding",
  cellspacing: "margin",
  border: "border-width",
  color: "color",
  background: "background",
  "background-color": "background-color",
};

const removeUnwantedTagAttributes = (elem) => {
  if (!elem.removeAttribute) return;
  elem.removeAttribute("border");
  elem.removeAttribute("width");
  elem.removeAttribute("height");
  elem.removeAttribute("align");
  elem.removeAttribute("valign");
  elem.removeAttribute("cellpadding");
  elem.removeAttribute("cellspacing");
  elem.removeAttribute("bgcolor");
};

const convertAttributesToStyles = (elem) => {
  // Get all attributes and their values from the element.
  const attributes = Array.from(elem.attributes);
  for (const attr of attributes) {
    // If the attribute is in the attributeToStyle object, convert it to a style property.
    if (attributeToStyle[attr.name]) {
      elem.style[attributeToStyle[attr.name]] = attr.value;

      // If the attribute lacks a unit for width, height, or padding, add "px" to the value.
      if (["width", "height", "padding"].includes(attr.name) && !attr.value.match(/px|%/)) {
        elem.style[attributeToStyle[attr.name]] = `${attr.value}px`;
      }

      // If the value is a url, wrap it in `url()`.
      if (attr.value.match(/^(((\/[^/]+)*\/?)|([a-zA-Z]:\\(?:[^\\:*?"<>|]+\\)*[^\\:*?"<>|]+))$/) && !attr.value.match(/url\(/)) {
        console.log(`Converting ${attr.value} to url() for`, [elem]);
        elem.style[attributeToStyle[attr.name]] = `url(${attr.value})`;
      }

      // Remove the attribute from the element.
      elem.removeAttribute(attr.name);
    }
  }
};

const emptyElementTester = (elem) => {
  if (elem.innerText.trim() === "" && elem.type !== "hidden" && !elem.name && !elem.id && !elem.tagName.match(/(input)|(img)|(a)|(button)/gi) && !elem.innerHTML.match(/(input)|(img)|(a)|(button)/g)) {
    elem.remove();
  }
};

const emptyElementHandler = () => {
  // Find and remove empty elements and elements with src "/billy/layout/blank.gif" or "/layout/skinred/clearspacer.gif"
  const emptyElements = document.querySelectorAll('img[src="/billy/layout/blank.gif"], img[src="/layout/skinred/clearspacer.gif"]');
  for (const elem of emptyElements) {
    elem.remove();
  }
  const allElements = document.querySelectorAll("*");
  for (const elem of allElements) {
    emptyElementTester(elem);
  }
};

const elementHandler = () => {
  const allElements = document.querySelectorAll("*");
  for (const elem of allElements) {
    convertAttributesToStyles(elem);
    removeUnwantedTagAttributes(elem);
  }
};

const bvsCSS = GM_getResourceText("BVS_CSS");
GM_addStyle(bvsCSS);

// Get the player name and password from the page.
const name = document.querySelector('input[name="player"]')?.value;
const pwd = document.querySelector('input[name="pwd"]')?.value;

// If the player name and password are not found, exit the script.
if (!name || !pwd) {
  console.error("Player name or password not found.");
  return;
}

const body = document.body;
const title = document.title;
const pageURL = window.location.href;
const pageName = pageURL.match(/[^\\/]+(?=\.[^\\/]*$)|[^\\/]+$/)[0];
const bvsContainer = document.getElementById("container");
const bvsWrapper = document.getElementById("wrapper");
const container = document.querySelector("center");

console.log({ body, title, pageURL, pageName, bvsContainer, bvsWrapper, container });

if (container) {
  // Give the container a CSS classname.
  container.className = "bvscss--container";

  // Remove style of container's immediate <table> children, and give them a CSS classname.
  let tables = container.children;
  for (const element of tables) {
    let table = element;
    table.removeAttribute("style");
    table.removeAttribute("width");
    table.classList.add("bvscss--container-table");
  }

  // Refactor the menu bar.
  const minimenuHTML = `
    <table id="minimenu-table" class="minimenu-table bvscss--minimenu-table">
      <tbody>
        <tr class="minimenu-row bvscss--minimenu-row">
          ${[
            { label: "Main", action: "/billy/bvs/pages/main.html" },
            { label: "Daily Fail", action: "/billy/bvs/dailyfail.html" },
            { label: "Breakfast Menu", action: "/billy/bvs/breakfast.html" },
            { label: "Trophy Room", action: "/billy/bvs/trophyroom.html" },
            { label: "Themes", action: "/billy/bvs/themesdifficulty.html" },
            { label: "Village", action: "/billy/bvs/village.html", extra: '<input type="hidden" name="showallmess" value="1">' },
            { label: "Party House", action: "/billy/bvs/partyhouse.html" },
            { label: "Shop", action: "/billy/bvs/shop.html" },
            { label: "Retail", action: "/billy/bvs/shop-retail.html" },
            { label: "Truck Loading", action: "/billy/bvs/truckload.html" },
            { label: "Workshop", action: "/billy/bvs/workshop.html" },
            { label: "Consumables", action: "/billy/bvs/oneuseitems.html" },
            { label: "Number One", action: "/billy/bvs/numberone.html", extra: '<input type="hidden" name="playn1" value="1">' },
            { label: "World Kaiju", action: "/billy/bvs/worldkaiju.html" },
            { label: "Missions", action: "/billy/bvs/missionstart.html" },
            { label: "Quests", action: "/billy/bvs/quests.html" },
            { label: "Spar", action: "/billy/bvs/spar.html" },
            { label: "Arena", action: "/billy/bvs/arena.html" },
            { label: "Scuffles", action: "/billy/bvs/wotageddon.html" },
            { label: "Team", action: "/billy/bvs/team.html" },
            { label: "Jutsu", action: "/billy/bvs/jutsu.html" },
            { label: "Summons", action: "/billy/bvs/summon.html" },
            { label: "Bucket", action: "/billy/bvs/bucket.html" },
            { label: "Pets", action: "/billy/bvs/pets.html" },
            { label: "PetVentures", action: "/billy/bvs/petventures.html", name: "petventurebgn", extra: '<input type="hidden" name="petventurego" value="1">' },
            { label: "<i>BillyClub</i>", action: "/billy/bvs/billyclub.html" },
          ]
            .map(
              (item) => `
            <td class="minimenu bvscss--minimenu-cell">
              <form ${item.name ? `name="${item.name}"` : ``} action="${item.action}" method="post">
                <input type="hidden" name="player" value="${name}">
                <input type="hidden" name="pwd" value="${pwd}">
                ${item.extra || ""}
                <button type="submit" class="minimenu bvscss--minimenu">${item.label}</button>
              </form>
            </td>
          `,
            )
            .join("")}
        </tr>
      </tbody>
    </table>
    `;

  const karmaHTML = `
    <form action="karma.html" method="post" style="display:inline">
      <input type="hidden" name="player" value="${name}">
      <input type="hidden" name="pwd" value="${pwd}">
      <button type="submit" class="bvscss--karma">Karma</button>
    </form>
    `;

  const thankYouHTML = `
    <form action="thankyou.html" method="post" style="display:inline">
      <input type="hidden" name="player" value="${name}">
      <input type="hidden" name="pwd" value="${pwd}">
      <button type="submit" class="bvscss--thankyou"><i>ThankYou</i></button>
    </form>
    `;

  // Replace first minimenu with the parsed content
  const oldMenu1 = document.querySelector("table.minimenu");
  if (oldMenu1) {
    let oldMenuCell = oldMenu1.parentElement;
    let oldMenuParentRow = oldMenuCell.parentElement;

    oldMenuCell.classList.add("bvscss--main-container");

    // Remove oldMenuParentRow's previous sibling.
    let oldMenuParentRowPrevSibling = oldMenuParentRow.previousElementSibling;
    if (oldMenuParentRowPrevSibling) {
      oldMenuParentRow.parentElement.removeChild(oldMenuParentRowPrevSibling);
    }

    // Remove oldMenuCell's previous and next sibling.
    let oldMenuCellPrevSibling = oldMenuCell.previousElementSibling;
    let oldMenuCellNextSibling = oldMenuCell.nextElementSibling;
    if (oldMenuCellNextSibling) {
      oldMenuCell.parentElement.removeChild(oldMenuCellNextSibling);
    }
    if (oldMenuCellPrevSibling) {
      oldMenuCell.parentElement.removeChild(oldMenuCellPrevSibling);
    }

    oldMenuParentRow.children[0].removeAttribute("width");
    oldMenuParentRow.children[0].children[0].removeAttribute("width");
    oldMenuParentRow.children[0].children[0].style.width = "4px";

    // Last child of the row, remove the width and set its child to 4px width.
    oldMenuParentRow.children[oldMenuParentRow.children.length - 1].removeAttribute("width");
    oldMenuParentRow.children[oldMenuParentRow.children.length - 1].children[0].removeAttribute("width");
    oldMenuParentRow.children[oldMenuParentRow.children.length - 1].children[0].style.width = "4px";

    const wrapper = document.createElement("div");
    wrapper.innerHTML = minimenuHTML;
    oldMenu1.replaceWith(...wrapper.children); // replaces with <style> + <table>

    // Remove second minimenu if it exists
    const oldMenu2 = document.querySelector("table.minimenub");
    if (oldMenu2) oldMenu2.remove();
  }

  // Get the BvS News element and replace background image with a gradient.
  const newsScrollTop = document.querySelector('div[style*="background-image:url(/billy/layout/scroll.gif)"]');
  if (newsScrollTop) {
    newsScrollTop.classList.add("bvscss--news-scroll");
    newsScrollTop.classList.add("bvscss--news-scroll--top");
    newsScrollTop.style.backgroundImage = "";
    newsScrollTop.style.height = "";

    // Get the news text.
    let newsText = newsScrollTop.children[0];
    newsText.classList.add("bvscss--news-text");
    newsText.style.padding = "0";

    // Change the news text to a div.
    let cnvNewsText = document.createElement("div");
    for (let attr of newsText.attributes) {
      cnvNewsText.setAttribute(attr.name, attr.value);
    }
    cnvNewsText.className = "bvscss--news-text";
    cnvNewsText.innerHTML = newsText.innerHTML;
    for (let child of newsText.children) {
      newsText.removeChild(child);
    }
    newsText.parentElement?.replaceChild(cnvNewsText, newsText);
    newsText = cnvNewsText;

    // Put the news text in a div.
    let newsTextDiv = document.createElement("div");
    newsTextDiv.className = "bvscss--news-text";
    newsTextDiv.innerHTML = newsText.innerHTML;
    newsText.innerHTML = "";
    newsText.appendChild(newsTextDiv);

    // Create scroll roller element.
    let scrollRoller = document.createElement("div");
    scrollRoller.className = "bvscss--scroll-roller";
    newsScrollTop.insertBefore(scrollRoller, newsText);

    // Create the gradient elements.
    let redGradient = document.createElement("div");
    redGradient.className = "bvscss--scroll-gradient--red";
    newsScrollTop.insertBefore(redGradient, newsText);

    let goldGradient = document.createElement("div");
    goldGradient.className = "bvscss--scroll-gradient--gold";
    newsScrollTop.insertBefore(goldGradient, newsText);

    let greenGradient = document.createElement("div");
    greenGradient.className = "bvscss--scroll-gradient--green";
    newsScrollTop.insertBefore(greenGradient, newsText);

    let karmaDiv = document.createElement("div");
    karmaDiv.className = "bvscss--karma";
    karmaDiv.innerHTML = karmaHTML;
    newsScrollTop.appendChild(karmaDiv);

    let thankYouDiv = document.createElement("div");
    thankYouDiv.className = "bvscss--thankyou";
    thankYouDiv.innerHTML = thankYouHTML;
    newsScrollTop.appendChild(thankYouDiv);
  }

  const newsScrollBottom = document.querySelector('img[src*="/billy/layout/scroll.gif"]');
  if (newsScrollBottom) {
    let newsScrollBottomParent = newsScrollBottom.parentElement;

    // Add a div.
    let newsScrollBottomDiv = document.createElement("div");
    newsScrollBottomDiv.classList.add("bvscss--news-scroll");
    newsScrollBottomDiv.classList.add("bvscss--news-scroll--bottom");
    newsScrollBottomDiv.style.backgroundImage = "";
    newsScrollBottomDiv.style.height = "";

    // Create scroll roller element.
    let scrollRoller = document.createElement("div");
    scrollRoller.className = "bvscss--scroll-roller";
    newsScrollBottomDiv.appendChild(scrollRoller);

    // Create the gradient elements.
    let redGradient = document.createElement("div");
    redGradient.className = "bvscss--scroll-gradient--red";
    newsScrollBottomDiv.appendChild(redGradient);

    let goldGradient = document.createElement("div");
    goldGradient.className = "bvscss--scroll-gradient--gold";
    newsScrollBottomDiv.appendChild(goldGradient);

    let greenGradient = document.createElement("div");
    greenGradient.className = "bvscss--scroll-gradient--green";
    newsScrollBottomDiv.appendChild(greenGradient);

    let karmaDiv = document.createElement("div");
    karmaDiv.className = "bvscss--karma";
    karmaDiv.innerHTML = karmaHTML;
    newsScrollBottomDiv.appendChild(karmaDiv);

    let thankYouDiv = document.createElement("div");
    thankYouDiv.className = "bvscss--thankyou";
    thankYouDiv.innerHTML = thankYouHTML;
    newsScrollBottomDiv.appendChild(thankYouDiv);

    // Remove the old news scroll.
    newsScrollBottomParent.removeChild(newsScrollBottom);
    newsScrollBottomParent.appendChild(newsScrollBottomDiv);
  }

  // Hide empty ad box.
  const adBox = document.getElementById("sovrn-overlay-footer");
  if (adBox) {
    adBox.style.height = "0px";
    adBox.style.width = "0px";
    adBox.style.left = "-100px";
    adBox.style.top = "-100px";
    adBox.style.overflow = "hidden";
  }

  // Adjust  position and size of thankyou box.
  const thankyouBox = document.forms.thankyou;
  const thankyouBoxCell = thankyouBox?.parentElement;
  const thankyouBoxContainerTable = thankyouBoxCell?.parentElement?.parentElement?.parentElement;

  const thankyouHandler = () => {
    if (thankyouBox && thankyouBoxCell && thankyouBoxContainerTable) {
      thankyouBoxContainerTable.className = "bvscss--thankyou-table";

      // Remove the style from the thankyou box cell.
      thankyouBoxCell.removeAttribute("style");
      thankyouBoxContainerTable.removeAttribute("width");

      // Simplify the thankyou box cell.
      const oldLink = thankyouBox.querySelector("a");

      if (oldLink) {
        const thankyouButton = document.createElement("button");
        thankyouButton.type = "submit";
        thankyouButton.className = "bvscss--thankyou-button";

        thankyouButton.innerHTML = `
      <h1>&gt;&gt; Click here to help 11 with BvS! &lt;&lt;</h1>
      <span>Do free surveys! Get anime merch! Earn ThankYou Coins! Redeem for cool stuffs! Yay!</span>
      <div class="bvscss--thankyou-button-update">
      Update! New Surveys! Double ThankYou Coin Bonus for a limited time!
      </div>
      `;

        oldLink.replaceWith(thankyouButton);
      }
    }
  };

  const contentContainerTable = thankyouBoxContainerTable?.nextElementSibling;
  if (contentContainerTable) {
    contentContainerTable.className = "bvscss--content-container-table";
    const contentContainerTableCells = contentContainerTable.children[0].children[0].children;

    if (contentContainerTableCells) {
      // Delete empty cells and remove style, width, align, and valign from the cells with content.
      for (let contentCell of contentContainerTableCells) {
        if (contentCell.innerText.trim() === "") {
          contentCell.parentElement.removeChild(contentCell);
        } else {
          removeUnwantedTagAttributes(contentCell);
        }
      }

      // Find and remove <img> elements with src "/billy/layout/blank.gif".
      const blankImages = contentContainerTable.querySelectorAll('img[src="/billy/layout/blank.gif"]');
      for (const blankImage of blankImages) {
        blankImage.parentElement.removeChild(blankImage);
      }

      // querySelectorAll for the rest of the children and remove style, width, align, and valign from the elements.
      const contentContainerTableChildren = contentContainerTable.querySelectorAll("*");
      for (const contentContainerTableChild of contentContainerTableChildren) {
        if (contentContainerTableChild) convertAttributesToStyles(contentContainerTableChild);
      }
    }
  }

  // Get all of thankyouBoxContainerTable's previous siblings.
  const noticeTables = [];

  let prevSibling = thankyouBoxContainerTable?.previousElementSibling;
  while (prevSibling) {
    if (prevSibling.tagName.match(/table/i)) {
      noticeTables.push(prevSibling);
    } else {
      break;
    }
    prevSibling = prevSibling.previousElementSibling;
  }

  // Get the 3 bonus inputs with names "videoroll", "yayfood", "bonusget".
  const bonusInputs = {
    videoroll: {
      input: document.querySelector('input[name="videoroll"]'),
      answer: "yes",
      text: `"Yes" for 100 Stamina!`,
      script: function () {
        document.videochallenge.submit();
      },
    },
    yayfood: {
      input: document.querySelector('form[name="givefood"]'),
      script: function () {
        document.givefood.submit();
      },
      text: `Yay food! And 11 Stamina!`,
      url: "https://greatergood.com/?ctg-cause=hunger-poverty-relief",
    },
    bonusget: {
      input: document.querySelector('input[name="bonusget"]'),
      text: `<b>Submit</b> the <b>Bonus Code</b> for <b>Bonus Stamina!</b>`,
      fetchCode: async function () {
        const proxyUrl = "https://api.allorigins.win/raw?url=" + encodeURIComponent("https://www.animecubed.com/index.shtml");

        fetch(proxyUrl)
          .then((response) => response.text())
          .then((html) => {
            const match = html.match(/Billy Vs\. SNAKEMAN Bonus Code:\s*(\d+)/i);
            if (match) {
              console.log("Bonus Code:", match[1]);
              const inputField = document.querySelector('input[name="bonusget"]');
              inputField.value = match[1];
              document.bonusget.submit();
            } else {
              console.log("Bonus Code not found.");
            }
          })
          .catch(console.error);
      },
    },
  };

  // If there are notice tables, move them to after and give them a class name "bvs--notice-table".
  if (noticeTables.length > 0) {
    for (const noticeTable of noticeTables) {
      noticeTable.className = "bvscss--notice-table";
      noticeTable.removeAttribute("width");
      noticeTable.removeAttribute("style");
      noticeTable.style.width = "100%";

      // Empty the notice row.
      let noticeRow = noticeTable.querySelector("tr");
      if (noticeRow) noticeRow.innerHTML = "";

      // Create <td> elements for each bonus input.
      for (const [key, value] of Object.entries(bonusInputs)) {
        if (value.input) {
          const noticeCell = document.createElement("td");
          noticeCell.className = "bvscss--notice-cell";

          // Create a button for the bonus input.
          const bonusButton = document.createElement("button");
          bonusButton.className = "bvscss--bonus-button";
          bonusButton.innerHTML = value.text;
          bonusButton.onclick = function () {
            if (value.input) {
              value.input.value = value.answer;
              if (value.url) {
                window.open(value.url, "_blank");
              }
              let code;
              if (value.fetchCode) code = value.fetchCode();
              if (value.script) value.script(code);
            }
          };

          // Append the button to the cell and the cell to the row.
          noticeCell.appendChild(bonusButton);
          noticeRow.appendChild(noticeCell);
        }
      }

      // Move the table to after the thankyouBoxContainerTable.
      // noticeTable.parentElement?.insertBefore(noticeTable, thankyouBoxContainerTable.nextElementSibling);
    }
  }

  let children = document.querySelectorAll(`[class*="bvscss--"], [class*="bvscss--"] *`);
  for (const child of children) {
    convertAttributesToStyles(child);
  }

  // Remove the back to top link.
  let backToTop = document.querySelector(`[href="#top"]`);
  console.log("Back to top link:", backToTop);
  if (backToTop?.parentElement?.tagName.match(/[pP]/)) {
    console.log("Removing back to top link parent element.");
    backToTop.parentElement.parentElement.removeChild(backToTop.parentElement);
  } else if (backToTop) {
    console.log("Removing back to top link.");
    backToTop.parentElement.removeChild(backToTop);
  }

  // Create a new back to top button sticky to the bottom right corner.
  const backToTopButton = document.createElement("button");
  backToTopButton.className = "bvscss--back-to-top";
  backToTopButton.id = "backToTopButton";
  backToTopButton.title = "Scroll to Top [Ctrl + Up Arrow]";
  backToTopButton.innerHTML = "<div>&#129033;</div><div>Back to Top</div><div>&#129033;</div>";
  // Add onclick event to scroll to top.
  backToTopButton.onclick = function () {
    window.scrollTo(0, 0);
  };

  const removeElements = () => {
    thankyouBoxContainerTable?.remove();
  };

  removeElements();

  // Add hot key, Ctrl + Up Arrow.
  window.addEventListener("keydown", function (event) {
    if (event.ctrlKey && event.key === "ArrowUp") {
      event.preventDefault();
      window.scrollTo(0, 0);
    }
  });

  // Append the back to top button to the body.
  document.body.appendChild(backToTopButton);
}
