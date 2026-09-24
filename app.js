const APP_VERSION = "0.1.0";

const fileInput = document.getElementById("fileInput");
const engineStatus = document.getElementById("engineStatus");
const fileName = document.getElementById("fileName");
const pageCount = document.getElementById("pageCount");
const renderStatus = document.getElementById("renderStatus");
const messageBox = document.getElementById("messageBox");
const viewer = document.getElementById("viewer");
const canvas = document.getElementById("pdfCanvas");
const ctx = canvas.getContext("2d", { alpha: false });

let pdfjsLib = null;

function setMessage(text, type = "") {
  messageBox.textContent = text;
  messageBox.className = "message-box";
  if (type) messageBox.classList.add(type);
}

async function loadPdfJs() {
  try {
    pdfjsLib = await import(
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.min.mjs"
    );

    if (!pdfjsLib || typeof pdfjsLib.getDocument !== "function") {
      throw new Error("PDF.js getDocument ontbreekt.");
    }

    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.worker.min.mjs";

    engineStatus.textContent = `✓ ${pdfjsLib.version || "geladen"}`;
    return true;
  } catch (error) {
    console.error(error);
    engineStatus.textContent = "✗ Mislukt";
    setMessage(`PDF.js kon niet worden geladen: ${error?.message || error}`, "error");
    return false;
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
  renderStatus.textContent = "Inlezen…";
  viewer.classList.add("hidden");
  setMessage("PDF wordt lokaal ingelezen…");

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());

    const loadingTask = pdfjsLib.getDocument({
      data: bytes
    });

    const pdfDoc = await loadingTask.promise;

    pageCount.textContent = String(pdfDoc.numPages);
    renderStatus.textContent = "Pagina 1 laden…";

    const page = await pdfDoc.getPage(1);
    const baseViewport = page.getViewport({ scale: 1 });

    const availableWidth = Math.max(
      240,
      Math.min(window.innerWidth - 56, 820)
    );

    const scale = Math.min(
      1.5,
      Math.max(0.25, availableWidth / baseViewport.width)
    );

    const viewport = page.getViewport({ scale });
    const outputScale = Math.min(2, Math.max(1, window.devicePixelRatio || 1));

    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;

    const transform = outputScale !== 1
      ? [outputScale, 0, 0, outputScale, 0, 0]
      : null;

    await page.render({
      canvasContext: ctx,
      transform,
      viewport
    }).promise;

    viewer.classList.remove("hidden");
    renderStatus.textContent = "✓ Pagina 1 gerenderd";
    setMessage(
      `✓ PDF geopend. ${pdfDoc.numPages} pagina${pdfDoc.numPages === 1 ? "" : "'s"} gevonden. Alleen pagina 1 wordt in deze testversie weergegeven.`,
      "ok"
    );
  } catch (error) {
    console.error(error);
    pageCount.textContent = "—";
    renderStatus.textContent = "✗ Mislukt";
    setMessage(`PDF openen mislukt: ${error?.message || error}`, "error");
  }
}

fileInput.addEventListener("change", async () => {
  const file = fileInput.files?.[0];
  fileInput.value = "";
  await openPdf(file);
});

await loadPdfJs();

console.info(`PdfReader ${APP_VERSION} — Minimal PDF Open geladen.`);
