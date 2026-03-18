// ============================================================
// Concerto · Tour Info
// Loads tours from /data/tours.json
// Renders searchable grid — tap a card to open tourWebsite
// ============================================================

const el = (id) => document.getElementById(id);

let allTours = [];

function normalizeUrl(url) {
  if (!url) return null;
  const u = String(url).trim();
  if (!u) return null;
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderGrid(list) {
  const wrap = el("toursBrowseList");
  const meta = el("libraryMeta");
  wrap.innerHTML = "";

  if (meta) meta.textContent = list.length ? `${list.length} tour${list.length !== 1 ? "s" : ""}` : "";

  if (!list.length) {
    wrap.innerHTML = `<div class="no-results">No tours found.</div>`;
    return;
  }

  list.forEach((t) => {
    const url = normalizeUrl(t.tourWebsite);

    // Use <a> so iOS WebView handles tap natively
    const card = document.createElement("a");
    card.className = "browse-item";
    card.rel = "noopener";

    if (url) {
      card.href = url;
      // iOS WebView: ensure single tap navigates
      card.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = url;
      }, true);
    } else {
      card.href = "#";
      card.classList.add("browse-item--no-link");
    }

    card.innerHTML = `
      <div class="browse-item-name">${escapeHtml(t.tourName)}</div>
      <div class="browse-item-meta">${escapeHtml(t.artist)}</div>
      ${url ? `<div class="browse-item-cta">Visit Site ↗</div>` : `<div class="browse-item-cta browse-item-cta--dim">No site yet</div>`}
    `;

    wrap.appendChild(card);
  });
}

function initSearch() {
  const input    = el("tourSearch");
  const clearBtn = el("clearSearchBtn");

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { renderGrid(allTours); return; }
    renderGrid(
      allTours.filter(
        (t) => t.tourName.toLowerCase().includes(q) || t.artist.toLowerCase().includes(q)
      )
    );
  });

  clearBtn.addEventListener("click", () => {
    input.value = "";
    renderGrid(allTours);
    input.focus();
  });
}

(async function init() {
  try {
    const res = await fetch("./data/tours.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load tours.json");
    allTours = await res.json();
    renderGrid(allTours);
    initSearch();
  } catch (e) {
    console.error(e);
    el("toursBrowseList").innerHTML = `
      <div class="error-state">
        Couldn't load tours. Check that <code>data/tours.json</code> exists and is valid JSON.
      </div>`;
  }
})();
