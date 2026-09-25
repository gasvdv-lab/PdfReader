const APP_VERSION = "0.3.2";

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

const continuousScrollMenuItem = $("continuousScrollMenuItem");
const fsContinuousScrollButton = $("fsContinuousScrollButton");
const continuousViewer = $("continuousViewer");
const continuousPages = $("continuousPages");
const annotationLayer = $("annotationLayer");
const annotationModeMenuItem = $("annotationModeMenuItem");
const fsAnnotationModeButton = $("fsAnnotationModeButton");
const annotationStatusChip = $("annotationStatusChip");

const highlightModeMenuItem = $("highlightModeMenuItem");
const fsHighlightModeButton = $("fsHighlightModeButton");
const highlightActionBar = $("highlightActionBar");
const highlightActionLabel = $("highlightActionLabel");
const applyHighlightButton = $("applyHighlightButton");
const deleteHighlightButton = $("deleteHighlightButton");
const closeHighlightActionButton = $("closeHighlightActionButton");

const textModeMenuItem = $("textModeMenuItem");
const fsTextModeButton = $("fsTextModeButton");
const textToolbarSlot = $("textToolbarSlot");
const textActionBar = $("textActionBar");
const textDraftInput = $("textDraftInput");
const textSizeSelect = $("textSizeSelect");
const textColorSelect = $("textColorSelect");
const saveTextAnnotationButton = $("saveTextAnnotationButton");
const deleteTextAnnotationButton = $("deleteTextAnnotationButton");
const cancelTextAnnotationButton = $("cancelTextAnnotationButton");

const installAppMenuItem = $("installAppMenuItem");
const installStatus = $("installStatus");

const installPanel = $("installPanel");
const installPanelBackdrop = $("installPanelBackdrop");
const installPanelClose = $("installPanelClose");
const installPanelSubtitle = $("installPanelSubtitle");
const installReadyBlock = $("installReadyBlock");
const androidBrowserBlock = $("androidBrowserBlock");
const manualInstallBlock = $("manualInstallBlock");
const installedBlock = $("installedBlock");
const nativeInstallButton = $("nativeInstallButton");
const openChromeButton = $("openChromeButton");
const openRegularBrowserLink = $("openRegularBrowserLink");
const manualInstallText = $("manualInstallText");
const diagHttps = $("diagHttps");
const diagManifest = $("diagManifest");
const diagStandalone = $("diagStandalone");
const diagPrompt = $("diagPrompt");
const diagOffline = $("diagOffline");
const diagPlatform = $("diagPlatform");

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
  if (document.body.classList.contains("fullscreen-reader")) {
    document.body.classList.add("fullscreen-search-open");
  }
  window.setTimeout(() => searchInput.focus(), 0);
}

function closeSearchPanel() {
  searchPanel.classList.add("hidden");
  document.body.classList.remove("fullscreen-search-open");
}


let fullscreenControlsTimer = null;

let fullscreenViewMode = "fit-page";

let thumbnailObserver = null;
let thumbnailRenderQueue = new Set();
let thumbnailRendered = new Set();

let continuousScrollEnabled = false;
let continuousObserver = null;
let continuousPageObserver = null;
let continuousRendered = new Set();
let continuousRendering = new Set();
let continuousVisibilityRatios = new Map();

let deferredInstallPrompt = null;

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
  fsZoomLabel.textContent = continuousScrollEnabled
    ? "Scroll"
    : `${Math.round(currentScale * 100)}%`;
  fullscreenOverlayTitle.textContent = fileName.textContent || "PdfReader";

  fsPrevButton.disabled = currentPage <= 1;
  fsNextButton.disabled = currentPage >= pdfDoc.numPages;
  fsZoomOutButton.disabled = continuousScrollEnabled;
  fsZoomInButton.disabled = continuousScrollEnabled;
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

      if (continuousScrollEnabled) {
        await jumpToContinuousPage(target);
      } else if (document.body.classList.contains("fullscreen-reader")) {
        currentPage = target;
        await applyFullscreenViewMode(fullscreenViewMode);
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


function setContinuousScrollEnabled(enabled) {
  continuousScrollEnabled = Boolean(enabled);
  document.body.classList.toggle("continuous-scroll-mode", continuousScrollEnabled);

  continuousScrollMenuItem.textContent = continuousScrollEnabled
    ? "Single page weergave"
    : "Doorlopend scrollen";

  fsContinuousScrollButton.textContent = continuousScrollEnabled
    ? "Single page weergave"
    : "Doorlopend scrollen";

  if (!continuousScrollEnabled) {
    teardownContinuousObservers();
    continuousViewer.classList.add("hidden");
    canvasWrap.classList.remove("hidden");
  } else {
    continuousViewer.classList.remove("hidden");
    canvasWrap.classList.add("hidden");
  }

  updateUi();
}

function teardownContinuousObservers() {
  continuousObserver?.disconnect();
  continuousPageObserver?.disconnect();
  continuousObserver = null;
  continuousPageObserver = null;
  continuousVisibilityRatios.clear();
}

function resetContinuousScroll() {
  teardownContinuousObservers();
  continuousRendered.clear();
  continuousRendering.clear();
  continuousPages.innerHTML = "";
}

async function continuousScaleForPage(page) {
  const base = page.getViewport({ scale: 1 });
  const availableWidth = Math.max(
    220,
    continuousViewer.clientWidth - (window.innerWidth <= 640 ? 16 : 32)
  );
  return clampScale(Math.min(1.5, availableWidth / base.width));
}

async function buildContinuousPages({ preservePosition = true } = {}) {
  if (!pdfDoc || !continuousScrollEnabled) return;

  continuousViewer.classList.remove("hidden");
  canvasWrap.classList.add("hidden");

  if (continuousPages.children.length !== pdfDoc.numPages) {
    resetContinuousScroll();

    const fragment = document.createDocumentFragment();

    for (let pageNumber = 1; pageNumber <= pdfDoc.numPages; pageNumber++) {
      const wrapper = document.createElement("section");
      wrapper.className = "continuous-page";
      wrapper.dataset.pageNumber = String(pageNumber);

      const placeholder = document.createElement("div");
      placeholder.className = "continuous-page-placeholder";
      placeholder.textContent = `Pagina ${pageNumber} laden wanneer zichtbaar…`;

      wrapper.appendChild(placeholder);
      fragment.appendChild(wrapper);
    }

    continuousPages.appendChild(fragment);
  }

  ensureContinuousObservers();
  observeContinuousPages();

  if (preservePosition) {
    requestAnimationFrame(() => {
      const target = continuousPages.querySelector(
        `.continuous-page[data-page-number="${currentPage}"]`
      );
      target?.scrollIntoView({ block: "center" });
    });
  }
}

function ensureContinuousObservers() {
  if (!continuousObserver) {
    continuousObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const wrapper = entry.target;
        const pageNumber = Number(wrapper.dataset.pageNumber);
        void renderContinuousPage(pageNumber, wrapper);
      }
    }, {
      root: continuousViewer,
      rootMargin: "900px 0px",
      threshold: 0.01
    });
  }

  if (!continuousPageObserver) {
    continuousPageObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const pageNumber = Number(entry.target.dataset.pageNumber);
        if (!Number.isFinite(pageNumber)) continue;
        continuousVisibilityRatios.set(
          pageNumber,
          entry.isIntersecting ? entry.intersectionRatio : 0
        );
      }

      let bestPage = currentPage;
      let bestRatio = -1;

      for (const [pageNumber, ratio] of continuousVisibilityRatios.entries()) {
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestPage = pageNumber;
        }
      }

      if (bestRatio <= 0 || bestPage === currentPage) return;

      currentPage = bestPage;
      updateUi();

      continuousPages.querySelectorAll(".continuous-page").forEach(page => {
        page.classList.toggle(
          "active-page",
          Number(page.dataset.pageNumber) === currentPage
        );
      });
    }, {
      root: continuousViewer,
      threshold: [0, 0.2, 0.4, 0.6, 0.8]
    });
  }
}

