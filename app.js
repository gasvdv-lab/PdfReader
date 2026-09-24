(() => {
  "use strict";

  const VERSION = "0.0.1.1";
  const $ = id => document.getElementById(id);

  $("browserInfo").textContent = `Browser: ${navigator.userAgent}`;
  $("screenInfo").textContent = `Scherm: ${window.innerWidth} × ${window.innerHeight} CSS px · DPR ${window.devicePixelRatio || 1}`;
  $("timeInfo").textContent = `PdfReader ${VERSION} geladen om ${new Date().toLocaleTimeString()}`;

  async function cleanup() {
    let removedWorkers = 0;
    let removedCaches = 0;

    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) {
          if (await reg.unregister()) removedWorkers++;
        }
      }
      $("swStatus").textContent = `${removedWorkers} verwijderd`;
    } catch (err) {
      $("swStatus").textContent = `Fout: ${err.message}`;
    }

    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        for (const key of keys) {
          if (key.toLowerCase().includes("pdfreader")) {
            if (await caches.delete(key)) removedCaches++;
          }
        }
      }
      $("cacheStatus").textContent = `${removedCaches} verwijderd`;
    } catch (err) {
      $("cacheStatus").textContent = `Fout: ${err.message}`;
    }

    const result = $("resultBox");
    result.textContent = "✓ Schone basis actief — oude PdfReader service workers en caches zijn opgeruimd.";
    result.classList.add("ok");

    console.info(`PdfReader ${VERSION}: cleanup voltooid`, {removedWorkers, removedCaches});
  }

  cleanup();
})();
