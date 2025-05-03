/** BVS Sitemapper 
 * This script extracts URLs from forms and links on the page,
 * normalizes them, and checks if they are valid BVS URLs.
 * It also checks if the forms are submittable and extracts hidden fields.
 * The results are merged into a global `bvs.sitemap` array, ensuring no duplicates.
 * The script also sorts the results based on page name and hidden fields.
 * Finally, it logs the total number of unique entries.
 * @license MIT
 * @version 1.0.0
*/
(() => {
  const allowedPath = "/billy/bvs/";
  const newResults = [];

  const normalize = (urlStr) => {
    try {
      return new URL(urlStr, location.origin).href;
    } catch {
      return null;
    }
  };

  const isBvsUrl = (urlStr) => {
    try {
      const url = new URL(urlStr, location.origin);
      const path = url.pathname;
      return (
        path.startsWith(allowedPath) &&
        !path.includes("/vlookup") &&
        !path.includes("/lookup")
      );
    } catch {
      return false;
    }
  };

  const getPageName = (url) => {
    return url?.match(/([^\\/]+?)(\.[^./]+)?$/)?.[1] || null;
  };

  const extractHiddenFields = (form) => {
    const fields = {};
    form.querySelectorAll('input[type="hidden"][name]')?.forEach(input => {
      const name = input.getAttribute("name");
      const value = input.getAttribute("value") || "";
      if (name !== "player" && name !== "pwd") {
        fields[name] = value;
      }
    });
    return fields;
  };

  const globalPlayer = document.querySelector('input[name="player"]')?.value;
  const globalPwd = document.querySelector('input[name="pwd"]')?.value;

  if (!globalPlayer || !globalPwd) {
    console.warn("❌ Missing global player or pwd input — form submittability checks may be inaccurate.");
  }

  const urls = new Set();

  // 1. Extract from <form>
  document.querySelectorAll("form[action]").forEach(form => {
    const action = form.getAttribute("action");
    const full = normalize(action);
    if (!full || !isBvsUrl(full)) return;

    const submittable = !!(
      form.querySelector('input[name="player"]')?.value &&
      form.querySelector('input[name="pwd"]')?.value
    );

    const fields = extractHiddenFields(form);
    urls.add(full);

    newResults.push({
      url: full,
      source: "form[action]",
      submittable,
      page: getPageName(full),
      fields
    });
  });

  // 2. Extract from <a> and JS-triggered forms
  document.querySelectorAll("a[href]").forEach(a => {
    const href = a.getAttribute("href");
    if (!href) return;

    if (href.startsWith("javascript:")) {
      const match = href.match(/document\.([a-zA-Z0-9_$]+)\.submit/);
      if (match) {
        const form = document.forms[match[1]];
        const action = form?.getAttribute("action");
        const full = normalize(action);
        if (!full || !isBvsUrl(full)) return;

        const submittable = !!(
          form.querySelector('input[name="player"]')?.value &&
          form.querySelector('input[name="pwd"]')?.value
        );

        const fields = extractHiddenFields(form);
        urls.add(full);

        newResults.push({
          url: full,
          source: `a[href="javascript"]`,
          submittable,
          page: getPageName(full),
          fields
        });
      }
    } else {
      const full = normalize(href);
      if (!full || !isBvsUrl(full)) return;

      urls.add(full);

      newResults.push({
        url: full,
        source: "a[href]",
        submittable: null,
        page: getPageName(full),
        fields: {}
      });
    }
  });

  // ✅ Merge into bvs.sitemap with deduplication
  window.bvs = window.bvs || {};
  const existing = window.bvs.sitemap || [];
  const existingKeys = new Set(
    existing.map(e => `${e.url}::${JSON.stringify(e.fields || {})}`)
  );
  const merged = [...existing];

  newResults.forEach(entry => {
    const key = `${entry.url}::${JSON.stringify(entry.fields || {})}`;
    if (!existingKeys.has(key)) {
      merged.push(entry);
      existingKeys.add(key);
    }
  });

  // ✅ Sort results
  const sorted = merged.slice().sort((a, b) => {
    const aPage = a.page || "";
    const bPage = b.page || "";
    const pageDiff = aPage.localeCompare(bPage);
    if (pageDiff !== 0) return pageDiff;

    const aKeys = Object.keys(a.fields || {}).sort().join(",");
    const bKeys = Object.keys(b.fields || {}).sort().join(",");
    const keyDiff = aKeys.localeCompare(bKeys);
    if (keyDiff !== 0) return keyDiff;

    const aVals = Object.values(a.fields || {}).sort().join(",");
    const bVals = Object.values(b.fields || {}).sort().join(",");
    return aVals.localeCompare(bVals);
  });

  // 💾 Save to global
  window.bvs.sitemap = sorted;

  console.log(`✅ Merged ${newResults.length} entries. Total unique: ${sorted.length}`);
  console.log(sorted);
})();
