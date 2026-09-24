const APP_VERSION = "0.2.3";

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
const fullscreenButton = $("fullscreenButton");

const fullscreenButtonTop = $("fullscreenButtonTop");
const openMenuButton = $("openMenuButton");
const moreMenuButton = $("moreMenuButton");
const sideMenu = $("sideMenu");
const moreMenu = $("moreMenu");
const menuBackdrop = $("menuBackdrop");
const sideMenuCloseButton = $("sideMenuCloseButton");
const openPdfMenuItem = $("openPdfMenuItem");
const fitWidthMenuItem = $("fitWidthMenuItem");
const fitPageMenuItem = $("fitPageMenuItem");
const resetZoomMenuItem = $("resetZoomMenuItem");
const toggleControlsMenuItem = $("toggleControlsMenuItem");
const searchToggleButton = $("searchToggleButton");
const searchPanel = $("searchPanel");
const searchCloseButton = $("searchCloseButton");
const topbarFileName = $("topbarFileName");

const thumbnailsMenuItem = $("thumbnailsMenuItem");
const fsThumbnailsButton = $("fsThumbnailsButton");
const thumbnailDrawer = $("thumbnailDrawer");
const thumbnailDrawerClose = $("thumbnailDrawerClose");
const thumbnailBackdrop = $("thumbnailBackdrop");
const thumbnailList = $("thumbnailList");
const thumbnailCount = $("thumbnailCount");

const fullscreenHandle = $("fullscreenHandle");
const fullscreenHandleButton = $("fullscreenHandleButton");
const fullscreenOverlay = $("fullscreenOverlay");
const fullscreenOverlayClose = $("fullscreenOverlayClose");
const fullscreenOverlayTitle = $("fullscreenOverlayTitle");
const fsPrevButton = $("fsPrevButton");
const fsNextButton = $("fsNextButton");
const fsCurrentPage = $("fsCurrentPage");
const fsPageCount = $("fsPageCount");
const fsZoomOutButton = $("fsZoomOutButton");
const fsZoomInButton = $("fsZoomInButton");
const fsZoomLabel = $("fsZoomLabel");
const fsSearchButton = $("fsSearchButton");
const fsFitWidthButton = $("fsFitWidthButton");
const fsFitPageButton = $("fsFitPageButton");
const fsFillScreenButton = $("fsFillScreenButton");
const fsResetZoomButton = $("fsResetZoomButton");
const fsExitButton = $("fsExitButton");
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



function closeMenus() {
  sideMenu.classList.add("hidden");
  moreMenu.classList.add("hidden");
  menuBackdrop.classList.add("hidden");
  sideMenu.setAttribute("aria-hidden", "true");
  moreMenu.setAttribute("aria-hidden", "true");
}

function openSideMenu() {
  closeMenus();
  sideMenu.classList.remove("hidden");
  menuBackdrop.classList.remove("hidden");
  sideMenu.setAttribute("aria-hidden", "false");
}

function openMoreMenu() {
  closeMenus();
  moreMenu.classList.remove("hidden");
  menuBackdrop.classList.remove("hidden");
  moreMenu.setAttribute("aria-hidden", "false");
}

function setControlsVisible(visible) {
  document.body.classList.toggle("controls-hidden", !visible);
  toggleControlsMenuItem.textContent = visible ? "Bediening verbergen" : "Bediening tonen";
}

function toggleControls() {
  setControlsVisible(document.body.classList.contains("controls-hidden"));
}

function openSearchPanel() {
  setControlsVisible(true);
  searchPanel.classList.remove("hidden");
  window.setTimeout(() => searchInput.focus(), 0);
}

function closeSearchPanel() {
  searchPanel.classList.add("hidden");
}


let fullscreenControlsTimer = null;

let fullscreenViewMode = "fit-page";

let thumbnailObserver = null;
let thumbnailRenderQueue = new Set();
let thumbnailRendered = new Set();

