// ==UserScript==
// @name         BvS Hotkey Reference Box
// @namespace    bvs
// @version      1.0
// @icon         https://github.com/itsnyxtho/bvs/blob/main/other/images/anime_cubed-icon.png?raw=true
// @description  Displays all registered hotkeys valid on the current page.
// @include      http*://*animecubed*/billy/bvs/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  function matchGlob(pattern, text) {
    const regex = new RegExp('^' + pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.') + '$');
    return regex.test(text);
  }

  function getValidHotkeys() {
    const pageURL = window.location.href;
    const validHotkeys = [];

    for (const key in localStorage) {
      if (!key.startsWith('bvs-hotkeys_')) continue;
      try {
        const item = JSON.parse(localStorage.getItem(key));
        if (!item || !item.hotkeys || !item.locations) continue;

        const { include = [], exclude = [] } = item.locations;
        const matchesInclude = include.some(p => matchGlob(p, pageURL));
        const matchesExclude = exclude.some(p => matchGlob(p, pageURL));

        if (matchesInclude && !matchesExclude) {
          validHotkeys.push(...item.hotkeys);
        }
      } catch (e) {
        console.warn('Invalid JSON in', key);
      }
    }

    return validHotkeys;
  }

  function createBox(hotkeys) {
    const box = document.createElement('div');
    box.id = 'bvs-hotkey-box';
    box.style.cssText = `
      position: fixed;
      bottom: 10px;
      right: 10px;
      background: #fff;
      color: #000;
      border: 2px solid #000;
      padding: 10px;
      font-size: 12px;
      font-family: monospace;
      max-height: 300px;
      max-width: 400px;
      overflow-y: auto;
      z-index: 9999;
      display: none;
    `;

    box.innerHTML = `<b>Hotkey Reference (this page)</b><hr>` + hotkeys.map(h => `
      <div><b>${h.keyCombination}</b>: ${h.description}</div>
    `).join('');

    document.body.appendChild(box);
  }

  setTimeout(() => {
    const hotkeys = getValidHotkeys();
    if (hotkeys.length > 0) {
      createBox(hotkeys);
    }
  }, 2000);

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && e.shiftKey && e.code === 'KeyK') {
      e.preventDefault();
      const box = document.getElementById('bvs-hotkey-box');
      if (box) {
        box.style.display = (box.style.display === 'none') ? 'block' : 'none';
      }
    }
  });
})();
