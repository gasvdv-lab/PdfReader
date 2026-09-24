# PdfReader v0.0.1.1 — Cache & Service Worker Cleanup

## Doel
Eén technisch concept: alle resten van de oude v0.2.x service-worker/cachearchitectuur verwijderen.

## Waarom?
v0.0.1 HTML stond correct live, maar de diagnostiek bleef op 'laden…'. Dat bewijst dat oude assets nog tussenkwamen.

## Deze release
- registreert GEEN nieuwe service worker
- unregistert bestaande service workers voor deze origin
- verwijdert caches waarvan de naam `pdfreader` bevat
- gebruikt cache-busters op CSS en JS
- toont daarna een groen resetresultaat

## Cache-vrije testlink
https://gasvdv-lab.github.io/PdfReader/?v=0.0.1.1-cleanreset

## Verwacht
- PdfReader v0.0.1.1
- browserinfo ingevuld
- scherminfo ingevuld
- laadtijd ingevuld
- Oude service workers: x verwijderd
- Oude caches: x verwijderd
- groene melding: Schone basis actief