function observeContinuousPages() {
  if (!continuousObserver || !continuousPageObserver) return;

  continuousPages.querySelectorAll(".continuous-page").forEach(page => {
    continuousObserver.observe(page);
    continuousPageObserver.observe(page);
  });
}

async function renderContinuousPage(pageNumber, wrapper) {
  if (
    !pdfDoc ||
    !continuousScrollEnabled ||
    continuousRendered.has(pageNumber) ||
    continuousRendering.has(pageNumber)
  ) return;

  continuousRendering.add(pageNumber);

  try {
    const page = await pdfDoc.getPage(pageNumber);
    const scale = await continuousScaleForPage(page);
    const viewport = page.getViewport({ scale });
    const outputScale = Math.min(2, Math.max(1, window.devicePixelRatio || 1));

    const stage = document.createElement("div");
    stage.className = "continuous-page-stage";
    stage.style.width = `${Math.floor(viewport.width)}px`;
    stage.style.height = `${Math.floor(viewport.height)}px`;

    const badge = document.createElement("span");
    badge.className = "continuous-page-number";
    badge.textContent = String(pageNumber);

    const canvasPage = document.createElement("canvas");
    const context = canvasPage.getContext("2d", { alpha: false });

    canvasPage.width = Math.max(1, Math.floor(viewport.width * outputScale));
    canvasPage.height = Math.max(1, Math.floor(viewport.height * outputScale));
    canvasPage.style.width = `${Math.floor(viewport.width)}px`;
    canvasPage.style.height = `${Math.floor(viewport.height)}px`;

    const transform = outputScale !== 1
      ? [outputScale, 0, 0, outputScale, 0, 0]
      : null;

    stage.appendChild(canvasPage);
    stage.appendChild(badge);

    wrapper.replaceChildren(stage);

    const task = page.render({
      canvasContext: context,
      viewport,
      transform
    });
    await task.promise;

    if (!continuousScrollEnabled) return;
    continuousRendered.add(pageNumber);
  } catch (error) {
    if (continuousScrollEnabled) {
      console.warn(`Continuous page ${pageNumber} kon niet renderen.`, error);
      wrapper.innerHTML =
        `<div class="continuous-page-placeholder">Pagina ${pageNumber} kon niet geladen worden.</div>`;
    }
  } finally {
    continuousRendering.delete(pageNumber);
  }
}

async function jumpToContinuousPage(pageNumber, { smooth = true } = {}) {
  if (!continuousScrollEnabled || !pdfDoc) return;

  const target = Math.max(1, Math.min(pdfDoc.numPages, Math.round(pageNumber)));
  currentPage = target;
  updateUi();

  const el = continuousPages.querySelector(
    `.continuous-page[data-page-number="${target}"]`
  );

  if (el) {
    el.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
      block: "center"
    });
  }
}

async function enableContinuousScroll() {
  if (!pdfDoc || continuousScrollEnabled) return;
  if (annotationModeEnabled) setAnnotationMode(false);
  if (highlightModeEnabled) setHighlightMode(false);
  if (textModeEnabled) setTextMode(false);
  setContinuousScrollEnabled(true);
  await buildContinuousPages();
}

async function disableContinuousScroll({ renderSinglePage = true } = {}) {
  if (!continuousScrollEnabled) return;
  setContinuousScrollEnabled(false);

  if (!renderSinglePage || !pdfDoc) return;

  if (document.body.classList.contains("fullscreen-reader")) {
    await applyFullscreenViewMode(fullscreenViewMode);
  } else {
    await renderPage(currentPage, currentScale);
  }
}

async function toggleContinuousScroll() {
  if (!pdfDoc) return;

  if (continuousScrollEnabled) {
    await disableContinuousScroll();
  } else {
    await enableContinuousScroll();
  }

  closeMenus();
  closeFullscreenOverlay();
}



async function cleanupLegacyPwaState() {
  // v0.2.6 gebruikt bewust opnieuw een service worker.
  // Verouderde PdfReader-caches worden veilig door de nieuwe service worker beheerd.
  return {
    registrationsFound: 0,
    registrationsRemoved: 0,
    cachesFound: 0,
    cachesRemoved: 0
  };
}

function isStandaloneMode() {
  return window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.navigator.standalone === true;
}

function isAndroidPlatform() {
  const ua = navigator.userAgent || "";
  return /Android/i.test(ua);
}

function platformLabel() {
  const ua = navigator.userAgent || "";
  if (/Android/i.test(ua)) return "Android";
  if (/Windows/i.test(ua)) return "Windows";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS/iPadOS";
  if (/Macintosh|Mac OS X/i.test(ua)) return "macOS";
  return navigator.platform || "Onbekend";
}

function chromeIntentUrl() {
  const pathAndQuery = `${location.host}${location.pathname}?v=0.3.2`;
  return `intent://${pathAndQuery}#Intent;scheme=https;package=com.android.chrome;end`;
}

function setInstallStatus(message = "", visible = false) {
  if (!installStatus) return;
  installStatus.textContent = message;
  installStatus.classList.toggle("hidden", !visible || !message);
}

