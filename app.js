const APP_VERSION = "0.2.1";

const fileInput = document.getElementById("fileInput");
const engineStatus = document.getElementById("engineStatus");
const fileName = document.getElementById("fileName");
const pageCount = document.getElementById("pageCount");
const navPageCount = document.getElementById("navPageCount");
const zoomStatus = document.getElementById("zoomStatus");
const messageBox = document.getElementById("messageBox");
const reader = document.getElementById("reader");
const emptyState = document.getElementById("emptyState");
const canvas = document.getElementById("pdfCanvas");
const canvasWrap = document.getElementById("canvasWrap");
const pageStage = document.getElementById("pageStage");
const textLayer = document.getElementById("textLayer");
const ctx = canvas.getContext("2d", { alpha: false });

const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");
const pageInput = document.getElementById("pageInput");
const pageLabel = document.getElementById("pageLabel");

const zoomOutButton = document.getElementById("zoomOutButton");
const zoomInButton = document.getElementById("zoomInButton");
const fitWidthButton = document.getElementById("fitWidthButton");
const fitPageButton = document.getElementById("fitPageButton");
const zoomLabel = document.getElementById("zoomLabel");

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const searchPrevButton = document.getElementById("searchPrevButton");
const searchNextButton = document.getElementById("searchNextButton");
const searchStatus = document.getElementById("searchStatus");
const searchMiniStatus = document.getElementById("searchMiniStatus");

let pdfjsLib = null;
let pdfDoc = null;
let currentPage = 1;
let currentScale = 1;
let renderTask = null;
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
  const availableHeight = Math.max(240, canvasWrap.clientHeight - 14);

  return clampScale(
    Math.min(
      availableWidth / viewport.width,
      availableHeight / viewport.height
    )
  );
}

function clearTextLayer() {
  textLayer.innerHTML = "";
}

async function getPageTextData(pageNumber) {
  if (pageTextCache.has(pageNumber)) return pageTextCache.get(pageNumber);
  const page = await pdfDoc.getPage(pageNumber);
  const textContent = await page.getTextContent();
  const items = textContent.items.map((item, index) => ({
    index,
    str: item.str || "",
    lower: (item.str || "").toLocaleLowerCase(),
    raw: item
  }));
  const data = { textContent, items };
  pageTextCache.set(pageNumber, data);
  return data;
}

async function renderTextLayer(page, viewport) {
  clearTextLayer();

  const { textContent, items } = await getPageTextData(currentPage);
  const styles = textContent.styles || {};

  textLayer.style.width = `${Math.floor(viewport.width)}px`;
  textLayer.style.height = `${Math.floor(viewport.height)}px`;

  let textItems = 0;

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

    const left = tx[4];
    const top = tx[5] - fontHeight * ascent;

    span.style.left = `${left}px`;
    span.style.top = `${top}px`;
    span.style.fontSize = `${fontHeight}px`;
    span.style.fontFamily = style.fontFamily || "sans-serif";

    const transforms = [];
    if (angle) {
      transforms.push(`rotate(${angle}rad)`);
    }

    span.style.transform = transforms.join(" ");
    textLayer.appendChild(span);

    // Correct horizontal scale after the browser has measured the span.
    const measuredWidth = span.getBoundingClientRect().width;
    const desiredWidth = Math.abs(item.width * currentScale);

    if (measuredWidth > 0 && desiredWidth > 0) {
      const scaleX = desiredWidth / measuredWidth;
      const rotation = angle ? `rotate(${angle}rad) ` : "";
      span.style.transform = `${rotation}scaleX(${scaleX})`;
    }

    textItems++;
  }

  applyHighlightsForCurrentPage();
}

function applyHighlightsForCurrentPage() {
  [...textLayer.querySelectorAll("span")].forEach(span => span.classList.remove("search-hit", "search-active"));
  searchResults.forEach((result, idx) => {
    if (result.page !== currentPage) return;
    const span = textLayer.querySelector(`span[data-item-index="${result.itemIndex}"]`);
    if (!span) return;
    span.classList.add("search-hit");
    if (idx === activeSearchIndex) span.classList.add("search-active");
  });
}


