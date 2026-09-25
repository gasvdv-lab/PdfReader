# PdfReader v0.2.6 — Offline Engine

## Doel
PdfReader na één succesvolle online initialisatie bruikbaar maken zonder internet.

## Nieuw
- versiegebonden service worker `pdfreader-0.2.6`
- offline app-shell
- PDF.js 5.4.149 en de worker worden tijdens installatie in de PdfReader-cache gezet
- lokale PDF-bestanden worden rechtstreeks vanaf het toestel geopend
- navigatie: network-first met offline fallback
- statische assets: cache-first met achtergrond-update
- alleen caches met prefix `pdfreader-` worden beheerd
- andere GitHub Pages-projecten worden niet geraakt
- `skipWaiting()` + `clients.claim()`
- registratie met `updateViaCache: "none"`
- installatiediagnose toont de status van de Offline Engine

## Belangrijk
De eerste start van v0.2.6 moet online gebeuren zodat de service worker de benodigde bestanden kan cachen.

## Offline test
1. Start v0.2.6 online.
2. Wacht tot `Offline engine = KLAAR`.
3. Sluit PdfReader volledig.
4. Zet wifi en mobiele data uit.
5. Open PdfReader opnieuw.
6. Open een lokale PDF.

## Testlink
https://gasvdv-lab.github.io/PdfReader/?v=0.2.6

## Vaste app-link
https://gasvdv-lab.github.io/PdfReader/