async function manifestReachable() {
  try {
    const link = document.querySelector('link[rel="manifest"]');
    if (!link?.href) return false;
    const response = await fetch(link.href, { cache: "no-store" });
    return response.ok;
  } catch {
    return false;
  }
}

async function updateInstallDiagnostics() {
  if (!diagHttps) return;

  diagHttps.textContent = window.isSecureContext ? "OK" : "NEE";
  diagStandalone.textContent = isStandaloneMode() ? "JA" : "NEE";
  diagPrompt.textContent = deferredInstallPrompt ? "BESCHIKBAAR" : "NIET BESCHIKBAAR";
  diagPlatform.textContent = platformLabel();
  diagManifest.textContent = (await manifestReachable()) ? "OK" : "NIET BEREIKBAAR";
  updateOfflineUi();
}

async function openInstallPanel() {
  closeMenus();

  installPanel.classList.remove("hidden");
  installPanel.setAttribute("aria-hidden", "false");

  installReadyBlock.classList.add("hidden");
  androidBrowserBlock.classList.add("hidden");
  manualInstallBlock.classList.add("hidden");
  installedBlock.classList.add("hidden");

  if (isStandaloneMode()) {
    installPanelSubtitle.textContent = "Reeds geïnstalleerd";
    installedBlock.classList.remove("hidden");
  } else if (deferredInstallPrompt) {
    installPanelSubtitle.textContent = "Native installatie beschikbaar";
    installReadyBlock.classList.remove("hidden");
  } else if (isAndroidPlatform()) {
    installPanelSubtitle.textContent = "Open in volledige browser";
    androidBrowserBlock.classList.remove("hidden");
    manualInstallBlock.classList.remove("hidden");
    manualInstallText.textContent =
      "Als Chrome geen automatische prompt toont: open Chrome-menu ⋮ en kies 'App installeren' of 'Toevoegen aan startscherm'.";
    openChromeButton.href = chromeIntentUrl();
  } else {
    installPanelSubtitle.textContent = "Handmatige installatie";
    manualInstallBlock.classList.remove("hidden");
    manualInstallText.textContent =
      "Gebruik in Chrome of Edge het browsermenu en kies 'App installeren'.";
  }

  await updateInstallDiagnostics();
}

function closeInstallPanel() {
  installPanel.classList.add("hidden");
  installPanel.setAttribute("aria-hidden", "true");
}

function refreshInstallUi() {
  if (!installAppMenuItem) return;

  // Critical fix: never hide the installation route just because
  // beforeinstallprompt has not fired.
  if (isStandaloneMode()) {
    installAppMenuItem.textContent = "App geïnstalleerd";
  } else if (deferredInstallPrompt) {
    installAppMenuItem.textContent = "App installeren";
  } else if (isAndroidPlatform()) {
    installAppMenuItem.textContent = "App installeren / Open in Chrome";
  } else {
    installAppMenuItem.textContent = "App installeren";
  }

  installAppMenuItem.classList.remove("hidden");
}

async function triggerNativeInstall() {
  if (!deferredInstallPrompt) {
    await openInstallPanel();
    return;
  }

  const promptEvent = deferredInstallPrompt;
  deferredInstallPrompt = null;
  refreshInstallUi();

  try {
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;

    if (choice?.outcome === "accepted") {
      setInstallStatus("Installatie gestart.", true);
      closeInstallPanel();
    } else {
      setInstallStatus("Installatie geannuleerd.", true);
      await openInstallPanel();
    }
  } catch (error) {
    console.warn("PWA installatieprompt kon niet worden geopend.", error);
    setInstallStatus("Installatieprompt kon niet worden geopend.", true);
    await openInstallPanel();
  }
}

async function installPwa() {
  await openInstallPanel();
}


let offlineEngineReady = false;
let annotationModeEnabled = false;
let annotationIdCounter = 1;
const annotationsByPage = new Map();
let selectedAnnotationId = null;

let highlightModeEnabled = false;
let highlightColor = "yellow";
let pendingHighlightSelection = null;
let suppressHighlightSelectionCapture = false;

let textModeEnabled = false;
let pendingTextPoint = null;
let editingTextAnnotationId = null;

function updateOfflineUi() {
  if (!diagOffline) return;

  if (!("serviceWorker" in navigator)) {
    diagOffline.textContent = "NIET ONDERSTEUND";
  } else if (offlineEngineReady) {
    diagOffline.textContent = "KLAAR";
  } else {
    diagOffline.textContent = "INITIALISEREN";
  }
}

function syncOnlineState() {
  document.body.classList.toggle("is-offline", !navigator.onLine);
}

async function registerOfflineEngine() {
  if (!("serviceWorker" in navigator)) {
    offlineEngineReady = false;
    updateOfflineUi();
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      "./service-worker.js?v=0.3.2",
      {
        scope: "./",
        updateViaCache: "none"
      }
    );

    await navigator.serviceWorker.ready;

    try {
      await registration.update();
    } catch (error) {
      console.warn("Service worker update check overgeslagen.", error);
    }

    offlineEngineReady = true;
    updateOfflineUi();
  } catch (error) {
    offlineEngineReady = false;
    console.error("Offline Engine registratie mislukt.", error);
    setInstallStatus(
      "Offline Engine kon niet worden geactiveerd. Online lezen blijft beschikbaar.",
      true
    );
    updateOfflineUi();
  }
}

window.addEventListener("online", () => {
  syncOnlineState();
  setInstallStatus("", false);
});

window.addEventListener("offline", () => {
  syncOnlineState();
  setInstallStatus(
    "Offline modus actief. Lokale PDF's blijven beschikbaar.",
    true
  );
});

syncOnlineState();


