const APP_VERSION = "0.1.1";

const fileInput = document.getElementById("fileInput");
const engineStatus = document.getElementById("engineStatus");
const fileName = document.getElementById("fileName");
const pageCount = document.getElementById("pageCount");
const navPageCount = document.getElementById("navPageCount");
const renderStatus = document.getElementById("renderStatus");
const messageBox = document.getElementById("messageBox");
const reader = document.getElementById("reader");
const canvas = document.getElementById("pdfCanvas");
const ctx = canvas.getContext("2d", { alpha: false });
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");
const pageInput = document.getElementById("pageInput");
const pageLabel = document.getElementById("pageLabel");

let pdfjsLib = null;
let pdfDoc = null;
let currentPage = 1;
let renderTask = null;

function setMessage(text, type = "") {
  messageBox.textContent = text;
  messageBox.className = "message-box";
  if (type) messageBox.classList.add(type);
}

function updateNavigation() {
  const ready = Boolean(pdfDoc);
  prevButton.disabled = !ready || currentPage <= 1;
  nextButton.disabled = !ready || currentPage >= (pdfDoc?.numPages || 1);
  pageInput.disabled = !ready;

  if (ready) {
    pageInput.value = String(currentPage);
    pageInput.max = String(pdfDoc.numPages);
    navPageCount.textContent = String(pdfDoc.numPages);
    pageLabel.textContent = `Pagina ${currentPage}`;
  }
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

async function renderPage(target) {
  if (!pdfDoc) return;

  const targetPage = Math.max(1, Math.min(pdfDoc.numPages, Math.round(target)));

  if (renderTask) {
    try { renderTask.cancel(); } catch {}
    renderTask = null;
  }

  renderStatus.textContent = `Pagina ${targetPage} laden…`;

  try {
    const page = await pdfDoc.getPage(targetPage);
    const baseViewport = page.getViewport({ scale: 1 });
    const availableWidth = Math.max(240, Math.min(window.innerWidth - 56, 820));
    const scale = Math.min(1.5, Math.max(0.25, availableWidth / baseViewport.width));
    const viewport = page.getViewport({ scale });
    const outputScale = Math.min(2, Math.max(1, window.devicePixelRatio || 1));

    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    const transform = outputScale !== 1
      ? [outputScale, 0, 0, outputScale, 0, 0]
      : null;

    renderTask = page.render({ canvasContext: ctx, transform, viewport });
    await renderTask.promise;
    renderTask = null;

    currentPage = targetPage;
    renderStatus.textContent = `✓ Pagina ${currentPage} gerenderd`;
    updateNavigation();
    setMessage(`✓ Pagina ${currentPage} van ${pdfDoc.numPages} wordt weergegeven.`, "ok");
  } catch (error) {
    if (error?.name === "RenderingCancelledException") return;
    console.error(error);
    renderTask = null;
    renderStatus.textContent = "✗ Mislukt";
    setMessage(`Pagina renderen mislukt: ${error?.message || error}`, "error");
  }
}

async function openPdf(file) {
  if (!file || !pdfjsLib) return;

  fileName.textContent = file.name || "Onbekend bestand";
  pageCount.textContent = "…";
  renderStatus.textContent = "Inlezen…";
  reader.classList.add("hidden");
  setMessage("PDF wordt lokaal ingelezen…");

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    pdfDoc = await pdfjsLib.getDocument({ data: bytes }).promise;
    currentPage = 1;

    pageCount.textContent = String(pdfDoc.numPages);
    reader.classList.remove("hidden");
    updateNavigation();
    await renderPage(1);
  } catch (error) {
    console.error(error);
    pdfDoc = null;
    pageCount.textContent = "—";
    navPageCount.textContent = "0";
    renderStatus.textContent = "✗ Mislukt";
    updateNavigation();
    setMessage(`PDF openen mislukt: ${error?.message || error}`, "error");
  }
}

fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.[0];
  fileInput.value = "";
  await openPdf(file);
});

prevButton.addEventListener("click", () => {
  if (pdfDoc && currentPage > 1) renderPage(currentPage - 1);
});

nextButton.addEventListener("click", () => {
  if (pdfDoc && currentPage < pdfDoc.numPages) renderPage(currentPage + 1);
});

pageInput.addEventListener("change", () => {
  if (!pdfDoc) return;
  const requested = Number(pageInput.value);
  if (!Number.isFinite(requested)) {
    pageInput.value = String(currentPage);
    return;
  }
  renderPage(requested);
});

await loadPdfJs();
updateNavigation();
console.info(`PdfReader ${APP_VERSION} — Page Navigation geladen.`);
