const APP_VERSION = "0.2.1.1";

const $ = id => document.getElementById(id);

const fileInput = $("fileInput");
const engineStatus = $("engineStatus");
const fileName = $("fileName");
const pageCount = $("pageCount");
const navPageCount = $("navPageCount");
const zoomStatus = $("zoomStatus");
const messageBox = $("messageBox");
const reader = $("reader");
const emptyState = $("emptyState");
const canvas = $("pdfCanvas");
const canvasWrap = $("canvasWrap");
const pageStage = $("pageStage");
const textLayer = $("textLayer");
const ctx = canvas.getContext("2d", { alpha: false });

const prevButton = $("prevButton");
const nextButton = $("nextButton");
const pageInput = $("pageInput");
const pageLabel = $("pageLabel");
const zoomOutButton = $("zoomOutButton");
const zoomInButton = $("zoomInButton");
const fitWidthButton = $("fitWidthButton");
const fitPageButton = $("fitPageButton");
const zoomLabel = $("zoomLabel");
const searchInput = $("searchInput");
const searchButton = $("searchButton");
const searchPrevButton = $("searchPrevButton");
const searchNextButton = $("searchNextButton");
const searchStatus = $("searchStatus");
const searchMiniStatus = $("searchMiniStatus");

let pdfjsLib = null;
let pdfDoc = null;
let currentPage = 1;
let currentScale = 1;
let renderTask = null;
let renderGeneration = 0;
let pageTextCache = new Map();
let searchResults = [];
let activeSearchIndex = -1;

function setMessage(text, type = "") {
  messageBox.textContent = text;
  messageBox.className = "message-box";
  if (type) messageBox.classList.add(type);
}

function clampScale(value) {
  return Math.min(4, Math.max(0.25, value));
}

function updateUi() {
  const ready = Boolean(pdfDoc);
  prevButton.disabled = !ready || currentPage <= 1;
  nextButton.disabled = !ready || currentPage >= (pdfDoc?.numPages || 1);
  pageInput.disabled = !ready;
  zoomOutButton.disabled = !ready;
  zoomInButton.disabled = !ready;
  fitWidthButton.disabled = !ready;
  fitPageButton.disabled = !ready;
  searchInput.disabled = !ready;
  searchButton.disabled = !ready;
  searchPrevButton.disabled = !ready || searchResults.length === 0;
  searchNextButton.disabled = !ready || searchResults.length === 0;

  if (ready) {
    pageInput.value = String(currentPage);
    pageInput.max = String(pdfDoc.numPages);
    navPageCount.textContent = String(pdfDoc.numPages);
    pageLabel.textContent = `Pagina ${currentPage}`;
  }

  const pct = Math.round(currentScale * 100);
  zoomLabel.textContent = `${pct}%`;
  zoomStatus.textContent = ready ? `${pct}%` : "—";
}

async function loadPdfJs() {
  try {
    pdfjsLib = await import("https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.min.mjs");
    if (!pdfjsLib || typeof pdfjsLib.getDocument !== "function") {
      throw new Error("PDF.js getDocument ontbreekt.");
    }
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.worker.min.mjs";
    engineStatus.textContent = `✓ ${pdfjsLib.version || "geladen"}`;
  } catch (error) {
    console.error(error);
    engineStatus.textContent = "✗ Mislukt";
    setMessage(`PDF.js kon niet worden geladen: ${error?.message || error}`, "error");
  }
}

async function fitWidthScale(pageNumber) {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1 });
  const availableWidth = Math.max(220, canvasWrap.clientWidth - 14);
  return clampScale(availableWidth / viewport.width);
}

async function fitPageScale(pageNumber) {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1 });
  const availableWidth = Math.max(220, canvasWrap.clientWidth - 14);
  const availableHeight = Math.max(240, window.innerHeight - 250);
  return clampScale(Math.min(
    availableWidth / viewport.width,
    availableHeight / viewport.height
  ));
}