function annotationPageList(pageNumber = currentPage) {
  if (!annotationsByPage.has(pageNumber)) annotationsByPage.set(pageNumber, []);
  return annotationsByPage.get(pageNumber);
}
function nextAnnotationId() { return `ann-${Date.now()}-${annotationIdCounter++}`; }
function setAnnotationMode(enabled) {
  annotationModeEnabled = Boolean(enabled);
  if (annotationModeEnabled && highlightModeEnabled) setHighlightMode(false);
  if (annotationModeEnabled && textModeEnabled) setTextMode(false);
  document.body.classList.toggle("annotation-mode", annotationModeEnabled);
  annotationLayer.classList.toggle("annotation-layer-active", annotationModeEnabled);
  annotationStatusChip?.classList.toggle("hidden", !annotationModeEnabled);
  annotationModeMenuItem.textContent = annotationModeEnabled ? "Annotatiemodus uitschakelen" : "Annotatiemodus";
  if (fsAnnotationModeButton) fsAnnotationModeButton.textContent = annotationModeEnabled ? "Annotatiemodus uitschakelen" : "Annotatiemodus";
  if (!annotationModeEnabled) { selectedAnnotationId = null; if (highlightModeEnabled) resetHighlightActionForSelection(); else renderAnnotationsForCurrentPage(); }
}
function toggleAnnotationMode() {
  if (!pdfDoc) return;
  if (continuousScrollEnabled) {
    setInstallStatus("De technische annotatiemodus werkt alleen in single-page weergave.", true);
    return;
  }
  setAnnotationMode(!annotationModeEnabled);
  closeMenus(); closeFullscreenOverlay();
}
function normalizePoint(clientX, clientY) {
  const rect = pageStage.getBoundingClientRect();
  const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
  const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
  return { x: rect.width > 0 ? x / rect.width : 0, y: rect.height > 0 ? y / rect.height : 0 };
}
function createFoundationAnnotation(point) {
  const annotation = { id: nextAnnotationId(), type: "foundation-point", page: currentPage, x: point.x, y: point.y, createdAt: new Date().toISOString() };
  annotationPageList(currentPage).push(annotation); selectedAnnotationId = annotation.id; renderAnnotationsForCurrentPage(); return annotation;
}
function deleteSelectedAnnotation() {
  if (!selectedAnnotationId) return;

  const list = annotationPageList(currentPage);
  const index = list.findIndex(item => item.id === selectedAnnotationId);

  if (index >= 0) {
    list.splice(index, 1);
  }

  selectedAnnotationId = null;

  if (highlightModeEnabled) {
    resetHighlightActionForSelection();
  } else if (textModeEnabled) {
    editingTextAnnotationId = null;
    pendingTextPoint = null;
    hideTextEditor();
    renderAnnotationsForCurrentPage();
  } else {
    renderAnnotationsForCurrentPage();
  }
}

function renderAnnotationsForCurrentPage() {
  if (!annotationLayer) return;
  annotationLayer.replaceChildren();

  const list = annotationsByPage.get(currentPage) || [];

  for (const annotation of list) {
    if (annotation.type === "text") {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "annotation-object annotation-text";
      item.dataset.annotationId = annotation.id;
      item.setAttribute("aria-label", `Tekstannotatie: ${annotation.text || ""}`);
      item.textContent = annotation.text || "";
      item.style.left = `${annotation.x * 100}%`;
      item.style.top = `${annotation.y * 100}%`;
      item.style.color = annotation.color || "#111827";
      item.style.fontSize = `${Math.max(9, (annotation.fontSize || 0.020) * pageStage.clientWidth)}px`;

      if (annotation.id === selectedAnnotationId) {
        item.classList.add("selected");
      }

      item.addEventListener("click", event => {
        event.stopPropagation();
        if (!textModeEnabled) return;
        openTextEditorForAnnotation(annotation);
      });

      annotationLayer.appendChild(item);
      continue;
    }

    if (annotation.type === "highlight") {
      for (const box of annotation.boxes || []) {
        const item = document.createElement("div");
        item.className = "annotation-object annotation-highlight";
        item.dataset.annotationId = annotation.id;
        item.setAttribute("aria-label", "Tekstmarkering");
        item.style.left = `${box.x * 100}%`;
        item.style.top = `${box.y * 100}%`;
        item.style.width = `${box.width * 100}%`;
        item.style.height = `${box.height * 100}%`;
        item.style.background = HIGHLIGHT_COLORS[annotation.color] || HIGHLIGHT_COLORS.yellow;

        if (annotation.id === selectedAnnotationId) item.classList.add("selected");

        item.addEventListener("click", event => {
          event.stopPropagation();
          if (!highlightModeEnabled) return;
          selectedAnnotationId = annotation.id;
          renderAnnotationsForCurrentPage();
          showSelectedHighlight(annotation);
        });

        annotationLayer.appendChild(item);
      }
      continue;
    }

    const item = document.createElement("button");
    item.type = "button";
    item.className = "annotation-object annotation-foundation-point";
    item.dataset.annotationId = annotation.id;
    item.setAttribute("aria-label", `Annotatie ${annotation.id}`);
    item.style.left = `${annotation.x * 100}%`;
    item.style.top = `${annotation.y * 100}%`;

    if (annotation.id === selectedAnnotationId) item.classList.add("selected");

    item.addEventListener("click", event => {
      event.stopPropagation();
      if (!annotationModeEnabled) return;
      selectedAnnotationId = annotation.id;
      renderAnnotationsForCurrentPage();
    });

    annotationLayer.appendChild(item);
  }

  annotationLayer.classList.toggle("has-annotations", list.length > 0);
}

function resetAnnotationDocumentState() {
  annotationsByPage.clear();
  selectedAnnotationId = null;
  annotationIdCounter = 1;
  pendingHighlightSelection = null;
  setAnnotationMode(false);
  setHighlightMode(false);
  setTextMode(false);
  renderAnnotationsForCurrentPage();
}

annotationLayer.addEventListener("click", event => {
  if (!annotationModeEnabled || !pdfDoc || continuousScrollEnabled) return;
  if (event.target.closest(".annotation-object")) return;
  createFoundationAnnotation(normalizePoint(event.clientX,event.clientY));
});

pageStage.addEventListener("click", event => {
  if (!textModeEnabled || !pdfDoc || continuousScrollEnabled) return;

  if (textAnnotationAtTarget(event.target)) return;
  if (event.target.closest?.(".annotation-object")) return;

  openTextEditorAt(normalizePoint(event.clientX, event.clientY));
});
window.addEventListener("keydown", event => {
  const active = document.activeElement;
  const typing =
    active === textDraftInput ||
    active?.tagName === "INPUT" ||
    active?.tagName === "TEXTAREA" ||
    active?.isContentEditable;

  if (typing) {
    if (event.key === "Escape" && textModeEnabled) {
      event.preventDefault();
      cancelTextAnnotationEdit();
    }
    return;
  }

  if (!annotationModeEnabled && !highlightModeEnabled && !textModeEnabled) return;

  if (
    (event.key === "Delete" || event.key === "Backspace") &&
    selectedAnnotationId
  ) {
    event.preventDefault();
    deleteSelectedAnnotation();
    return;
  }

  if (event.key === "Escape") {
    if (highlightModeEnabled) {
      resetHighlightActionForSelection();
    } else if (textModeEnabled) {
      cancelTextAnnotationEdit();
    } else {
      selectedAnnotationId = null;
      renderAnnotationsForCurrentPage();
    }
  }
});


