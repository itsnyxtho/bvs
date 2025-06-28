// ==UserScript==
// @name         Expand/Contract List Hotkeys
// @namespace    bvs
// @version      1.4
// @icon         https://github.com/itsnyxtho/bvs/blob/main/other/images/anime_cubed-icon.png?raw=true
// @author       itsnyxtho
// @description  Adds hotkeys to toggle Expand/Contract links
// @include      http*://*animecubed*/billy/bvs/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const STORAGE_KEY = 'bvs-hotkeys_expand-contract-list';

  const hotkeyDefinitions = [
    { keyCombination: 'Ctrl+Shift+E', description: 'Expand next collapsed element', ownerScript: 'Expand/Contract List Hotkeys' },
    { keyCombination: 'Ctrl+Shift+S', description: 'Contract next expanded element', ownerScript: 'Expand/Contract List Hotkeys' },
    { keyCombination: 'Ctrl+Shift+Alt+E', description: 'Expand all collapsed elements', ownerScript: 'Expand/Contract List Hotkeys' },
    { keyCombination: 'Ctrl+Shift+Alt+S', description: 'Contract all expanded elements', ownerScript: 'Expand/Contract List Hotkeys' },
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    locations: {
      include: ['http*://*animecubed*/billy/bvs/*'],
      exclude: []
    },
    hotkeys: hotkeyDefinitions
  }));

  const toggleLinks = Array.from(document.querySelectorAll('a')).filter(link =>
    /^Expand\/Contract/.test(link.textContent.trim()) &&
    link.href.startsWith('javascript:')
  );

  function getTargetIdFromHref(href) {
    const smallMatch = href.match(/expandSmallMenu\('([^']+)'/);
    if (smallMatch) return smallMatch[1];
    const genericMatch = href.match(/expand([A-Z][a-zA-Z]+)/);
    if (genericMatch) return genericMatch[1].toLowerCase();
    return null;
  }

  function getTargetElement(link) {
    const id = getTargetIdFromHref(link.href);
    return id ? document.getElementById(id) : null;
  }

  function isExpandedStyleBased(el) {
    if (!el) return false;
    const styleHeight = el.style.height;
    return styleHeight === 'auto';
  }

  function getLinksByState(expand = true) {
    return toggleLinks.filter(link => {
      const el = getTargetElement(link);
      if (!el) return false;
      const expanded = isExpandedStyleBased(el);
      return expand ? !expanded : expanded;
    });
  }

  function toggleOne(expand = true) {
    const pool = getLinksByState(expand);
    if (pool.length === 0) return;
    const link = pool[toggleIndex % pool.length];
    simulateClick(link);
    toggleIndex = (toggleIndex + 1) % pool.length;
  }

  function toggleAll(expand = true) {
    getLinksByState(expand).forEach(link => simulateClick(link));
  }

  function simulateClick(link) {
    if (link) {
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    }
  }

  let toggleIndex = 0;

  document.addEventListener('keydown', (e) => {
    const isCtrlShift = e.ctrlKey && e.shiftKey;
    const isAlt = e.altKey;
    if (!isCtrlShift) return;

    if (e.code === 'KeyE') {
      e.preventDefault();
      isAlt ? toggleAll(true) : toggleOne(true);
    }

    if (e.code === 'KeyS') {
      e.preventDefault();
      isAlt ? toggleAll(false) : toggleOne(false);
    }
  });
})();
