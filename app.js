import * as pdfjsLib from "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.min.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.worker.min.mjs";

const APP_VERSION = "0.2.0";

const fileInput = document.getElementById("fileInput");
const welcome = document.getElementById("welcome");
const reader = document.getElementById("reader");
const prevPage = document.getElementById("prevPage");
const nextPage = document.getElementById("nextPage");
const pageNumber = document.getElementById("pageNumber");
const pageCount = document.getElementById("pageCount");
const zoomOut = document.getElementById("zoomOut");
const zoomIn = document.getElementById("zoomIn");
const zoomLabel = document.getElementById("zoomLabel");
const fitWidth = document.getElementById("fitWidth");
const fitPage = document.getElementById("fitPage");
const status = document.getElementById("status");
const fileName = document.getElementById("fileName");
const pages = document.getElementById("pages");
const scrollContainer = document.getElementById("scrollContainer");
const thumbnails = document.getElementById("thumbnails");
const sidebar = document.getElementById("sidebar");
const toggleSidebar = document.getElementById("toggleSidebar");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const searchPrev = document.getElementById("searchPrev");
const searchNext = document.getElementById("searchNext");
const searchStatus = document.getElementById("searchStatus");
const checkUpdateButton = document.getElementById("checkUpdate");

let pdfDoc = null;
let currentPage = 1;
let scale = 1;
let pageBaseSizes = [];
let renderGeneration = 0;
let searchResults = [];
let activeSearchIndex = -1;
let observer = null;

function setStatus(message) {
  status.textContent = message;
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

function setupPageObserver() {
  if (observer) observer.disconnect();

  observer = new IntersectionObserver(entries => {
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
    threshold: [0.15, 0.35, 0.6, 0.85]
  });

  document.querySelectorAll(".page-shell").forEach(el => observer.observe(el));
}

async function buildPageBaseSizes() {
  pageBaseSizes = [];
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    pageBaseSizes.push({ width: viewport.width, height: viewport.height });
  }
}

async function renderAllPages() {
  if (!pdfDoc) return;

  const generation = ++renderGeneration;
  pages.innerHTML = "";
  setStatus("Pagina's renderen…");

  for (let pageNo = 1; pageNo <= pdfDoc.numPages; pageNo++) {
    if (generation !== renderGeneration) return;

    const page = await pdfDoc.getPage(pageNo);
    const viewport = page.getViewport({ scale });
    const outputScale = Math.max(1, window.devicePixelRatio || 1);

    const shell = document.createElement("div");
    shell.className = "page-shell";
    shell.dataset.page = String(pageNo);
    shell.id = `page-${pageNo}`;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { alpha: false });

    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    const label = document.createElement("div");
    label.className = "page-number-label";
    label.textContent = pageNo;

    shell.append(canvas, label);
    pages.appendChild(shell);

    const transform = outputScale !== 1
      ? [outputScale, 0, 0, outputScale, 0, 0]
      : null;

    await page.render({
      canvasContext: ctx,
      transform,
      viewport
    }).promise;
  }

  setupPageObserver();
  setStatus(`${pdfDoc.numPages} pagina's geladen`);
  scrollToPage(currentPage, false);
}

async function buildThumbnails() {
  thumbnails.innerHTML = "";

  for (let pageNo = 1; pageNo <= pdfDoc.numPages; pageNo++) {
    const page = await pdfDoc.getPage(pageNo);
    const base = page.getViewport({ scale: 1 });
    const thumbScale = Math.min(0.28, 150 / base.width);
    const viewport = page.getViewport({ scale: thumbScale });

    const item = document.createElement("button");
    item.type = "button";
    item.className = "thumb";
    item.dataset.page = String(pageNo);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { alpha: false });
    const outputScale = Math.max(1, window.devicePixelRatio || 1);

    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);

    const label = document.createElement("div");
    label.className = "thumb-label";
    label.textContent = `Pagina ${pageNo}`;

    item.append(canvas, label);
    thumbnails.appendChild(item);

    await page.render({
      canvasContext: ctx,
      transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null,
      viewport
    }).promise;

    item.addEventListener("click", () => {
      scrollToPage(pageNo);
      if (window.innerWidth <= 900) sidebar.classList.add("hidden-mobile");
    });
  }

  setActiveThumbnail(currentPage);
}

function scrollToPage(pageNo, smooth = true) {
  const target = document.getElementById(`page-${pageNo}`);
  if (!target) return;
  currentPage = pageNo;
  updateControls();
  setActiveThumbnail(pageNo);
  target.scrollIntoView({
    behavior: smooth ? "smooth" : "auto",
    block: "start"
  });
}

