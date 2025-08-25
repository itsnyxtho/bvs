// @ts-nocheck
// ==UserScript==
// @name         BvS General Facelift
// @namespace    bvs
// @version      0.0.1
// @description  General facelift for BvS pages.
// @author       itsnyxtho
// @icon         https://github.com/itsnyxtho/bvs/blob/main/other/images/anime_cubed-icon.png?raw=true
// @include      http*://*animecubed*/billy/bvs/*
// @grant        none
// @disclaimer   These scripts are provided 'as is' and without warranty of any kind. Use of these scripts is at your own risk and discretion.
// ==/UserScript==

(function () {
  // === HELPER FUNCTIONS ===
  // Function to convert HTML attributes to style properties.
  function convertAttrsToStyles() {
    // legacy HTML attrs → CSS properties
    const legacyMap = {
      align: "text-align",
      background: "background", // special HTML “background” attribute
      bgcolor: "background-color",
      border: "border-width",
      cellborder: "border-width",
      cellpadding: "padding",
      cellspacing: "border-spacing",
      color: "color",
      face: "font-family",
      height: "height",
      valign: "vertical-align",
      width: "width",
    };

    const skipAttrs = new Set(["id", "class", "href", "src", "alt", "title", "role", "name", "type", "value", "cellborder", "cellpadding", "cellspacing", "valign"]);
    const deleteAttrs = new Set(["valign"]);

    document.querySelectorAll("*").forEach((el) => {
      Array.from(el.attributes).forEach(({ name, value }) => {
        name = name.toLowerCase();
        if (skipAttrs.has(name) || name.startsWith("data-") || name.startsWith("aria-")) {
          return;
        }
        if (deleteAttrs.has(name)) {
          el.removeAttribute(name);
          return; // skip further processing for this attribute
        }

        let val = value.trim();

        // ─── Special case: HTML `background` attribute → background-image + no-repeat ───
        if (name === "background") {
          // treat the raw attribute value as an image URL
          el.style.setProperty("background-image", `url(${val})`);
          if (!val.match(/.*bg.*/i)) el.style.setProperty("background-repeat", "no-repeat");
          el.removeAttribute(name);
          return; // done with this attribute
        }

        // ─── Otherwise, fall back to generic mapping ───
        // map to CSS prop name
        let cssProp =
          legacyMap[name] ||
          name
            .replace(/([A-Z])/g, "-$1")
            .replace(/^ms-/, "-ms-")
            .toLowerCase();

        // if this is a color prop and looks like hex digits without '#', add it
        if ((cssProp === "color" || cssProp === "background-color") && /^[0-9A-Fa-f]{3,8}$/.test(val)) {
          val = "#" + val;
        }

        // try raw or px value
        if (CSS.supports(cssProp, val)) {
          el.style.setProperty(cssProp, val);
          el.removeAttribute(name);
        } else if (/^\d+(\.\d+)?$/.test(val) && CSS.supports(cssProp, val + "px")) {
          el.style.setProperty(cssProp, val + "px");
          el.removeAttribute(name);
        }
      });
    });
  }

  // Function to convert a vertical table to a horizontal one.
  function makeHorizontal(table) {
    const tbody = table.tBodies[0];
    // grab each <td> (the first—and only—cell in each <tr>)
    const cells = Array.from(tbody.rows).map((r) => r.cells[0].cloneNode(true));

    // clear out the old vertical rows
    tbody.innerHTML = "";

    // build one new <tr> and append all of the cloned <td>s to it
    const topRow = document.createElement("tr");
    const middleRow = document.createElement("tr");
    const bottomRow = document.createElement("tr");
    // Top row contains the first cell, bottom row contains the last cell.
    cells.forEach((td, index) => {
      // optional: tweak each cell so it lines up nicely
      td.style.display = "table-cell";
      td.style.verticalAlign = "top";
      td.removeAttribute("width");
      if (index === 0) {
        topRow.appendChild(td);
        // Remove width attribute.
        // Set the width to 100% for the top row and its cell.
        topRow.style.width = "100%";
        td.style.width = "100%";
      } else if (index < cells.length - 1) {
        middleRow.appendChild(td);
      } else {
        bottomRow.appendChild(td);
        // Remove width attribute.
        // Set the width to 100% for the bottom row and its cell.
        bottomRow.style.width = "100%";
        td.style.width = "100%";
      }
    });

    // put your new horizontal row back into the table
    tbody.appendChild(topRow);
    tbody.appendChild(middleRow);
    tbody.appendChild(bottomRow);

    // optional: make the table stretch to fit its container
    table.style.width = "100%";
    table.style.tableLayout = "auto";
  }

  // Function to find and hide `<td width="7">&nbsp;</td>` elements in the passed element.
  function hideSpacerCells(element) {
    const spacerCells = element.querySelectorAll("td[width='7']");
    spacerCells.forEach((cell) => {
      if (cell.innerHTML.trim() === "&nbsp;") {
        cell.style.display = "none";
      }
    });
  }

  // === CONVERT LEGACY ATTRIBUTES TO STYLES ===
  convertAttrsToStyles();

  // === Add Styles ===
  const style = document.createElement("style");
  style.textContent = `
  * {
    box-sizing: border-box;
    border-collapse: collapse;
  }
  `;
  document.head.appendChild(style);

  // === Hiding Unnecessary Empty Spacers ===
  // Get top empty table and hide.
  let emptyTable = document.querySelector("center>table:nth-child(2)");
  // If table, no innerText, contains <script> child with src containing "ap.lijit.com"
  if (emptyTable && emptyTable.innerText.trim() === "" && emptyTable.querySelector("script[src*='ap.lijit.com']")) {
    // Hide the empty table.
    emptyTable.style.display = "none";
  }

  // Get the main content table, nth-child(3) of center.
  const mainContentTable = document.querySelector("center>table:nth-child(3)");
  if (mainContentTable) {
    mainContentTable.id = "bvs--main-content-table";
    // Get the content table inside the main content table.
    const contentTable = mainContentTable.querySelector("table");
    if (contentTable) {
      contentTable.id = "bvs--content-table";
      // Get the rows of the content table.
      const rows = contentTable.children[0]?.children || [];
      // If rows exist...
      if (rows.length === 2) {
        const firstRow = rows[0];
        const secondRow = rows[1];
        // If the first row contains only cells with "clearspacer.gif" images, delete the content of the row.
        if (firstRow && Array.from(firstRow.cells).every((cell) => cell.querySelector("img[src*='clearspacer.gif']"))) {
          firstRow.innerHTML = ""; // Clear the first row.
        }
        // In the second row...
        if (secondRow?.children.length === 3) {
          // Hide spacer cells.
          hideSpacerCells(secondRow);

          // If cell with attributes `align="right"` and `valign="top"` exists, convert it to a horizontal display in the first row, max-width = width of the content table.
          const rightCell = secondRow.querySelector("td[align='right'][valign='top'][width='160']");
          if (rightCell) {
            rightCell.id = "bvs--hammergirl-ad-cell";
            // Move the cell to the first row.
            // firstRow.appendChild(rightCell);
            // Make the first row horizontal.
            // makeHorizontal(rightCell.querySelector("table"));
            // Set the max-width of the first row to the width of the content table.
            // firstRow.style.maxWidth = `${rightCell.offsetWidth}px`;
            // Set the width of the first row to 100%.
            // firstRow.style.width = "100%";
          }
        }
      }
    }
  }

  // === Replacing Images with Custom Icons ===
  // let imageConfig = {
  //   // Replace Hammergirl Icon "/structure2/hgicon.gif" with "https://raw.githubusercontent.com/itsnyxtho/bvs/refs/heads/main/other/images/hammer_girl-icon.svg".
  //   "/structure2/hgicon.gif": {
  //     newImage: "https://raw.githubusercontent.com/itsnyxtho/bvs/refs/heads/main/other/images/hammer_girl-icon.svg",
  //     altText: "Hammergirl Icon",
  //     titleText: "Hammergirl Icon",
  //   },
  // };

  // // Iterate over each key-value pair in imageConfig.
  // for (const [oldSrc, { newImage, altText, titleText }] of Object.entries(imageConfig)) {
  //   // Select all images with the old source.
  //   const images = document.querySelectorAll(`img[src="${oldSrc}"]`);
  //   // For each image, replace its source with the new source.
  //   images.forEach((img) => {
  //     img.src = newImage;
  //     img.alt = altText || "Replaced Icon"; // Set alt text if not already set.
  //     img.title = titleText || "Replaced Icon"; // Set title text if not already set.
  //   });
  // }
})();