function setFullscreenViewMode(mode) {
  fullscreenViewMode = mode;
  document.body.classList.remove(
    "fullscreen-mode-fit-page",
    "fullscreen-mode-fit-width",
    "fullscreen-mode-fill-screen"
  );
  document.body.classList.add(`fullscreen-mode-${mode}`);

  [fsFitPageButton, fsFitWidthButton, fsFillScreenButton].forEach(btn => {
    btn?.classList.remove("active-mode");
  });

  if (mode === "fit-page") fsFitPageButton?.classList.add("active-mode");
  if (mode === "fit-width") fsFitWidthButton?.classList.add("active-mode");
  if (mode === "fill-screen") fsFillScreenButton?.classList.add("active-mode");
}

async function fullscreenScaleForMode(mode, pageNumber) {
  if (!pdfDoc) return currentScale;

  const page = await pdfDoc.getPage(pageNumber);
  const base = page.getViewport({ scale: 1 });

  const vw = Math.max(1, window.innerWidth);
  const vh = Math.max(1, window.innerHeight);

  if (mode === "fit-page") {
    return clampScale(Math.min(vw / base.width, vh / base.height));
  }

  if (mode === "fit-width") {
    return clampScale(vw / base.width);
  }

  // fill-screen: cover entire viewport, allowing overflow/panning on one axis.
  return clampScale(Math.max(vw / base.width, vh / base.height));
}

async function applyFullscreenViewMode(mode = fullscreenViewMode, { recenter = true } = {}) {
  if (!pdfDoc || !document.body.classList.contains("fullscreen-reader")) return;

  setFullscreenViewMode(mode);
  const scale = await fullscreenScaleForMode(mode, currentPage);
  await renderPage(currentPage, scale);

  if (recenter) {
    requestAnimationFrame(() => {
      const maxX = Math.max(0, canvasWrap.scrollWidth - canvasWrap.clientWidth);
      const maxY = Math.max(0, canvasWrap.scrollHeight - canvasWrap.clientHeight);
      canvasWrap.scrollLeft = Math.round(maxX / 2);
      canvasWrap.scrollTop = Math.round(maxY / 2);
    });
  }
}

function updateFullscreenOverlayUi() {
  if (!pdfDoc) return;
  fsCurrentPage.textContent = String(currentPage);
  fsPageCount.textContent = String(pdfDoc.numPages);
  fsZoomLabel.textContent = `${Math.round(currentScale * 100)}%`;
  fullscreenOverlayTitle.textContent = fileName.textContent || "PdfReader";

  fsPrevButton.disabled = currentPage <= 1;
  fsNextButton.disabled = currentPage >= pdfDoc.numPages;
}

function showFullscreenHandle() {
  if (!document.body.classList.contains("fullscreen-reader")) return;
  fullscreenHandle.classList.remove("hidden");
  fullscreenHandle.setAttribute("aria-hidden", "false");
}

function hideFullscreenHandle() {
  fullscreenHandle.classList.add("hidden");
  fullscreenHandle.setAttribute("aria-hidden", "true");
}

function openFullscreenOverlay() {
  if (!document.body.classList.contains("fullscreen-reader")) return;
  clearTimeout(fullscreenControlsTimer);
  updateFullscreenOverlayUi();
  fullscreenOverlay.classList.remove("hidden");
  fullscreenOverlay.setAttribute("aria-hidden", "false");
  hideFullscreenHandle();
}

function closeFullscreenOverlay() {
  fullscreenOverlay.classList.add("hidden");
  fullscreenOverlay.setAttribute("aria-hidden", "true");
  scheduleFullscreenHandle();
}

function scheduleFullscreenHandle() {
  clearTimeout(fullscreenControlsTimer);
  showFullscreenHandle();
  fullscreenControlsTimer = setTimeout(() => {
    if (
      document.body.classList.contains("fullscreen-reader") &&
      fullscreenOverlay.classList.contains("hidden")
    ) {
      fullscreenHandle.classList.add("idle");
    }
  }, 2400);
}

