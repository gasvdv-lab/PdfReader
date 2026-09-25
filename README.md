# PdfReader v0.2.5.2 — PWA Installability Repair

## Hoofdprobleem in v0.2.5 / v0.2.5.1
De installatieknop was gekoppeld aan `beforeinstallprompt`. Als dat browser-event niet kwam, werd de knop verborgen. In een in-app browser / Android Custom Tab is dat juist een veelvoorkomende situatie.

Daardoor had de gebruiker geen bruikbare installatieroute.

## Gefixt
- `App installeren` blijft altijd bereikbaar zolang de app niet standalone draait
- eigen installatiepaneel met duidelijke status
- native installatieprompt wordt gebruikt zodra die beschikbaar is
- Android krijgt expliciete `Open PdfReader in Chrome`-knop
- handmatige Chrome/Edge-installatiestappen zijn altijd bereikbaar
- installatiemelding staat buiten de verborgen PDF-reader en is dus ook zichtbaar zonder geopende PDF
- installatiediagnose: HTTPS, manifest, standalone, native prompt, platform en versie
- foutieve oude `Volgende stap: v0.2.5` tekst vervangen door `v0.2.6 — Offline Engine`
- dubbele `theme-color` metadata verwijderd
- `prefer_related_applications: false` expliciet toegevoegd
- legacy cleanup is nu beperkt tot PdfReader en wist niet langer service workers/caches van andere projecten op `gasvdv-lab.github.io`

## Nog bewust niet
- geen nieuwe service worker
- geen offline cache

## Android test
Open bij voorkeur rechtstreeks in Chrome:
https://gasvdv-lab.github.io/PdfReader/?v=0.2.5.2

Als je vanuit ChatGPT/in-app browser opent:
Menu ☰ → `App installeren / Open in Chrome` → `Open PdfReader in Chrome`.

## Vaste app-link
https://gasvdv-lab.github.io/PdfReader/