async function openPdf(file) {
  if (!file) return;

  if (file.type && file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    setStatus("Kies een geldig PDF-bestand.");
    return;
  }

  fileName.textContent = file.name;
  setStatus(`"${file.name}" openen…`);

  try {
    const buffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: buffer });
    pdfDoc = await loadingTask.promise;

    currentPage = 1;
    scale = 1;
    searchResults = [];
    activeSearchIndex = -1;
    searchStatus.textContent = "Geen zoekopdracht";

    welcome.classList.add("hidden");
    reader.classList.remove("hidden");

    await buildPageBaseSizes();
    await fitToWidth(false);
    await buildThumbnails();

    document.title = `${file.name} - PdfReader`;
  } catch (err) {
    console.error(err);
    setStatus("De PDF kon niet worden geopend.");
  }
}

async function fitToWidth(render = true) {
  if (!pdfDoc || !pageBaseSizes.length) return;

  const base = pageBaseSizes[currentPage - 1] || pageBaseSizes[0];
  const sidebarWidth = window.innerWidth > 900 ? 230 : 0;
  const available = Math.max(220, window.innerWidth - sidebarWidth - 48);
  scale = Math.min(3, Math.max(0.25, available / base.width));

  updateControls();
  if (render) await renderAllPages();
  else await renderAllPages();
}

async function fitCurrentPage() {
  if (!pdfDoc || !pageBaseSizes.length) return;

  const base = pageBaseSizes[currentPage - 1] || pageBaseSizes[0];
  const sidebarWidth = window.innerWidth > 900 ? 230 : 0;
  const availableWidth = Math.max(220, window.innerWidth - sidebarWidth - 48);
  const availableHeight = Math.max(260, window.innerHeight - 220);

  scale = Math.min(
    3,
    Math.max(0.25, Math.min(availableWidth / base.width, availableHeight / base.height))
  );

  updateControls();
  await renderAllPages();
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

  for (let pageNo = 1; pageNo <= pdfDoc.numPages; pageNo++) {
    const page = await pdfDoc.getPage(pageNo);
    const textContent = await page.getTextContent();
    const text = textContent.items
      .map(item => item.str || "")
      .join(" ")
      .toLocaleLowerCase();

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
}

function showSearchResult() {
  document.querySelectorAll(".page-shell").forEach(el => el.classList.remove("search-hit"));

  if (!searchResults.length || activeSearchIndex < 0) return;

  const result = searchResults[activeSearchIndex];
  const shell = document.getElementById(`page-${result.pageNo}`);
  shell?.classList.add("search-hit");

  searchStatus.textContent =
    `${activeSearchIndex + 1} / ${searchResults.length} · pagina ${result.pageNo}`;

  scrollToPage(result.pageNo);
}

fileInput.addEventListener("change", () => {
  openPdf(fileInput.files?.[0]);
  fileInput.value = "";
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

zoomIn.addEventListener("click", async () => {
  if (!pdfDoc) return;
  scale = Math.min(4, scale + 0.15);
  updateControls();
  await renderAllPages();
});

zoomOut.addEventListener("click", async () => {
  if (!pdfDoc) return;
  scale = Math.max(0.25, scale - 0.15);
  updateControls();
  await renderAllPages();
});

fitWidth.addEventListener("click", () => fitToWidth(true));
fitPage.addEventListener("click", fitCurrentPage);

toggleSidebar.addEventListener("click", () => {
  sidebar.classList.toggle("hidden-mobile");
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

  if (event.key === "ArrowLeft" && currentPage > 1) {
    scrollToPage(currentPage - 1);
  } else if (event.key === "ArrowRight" && currentPage < pdfDoc.numPages) {
    scrollToPage(currentPage + 1);
  } else if (event.key === "+" || event.key === "=") {
    zoomIn.click();
  } else if (event.key === "-") {
    zoomOut.click();
  }
});

let resizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (window.innerWidth > 900) sidebar.classList.remove("hidden-mobile");
  }, 160);
});

async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;

  try {
    const registration = await navigator.serviceWorker.register("./service-worker.js", {
      updateViaCache: "none"
    });
    await registration.update();
    return registration;
  } catch (err) {
    console.error("Service worker registratie mislukt:", err);
    return null;
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

if (window.innerWidth <= 900) {
  sidebar.classList.add("hidden-mobile");
}

updateControls();