function enterImmersiveUi() {
  setControlsVisible(false);
  closeMenus();
  closeSearchPanel();
  closeFullscreenOverlay();
  showFullscreenHandle();
  setFullscreenViewMode("fit-page");
}

function leaveImmersiveUi() {
  clearTimeout(fullscreenControlsTimer);
  closeFullscreenOverlay();
  closeThumbnailDrawer();
  hideFullscreenHandle();
  setControlsVisible(true);
}


function closeThumbnailDrawer() {
  thumbnailDrawer.classList.add("hidden");
  thumbnailBackdrop.classList.add("hidden");
  thumbnailDrawer.setAttribute("aria-hidden", "true");
}

function openThumbnailDrawer() {
  if (!pdfDoc) return;
  closeMenus();
  closeFullscreenOverlay();
  buildThumbnailList();
  updateActiveThumbnail();
  thumbnailDrawer.classList.remove("hidden");
  thumbnailBackdrop.classList.remove("hidden");
  thumbnailDrawer.setAttribute("aria-hidden", "false");
}

function resetThumbnails() {
  thumbnailObserver?.disconnect();
  thumbnailObserver = null;
  thumbnailRenderQueue.clear();
  thumbnailRendered.clear();
  thumbnailList.innerHTML = "";
  thumbnailCount.textContent = "0 pagina's";
}

function buildThumbnailList() {
  if (!pdfDoc) return;

  if (thumbnailList.children.length === pdfDoc.numPages) {
    ensureThumbnailObserver();
    observePendingThumbnails();
    return;
  }

  resetThumbnails();
  thumbnailCount.textContent = `${pdfDoc.numPages} pagina${pdfDoc.numPages === 1 ? "" : "'s"}`;

  const fragment = document.createDocumentFragment();

  for (let pageNumber = 1; pageNumber <= pdfDoc.numPages; pageNumber++) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "thumbnail-item";
    button.dataset.pageNumber = String(pageNumber);
    button.setAttribute("aria-label", `Ga naar pagina ${pageNumber}`);

    const preview = document.createElement("div");
    preview.className = "thumbnail-preview";
    preview.dataset.pageNumber = String(pageNumber);

    const placeholder = document.createElement("div");
    placeholder.className = "thumbnail-placeholder";
    placeholder.textContent = "Laden…";
    preview.appendChild(placeholder);

    const meta = document.createElement("div");
    meta.className = "thumbnail-meta";
    meta.innerHTML = `<strong>Pagina ${pageNumber}</strong><span>Tik om te openen</span>`;

    button.appendChild(preview);
    button.appendChild(meta);

    button.addEventListener("click", async () => {
      const target = Number(button.dataset.pageNumber);
      closeThumbnailDrawer();

      if (document.body.classList.contains("fullscreen-reader")) {
        await renderPage(target, currentScale);
        if (fullscreenViewMode === "fit-page") {
          await applyFullscreenViewMode("fit-page");
        }
      } else {
        await renderPage(target, currentScale);
      }

      updateActiveThumbnail();
    });

    fragment.appendChild(button);
  }

  thumbnailList.appendChild(fragment);
  ensureThumbnailObserver();
  observePendingThumbnails();
}

function ensureThumbnailObserver() {
  if (thumbnailObserver) return;

  thumbnailObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;

      const preview = entry.target;
      const pageNumber = Number(preview.dataset.pageNumber);

      thumbnailObserver.unobserve(preview);
      renderThumbnail(pageNumber, preview);
    }
  }, {
    root: thumbnailList,
    rootMargin: "180px 0px",
    threshold: 0.01
  });
}

function observePendingThumbnails() {
  if (!thumbnailObserver) return;

  thumbnailList.querySelectorAll(".thumbnail-preview").forEach(preview => {
    const pageNumber = Number(preview.dataset.pageNumber);
    if (!thumbnailRendered.has(pageNumber) && !thumbnailRenderQueue.has(pageNumber)) {
      thumbnailObserver.observe(preview);
    }
  });
}