function clearTextLayer() {
  textLayer.replaceChildren();
}

function normalizeSearchText(value) {
  return String(value || "").replace(/\s+/g, " ").trim().toLocaleLowerCase();
}

async function getPageTextData(pageNumber) {
  if (pageTextCache.has(pageNumber)) return pageTextCache.get(pageNumber);

  const page = await pdfDoc.getPage(pageNumber);
  const textContent = await page.getTextContent();
  const items = textContent.items.map((item, index) => ({
    index,
    str: item.str || "",
    raw: item
  }));

  // Build one normalized page string plus a character→item map.
  // This allows multi-word searches even when PDF.js split a phrase over text items.
  let pageText = "";
  const charToItem = [];
  for (const item of items) {
    const normalized = String(item.str || "").replace(/\s+/g, " ").trim();
    if (!normalized) continue;
    if (pageText && !pageText.endsWith(" ")) {
      pageText += " ";
      charToItem.push(null);
    }
    for (const ch of normalized) {
      pageText += ch.toLocaleLowerCase();
      charToItem.push(item.index);
    }
  }

  const data = { textContent, items, pageText, charToItem };
  pageTextCache.set(pageNumber, data);
  return data;
}

async function renderTextLayer(pageNumber, viewport, generation) {
  clearTextLayer();

  const { textContent, items } = await getPageTextData(pageNumber);
  if (generation !== renderGeneration) return;

  const styles = textContent.styles || {};
  textLayer.style.width = `${Math.floor(viewport.width)}px`;
  textLayer.style.height = `${Math.floor(viewport.height)}px`;

  for (const entry of items) {
    const item = entry.raw;
    if (!item.str) continue;

    const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
    const angle = Math.atan2(tx[1], tx[0]);
    const fontHeight = Math.hypot(tx[2], tx[3]);
    if (!Number.isFinite(fontHeight) || fontHeight <= 0) continue;

    const span = document.createElement("span");
    span.textContent = item.str;
    span.dataset.itemIndex = String(entry.index);

    const style = styles[item.fontName] || {};
    const ascent = Number.isFinite(style.ascent)
      ? style.ascent
      : (Number.isFinite(style.descent) ? 1 + style.descent : 0.8);

    span.style.left = `${tx[4]}px`;
    span.style.top = `${tx[5] - fontHeight * ascent}px`;
    span.style.fontSize = `${fontHeight}px`;
    span.style.fontFamily = style.fontFamily || "sans-serif";

    if (angle) span.style.transform = `rotate(${angle}rad)`;
    textLayer.appendChild(span);

    const measuredWidth = span.getBoundingClientRect().width;
    const desiredWidth = Math.abs(item.width * currentScale);
    if (measuredWidth > 0 && desiredWidth > 0) {
      const scaleX = desiredWidth / measuredWidth;
      span.style.transform = `${angle ? `rotate(${angle}rad) ` : ""}scaleX(${scaleX})`;
    }
  }

  applyHighlightsForCurrentPage();
}

function applyHighlightsForCurrentPage() {
  for (const span of textLayer.querySelectorAll("span")) {
    span.classList.remove("search-hit", "search-active");
  }

  searchResults.forEach((result, resultIndex) => {
    if (result.page !== currentPage) return;
    for (const itemIndex of result.itemIndices) {
      const span = textLayer.querySelector(`span[data-item-index="${itemIndex}"]`);
      if (!span) continue;
      span.classList.add("search-hit");
      if (resultIndex === activeSearchIndex) span.classList.add("search-active");
    }
  });
}

