# PdfReader v0.2.2.3 — Testing

## Cache-vrije testlink
https://gasvdv-lab.github.io/PdfReader/?v=0.2.2.3

## Android
1. Open dezelfde A4-PDF.
2. Activeer fullscreen.
3. Controleer dat de fullscreen-viewer exact het volledige scherm gebruikt.
4. Standaard moet `Vul scherm` actief zijn.
5. Controleer dat er geen grote ongebruikte zwarte helft meer is.
6. Pan horizontaal/verticaal wanneer delen van de PDF buiten beeld vallen.
7. Open `⋯`.
8. Test `Pagina`.
9. Test `Breedte`.
10. Test `Vul scherm`.
11. Draai portrait → landscape → portrait.
12. Controleer dat de gekozen modus opnieuw correct wordt berekend.
13. In `Vul scherm`: swipe horizontaal binnen een ingezoomde pagina moet eerst pannen.
14. Pas aan de rand mag een duidelijke swipe naar vorige/volgende pagina navigeren.
15. Test pinch zoom.
16. Verlaat fullscreen en controleer dat normale UI correct terugkomt.

## Windows
Herhaal de drie fullscreenmodi, fullscreen verlaten, resize van venster en navigatie.

## Acceptatie
v0.2.2.3 is geslaagd wanneer fullscreen werkelijk de volledige viewport gebruikt, `Vul scherm` het scherm visueel vult en panning/navigatie niet met elkaar botsen.

Pas daarna doorgaan naar v0.2.3 — Thumbnails.