const HIGHLIGHT_COLORS = {
  yellow: "rgba(250, 204, 21, 0.42)",
  green: "rgba(34, 197, 94, 0.36)",
  blue: "rgba(59, 130, 246, 0.34)",
  pink: "rgba(236, 72, 153, 0.34)"
};

function setHighlightColor(color) {
  if (!HIGHLIGHT_COLORS[color]) return;
  highlightColor = color;

  document.querySelectorAll("[data-highlight-color]").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.highlightColor === color
    );
  });
}

function clearPendingHighlightSelection({ clearNative = false } = {}) {
  pendingHighlightSelection = null;

  if (clearNative) {
    suppressHighlightSelectionCapture = true;
    try {
      window.getSelection()?.removeAllRanges();
    } finally {
      window.setTimeout(() => {
        suppressHighlightSelectionCapture = false;
      }, 0);
    }
  }

  if (highlightModeEnabled && !selectedAnnotationId) {
    highlightActionLabel.textContent = "Selecteer tekst in de PDF";
    applyHighlightButton.disabled = true;
  }
}

function setHighlightMode(enabled) {
  highlightModeEnabled = Boolean(enabled);
  document.body.classList.toggle("highlight-mode", highlightModeEnabled);

  if (highlightModeEnabled) {
    if (annotationModeEnabled) setAnnotationMode(false);
    if (textModeEnabled) setTextMode(false);

    selectedAnnotationId = null;
    clearPendingHighlightSelection();

    highlightActionBar.classList.remove("hidden");
    highlightActionLabel.textContent = "Selecteer tekst in de PDF";
    applyHighlightButton.classList.remove("hidden");
    applyHighlightButton.disabled = true;
    deleteHighlightButton.classList.add("hidden");
  } else {
    selectedAnnotationId = null;
    clearPendingHighlightSelection({ clearNative: true });
    highlightActionBar.classList.add("hidden");
  }

  highlightModeMenuItem.textContent = highlightModeEnabled
    ? "Markeren uitschakelen"
    : "Markeren";

  if (fsHighlightModeButton) {
    fsHighlightModeButton.textContent = highlightModeEnabled
      ? "Markeren uitschakelen"
      : "Markeren";
  }

  renderAnnotationsForCurrentPage();
}

function toggleHighlightMode() {
  if (!pdfDoc) return;

  if (continuousScrollEnabled) {
    setInstallStatus(
      "Markeren werkt in v0.3.1.1 alleen in single-page weergave.",
      true
    );
    return;
  }

  setHighlightMode(!highlightModeEnabled);
  closeMenus();
  closeFullscreenOverlay();
}

function nodeInsideTextLayer(node) {
  if (!node) return false;
  const element = node.nodeType === Node.TEXT_NODE
    ? node.parentElement
    : node;
  return Boolean(element?.closest?.("#textLayer"));
}

function normalizedRectFromClientRect(rect, stageRect) {
  const left = Math.max(stageRect.left, rect.left);
  const top = Math.max(stageRect.top, rect.top);
  const right = Math.min(stageRect.right, rect.right);
  const bottom = Math.min(stageRect.bottom, rect.bottom);

  const width = right - left;
  const height = bottom - top;

  if (
    width <= 1 ||
    height <= 1 ||
    stageRect.width <= 0 ||
    stageRect.height <= 0
  ) {
    return null;
  }

  return {
    x: (left - stageRect.left) / stageRect.width,
    y: (top - stageRect.top) / stageRect.height,
    width: width / stageRect.width,
    height: height / stageRect.height
  };
}

function mergeHighlightBoxes(boxes) {
  if (!boxes.length) return [];

  const sorted = [...boxes].sort((a, b) => {
    const dy = a.y - b.y;
    return Math.abs(dy) > 0.004 ? dy : a.x - b.x;
  });

  const merged = [];

  for (const box of sorted) {
    const previous = merged[merged.length - 1];

    if (!previous) {
      merged.push({ ...box });
      continue;
    }

    const sameLine =
      Math.abs(previous.y - box.y) <= Math.max(0.006, Math.min(previous.height, box.height) * 0.45);

    const gap = box.x - (previous.x + previous.width);
    const closeEnough = gap >= -0.004 && gap <= 0.018;

    if (sameLine && closeEnough) {
      const right = Math.max(previous.x + previous.width, box.x + box.width);
      const bottom = Math.max(previous.y + previous.height, box.y + box.height);
      previous.x = Math.min(previous.x, box.x);
      previous.y = Math.min(previous.y, box.y);
      previous.width = right - previous.x;
      previous.height = bottom - previous.y;
    } else {
      merged.push({ ...box });
    }
  }

  return merged;
}

function captureCurrentHighlightSelection() {
  if (
    !highlightModeEnabled ||
    !pdfDoc ||
    continuousScrollEnabled ||
    suppressHighlightSelectionCapture
  ) {
    return false;
  }

  const selection = window.getSelection();

  if (
    !selection ||
    selection.isCollapsed ||
    selection.rangeCount === 0
  ) {
    return false;
  }

  const range = selection.getRangeAt(0);

  if (
    !nodeInsideTextLayer(range.startContainer) ||
    !nodeInsideTextLayer(range.endContainer)
  ) {
    return false;
  }

  const stageRect = pageStage.getBoundingClientRect();

  const boxes = mergeHighlightBoxes(
    Array.from(range.getClientRects())
      .map(rect => normalizedRectFromClientRect(rect, stageRect))
      .filter(Boolean)
  );

  const text = selection.toString().replace(/\s+/g, " ").trim();

  if (!boxes.length || !text) return false;

  pendingHighlightSelection = {
    page: currentPage,
    boxes,
    text
  };

  selectedAnnotationId = null;
  highlightActionBar.classList.remove("hidden");
  highlightActionLabel.textContent =
    `Geselecteerd: ${text.slice(0, 46)}${text.length > 46 ? "…" : ""}`;
  applyHighlightButton.classList.remove("hidden");
  applyHighlightButton.disabled = false;
  deleteHighlightButton.classList.add("hidden");

  renderAnnotationsForCurrentPage();
  return true;
}