async function renderPage(targetPage, scale = currentScale) {
  if (!pdfDoc) return;

  const pageNumber = Math.max(1, Math.min(pdfDoc.numPages, Math.round(targetPage)));
  const safeScale = clampScale(scale);
  const generation = ++renderGeneration;

  if (renderTask) {
    try { renderTask.cancel(); } catch {}
    renderTask = null;
  }
  clearTextLayer();

  try {
    const page = await pdfDoc.getPage(pageNumber);
    if (generation !== renderGeneration) return;

    const viewport = page.getViewport({ scale: safeScale });
    const outputScale = Math.min(2, Math.max(1, window.devicePixelRatio || 1));

    canvas.width = Math.max(1, Math.floor(viewport.width * outputScale));
    canvas.height = Math.max(1, Math.floor(viewport.height * outputScale));
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;
    pageStage.style.width = `${Math.floor(viewport.width)}px`;
    pageStage.style.height = `${Math.floor(viewport.height)}px`;

    const transform = outputScale !== 1
      ? [outputScale, 0, 0, outputScale, 0, 0]
      : null;

    renderTask = page.render({ canvasContext: ctx, transform, viewport });
    await renderTask.promise;
    if (generation !== renderGeneration) return;
    renderTask = null;

    currentPage = pageNumber;
    currentScale = safeScale;
    updateUi();
    await renderTextLayer(pageNumber, viewport, generation);
    if (generation !== renderGeneration) return;

    setMessage(`Pagina ${currentPage} van ${pdfDoc.numPages} · tekstselectie actief`, "ok");
  } catch (error) {
    if (error?.name === "RenderingCancelledException") return;
    console.error(error);
    renderTask = null;
    setMessage(`Renderfout: ${error?.message || error}`, "error");
  }
}

async function openPdf(file) {
  if (!file) return;
  if (!pdfjsLib) {
    setMessage("PDF-engine is nog niet beschikbaar.", "error");
    return;
  }

  fileName.textContent = file.name || "Onbekend bestand";
  pageCount.textContent = "…";
  emptyState.classList.add("hidden");
  reader.classList.remove("hidden");
  setMessage("PDF wordt lokaal ingelezen…");

  try {
    ++renderGeneration;
    if (renderTask) {
      try { renderTask.cancel(); } catch {}
      renderTask = null;
    }
    if (pdfDoc) {
      try { await pdfDoc.destroy(); } catch {}
      pdfDoc = null;
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    pdfDoc = await pdfjsLib.getDocument({ data: bytes }).promise;

    currentPage = 1;
    currentScale = 1;
    pageTextCache.clear();
    searchResults = [];
    activeSearchIndex = -1;
    searchInput.value = "";
    searchStatus.textContent = "Geen zoekopdracht";
    searchMiniStatus.textContent = "Wachten";
    pageCount.textContent = String(pdfDoc.numPages);

    currentScale = await fitWidthScale(1);
    updateUi();
    await renderPage(1, currentScale);
  } catch (error) {
    console.error(error);
    pdfDoc = null;
    pageCount.textContent = "—";
    navPageCount.textContent = "0";
    currentScale = 1;
    searchResults = [];
    activeSearchIndex = -1;
    updateUi();
    setMessage(`PDF openen mislukt: ${error?.message || error}`, "error");
  }
}

async function searchPdf() {
  if (!pdfDoc) return;

  const query = normalizeSearchText(searchInput.value);
  searchResults = [];
  activeSearchIndex = -1;

  if (!query) {
    searchStatus.textContent = "Geen zoekopdracht";
    searchMiniStatus.textContent = "Wachten";
    applyHighlightsForCurrentPage();
    updateUi();
    return;
  }

  searchStatus.textContent = "Zoeken…";
  searchMiniStatus.textContent = "Zoeken…";
  updateUi();

  try {
    for (let pageNumber = 1; pageNumber <= pdfDoc.numPages; pageNumber++) {
      const { pageText, charToItem } = await getPageTextData(pageNumber);
      let start = 0;

      while (start <= pageText.length - query.length) {
        const hit = pageText.indexOf(query, start);
        if (hit === -1) break;

        const itemIndices = [];
        const seen = new Set();
        for (let pos = hit; pos < hit + query.length; pos++) {
          const itemIndex = charToItem[pos];
          if (itemIndex !== null && itemIndex !== undefined && !seen.has(itemIndex)) {
            seen.add(itemIndex);
            itemIndices.push(itemIndex);
          }
        }

        if (itemIndices.length) {
          searchResults.push({ page: pageNumber, itemIndices });
        }
        start = hit + Math.max(1, query.length);
      }
    }

    if (!searchResults.length) {
      searchStatus.textContent = "Geen resultaten";
      searchMiniStatus.textContent = "0 resultaten";
      applyHighlightsForCurrentPage();
      updateUi();
      return;
    }

    activeSearchIndex = 0;
    searchMiniStatus.textContent = `${searchResults.length} resultaat${searchResults.length === 1 ? "" : "en"}`;
    updateUi();
    await showActiveSearchResult();
  } catch (error) {
    console.error(error);
    searchStatus.textContent = `Zoekfout: ${error?.message || error}`;
    searchMiniStatus.textContent = "✗ Fout";
    updateUi();
  }
}

async function showActiveSearchResult() {
  if (!searchResults.length || activeSearchIndex < 0) return;
  const result = searchResults[activeSearchIndex];

  if (currentPage !== result.page) {
    await renderPage(result.page, currentScale);
  } else {
    applyHighlightsForCurrentPage();
  }

  searchStatus.textContent = `${activeSearchIndex + 1} / ${searchResults.length} · pagina ${result.page}`;
  searchMiniStatus.textContent = `${searchResults.length} resultaat${searchResults.length === 1 ? "" : "en"}`;

  requestAnimationFrame(() => {
    const firstItem = result.itemIndices[0];
    const span = textLayer.querySelector(`span[data-item-index="${firstItem}"]`);
    span?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
  });
}

fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.[0];
  fileInput.value = "";
  await openPdf(file);
});

