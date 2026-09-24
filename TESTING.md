# PdfReader v0.2.4.1 — Testing

## Cache-vrije testlink
https://gasvdv-lab.github.io/PdfReader/?v=0.2.4.1

## Kritieke Android-test
1. Open een PDF met meerdere pagina's.
2. Test single-page vorige/volgende.
3. Open `Doorlopend scrollen`.
4. Controleer dat de pagina's werkelijk zichtbaar zijn en onder elkaar staan.
5. Scroll over meerdere pagina's en controleer het actieve paginanummer.
6. Gebruik vorige/volgende terwijl continuous mode actief is.
7. Kies een pagina via thumbnails; continuous mode moet behouden blijven.
8. Zoek naar tekst op een andere pagina; de viewer moet naar die pagina scrollen.
9. Schakel terug naar `Single page weergave`.
10. Test tekstselectie en zoeken opnieuw.
11. Activeer fullscreen in single-page mode; standaard moet `Pagina` gelden.
12. Open `⋯` > Zoeken; het zoekpaneel moet zichtbaar zijn in fullscreen.
13. Verlaat fullscreen.
14. Activeer continuous mode en daarna fullscreen.
15. Continuous mode moet zichtbaar blijven en scrollbaar zijn.
16. Draai portrait ↔ landscape.
17. Open daarna een andere PDF; deze moet schoon in single-page mode starten.

## Windows
Herhaal dezelfde flow in Chrome of Edge en test ook native fullscreen met Esc.

## Acceptatie
Deze patch is geslaagd als single-page, thumbnails, continuous scroll, zoeken en fullscreen zonder verborgen viewer, verkeerde navigatie of mode-conflicten samenwerken.

Ga pas daarna door naar v0.2.5 — PWA Foundation.
