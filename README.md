# PdfReader v0.2.0.1 — Version Sync Repair

Live app:
https://gasvdv-lab.github.io/PdfReader/

## Waarom deze patch?

De repository bevatte bestanden uit verschillende versies:
- app.js was v0.2.0
- index.html was nog v0.1.2

Daardoor kon een PDF wel gekozen worden, maar de nieuwe JavaScript vond de vereiste v0.2.0-interface niet en kon niet renderen.

## Wat deze release doet

- alle bestanden horen bij exact dezelfde versie: v0.2.0.1
- continue scroll
- thumbnails
- zoeken
- fit width
- fit page
- cache/updatefix
- extra startupcontrole op ontbrekende UI-elementen

## BELANGRIJK BIJ UPLOAD

Verwijder of vervang ALLE bestaande projectbestanden in de repository-root met de bestanden uit deze ZIP.

Controleer daarna:
- index.html bevat v0.2.0.1
- app.js bevat APP_VERSION = "0.2.0.1"
- service-worker.js bevat pdfreader-v0.2.0.1

Cache-vrije testlink:
https://gasvdv-lab.github.io/PdfReader/?v=0.2.0.1
