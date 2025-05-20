// @ts-nocheck
(() => {
  "use strict";

  // Add bvsOptionsBox to the page if it doesn't exist.
  if (!document.getElementById("bvsOptionsBox")) {
    let optionsBox = document.createElement("div");
    optionsBox.id = "bvsOptionsBox";
    optionsBox.style = "top: 0; right: 0; position: absolute; background: white;z-index: 10000; width: 192px; padding: 8px;";
    optionsBox.innerHTML = `<h3>BvS Options Box</h3><hr>`;
    document.body.appendChild(optionsBox);
    optionsBox.style.width = "192px";
    optionsBox.style.zIndex = 10000;
  }
  
})();