async function renderPage(targetPage, scale = currentScale) {
  if (!pdfDoc) return;

  const pageNumber = Math.max(1, Math.min(pdfDoc.numPages, Math.round(targetPage)));
  const safeScale = clampScale(scale);

  if (renderTask) {
    try { renderTask.cancel(); } catch {}
    renderTask = null;
  }

  clearTextLayer();

  try {
    const page = await pdfDoc.getPage(pageNumber);
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

    renderTask = page.render({
      canvasContext: ctx,
      transform,
      viewport
    });

    await renderTask.promise;
    renderTask = null;

    currentPage = pageNumber;
    currentScale = safeScale;
    updateUi();

    await renderTextLayer(page, viewport);

    setMessage(
      `Pagina ${currentPage} van ${pdfDoc.numPages} · tekstselectie actief`,
      "ok"
    );
  } catch (error) {
    if (error?.name === "RenderingCancelledException") return;

    console.error(error);
    renderTask = null;
    setMessage(`Renderfout: ${error?.message || error}`, "error");
  }
}

async function openPdf(file) {
  if (!file || !pdfjsLib) return;

  fileName.textContent = file.name || "Onbekend bestand";
  pageCount.textContent = "…";
  textStatus.textContent = "Wachten";
  emptyState.classList.add("hidden");
  reader.classList.remove("hidden");
  setMessage("PDF wordt lokaal ingelezen…");

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    pdfDoc = await pdfjsLib.getDocument({ data: bytes }).promise;

    currentPage = 1;
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
    updateUi();
    setMessage(`PDF openen mislukt: ${error?.message || error}`, "error");
  }
}


async function searchPdf() {
  if (!pdfDoc) return;

  const query = searchInput.value.trim().toLocaleLowerCase();
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

  for (let pageNumber = 1; pageNumber <= pdfDoc.numPages; pageNumber++) {
    const { items } = await getPageTextData(pageNumber);

    for (const item of items) {
      if (!item.lower) continue;
      let start = 0;
      while (true) {
        const hit = item.lower.indexOf(query, start);
        if (hit === -1) break;
        searchResults.push({ page: pageNumber, itemIndex: item.index, offset: hit });
        start = hit + Math.max(1, query.length);
      }
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
  await showActiveSearchResult();
  updateUi();
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

  requestAnimationFrame(() => {
    const span = textLayer.querySelector(`span[data-item-index="${result.itemIndex}"]`);
    span?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
  });
}

fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.[0];
  fileInput.value = "";
  await openPdf(file);
});

prevButton.addEventListener("click", () => {
  if (pdfDoc && currentPage > 1) renderPage(currentPage - 1, currentScale);
});

nextButton.addEventListener("click", () => {
  if (pdfDoc && currentPage < pdfDoc.numPages) renderPage(currentPage + 1, currentScale);
});

pageInput.addEventListener("change", () => {
  if (!pdfDoc) return;
  const requested = Number(pageInput.value);
  if (Number.isFinite(requested)) renderPage(requested, currentScale);
  else pageInput.value = String(currentPage);
});

zoomInButton.addEventListener("click", () => {
  if (pdfDoc) renderPage(currentPage, currentScale + 0.15);
});

zoomOutButton.addEventListener("click", () => {
  if (pdfDoc) renderPage(currentPage, currentScale - 0.15);
});

fitWidthButton.addEventListener("click", async () => {
  if (!pdfDoc) return;
  await renderPage(currentPage, await fitWidthScale(currentPage));
});

fitPageButton.addEventListener("click", async () => {
  if (!pdfDoc) return;
  await renderPage(currentPage, await fitPageScale(currentPage));
});

searchButton.addEventListener("click", searchPdf);
searchInput.addEventListener("keydown", event => {
  if (event.key === "Enter") searchPdf();
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

console.info(`PdfReader ${APP_VERSION} — Text Layer geladen.`);
