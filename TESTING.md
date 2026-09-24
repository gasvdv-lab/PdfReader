# pdfReader v0.1.0 — Testing

## Doel

Controleren dat de eerste readerbasis werkt op GitHub Pages, Windows en Android.

## Voor deployment

Controleer dat de repository-root minimaal bevat:

- index.html
- app.js
- styles.css
- manifest.webmanifest
- service-worker.js
- icon.svg
- README.md
- ROADMAP.md
- TESTING.md

## Windows test

1. Open de GitHub Pages-link in Chrome of Edge.
2. Controleer dat het startscherm zichtbaar is.
3. Klik `PDF openen`.
4. Kies een PDF met meerdere pagina's.
5. Controleer:
   - pagina 1 wordt zichtbaar;
   - pagina-aantal klopt;
   - vorige/volgende werkt;
   - direct paginanummer invoeren werkt;
   - zoom + werkt;
   - zoom - werkt;
   - `Breedte` werkt.
6. Test de pijltjestoetsen links/rechts.
7. Herlaad de pagina.

## Android test

1. Open de GitHub Pages-link in Chrome.
2. Kies `PDF openen`.
3. Selecteer een PDF uit lokale opslag.
4. Controleer:
   - PDF wordt weergegeven;
   - knoppen zijn bruikbaar met touch;
   - pagina past op schermbreedte;
   - horizontaal/verticaal draaien van toestel breekt de reader niet.
5. Voeg de app toe aan het startscherm indien Chrome dit aanbiedt.
6. Start de app via het nieuwe pictogram.

## Bekende beperking v0.1.0

PDF.js wordt nog via een externe CDN geladen. Daarom is een internetverbinding nodig wanneer de PDF-engine nog niet door de browser is geladen.

De eigen app-shell wordt wel als PWA gecachet.

## Acceptatiecriterium

v0.1.0 is geslaagd wanneer dezelfde GitHub Pages-versie op zowel Windows als Android een lokale PDF kan openen, renderen, navigeren en zoomen zonder dat het document naar een eigen backend wordt gestuurd.
