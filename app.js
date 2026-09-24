import * as pdfjsLib from "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.min.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.worker.min.mjs";

const fileInput = document.getElementById("fileInput");
const welcome = document.getElementById("welcome");
const reader = document.getElementById("reader");
const canvas = document.getElementById("pdfCanvas");
const ctx = canvas.getContext("2d", { alpha: false });

const prevPage = document.getElementById("prevPage");
const nextPage = document.getElementById("nextPage");
const pageNumber = document.getElementById("pageNumber");
const pageCount = document.getElementById("pageCount");
const zoomOut = document.getElementById("zoomOut");
const zoomIn = document.getElementById("zoomIn");
const zoomLabel = document.getElementById("zoomLabel");
const fitWidth = document.getElementById("fitWidth");
const canvasWrap = document.getElementById("canvasWrap");
const status = document.getElementById("status");
const fileName = document.getElementById("fileName");

let pdfDoc = null;
let currentPage = 1;
let scale = 1;
let renderTask = null;
let renderSerial = 0;
let activeFileName = "";

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

async function renderPage(pageNo) {
  if (!pdfDoc) return;

  const serial = ++renderSerial;

  if (renderTask) {
    try { renderTask.cancel(); } catch {}
    renderTask = null;
  }

  setStatus(`Pagina ${pageNo} laden…`);

  try {
    const page = await pdfDoc.getPage(pageNo);
    if (serial !== renderSerial) return;

    const viewport = page.getViewport({ scale });
    const outputScale = Math.max(1, window.devicePixelRatio || 1);

    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

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

    if (serial !== renderSerial) return;

    currentPage = pageNo;
    updateControls();
    setStatus(`Pagina ${currentPage} van ${pdfDoc.numPages}`);
  } catch (err) {
    if (err?.name === "RenderingCancelledException") return;
    console.error(err);
    setStatus("Kon deze pagina niet renderen.");
  }
}

async function openPdf(file) {
  if (!file) return;

  if (file.type && file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    setStatus("Kies een geldig PDF-bestand.");
    return;
  }

  activeFileName = file.name;
  fileName.textContent = file.name;
  setStatus(`"${file.name}" openen…`);

  try {
    const buffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: buffer });
    pdfDoc = await loadingTask.promise;

    currentPage = 1;
    scale = 1;

    welcome.classList.add("hidden");
    reader.classList.remove("hidden");

    await fitPageToWidth();

    document.title = `${file.name} - PdfReader`;
  } catch (err) {
    console.error(err);
    setStatus("De PDF kon niet worden geopend.");
  }
}

async function fitPageToWidth() {
  if (!pdfDoc) return;

  const page = await pdfDoc.getPage(currentPage);
  const baseViewport = page.getViewport({ scale: 1 });

  const horizontalPadding = window.innerWidth <= 640 ? 18 : 30;
  const availableWidth = Math.max(220, canvasWrap.clientWidth - horizontalPadding);

  scale = Math.min(3, Math.max(0.25, availableWidth / baseViewport.width));
  updateControls();
  await renderPage(currentPage);
}

fileInput.addEventListener("change", () => {
  openPdf(fileInput.files?.[0]);
  fileInput.value = "";
});

prevPage.addEventListener("click", () => {
  if (pdfDoc && currentPage > 1) renderPage(currentPage - 1);
});

nextPage.addEventListener("click", () => {
  if (pdfDoc && currentPage < pdfDoc.numPages) renderPage(currentPage + 1);
});

pageNumber.addEventListener("change", () => {
  if (!pdfDoc) return;
  const requested = Math.max(1, Math.min(pdfDoc.numPages, Number(pageNumber.value) || 1));
  renderPage(requested);
});

zoomIn.addEventListener("click", () => {
  if (!pdfDoc) return;
  scale = Math.min(4, scale + 0.15);
  updateControls();
  renderPage(currentPage);
});

zoomOut.addEventListener("click", () => {
  if (!pdfDoc) return;
  scale = Math.max(0.25, scale - 0.15);
  updateControls();
  renderPage(currentPage);
});

fitWidth.addEventListener("click", fitPageToWidth);

window.addEventListener("keydown", event => {
  if (!pdfDoc) return;

  if (event.key === "ArrowLeft" && currentPage > 1) {
    renderPage(currentPage - 1);
  } else if (event.key === "ArrowRight" && currentPage < pdfDoc.numPages) {
    renderPage(currentPage + 1);
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
    if (pdfDoc) fitPageToWidth();
  }, 180);
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(console.error);
  });
}

updateControls();
