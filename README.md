# PdfReader v0.2.4.1 — Reader Stability Fix

## Waarom deze patch
v0.2.4 bevatte meerdere interactiefouten die door losse eerdere patches waren ontstaan.

## Belangrijkste fixes
- `continuousViewer` staat nu correct naast `canvasWrap` in plaats van erin
- continuous scroll wordt daardoor niet meer samen met de single-page viewer verborgen
- normale vorige/volgende/directe paginanavigatie respecteert continuous mode
- thumbnails navigeren correct binnen continuous mode
- een nieuwe PDF start altijd schoon in single-page mode
- fullscreen behoudt continuous mode zonder verborgen single-page renders
- dubbele/geneste fullscreen-herberekeningslogica verwijderd
- fullscreen zoeken is nu zichtbaar en bruikbaar
- zoekresultaten in continuous mode proberen niet meer de verkeerde tekstlaag te scrollen
- zoom/fit schakelt voorspelbaar terug naar single-page mode
- continuous pages krijgen per pagina een correcte breedteschaal
- actieve pagina-detectie gebruikt blijvende intersection-ratio's en is stabieler
- resize en schermrotatie gebruiken één centrale herberekeningsroute

## Bewust nog niet
Continuous scroll heeft nog geen eigen selecteerbare tekstlaag. Tekstselectie/highlighting blijft in deze release een single-page functie.

## Cache-vrije testlink
https://gasvdv-lab.github.io/PdfReader/?v=0.2.4.1

## Vaste app-link
https://gasvdv-lab.github.io/PdfReader/
