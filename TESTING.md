# PdfReader v0.2.5.1 — Testing

## Cache-vrije testlink
https://gasvdv-lab.github.io/PdfReader/?v=0.2.5.1

## Eerst
Volg `REPOSITORY_RESET.md`.

## Android
1. Open de cache-vrije link.
2. Controleer dat de UI-versie v0.2.5.1 toont.
3. Herlaad de pagina één keer.
4. Open een PDF.
5. Test single-page navigatie.
6. Test thumbnails.
7. Test continuous scroll.
8. Test fullscreen.
9. Open het menu en controleer PWA-installatiegedrag.
10. Controleer dat geen oude versie terugkomt na opnieuw openen.

## Windows
Herhaal dezelfde test in Chrome of Edge.

## Kritieke acceptatie
- UI toont v0.2.5.1
- repository-root bevat geen oude `service-worker.js`
- live Pages toont dezelfde versie
- readerfuncties blijven werken
- geen terugval naar oude UI na herladen

Pas daarna doorgaan naar v0.2.6.
