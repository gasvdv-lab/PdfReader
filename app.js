const APP_VERSION = "0.0.2";

const engineStatus = document.getElementById("engineStatus");
const engineVersion = document.getElementById("engineVersion");
const loadMessage = document.getElementById("loadMessage");
const browserInfo = document.getElementById("browserInfo");
const resultBox = document.getElementById("resultBox");

browserInfo.textContent = `Browser: ${navigator.userAgent}`;

async function testPdfJs() {
  try {
    loadMessage.textContent = "PDF.js module importeren…";

    const pdfjsLib = await import(
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.149/build/pdf.min.mjs"
    );

    if (!pdfjsLib || typeof pdfjsLib.getDocument !== "function") {
      throw new Error("PDF.js geladen, maar getDocument ontbreekt.");
    }

    const version = pdfjsLib.version || "onbekend";
    engineStatus.textContent = "✓ Geladen";
    engineVersion.textContent = version;
    loadMessage.textContent = `PDF.js succesvol geïmporteerd in PdfReader ${APP_VERSION}.`;
    resultBox.textContent = "✓ PDF-engine werkt. Klaar voor v0.1.0 — Minimal PDF Open.";
    resultBox.classList.add("ok");
  } catch (error) {
    console.error(error);
    engineStatus.textContent = "✗ Mislukt";
    engineVersion.textContent = "Niet beschikbaar";
    loadMessage.textContent = `Fout: ${error?.message || error}`;
    resultBox.textContent = "✗ PDF-engine kon niet worden geladen.";
    resultBox.classList.add("error");
  }
}

testPdfJs();