function applyCurrentTextSelectionAsHighlight() {
  if (!highlightModeEnabled || !pdfDoc || continuousScrollEnabled) return;

  // Capture once more if the browser still has the native selection.
  captureCurrentHighlightSelection();

  const pending = pendingHighlightSelection;

  if (!pending || pending.page !== currentPage || !pending.boxes.length) {
    highlightActionLabel.textContent = "Selecteer eerst tekst in de PDF";
    applyHighlightButton.disabled = true;
    return;
  }

  const annotation = {
    id: nextAnnotationId(),
    type: "highlight",
    page: currentPage,
    color: highlightColor,
    boxes: pending.boxes.map(box => ({ ...box })),
    text: pending.text,
    createdAt: new Date().toISOString()
  };

  annotationPageList(currentPage).push(annotation);
  selectedAnnotationId = annotation.id;
  pendingHighlightSelection = null;

  suppressHighlightSelectionCapture = true;
  try {
    window.getSelection()?.removeAllRanges();
  } finally {
    window.setTimeout(() => {
      suppressHighlightSelectionCapture = false;
    }, 0);
  }

  renderAnnotationsForCurrentPage();
  showSelectedHighlight(annotation);
}

function showSelectedHighlight(annotation) {
  if (!annotation || annotation.type !== "highlight") return;

  const text = String(annotation.text || "")
    .replace(/\s+/g, " ")
    .trim();

  pendingHighlightSelection = null;
  highlightActionBar.classList.remove("hidden");
  highlightActionLabel.textContent = text
    ? `Markering: ${text.slice(0, 42)}${text.length > 42 ? "…" : ""}`
    : "Markering geselecteerd";

  applyHighlightButton.classList.add("hidden");
  deleteHighlightButton.classList.remove("hidden");
}

function resetHighlightActionForSelection() {
  if (!highlightModeEnabled) return;

  selectedAnnotationId = null;
  clearPendingHighlightSelection({ clearNative: true });

  highlightActionBar.classList.remove("hidden");
  highlightActionLabel.textContent = "Selecteer tekst in de PDF";
  applyHighlightButton.classList.remove("hidden");
  applyHighlightButton.disabled = true;
  deleteHighlightButton.classList.add("hidden");

  renderAnnotationsForCurrentPage();
}

function pointHitsHighlight(clientX, clientY) {
  const rect = pageStage.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;

  const x = (clientX - rect.left) / rect.width;
  const y = (clientY - rect.top) / rect.height;

  const list = annotationsByPage.get(currentPage) || [];

  for (let index = list.length - 1; index >= 0; index--) {
    const annotation = list[index];
    if (annotation.type !== "highlight") continue;

    for (const box of annotation.boxes || []) {
      const paddingX = 0.006;
      const paddingY = 0.004;

      if (
        x >= box.x - paddingX &&
        x <= box.x + box.width + paddingX &&
        y >= box.y - paddingY &&
        y <= box.y + box.height + paddingY
      ) {
        return annotation;
      }
    }
  }

  return null;
}

document.addEventListener("selectionchange", () => {
  if (!highlightModeEnabled || suppressHighlightSelectionCapture) return;

  // Android updates selection repeatedly while handles are dragged.
  // Cache every valid state; a later tap on the toolbar may collapse
  // the native DOM selection, but the cached geometry remains available.
  window.requestAnimationFrame(() => {
    captureCurrentHighlightSelection();
  });
});

pageStage.addEventListener("pointerup", () => {
  if (!highlightModeEnabled) return;

  window.setTimeout(() => {
    captureCurrentHighlightSelection();
  }, 0);
});

pageStage.addEventListener("click", event => {
  if (!highlightModeEnabled) return;

  const selection = window.getSelection();
  if (selection && !selection.isCollapsed) return;

  const hit = pointHitsHighlight(event.clientX, event.clientY);

  if (hit) {
    selectedAnnotationId = hit.id;
    pendingHighlightSelection = null;
    renderAnnotationsForCurrentPage();
    showSelectedHighlight(hit);
  }
});


function setTextMode(enabled) {
  textModeEnabled = Boolean(enabled);
  document.body.classList.toggle("text-mode", textModeEnabled);
  annotationLayer.classList.toggle("text-layer-active", textModeEnabled);

  if (textModeEnabled) {
    if (annotationModeEnabled) setAnnotationMode(false);
    if (highlightModeEnabled) setHighlightMode(false);

    selectedAnnotationId = null;
    pendingTextPoint = null;
    editingTextAnnotationId = null;
    hideTextEditor();

    setInstallStatus(
      "Tekstmodus actief: tik op de PDF waar de tekst moet komen.",
      true
    );
  } else {
    selectedAnnotationId = null;
    pendingTextPoint = null;
    editingTextAnnotationId = null;
    hideTextEditor();
  }

  textModeMenuItem.textContent = textModeEnabled
    ? "Tekstmodus uitschakelen"
    : "Tekst toevoegen";

  if (fsTextModeButton) {
    fsTextModeButton.textContent = textModeEnabled
      ? "Tekstmodus uitschakelen"
      : "Tekst toevoegen";
  }

  renderAnnotationsForCurrentPage();
}

function toggleTextMode() {
  if (!pdfDoc) return;

  if (continuousScrollEnabled) {
    setInstallStatus(
      "Tekst toevoegen werkt in v0.3.2 alleen in single-page weergave.",
      true
    );
    return;
  }

  setTextMode(!textModeEnabled);
  closeMenus();
  closeFullscreenOverlay();
}

function hideTextEditor() {
  textToolbarSlot.classList.add("hidden");
  textDraftInput.value = "";
  textSizeSelect.value = "0.020";
  textColorSelect.value = "#111827";
  deleteTextAnnotationButton.classList.add("hidden");
}

function openTextEditorAt(point) {
  pendingTextPoint = point;
  editingTextAnnotationId = null;
  selectedAnnotationId = null;

  textDraftInput.value = "";
  textSizeSelect.value = "0.020";
  textColorSelect.value = "#111827";
  deleteTextAnnotationButton.classList.add("hidden");
  textToolbarSlot.classList.remove("hidden");

  window.setTimeout(() => {
    textDraftInput.focus();
  }, 30);
}

function openTextEditorForAnnotation(annotation) {
  if (!annotation || annotation.type !== "text") return;

  pendingTextPoint = { x: annotation.x, y: annotation.y };
  editingTextAnnotationId = annotation.id;
  selectedAnnotationId = annotation.id;

  textDraftInput.value = annotation.text || "";
  textSizeSelect.value = String(annotation.fontSize || 0.020);
  textColorSelect.value = annotation.color || "#111827";
  deleteTextAnnotationButton.classList.remove("hidden");
  textToolbarSlot.classList.remove("hidden");

  renderAnnotationsForCurrentPage();

  window.setTimeout(() => {
    textDraftInput.focus();
    textDraftInput.setSelectionRange(
      textDraftInput.value.length,
      textDraftInput.value.length
    );
  }, 30);
}

