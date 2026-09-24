# PdfReader v0.2.2 — Fullscreen Reader

## Doel
Deze release voegt exact één nieuw technisch concept toe: een echte fullscreen leesmodus.

## Nieuw
- Fullscreen-knop in de reader-toolbar
- native Fullscreen API waar de browser dit ondersteunt
- veilige reader-focusmodus als native fullscreen wordt geweigerd of niet beschikbaar is
- header, footer, statusblokken en roadmapmelding verdwijnen tijdens fullscreen
- PDF-viewer gebruikt vrijwel het volledige scherm
- knop verandert naar `Sluiten`
- Esc/back/fullscreen-exit wordt gedetecteerd
- pagina wordt opnieuw passend gerenderd bij in- en uitstappen

## Behouden
Alle bewezen functies van v0.2.1.1:
- lokale PDF openen
- pagina navigatie
- directe paginakeuze
- zoom +/-
- fit Breedte en Pagina
- mobiele reader UX
- selecteerbare text layer
- zoeken over meerdere pagina's
- vorige/volgende zoekresultaat
- zoekmarkeringen

## Bewust nog niet aanwezig
- thumbnails
- continue scroll
- service worker
- PWA-cache

## Cache-vrije testlink
https://gasvdv-lab.github.io/PdfReader/?v=0.2.2

## Vaste app-link
https://gasvdv-lab.github.io/PdfReader/
