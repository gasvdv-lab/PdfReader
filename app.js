import * as pdfjsLib from "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.min.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.worker.min.mjs";

const APP_VERSION = "0.2.0.2";
const MAX_OUTPUT_SCALE = 2;

const $ = id => document.getElementById(id);

const fileInput = $("fileInput");
const welcome = $("welcome");
const reader = $("reader");
const prevPage = $("prevPage");
const nextPage = $("nextPage");
const pageNumber = $("pageNumber");
const pageCount = $("pageCount");
const zoomOut = $("zoomOut");
const zoomIn = $("zoomIn");
const zoomLabel = $("zoomLabel");
const fitWidth = $("fitWidth");
const fitPage = $("fitPage");
const status = $("status");
const fileName = $("fileName");
const pages = $("pages");
const thumbnails = $("thumbnails");
const sidebar = $("sidebar");
const toggleSidebar = $("toggleSidebar");
const searchInput = $("searchInput");
const searchButton = $("searchButton");
const searchPrev = $("searchPrev");
const searchNext = $("searchNext");
const searchStatus = $("searchStatus");
const checkUpdateButton = $("checkUpdate");

const REQUIRED_UI_IDS = [
  "fileInput","welcome","reader","prevPage","nextPage","pageNumber","pageCount",
  "zoomOut","zoomIn","zoomLabel","fitWidth","fitPage","status","fileName",
  "pages","thumbnails","sidebar","toggleSidebar","searchInput","searchButton",
  "searchPrev","searchNext","searchStatus"
];

let pdfDoc = null;
let currentPage = 1;
let scale = 1;
let baseSizes = [];
let renderedPages = new Set();
let renderingPages = new Set();
let pageObserver = null;
let visibilityObserver = null;
let thumbnailsBuilt = false;
let thumbnailsBuilding = false;
let searchResults = [];
let activeSearchIndex = -1;
let documentToken = 0;

function validateUi() {
  const missing = REQUIRED_UI_IDS.filter(id => !$(id));
  if (!missing.length) return;

  document.body.innerHTML = `
    <main style="padding:24px;font-family:system-ui;background:#08111f;color:white;min-height:100vh">
      <h1>PdfReader v${APP_VERSION}</h1>
      <h2>Versiebestanden komen niet overeen</h2>
      <p>Ontbrekende UI-elementen: ${missing.join(", ")}</p>
    </main>`;
  throw new Error(`UI version mismatch: ${missing.join(", ")}`);
}

validateUi();

function setStatus(message) {
  status.textContent = message;
}

function showFatal(message, err) {
  console.error(message, err);
  welcome.classList.add("hidden");
  reader.classList.remove("hidden");
  setStatus(message);
}

function updateControls() {
  pageNumber.value = currentPage;
  pageNumber.max = pdfDoc ? pdfDoc.numPages : 1;
  pageCount.textContent = pdfDoc ? pdfDoc.numPages : 0;
  zoomLabel.textContent = `${Math.round(scale * 100)}%`;
  prevPage.disabled = !pdfDoc || currentPage <= 1;
  nextPage.disabled = !pdfDoc || currentPage >= pdfDoc.numPages;
}

function setActiveThumbnail(pageNo) {
  document.querySelectorAll(".thumb").forEach(el => {
    el.classList.toggle("active", Number(el.dataset.page) === pageNo);
  });
}

async function readBaseSizes(token) {
  baseSizes = [];
  for (let pageNo = 1; pageNo <= pdfDoc.numPages; pageNo++) {
    if (token !== documentToken) return;
    const page = await pdfDoc.getPage(pageNo);
    const viewport = page.getViewport({ scale: 1 });
    baseSizes.push({ width: viewport.width, height: viewport.height });
  }
}

function widthScaleFor(pageNo = 1) {
  const base = baseSizes[pageNo - 1] || baseSizes[0];
  if (!base) return 1;

  const sidebarWidth = window.innerWidth > 900 ? 230 : 0;
  const available = Math.max(220, window.innerWidth - sidebarWidth - 48);
  return Math.min(3, Math.max(0.25, available / base.width));
}

