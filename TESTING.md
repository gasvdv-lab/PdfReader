# PdfReader v0.3.0 — Testing

## Testlink
https://gasvdv-lab.github.io/PdfReader/?v=0.3.0

## Android
1. Open een PDF.
2. ☰ → Annotatiemodus.
3. Tik op drie plaatsen: drie blauwe foundation points.
4. Selecteer een point: gele outline.
5. Zoom, fit pagina/breedte, fullscreen en roteer.
6. Points moeten op dezelfde PDF-posities blijven.
7. Plaats een point op pagina 2 en ga terug naar pagina 1.
8. Activeer continuous scroll: annotatiemodus moet uitschakelen.
9. Open een tweede PDF: oude annotaties mogen niet meegaan.

## Windows
Herhaal en test Delete/Backspace voor geselecteerde point en Escape voor deselectie.

## Offline regressietest
Na online initialisatie moet de app offline blijven starten zoals v0.2.6.

## Acceptatie
v0.3.0 is geslaagd wanneer annotaties per pagina correct blijven zitten bij zoom, fullscreen, rotatie en rerender.