function saveTextAnnotation() {
  if (!textModeEnabled || !pdfDoc || continuousScrollEnabled) return;

  const text = textDraftInput.value.trim();

  if (!text) {
    setInstallStatus("Typ eerst tekst.", true);
    textDraftInput.focus();
    return;
  }

  const fontSize = Number(textSizeSelect.value) || 0.020;
  const color = textColorSelect.value || "#111827";

  if (editingTextAnnotationId) {
    const list = annotationPageList(currentPage);
    const annotation = list.find(item => item.id === editingTextAnnotationId);

    if (annotation && annotation.type === "text") {
      annotation.text = text;
      annotation.fontSize = fontSize;
      annotation.color = color;
      annotation.updatedAt = new Date().toISOString();
      selectedAnnotationId = annotation.id;
    }
  } else {
    if (!pendingTextPoint) {
      setInstallStatus("Tik eerst op de PDF waar de tekst moet komen.", true);
      return;
    }

    const annotation = {
      id: nextAnnotationId(),
      type: "text",
      page: currentPage,
      x: pendingTextPoint.x,
      y: pendingTextPoint.y,
      text,
      fontSize,
      color,
      createdAt: new Date().toISOString()
    };

    annotationPageList(currentPage).push(annotation);
    selectedAnnotationId = annotation.id;
  }

  pendingTextPoint = null;
  editingTextAnnotationId = null;
  hideTextEditor();
  renderAnnotationsForCurrentPage();

  setInstallStatus(
    "Tekstannotatie opgeslagen. Tik opnieuw op de PDF om nog tekst toe te voegen.",
    true
  );
}

function cancelTextAnnotationEdit() {
  pendingTextPoint = null;
  editingTextAnnotationId = null;
  selectedAnnotationId = null;
  hideTextEditor();
  renderAnnotationsForCurrentPage();
}

function deleteEditingTextAnnotation() {
  if (!editingTextAnnotationId) return;

  selectedAnnotationId = editingTextAnnotationId;
  deleteSelectedAnnotation();

  editingTextAnnotationId = null;
  pendingTextPoint = null;
  hideTextEditor();
  renderAnnotationsForCurrentPage();
}