async function renderThumbnail(pageNumber, preview) {
  if (!pdfDoc || thumbnailRendered.has(pageNumber) || thumbnailRenderQueue.has(pageNumber)) return;

  thumbnailRenderQueue.add(pageNumber);

  try {
    const page = await pdfDoc.getPage(pageNumber);
    const baseViewport = page.getViewport({ scale: 1 });

    const targetWidth = 78;
    const scale = targetWidth / baseViewport.width;
    const viewport = page.getViewport({ scale });

    const canvasThumb = document.createElement("canvas");
    const thumbCtx = canvasThumb.getContext("2d", { alpha: false });
    const outputScale = Math.min(1.5, Math.max(1, window.devicePixelRatio || 1));

    canvasThumb.width = Math.max(1, Math.floor(viewport.width * outputScale));
    canvasThumb.height = Math.max(1, Math.floor(viewport.height * outputScale));
    canvasThumb.style.width = `${Math.floor(viewport.width)}px`;
    canvasThumb.style.height = `${Math.floor(viewport.height)}px`;

    const transform = outputScale !== 1
      ? [outputScale, 0, 0, outputScale, 0, 0]
      : null;

    await page.render({
      canvasContext: thumbCtx,
      viewport,
      transform
    }).promise;

    preview.innerHTML = "";
    preview.appendChild(canvasThumb);
    thumbnailRendered.add(pageNumber);
  } catch (error) {
    console.warn(`Thumbnail pagina ${pageNumber} kon niet renderen.`, error);
    preview.innerHTML = '<div class="thumbnail-placeholder">Niet beschikbaar</div>';
  } finally {
    thumbnailRenderQueue.delete(pageNumber);
  }
}

function updateActiveThumbnail() {
  thumbnailList.querySelectorAll(".thumbnail-item").forEach(item => {
    item.classList.toggle(
      "active",
      Number(item.dataset.pageNumber) === currentPage
    );
  });

  const active = thumbnailList.querySelector(
    `.thumbnail-item[data-page-number="${currentPage}"]`
  );

  if (active && !thumbnailDrawer.classList.contains("hidden")) {
    active.scrollIntoView({ block: "nearest" });
  }
}

function fullscreenSupported() {
  return Boolean(
    document.documentElement.requestFullscreen ||
    document.documentElement.webkitRequestFullscreen
  );
}

function nativeFullscreenActive() {
  return Boolean(document.fullscreenElement || document.webkitFullscreenElement);
}

function setFullscreenUi(active) {
  document.body.classList.toggle("fullscreen-reader", active);
  fullscreenButton.textContent = active ? "Fullscreen sluiten" : "Fullscreen";
  fullscreenButtonTop.textContent = active ? "⛶" : "⛶";
  fullscreenButton.setAttribute("aria-label", active ? "Fullscreen sluiten" : "Fullscreen openen");
  fullscreenButtonTop.setAttribute("aria-label", active ? "Fullscreen sluiten" : "Fullscreen openen");
}

async function enterFullscreen() {
  if (!pdfDoc) return;

  // Apply reader-only layout immediately. If native fullscreen is unsupported,
  // this remains as a safe browser fallback.
  setFullscreenUi(true);
  enterImmersiveUi();
  fullscreenViewMode = "fit-page";

  try {
    const root = document.documentElement;
    if (root.requestFullscreen) {
      await root.requestFullscreen({ navigationUI: "hide" });
    } else if (root.webkitRequestFullscreen) {
      root.webkitRequestFullscreen();
    }
  } catch (error) {
    console.warn("Native fullscreen geweigerd; focusmodus blijft actief.", error);
  }

  // Refit after viewport dimensions have changed.
  window.setTimeout(async () => {
    if (!pdfDoc) return;
    try {
      if (document.body.classList.contains("fullscreen-reader")) {
        await applyFullscreenViewMode(fullscreenViewMode);
      } else {
        if (document.body.classList.contains("fullscreen-reader")) {
      await applyFullscreenViewMode(fullscreenViewMode);
    } else {
      await renderPage(currentPage, await fitWidthScale(currentPage));
    }
      }
    } catch (error) {
      console.warn("Herfit na fullscreen mislukt.", error);
    }
  }, 180);
}

