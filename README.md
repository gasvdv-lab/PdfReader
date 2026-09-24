# PdfReader v0.2.1.1 — Search Stability Fix

Patchrelease op v0.2.1. Geen nieuwe module; bestaande functies zijn hersteld en gestabiliseerd.

## Opgeloste fouten
- `textStatus is not defined` blokkeerde PDF-openen in v0.2.1.
- Zoekpagina droeg nog de verkeerde titel `Text Layer`.
- Zoeken werkte alleen binnen één PDF.js-tekstitem; meerdelige zoektermen konden gemist worden.
- Snelle pagina-/zoomacties konden een oudere render alsnog laten terugschrijven.
- Vorige PDF werd niet expliciet vrijgegeven bij openen van een nieuw bestand.
- Fit Page gebruikte een onbetrouwbare viewerhoogte vóór rendering.

## Functies die behouden en gecontroleerd zijn
- lokale PDF openen
- pagina-aantal
- vorige/volgende pagina
- directe paginakeuze
- zoom + / -
- Breedte
- Pagina
- mobiele responsive layout
- text layer / tekstselectie
- zoeken over alle pagina's
- vorige/volgende zoekresultaat
- automatische navigatie naar resultaat
- visuele zoekmarkering

Geen service worker en geen PWA-cache.

Cache-vrije testlink:
https://gasvdv-lab.github.io/PdfReader/?v=0.2.1.1

Vaste app-link:
https://gasvdv-lab.github.io/PdfReader/