function textAnnotationAtTarget(target) {
  return target?.closest?.(".annotation-text") || null;
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

async function rerenderForCurrentViewport() {
  if (!pdfDoc) return;

  if (continuousScrollEnabled) {
    resetContinuousScroll();
    await buildContinuousPages();
    return;
  }

  if (document.body.classList.contains("fullscreen-reader")) {
    await applyFullscreenViewMode(fullscreenViewMode);
  } else {
    await renderPage(currentPage, await fitWidthScale(currentPage));
  }
}

async function enterFullscreen() {
  if (!pdfDoc) return;

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

  window.setTimeout(async () => {
    try {
      await rerenderForCurrentViewport();
    } catch (error) {
      console.warn("Herberekenen na fullscreen mislukt.", error);
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
    try {
      await rerenderForCurrentViewport();
    } catch (error) {
      console.warn("Herberekenen na fullscreen afsluiten mislukt.", error);
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
  if (ready) renderAnnotationsForCurrentPage();
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

  if (pageNumber !== currentPage && highlightModeEnabled) {
    selectedAnnotationId = null;
    clearPendingHighlightSelection({ clearNative: true });
  }

  if (pageNumber !== currentPage && textModeEnabled) {
    selectedAnnotationId = null;
    pendingTextPoint = null;
    editingTextAnnotationId = null;
    hideTextEditor();
  }

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
    resetAnnotationDocumentState();
    resetThumbnails();
    setContinuousScrollEnabled(false);
    resetContinuousScroll();
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

  if (continuousScrollEnabled) {
    await jumpToContinuousPage(result.page);
  } else if (currentPage !== result.page) {
    await renderPage(result.page, currentScale);
  } else {
    applyHighlightsForCurrentPage();
  }

  searchStatus.textContent = `${activeSearchIndex + 1} / ${searchResults.length} · pagina ${result.page}`;
  searchMiniStatus.textContent = `${searchResults.length} resultaat${searchResults.length === 1 ? "" : "en"}`;

  if (!continuousScrollEnabled) {
    requestAnimationFrame(() => {
      const firstItem = result.itemIndices[0];
      const span = textLayer.querySelector(`span[data-item-index="${firstItem}"]`);
      span?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    });
  }
}

fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.[0];
  fileInput.value = "";
  await openPdf(file);
});

prevButton.addEventListener("click", async () => {
  if (!pdfDoc || currentPage <= 1) return;
  if (continuousScrollEnabled) {
    await jumpToContinuousPage(currentPage - 1);
  } else {
    await renderPage(currentPage - 1, currentScale);
  }
});

nextButton.addEventListener("click", async () => {
  if (!pdfDoc || currentPage >= pdfDoc.numPages) return;
  if (continuousScrollEnabled) {
    await jumpToContinuousPage(currentPage + 1);
  } else {
    await renderPage(currentPage + 1, currentScale);
  }
});

pageInput.addEventListener("change", async () => {
  if (!pdfDoc) return;
  const requested = Number(pageInput.value);

  if (!Number.isFinite(requested)) {
    pageInput.value = String(currentPage);
    return;
  }

  if (continuousScrollEnabled) {
    await jumpToContinuousPage(requested);
  } else {
    await renderPage(requested, currentScale);
  }
});

zoomInButton.addEventListener("click", async () => {
  if (!pdfDoc) return;
  if (continuousScrollEnabled) await disableContinuousScroll({ renderSinglePage: false });
  await renderPage(currentPage, currentScale + 0.15);
});

zoomOutButton.addEventListener("click", async () => {
  if (!pdfDoc) return;
  if (continuousScrollEnabled) await disableContinuousScroll({ renderSinglePage: false });
  await renderPage(currentPage, currentScale - 0.15);
});

fitWidthButton.addEventListener("click", async () => {
  if (!pdfDoc) return;
  if (continuousScrollEnabled) await disableContinuousScroll({ renderSinglePage: false });
  await renderPage(currentPage, await fitWidthScale(currentPage));
});

fitPageButton.addEventListener("click", async () => {
  if (!pdfDoc) return;
  if (continuousScrollEnabled) await disableContinuousScroll({ renderSinglePage: false });
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
  if (continuousScrollEnabled) await disableContinuousScroll({ renderSinglePage: false });
  await renderPage(currentPage, await fitWidthScale(currentPage));
});

fitPageMenuItem.addEventListener("click", async () => {
  closeMenus();
  if (!pdfDoc) return;
  if (continuousScrollEnabled) await disableContinuousScroll({ renderSinglePage: false });
  await renderPage(currentPage, await fitPageScale(currentPage));
});

resetZoomMenuItem.addEventListener("click", async () => {
  closeMenus();
  if (!pdfDoc) return;
  if (continuousScrollEnabled) await disableContinuousScroll({ renderSinglePage: false });
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
continuousScrollMenuItem.addEventListener("click", toggleContinuousScroll);
annotationModeMenuItem.addEventListener("click", toggleAnnotationMode);
highlightModeMenuItem.addEventListener("click", toggleHighlightMode);

textModeMenuItem.addEventListener("click", toggleTextMode);
if (fsTextModeButton) {
  fsTextModeButton.addEventListener("click", toggleTextMode);
}

saveTextAnnotationButton.addEventListener("click", saveTextAnnotation);
deleteTextAnnotationButton.addEventListener("click", deleteEditingTextAnnotation);
cancelTextAnnotationButton.addEventListener("click", cancelTextAnnotationEdit);
document.querySelectorAll("[data-highlight-color]").forEach(button => {
  button.addEventListener("click", () => {
    setHighlightColor(button.dataset.highlightColor);
    closeMenus();
  });
});
applyHighlightButton.addEventListener("click", applyCurrentTextSelectionAsHighlight);
deleteHighlightButton.addEventListener("click", deleteSelectedAnnotation);
closeHighlightActionButton.addEventListener("click", () => {
  setHighlightMode(false);
});
if (fsAnnotationModeButton) fsAnnotationModeButton.addEventListener("click", toggleAnnotationMode);
if (fsHighlightModeButton) fsHighlightModeButton.addEventListener("click", toggleHighlightMode);

installAppMenuItem.addEventListener("click", installPwa);
installPanelClose.addEventListener("click", closeInstallPanel);
installPanelBackdrop.addEventListener("click", closeInstallPanel);
nativeInstallButton.addEventListener("click", triggerNativeInstall);


window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  deferredInstallPrompt = event;
  refreshInstallUi();
  void updateInstallDiagnostics();

  if (!installPanel.classList.contains("hidden")) {
    installReadyBlock.classList.remove("hidden");
    androidBrowserBlock.classList.add("hidden");
    manualInstallBlock.classList.add("hidden");
    installPanelSubtitle.textContent = "Native installatie beschikbaar";
  }
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  refreshInstallUi();
  setInstallStatus("PdfReader is geïnstalleerd.", true);
  void updateInstallDiagnostics();
  closeInstallPanel();
});
fsContinuousScrollButton.addEventListener("click", toggleContinuousScroll);
fsThumbnailsButton.addEventListener("click", openThumbnailDrawer);
thumbnailDrawerClose.addEventListener("click", closeThumbnailDrawer);
thumbnailBackdrop.addEventListener("click", closeThumbnailDrawer);

fullscreenHandleButton.addEventListener("click", openFullscreenOverlay);

fullscreenOverlayClose.addEventListener("click", closeFullscreenOverlay);

fullscreenOverlay.addEventListener("click", event => {
  if (event.target === fullscreenOverlay) closeFullscreenOverlay();
});

fsPrevButton.addEventListener("click", async () => {
  if (!pdfDoc || currentPage <= 1) return;
  if (continuousScrollEnabled) {
    await jumpToContinuousPage(currentPage - 1);
  } else {
    await renderPage(currentPage - 1, currentScale);
  }
  updateFullscreenOverlayUi();
});

fsNextButton.addEventListener("click", async () => {
  if (!pdfDoc || currentPage >= pdfDoc.numPages) return;
  if (continuousScrollEnabled) {
    await jumpToContinuousPage(currentPage + 1);
  } else {
    await renderPage(currentPage + 1, currentScale);
  }
  updateFullscreenOverlayUi();
});

fsZoomOutButton.addEventListener("click", async () => {
  if (!pdfDoc) return;
  if (continuousScrollEnabled) await disableContinuousScroll({ renderSinglePage: false });
  await renderPage(currentPage, currentScale - 0.15);
  updateFullscreenOverlayUi();
});

fsZoomInButton.addEventListener("click", async () => {
  if (!pdfDoc) return;
  if (continuousScrollEnabled) await disableContinuousScroll({ renderSinglePage: false });
  await renderPage(currentPage, currentScale + 0.15);
  updateFullscreenOverlayUi();
});

fsFitWidthButton.addEventListener("click", async () => {
  if (!pdfDoc) return;
  if (continuousScrollEnabled) await disableContinuousScroll({ renderSinglePage: false });
  await applyFullscreenViewMode("fit-width");
  updateFullscreenOverlayUi();
  closeFullscreenOverlay();
});

fsFitPageButton.addEventListener("click", async () => {
  if (!pdfDoc) return;
  if (continuousScrollEnabled) await disableContinuousScroll({ renderSinglePage: false });
  await applyFullscreenViewMode("fit-page");
  updateFullscreenOverlayUi();
  closeFullscreenOverlay();
});

fsFillScreenButton.addEventListener("click", async () => {
  if (!pdfDoc) return;
  if (continuousScrollEnabled) await disableContinuousScroll({ renderSinglePage: false });
  await applyFullscreenViewMode("fill-screen");
  updateFullscreenOverlayUi();
  closeFullscreenOverlay();
});

fsResetZoomButton.addEventListener("click", async () => {
  if (!pdfDoc) return;
  if (continuousScrollEnabled) await disableContinuousScroll({ renderSinglePage: false });
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
  if (!nativeFullscreenActive() && document.body.classList.contains("fullscreen-reader")) {
    setFullscreenUi(false);
    leaveImmersiveUi();

    window.setTimeout(async () => {
      try {
        await rerenderForCurrentViewport();
      } catch (error) {
        console.warn("Herberekenen na extern fullscreen-einde mislukt.", error);
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

  if (!continuousScrollEnabled && horizontal && fastEnough && farEnough) {
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
      await rerenderForCurrentViewport();
    } catch (error) {
      console.warn("Herberekenen na rotatie mislukt.", error);
    }
  }, 220);
});

let resizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(async () => {
    if (!pdfDoc) return;
    try {
      await rerenderForCurrentViewport();
    } catch (error) {
      console.warn("Herberekenen na resize mislukt.", error);
    }
  }, 180);
});

await cleanupLegacyPwaState();
refreshInstallUi();
updateOfflineUi();
await registerOfflineEngine();
void updateInstallDiagnostics();
await loadPdfJs();
updateUi();
console.info(`PdfReader ${APP_VERSION} — Tekst toevoegen geladen.`);