async function exitFullscreen() {
  try {
    if (document.exitFullscreen && document.fullscreenElement) {
      await document.exitFullscreen();
    } else if (document.webkitExitFullscreen && document.webkitFullscreenElement) {
      document.webkitExitFullscreen();
    }
  } catch (error) {
    console.warn("Fullscreen afsluiten gaf een fout.", error);
  }

  setFullscreenUi(false);
  leaveImmersiveUi();

  window.setTimeout(async () => {
    if (!pdfDoc) return;
    try {
      if (document.body.classList.contains("fullscreen-reader")) {
        await applyFullscreenViewMode(fullscreenViewMode);
      } else {
        if (document.body.classList.contains("fullscreen-reader")) {
      await applyFullscreenViewMode(fullscreenViewMode);
    } else {
      await renderPage(currentPage, await fitWidthScale(currentPage));
    }
      }
    } catch (error) {
      console.warn("Herfit na fullscreen afsluiten mislukt.", error);
    }
  }, 180);
}

async function toggleFullscreen() {
  if (!pdfDoc) return;

  const active = document.body.classList.contains("fullscreen-reader");
  if (active) {
    await exitFullscreen();
  } else {
    await enterFullscreen();
  }
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
  fullscreenButton.disabled = !ready;
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
  if (ready) updateFullscreenOverlayUi();
  if (ready) updateActiveThumbnail();
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
  topbarFileName.textContent = file.name || "Onbekend bestand";
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
    resetThumbnails();
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



openMenuButton.addEventListener("click", openSideMenu);
moreMenuButton.addEventListener("click", openMoreMenu);
menuBackdrop.addEventListener("click", closeMenus);
sideMenuCloseButton.addEventListener("click", closeMenus);

openPdfMenuItem.addEventListener("click", () => {
  closeMenus();
  fileInput.click();
});

fitWidthMenuItem.addEventListener("click", async () => {
  closeMenus();
  if (!pdfDoc) return;
  await renderPage(currentPage, await fitWidthScale(currentPage));
});

fitPageMenuItem.addEventListener("click", async () => {
  closeMenus();
  if (!pdfDoc) return;
  await renderPage(currentPage, await fitPageScale(currentPage));
});

resetZoomMenuItem.addEventListener("click", async () => {
  closeMenus();
  if (!pdfDoc) return;
  await renderPage(currentPage, 1);
});

toggleControlsMenuItem.addEventListener("click", () => {
  closeMenus();
  toggleControls();
});

searchToggleButton.addEventListener("click", () => {
  if (searchPanel.classList.contains("hidden")) openSearchPanel();
  else closeSearchPanel();
});

searchCloseButton.addEventListener("click", closeSearchPanel);

fullscreenButtonTop.addEventListener("click", toggleFullscreen);


thumbnailsMenuItem.addEventListener("click", openThumbnailDrawer);
fsThumbnailsButton.addEventListener("click", openThumbnailDrawer);
thumbnailDrawerClose.addEventListener("click", closeThumbnailDrawer);
thumbnailBackdrop.addEventListener("click", closeThumbnailDrawer);

fullscreenHandleButton.addEventListener("click", openFullscreenOverlay);

fullscreenOverlayClose.addEventListener("click", closeFullscreenOverlay);

fullscreenOverlay.addEventListener("click", event => {
  if (event.target === fullscreenOverlay) closeFullscreenOverlay();
});

fsPrevButton.addEventListener("click", async () => {
  if (pdfDoc && currentPage > 1) {
    await renderPage(currentPage - 1, currentScale);
    updateFullscreenOverlayUi();
  }
});

fsNextButton.addEventListener("click", async () => {
  if (pdfDoc && currentPage < pdfDoc.numPages) {
    await renderPage(currentPage + 1, currentScale);
    updateFullscreenOverlayUi();
  }
});

fsZoomOutButton.addEventListener("click", async () => {
  if (!pdfDoc) return;
  await renderPage(currentPage, currentScale - 0.15);
  updateFullscreenOverlayUi();
});

fsZoomInButton.addEventListener("click", async () => {
  if (!pdfDoc) return;
  await renderPage(currentPage, currentScale + 0.15);
  updateFullscreenOverlayUi();
});

fsFitWidthButton.addEventListener("click", async () => {
  if (!pdfDoc) return;
  await applyFullscreenViewMode("fit-width");
  updateFullscreenOverlayUi();
  closeFullscreenOverlay();
});

fsFitPageButton.addEventListener("click", async () => {
  if (!pdfDoc) return;
  await applyFullscreenViewMode("fit-page");
  updateFullscreenOverlayUi();
  closeFullscreenOverlay();
});

fsFillScreenButton.addEventListener("click", async () => {
  if (!pdfDoc) return;
  await applyFullscreenViewMode("fill-screen");
  updateFullscreenOverlayUi();
  closeFullscreenOverlay();
});

fsResetZoomButton.addEventListener("click", async () => {
  if (!pdfDoc) return;
  await renderPage(currentPage, 1);
  updateFullscreenOverlayUi();
  closeFullscreenOverlay();
});

fsSearchButton.addEventListener("click", () => {
  closeFullscreenOverlay();
  setControlsVisible(true);
  openSearchPanel();
});

fsExitButton.addEventListener("click", async () => {
  closeFullscreenOverlay();
  await exitFullscreen();
});

fullscreenButton.addEventListener("click", toggleFullscreen);

function syncFullscreenState() {
  // If native fullscreen was closed with Esc/back gesture, also leave reader-only CSS mode.
  if (!nativeFullscreenActive() && document.body.classList.contains("fullscreen-reader")) {
    setFullscreenUi(false);
    leaveImmersiveUi();
    window.setTimeout(async () => {
      if (!pdfDoc) return;
      try {
        if (document.body.classList.contains("fullscreen-reader")) {
        await applyFullscreenViewMode(fullscreenViewMode);
      } else {
        if (document.body.classList.contains("fullscreen-reader")) {
      await applyFullscreenViewMode(fullscreenViewMode);
    } else {
      await renderPage(currentPage, await fitWidthScale(currentPage));
    }
      }
      } catch (error) {
        console.warn("Herfit na extern fullscreen-einde mislukt.", error);
      }
    }, 120);
  }
}

document.addEventListener("fullscreenchange", syncFullscreenState);
document.addEventListener("webkitfullscreenchange", syncFullscreenState);


let gestureStartX = 0;
let gestureStartY = 0;
let gestureStartTime = 0;
let gestureMoved = false;
let pinchStartDistance = 0;
let pinchStartScale = 1;
let pinchActive = false;

function selectionActive() {
  const selection = window.getSelection?.();
  return Boolean(selection && !selection.isCollapsed && String(selection).trim());
}

function touchDistance(t1, t2) {
  return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
}

pageStage.addEventListener("touchstart", event => {
  if (!pdfDoc) return;

  if (event.touches.length === 2) {
    pinchActive = true;
    pinchStartDistance = touchDistance(event.touches[0], event.touches[1]);
    pinchStartScale = currentScale;
    return;
  }

  if (event.touches.length !== 1) return;

  pinchActive = false;
  gestureMoved = false;
  gestureStartX = event.touches[0].clientX;
  gestureStartY = event.touches[0].clientY;
  gestureStartTime = performance.now();
}, { passive: true });

pageStage.addEventListener("touchmove", event => {
  if (!pdfDoc) return;

  if (event.touches.length === 2 && pinchActive) {
    const distance = touchDistance(event.touches[0], event.touches[1]);
    if (pinchStartDistance > 0) {
      const factor = distance / pinchStartDistance;
      const previewScale = clampScale(pinchStartScale * factor);
      zoomLabel.textContent = `${Math.round(previewScale * 100)}%`;
    }
    gestureMoved = true;
    return;
  }

  if (event.touches.length !== 1) return;
  const dx = event.touches[0].clientX - gestureStartX;
  const dy = event.touches[0].clientY - gestureStartY;
  if (Math.abs(dx) > 8 || Math.abs(dy) > 8) gestureMoved = true;
}, { passive: true });

pageStage.addEventListener("touchend", async event => {
  if (!pdfDoc) return;

  if (pinchActive) {
    pinchActive = false;
    if (event.changedTouches.length >= 1) {
      // Use last preview estimate from label when possible.
      const pct = parseInt(zoomLabel.textContent, 10);
      if (Number.isFinite(pct)) {
        await renderPage(currentPage, clampScale(pct / 100));
      }
    }
    return;
  }

  if (!event.changedTouches.length) return;

  const endX = event.changedTouches[0].clientX;
  const endY = event.changedTouches[0].clientY;
  const dx = endX - gestureStartX;
  const dy = endY - gestureStartY;
  const dt = performance.now() - gestureStartTime;

  if (selectionActive()) return;

  // Horizontal swipe only when page itself is not horizontally scrolled at an edge conflict.
  const horizontal = Math.abs(dx) > Math.abs(dy) * 1.35;
  const fastEnough = dt < 700;
  const farEnough = Math.abs(dx) >= 70;

  if (horizontal && fastEnough && farEnough) {
    const maxScrollX = Math.max(0, canvasWrap.scrollWidth - canvasWrap.clientWidth);
    const atLeftEdge = canvasWrap.scrollLeft <= 2;
    const atRightEdge = canvasWrap.scrollLeft >= maxScrollX - 2;
    const hasHorizontalPan = maxScrollX > 4;

    // When zoomed/fill-screen, horizontal swipes first belong to panning.
    // Page navigation is only allowed once the user reaches the relevant edge.
    if (dx < 0) {
      if (hasHorizontalPan && !atRightEdge) return;
      if (currentPage < pdfDoc.numPages) {
        await renderPage(currentPage + 1, currentScale);
        if (document.body.classList.contains("fullscreen-reader")) {
          await applyFullscreenViewMode(fullscreenViewMode);
        }
        return;
      }
    }

    if (dx > 0) {
      if (hasHorizontalPan && !atLeftEdge) return;
      if (currentPage > 1) {
        await renderPage(currentPage - 1, currentScale);
        if (document.body.classList.contains("fullscreen-reader")) {
          await applyFullscreenViewMode(fullscreenViewMode);
        }
        return;
      }
    }
  }

  // Short tap in document area toggles controls.
  const tap = dt < 280 && Math.abs(dx) < 12 && Math.abs(dy) < 12 && !gestureMoved;
  if (tap) {
    if (document.body.classList.contains("fullscreen-reader")) {
      if (fullscreenOverlay.classList.contains("hidden")) {
        openFullscreenOverlay();
      } else {
        closeFullscreenOverlay();
      }
    } else {
      toggleControls();
    }
  }
}, { passive: true });


window.addEventListener("orientationchange", () => {
  window.setTimeout(async () => {
    if (!pdfDoc) return;
    try {
      if (document.body.classList.contains("fullscreen-reader")) {
        await applyFullscreenViewMode(fullscreenViewMode);
      }
    } catch (error) {
      console.warn("Fullscreen herberekenen na rotatie mislukt.", error);
    }
  }, 220);
});

let resizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(async () => {
    if (!pdfDoc) return;
    if (document.body.classList.contains("fullscreen-reader")) {
      await applyFullscreenViewMode(fullscreenViewMode);
    } else {
      await renderPage(currentPage, await fitWidthScale(currentPage));
    }
  }, 180);
});

await loadPdfJs();
updateUi();
console.info(`PdfReader ${APP_VERSION} — Thumbnails geladen.`);