function pageScaleFor(pageNo = currentPage) {
  const base = baseSizes[pageNo - 1] || baseSizes[0];
  if (!base) return 1;

  const sidebarWidth = window.innerWidth > 900 ? 230 : 0;
  const availableWidth = Math.max(220, window.innerWidth - sidebarWidth - 48);
  const availableHeight = Math.max(260, window.innerHeight - 220);

  return Math.min(
    3,
    Math.max(0.25, Math.min(
      availableWidth / base.width,
      availableHeight / base.height
    ))
  );
}

function buildPlaceholders() {
  pages.innerHTML = "";
  renderedPages.clear();
  renderingPages.clear();

  for (let pageNo = 1; pageNo <= pdfDoc.numPages; pageNo++) {
    const base = baseSizes[pageNo - 1];

    const shell = document.createElement("div");
    shell.className = "page-shell";
    shell.dataset.page = String(pageNo);
    shell.id = `page-${pageNo}`;
    shell.style.width = `${Math.max(1, Math.round(base.width * scale))}px`;
    shell.style.height = `${Math.max(1, Math.round(base.height * scale))}px`;

    const canvas = document.createElement("canvas");
    canvas.dataset.page = String(pageNo);
    canvas.style.width = "100%";
    canvas.style.height = "100%";

    const loading = document.createElement("div");
    loading.className = "page-loading";
    loading.textContent = `Pagina ${pageNo} laden…`;

    const label = document.createElement("div");
    label.className = "page-number-label";
    label.textContent = pageNo;

    shell.append(canvas, loading, label);
    pages.appendChild(shell);
  }

  setupObservers();
}

async function renderPage(pageNo) {
  if (!pdfDoc || renderedPages.has(pageNo) || renderingPages.has(pageNo)) return;

  const token = documentToken;
  const shell = $(`page-${pageNo}`);
  if (!shell) return;

  renderingPages.add(pageNo);

  try {
    const page = await pdfDoc.getPage(pageNo);
    if (token !== documentToken) return;

    const viewport = page.getViewport({ scale });
    const outputScale = Math.min(MAX_OUTPUT_SCALE, Math.max(1, window.devicePixelRatio || 1));

    const canvas = shell.querySelector("canvas");
    const ctx = canvas.getContext("2d", { alpha: false });

    canvas.width = Math.max(1, Math.floor(viewport.width * outputScale));
    canvas.height = Math.max(1, Math.floor(viewport.height * outputScale));
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    shell.style.width = `${Math.floor(viewport.width)}px`;
    shell.style.height = `${Math.floor(viewport.height)}px`;

    const transform = outputScale !== 1
      ? [outputScale, 0, 0, outputScale, 0, 0]
      : null;

    await page.render({
      canvasContext: ctx,
      transform,
      viewport
    }).promise;

    if (token !== documentToken) return;

    shell.querySelector(".page-loading")?.remove();
    renderedPages.add(pageNo);

    if (pageNo === 1) {
      setStatus(`PDF geopend · ${pdfDoc.numPages} pagina${pdfDoc.numPages === 1 ? "" : "'s"}`);
    }
  } catch (err) {
    console.error(`Renderfout pagina ${pageNo}`, err);
    const loading = shell.querySelector(".page-loading");
    if (loading) loading.textContent = `Pagina ${pageNo} kon niet worden gerenderd`;
  } finally {
    renderingPages.delete(pageNo);
  }
}

function setupObservers() {
  pageObserver?.disconnect();
  visibilityObserver?.disconnect();

  pageObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        renderPage(Number(entry.target.dataset.page));
      }
    }
  }, {
    root: null,
    rootMargin: "900px 0px",
    threshold: 0.01
  });

  visibilityObserver = new IntersectionObserver(entries => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

    if (!visible.length) return;

    const pageNo = Number(visible[0].target.dataset.page);
    if (!Number.isFinite(pageNo)) return;

    currentPage = pageNo;
    updateControls();
    setActiveThumbnail(pageNo);
  }, {
    root: null,
    threshold: [0.1, 0.3, 0.6]
  });

  document.querySelectorAll(".page-shell").forEach(shell => {
    pageObserver.observe(shell);
    visibilityObserver.observe(shell);
  });
}

