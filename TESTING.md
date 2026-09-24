# PdfReader v0.2.3 — Testing

## Cache-vrije testlink
https://gasvdv-lab.github.io/PdfReader/?v=0.2.3

## Android
1. Open een PDF met meerdere pagina's.
2. Open het linkermenu.
3. Kies `Paginaminiaturen`.
4. Controleer dat het thumbnailpaneel opent.
5. Scroll door het paneel.
6. Controleer dat thumbnails pas zichtbaar worden wanneer ze in/nabij beeld komen.
7. Tik op pagina 2 of 3.
8. Controleer dat de hoofdviewer direct naar die pagina gaat.
9. Open thumbnails opnieuw.
10. Controleer dat de huidige pagina visueel gemarkeerd is.
11. Activeer fullscreen.
12. Open het `⋯`-menu.
13. Kies `Paginaminiaturen`.
14. Tik een andere pagina.
15. Controleer dat fullscreen behouden blijft en de gekozen pagina passend wordt weergegeven.
16. Test daarna swipe, pinch, zoeken en gewone navigatie opnieuw.

## Windows
Herhaal dezelfde tests in Chrome of Edge.

## Acceptatie
v0.2.3 is geslaagd wanneer thumbnails lazy laden, correcte pagina's tonen, paginanavigatie betrouwbaar uitvoeren en de bestaande readerfuncties niet breken.

Pas daarna doorgaan naar v0.2.4 — Continuous Scroll.
