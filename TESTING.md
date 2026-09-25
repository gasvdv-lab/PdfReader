# PdfReader v0.2.6 — Testing

## Testlink
https://gasvdv-lab.github.io/PdfReader/?v=0.2.6

## Eerste online test
1. Upload alle bestanden naar de repository-root.
2. Open de testlink online.
3. Controleer dat v0.2.6 zichtbaar is.
4. Open ☰ → App installeren → Installatiediagnose.
5. `Offline engine` moet `KLAAR` tonen.
6. Open een PDF en test reader, zoeken, thumbnails, continuous scroll en fullscreen.

## Echte offline test
1. Sluit PdfReader volledig.
2. Zet wifi én mobiele data uit.
3. Open PdfReader opnieuw.
4. De app-shell moet laden.
5. Kies een lokale PDF.
6. De PDF moet renderen.
7. Test pagina's, zoom en fullscreen.

## Update-test
1. Zet internet opnieuw aan.
2. Herlaad v0.2.6.
3. Er mag geen terugval naar v0.2.5.x optreden.
4. Alleen caches met prefix `pdfreader-` mogen beheerd worden.

## Acceptatie
v0.2.6 is geslaagd wanneer de app na één online initialisatie offline kan starten en een lokale PDF kan openen/renderen.

Pas daarna v0.3.0 — Annotation Foundation.
