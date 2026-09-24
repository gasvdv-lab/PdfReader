# PdfReader v0.2.4 — Continuous Scroll

## Doel
Een aparte doorlopende scrollmodus toevoegen zonder de bewezen single-page reader te vervangen.

## Nieuw
- menuoptie `Doorlopend scrollen`
- alle PDF-pagina's onder elkaar
- lazy rendering via IntersectionObserver
- alleen zichtbare en nabije pagina's worden gerenderd
- actieve pagina wordt automatisch gedetecteerd
- paginanummer bovenin volgt mee tijdens scrollen
- directe paginakeuze scrollt naar de juiste pagina
- thumbnails kunnen nog steeds naar een specifieke pagina navigeren
- zoeken kan naar een pagina in continuous mode springen
- menuoptie verandert naar `Single page weergave` om terug te schakelen

## Gedrag
- swipe links/rechts voor paginawissel is uitgeschakeld in continuous mode
- gewone verticale scroll wordt dan de primaire navigatie
- single-page modus behoudt swipe/pinch/fullscreen zoals voorheen
- fullscreen continuous mode blijft mogelijk

## Nog niet
- PWA
- offline engine
- annotaties

## Cache-vrije testlink
https://gasvdv-lab.github.io/PdfReader/?v=0.2.4

## Vaste app-link
https://gasvdv-lab.github.io/PdfReader/
