// @ts-nocheck
(function () {
  "use strict";

  // Get the BODY and HEAD elements.
  const body = document.body;
  const head = document.head;

  // Get #container and #wrapper elements.
  const container = document.getElementById("container");
  const wrapper = document.getElementById("wrapper");

  // Get the player name and password from the page.
  const name = document.querySelector(`input[name="player"]`)?.value;
  const pwd = document.querySelector(`input[name="pwd"]`)?.value;

  // If the player name and password are not found, exit the script.
  if (!name || !pwd) {
    console.log("Player name or password not found.");
    return;
  }

  /**
   * This function handles the inclusion of Google Fonts in the document.
   * It generates <link> tags for each font URL and appends them to the document head.
   * The fonts are preloaded for better performance.
   * @returns {void}
   * @example
   *  fontHandler();
   * @see {@link https://fonts.google.com/} for more information on Google Fonts.
   */
  const fontHandler = () => {
    const fontUrls = [
      "https://fonts.googleapis.com/css2?family=Amaranth:ital,wght@0,400;0,700;1,400;1,700&display=swap",
      "https://fonts.googleapis.com/css2?family=Amatic+SC:wght@400;700&display=swap",
      "https://fonts.googleapis.com/css2?family=Amita:wght@400;700&display=swap",
      "https://fonts.googleapis.com/css2?family=Berkshire+Swash&display=swap",
      "https://fonts.googleapis.com/css2?family=Bree+Serif&display=swap",
      "https://fonts.googleapis.com/css2?family=Bungee&display=swap",
      "https://fonts.googleapis.com/css2?family=Bytesized&display=swap",
      "https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&display=swap",
      "https://fonts.googleapis.com/css2?family=Creepster&display=swap",
      "https://fonts.googleapis.com/css2?family=Crete+Round:ital@0;1&display=swap",
      "https://fonts.googleapis.com/css2?family=Handlee&display=swap",
      "https://fonts.googleapis.com/css2?family=Josefin+Slab:ital,wght@0,100..700;1,100..700&display=swap",
      "https://fonts.googleapis.com/css2?family=Julius+Sans+One&display=swap",
      "https://fonts.googleapis.com/css2?family=Just+Another+Hand&display=swap",
      "https://fonts.googleapis.com/css2?family=Kreon:wght@300..700&display=swap",
      "https://fonts.googleapis.com/css2?family=Leckerli+One&display=swap",
      "https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap",
      "https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap",
      "https://fonts.googleapis.com/css2?family=Poiret+One&display=swap",
      "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap",
      "https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap",
      "https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap",
      "https://fonts.googleapis.com/css2?family=Rochester&display=swap",
      "https://fonts.googleapis.com/css2?family=Rock+Salt&display=swap",
      "https://fonts.googleapis.com/css2?family=Sacramento&display=swap",
      "https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap",
      "https://fonts.googleapis.com/css2?family=Six+Caps&display=swap",
      "https://fonts.googleapis.com/css2?family=Special+Elite&display=swap",
      "https://fonts.googleapis.com/css2?family=Titan+One&display=swap",
      "https://fonts.googleapis.com/css2?family=Winky+Sans:ital,wght@0,300..900;1,300..900&display=swap",
    ];

    /**
     * Converts an array of Google Fonts URLs into <link> tag strings.
     * @param {string[]} fontUrls - An array of Google Fonts API URLs.
     * @returns {string[]} - Array of <link> tags as strings.
     */
    function generateLinkTags(fontUrls) {
      return fontUrls.map((url) => `<link href="${url}" rel="stylesheet">`);
    }

    // Include fonts.
    let fonts =
      `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    ` + generateLinkTags(fontUrls).join("\n");

    // Append fonts to the document head.
    document.head.innerHTML += fonts;
  };
  // Call the font handler to include fonts.
  fontHandler();

  /**
   * This function handles the inclusion of CSS styles in the document.
   * It retrieves the CSS from a resource and adds it to the document.
   * @returns {void}
   * @example
   *  cssHandler();
   * @see {@link https://www.greasespot.net/} for more information on Greasemonkey.
   */
  const cssHandler = () => {
    const bvsCSS = GM_getResourceText("BVS_CSS");
    GM_addStyle(bvsCSS);
  };

  const emptyElementTester = (elem) => {
    if (elem.innerText.trim() === "" && elem.type !== "hidden" && !elem.name && !elem.id && !elem.innerHTML.match(/(input)|(img)|(a)|(button)/g)) {
      elem.remove();
    }
  };

  // Placeholder function for handling empty elements.
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

  // Placeholder function for handling the mini menu.
  const minimenuHandler = () => {
    console.log("minimenuHandler is not implemented yet.");
  };

  // Placeholder function for handling the news scroll.
  const newsScrollHandler = () => {
    console.log("newsScrollHandler is not implemented yet.");
  };
})();