async function buildThumbnails() {
  if (!pdfDoc || thumbnailsBuilt || thumbnailsBuilding) return;

  thumbnailsBuilding = true;
  thumbnails.innerHTML = "";

  const token = documentToken;

  try {
    for (let pageNo = 1; pageNo <= pdfDoc.numPages; pageNo++) {
      if (token !== documentToken) return;

      const page = await pdfDoc.getPage(pageNo);
      const base = page.getViewport({ scale: 1 });
      const thumbScale = Math.min(0.22, 120 / base.width);
      const viewport = page.getViewport({ scale: thumbScale });

      const item = document.createElement("button");
      item.type = "button";
      item.className = "thumb";
      item.dataset.page = String(pageNo);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { alpha: false });

      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));

      const label = document.createElement("div");
      label.className = "thumb-label";
      label.textContent = `Pagina ${pageNo}`;

      item.append(canvas, label);
      thumbnails.appendChild(item);

      await page.render({ canvasContext: ctx, viewport }).promise;

      item.addEventListener("click", () => {
        scrollToPage(pageNo);
        if (window.innerWidth <= 900) sidebar.classList.add("hidden-mobile");
      });

      // Yield briefly so mobile UI remains responsive.
      await new Promise(resolve => setTimeout(resolve, 0));
    }

    thumbnailsBuilt = true;
    setActiveThumbnail(currentPage);
  } catch (err) {
    console.error("Thumbnailfout", err);
  } finally {
    thumbnailsBuilding = false;
  }
}

function scrollToPage(pageNo, smooth = true) {
  const target = $(`page-${pageNo}`);
  if (!target) return;

  currentPage = pageNo;
  updateControls();
  setActiveThumbnail(pageNo);
  renderPage(pageNo);

  target.scrollIntoView({
    behavior: smooth ? "smooth" : "auto",
    block: "start"
  });
}

async function openPdf(file) {
  if (!file) return;

  const isPdfName = file.name?.toLowerCase().endsWith(".pdf");
  const isPdfType = !file.type || file.type === "application/pdf" || file.type === "application/octet-stream";

  if (!isPdfName && !isPdfType) {
    setStatus("Kies een geldig PDF-bestand.");
    return;
  }

  const token = ++documentToken;
  fileName.textContent = file.name || "document.pdf";
  setStatus(`"${file.name || "PDF"}" inlezen…`);

  try {
    const buffer = await file.arrayBuffer();
    if (token !== documentToken) return;

    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      useWorkerFetch: false
    });

    pdfDoc = await loadingTask.promise;
    if (token !== documentToken) return;

    currentPage = 1;
    searchResults = [];
    activeSearchIndex = -1;
    thumbnailsBuilt = false;
    thumbnailsBuilding = false;
    thumbnails.innerHTML = "";
    searchStatus.textContent = "Geen zoekopdracht";

    welcome.classList.add("hidden");
    reader.classList.remove("hidden");
    updateControls();

    setStatus(`PDF gelezen · ${pdfDoc.numPages} pagina${pdfDoc.numPages === 1 ? "" : "'s"} · weergave voorbereiden…`);

    await readBaseSizes(token);
    if (token !== documentToken) return;

    scale = widthScaleFor(1);
    updateControls();
    buildPlaceholders();

    // Critical: paint page 1 first and return usable UI immediately.
    await renderPage(1);
    scrollToPage(1, false);

    document.title = `${file.name || "PDF"} - PdfReader`;

    // Desktop thumbnails can build after first page is already visible.
    if (window.innerWidth > 900) {
      setTimeout(() => buildThumbnails(), 0);
    }
  } catch (err) {
    console.error("PDF openfout:", err);
    showFatal(`PDF openen mislukt: ${err?.message || "onbekende fout"}`, err);
  }
}

async function rerenderAtScale(newScale) {
  if (!pdfDoc) return;
  scale = Math.min(4, Math.max(0.25, newScale));
  updateControls();
  buildPlaceholders();
  await renderPage(currentPage);
  scrollToPage(currentPage, false);
}

