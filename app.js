const APP_VERSION = "0.1.3";

const fileInput = document.getElementById("fileInput");
const engineStatus = document.getElementById("engineStatus");
const fileName = document.getElementById("fileName");
const pageCount = document.getElementById("pageCount");
const navPageCount = document.getElementById("navPageCount");
const renderStatus = document.getElementById("renderStatus");
const zoomStatus = document.getElementById("zoomStatus");
const messageBox = document.getElementById("messageBox");
const reader = document.getElementById("reader");
const emptyState = document.getElementById("emptyState");
const canvas = document.getElementById("pdfCanvas");
const canvasWrap = document.getElementById("canvasWrap");
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

let pdfjsLib = null;
let pdfDoc = null;
let currentPage = 1;
let currentScale = 1;
let renderTask = null;

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

async function renderPage(targetPage, scale = currentScale) {
  if (!pdfDoc) return;

  const pageNumber = Math.max(1, Math.min(pdfDoc.numPages, Math.round(targetPage)));
  const safeScale = clampScale(scale);

  if (renderTask) {
    try { renderTask.cancel(); } catch {}
    renderTask = null;
  }

  renderStatus.textContent = `Pagina ${pageNumber} laden…`;

  try {
    const page = await pdfDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale: safeScale });
    const outputScale = Math.min(2, Math.max(1, window.devicePixelRatio || 1));

    canvas.width = Math.max(1, Math.floor(viewport.width * outputScale));
    canvas.height = Math.max(1, Math.floor(viewport.height * outputScale));
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

    currentPage = pageNumber;
    currentScale = safeScale;
    renderStatus.textContent = `✓ Pagina ${currentPage}`;
    updateUi();

    setMessage(
      `Pagina ${currentPage} van ${pdfDoc.numPages} · ${Math.round(currentScale * 100)}%`,
      "ok"
    );
  } catch (error) {
    if (error?.name === "RenderingCancelledException") return;
    console.error(error);
    renderTask = null;
    renderStatus.textContent = "✗ Mislukt";
    setMessage(`Renderfout: ${error?.message || error}`, "error");
  }
}

async function openPdf(file) {
  if (!file || !pdfjsLib) return;

  fileName.textContent = file.name || "Onbekend bestand";
  pageCount.textContent = "…";
  renderStatus.textContent = "Inlezen…";
  emptyState.classList.add("hidden");
  reader.classList.remove("hidden");
  setMessage("PDF wordt lokaal ingelezen…");

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    pdfDoc = await pdfjsLib.getDocument({ data: bytes }).promise;

    currentPage = 1;
    pageCount.textContent = String(pdfDoc.numPages);

    currentScale = await fitWidthScale(1);
    updateUi();
    await renderPage(1, currentScale);
  } catch (error) {
    console.error(error);
    pdfDoc = null;
    pageCount.textContent = "—";
    navPageCount.textContent = "0";
    renderStatus.textContent = "✗ Mislukt";
    currentScale = 1;
    updateUi();
    setMessage(`PDF openen mislukt: ${error?.message || error}`, "error");
  }
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

console.info(`PdfReader ${APP_VERSION} — Mobile Reader UX geladen.`);
