# pdfReader v0.1.0 — Reader Foundation

`pdfReader` is de eerste technische basis voor een PDF-reader/-bewerker die op Android en Windows werkt via GitHub Pages als PWA.

## Doel van deze versie

Deze release bewijst de basis:

- PDF lokaal openen vanaf het toestel
- PDF renderen in de browser
- vorige/volgende pagina
- rechtstreeks naar een paginanummer springen
- in- en uitzoomen
- passend op schermbreedte
- responsive bediening voor Android en Windows
- installeerbare PWA-basis
- GitHub Pages geschikt
- geen eigen backend/server nodig

## Privacy

De gekozen PDF wordt door deze applicatie rechtstreeks in de browser verwerkt. De applicatiecode uploadt het document niet naar een eigen server.

Let op: de PDF.js bibliotheek wordt in v0.1.0 via jsDelivr geladen. Daardoor heeft de eerste start internet nodig. Een latere release zal de PDF-engine lokaal bundelen zodat ook de reader zelf volledig offline kan werken.

## Installeren via GitHub Pages

1. Maak een GitHub repository met de naam `pdfReader`.
2. Upload **alle bestanden uit deze ZIP rechtstreeks naar de root** van de repository.
3. Open in GitHub:
   `Settings > Pages`
4. Kies bij `Build and deployment`:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
5. Sla op.
6. GitHub toont daarna de Pages-link.

Bij gebruikersnaam `gasvdv-lab` wordt de verwachte URL:

`https://gasvdv-lab.github.io/pdfReader/`

## Windows

Open de GitHub Pages-link in Edge of Chrome. De applicatie kan vervolgens als PWA worden geïnstalleerd.

## Android

Open de GitHub Pages-link in Chrome en kies indien beschikbaar `Toevoegen aan startscherm` of `App installeren`.

## Bediening

- `PDF openen`: kies een lokale PDF.
- `←` / `→`: vorige of volgende pagina.
- paginaveld: rechtstreeks naar een pagina.
- `+` / `-`: zoom.
- `Breedte`: pas de pagina aan de beschikbare schermbreedte aan.

Op Windows werken ook de pijltjestoetsen links/rechts en `+`/`-`.

## Volgende release

v0.2.0 breidt de reader uit met onder andere:

- continue scrollmodus
- thumbnails
- tekst zoeken
- tekstselectie
- verbeterde mobiele reader
- recente documenten
- lokale PDF.js-bundeling
