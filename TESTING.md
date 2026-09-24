# PdfReader v0.2.2.2 — Testing

## Cache-vrije testlink
https://gasvdv-lab.github.io/PdfReader/?v=0.2.2.2

## Android
1. Open een PDF.
2. Activeer fullscreen.
3. Controleer dat topbar, paginabalk, zoekbalk en statusregels verdwijnen.
4. Alleen PDF + kleine `⋯`-handle mogen permanent zichtbaar blijven.
5. Tik `⋯`.
6. Controleer overlay:
   - vorige/volgende
   - pagina/totaal
   - zoom -/+
   - zoeken
   - breedte
   - pagina
   - zoom 100%
   - fullscreen verlaten
7. Sluit overlay.
8. Swipe links/rechts terwijl overlay dicht is.
9. Pinch zoom.
10. Tik kort op PDF → overlay opent.
11. Tik buiten overlay → overlay sluit.
12. Selecteer tekst en controleer dat swipe niet per ongeluk pagina wisselt.
13. Test zoeken vanuit fullscreen overlay.
14. Verlaat fullscreen.
15. Controleer dat normale professionele UI correct terugkomt.

## Windows
Herhaal fullscreen, overlaymenu, Esc, zoeken, zoom en navigatie.

## Acceptatie
v0.2.2.2 is geslaagd wanneer fullscreen vrijwel alleen de PDF toont en alle functies toch bereikbaar blijven via één discrete menu-handle.

Pas daarna doorgaan naar v0.2.3 — Thumbnails.
