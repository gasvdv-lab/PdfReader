# PdfReader v0.2.5 — PWA Foundation

## Doel
PdfReader install-ready maken op Android en Windows zonder opnieuw vroegtijdig caching of een service worker in te voeren.

## Nieuw
- `manifest.webmanifest`
- standalone app-modus
- app-naam, theme color en start URL
- 192×192 en 512×512 PNG-iconen
- Android/Windows installatie-metadata
- `beforeinstallprompt` ondersteuning waar de browser dit aanbiedt
- menu-item `App installeren` verschijnt alleen wanneer een install prompt beschikbaar is
- fallbacktekst wanneer handmatige installatie via het browsermenu nodig is

## Bewust nog NIET toegevoegd
- geen service worker
- geen offline cache
- geen PDF.js precache
- geen background sync

Dit komt pas in v0.2.6 — Offline Engine, na fysieke validatie van deze PWA-basis.

## Cache-vrije testlink
https://gasvdv-lab.github.io/PdfReader/?v=0.2.5

## Vaste app-link
https://gasvdv-lab.github.io/PdfReader/