async function searchPdf() {
  if (!pdfDoc) return;

  const query = searchInput.value.trim().toLocaleLowerCase();
  searchResults = [];
  activeSearchIndex = -1;

  document.querySelectorAll(".page-shell").forEach(el => el.classList.remove("search-hit"));

  if (!query) {
    searchStatus.textContent = "Geen zoekopdracht";
    return;
  }

  searchStatus.textContent = "Zoeken…";

  try {
    for (let pageNo = 1; pageNo <= pdfDoc.numPages; pageNo++) {
      const page = await pdfDoc.getPage(pageNo);
      const textContent = await page.getTextContent();
      const text = textContent.items.map(item => item.str || "").join(" ").toLocaleLowerCase();

      let fromIndex = 0;
      while (true) {
        const pos = text.indexOf(query, fromIndex);
        if (pos === -1) break;
        searchResults.push({ pageNo, pos });
        fromIndex = pos + Math.max(1, query.length);
      }
    }

    if (!searchResults.length) {
      searchStatus.textContent = "Geen resultaten";
      return;
    }

    activeSearchIndex = 0;
    showSearchResult();
  } catch (err) {
    console.error("Zoekfout:", err);
    searchStatus.textContent = "Zoeken mislukt";
  }
}

function showSearchResult() {
  document.querySelectorAll(".page-shell").forEach(el => el.classList.remove("search-hit"));
  if (!searchResults.length || activeSearchIndex < 0) return;

  const result = searchResults[activeSearchIndex];
  const shell = $(`page-${result.pageNo}`);
  shell?.classList.add("search-hit");

  searchStatus.textContent =
    `${activeSearchIndex + 1} / ${searchResults.length} · pagina ${result.pageNo}`;

  scrollToPage(result.pageNo);
}

fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.[0];
  fileInput.value = "";
  await openPdf(file);
});

prevPage.addEventListener("click", () => {
  if (pdfDoc && currentPage > 1) scrollToPage(currentPage - 1);
});

nextPage.addEventListener("click", () => {
  if (pdfDoc && currentPage < pdfDoc.numPages) scrollToPage(currentPage + 1);
});

pageNumber.addEventListener("change", () => {
  if (!pdfDoc) return;
  const requested = Math.max(1, Math.min(pdfDoc.numPages, Number(pageNumber.value) || 1));
  scrollToPage(requested);
});

zoomIn.addEventListener("click", () => rerenderAtScale(scale + 0.15));
zoomOut.addEventListener("click", () => rerenderAtScale(scale - 0.15));
fitWidth.addEventListener("click", () => rerenderAtScale(widthScaleFor(currentPage)));
fitPage.addEventListener("click", () => rerenderAtScale(pageScaleFor(currentPage)));

toggleSidebar.addEventListener("click", async () => {
  sidebar.classList.toggle("hidden-mobile");
  if (!sidebar.classList.contains("hidden-mobile")) {
    await buildThumbnails();
  }
});

searchButton.addEventListener("click", searchPdf);
searchInput.addEventListener("keydown", event => {
  if (event.key === "Enter") searchPdf();
});

searchNext.addEventListener("click", () => {
  if (!searchResults.length) return;
  activeSearchIndex = (activeSearchIndex + 1) % searchResults.length;
  showSearchResult();
});

searchPrev.addEventListener("click", () => {
  if (!searchResults.length) return;
  activeSearchIndex = (activeSearchIndex - 1 + searchResults.length) % searchResults.length;
  showSearchResult();
});

window.addEventListener("keydown", event => {
  if (!pdfDoc || event.target?.matches("input")) return;

  if (event.key === "ArrowLeft" && currentPage > 1) scrollToPage(currentPage - 1);
  else if (event.key === "ArrowRight" && currentPage < pdfDoc.numPages) scrollToPage(currentPage + 1);
  else if (event.key === "+" || event.key === "=") zoomIn.click();
  else if (event.key === "-") zoomOut.click();
});

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.register("./service-worker.js", {
      updateViaCache: "none"
    });
    await registration.update();
  } catch (err) {
    console.error("Service worker registratie mislukt:", err);
  }
}

async function forceUpdateCheck() {
  setStatus(`Controleren op update… (v${APP_VERSION})`);

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) await registration.update();

    const url = new URL(window.location.href);
    url.searchParams.set("v", `${APP_VERSION}-${Date.now()}`);
    window.location.replace(url.toString());
  } catch (err) {
    console.error(err);
    setStatus("Updatecontrole mislukt.");
  }
}

checkUpdateButton?.addEventListener("click", forceUpdateCheck);
window.addEventListener("load", registerServiceWorker);

if (window.innerWidth <= 900) sidebar.classList.add("hidden-mobile");

updateControls();