prevButton.addEventListener("click", () => {
  if (pdfDoc && currentPage > 1) void renderPage(currentPage - 1, currentScale);
});
nextButton.addEventListener("click", () => {
  if (pdfDoc && currentPage < pdfDoc.numPages) void renderPage(currentPage + 1, currentScale);
});
pageInput.addEventListener("change", () => {
  if (!pdfDoc) return;
  const requested = Number(pageInput.value);
  if (Number.isFinite(requested)) void renderPage(requested, currentScale);
  else pageInput.value = String(currentPage);
});
zoomInButton.addEventListener("click", () => {
  if (pdfDoc) void renderPage(currentPage, currentScale + 0.15);
});
zoomOutButton.addEventListener("click", () => {
  if (pdfDoc) void renderPage(currentPage, currentScale - 0.15);
});
fitWidthButton.addEventListener("click", async () => {
  if (!pdfDoc) return;
  await renderPage(currentPage, await fitWidthScale(currentPage));
});
fitPageButton.addEventListener("click", async () => {
  if (!pdfDoc) return;
  await renderPage(currentPage, await fitPageScale(currentPage));
});
searchButton.addEventListener("click", () => void searchPdf());
searchInput.addEventListener("keydown", event => {
  if (event.key === "Enter") void searchPdf();
});
searchNextButton.addEventListener("click", async () => {
  if (!searchResults.length) return;
  activeSearchIndex = (activeSearchIndex + 1) % searchResults.length;
  await showActiveSearchResult();
});
searchPrevButton.addEventListener("click", async () => {
  if (!searchResults.length) return;
  activeSearchIndex = (activeSearchIndex - 1 + searchResults.length) % searchResults.length;
  await showActiveSearchResult();
});

let resizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(async () => {
    if (!pdfDoc) return;
    await renderPage(currentPage, await fitWidthScale(currentPage));
  }, 180);
});

await loadPdfJs();
updateUi();
console.info(`PdfReader ${APP_VERSION} — Search Stability Fix geladen.`);
