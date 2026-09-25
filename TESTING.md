# PdfReader v0.2.5.2 — Testing

## Testlink
https://gasvdv-lab.github.io/PdfReader/?v=0.2.5.2

## Android — belangrijk
1. Open de link vanuit ChatGPT zoals je eerder deed.
2. Open PdfReader-menu ☰.
3. `App installeren / Open in Chrome` moet zichtbaar zijn, ook wanneer Chrome geen `beforeinstallprompt` event gaf.
4. Open dit item.
5. Het installatiepaneel moet verschijnen.
6. Tik `Open PdfReader in Chrome`.
7. PdfReader moet in de volledige Chrome-app openen.
8. Open Chrome-menu ⋮.
9. Kies `App installeren` of `Toevoegen aan startscherm` als Chrome dit aanbiedt.
10. Indien de native prompt binnen PdfReader beschikbaar wordt, moet het paneel automatisch naar `Klaar om te installeren` omschakelen.
11. Open `Installatiediagnose` en controleer:
   - HTTPS = OK
   - Manifest = OK
   - Standalone = NEE vóór installatie
   - Platform = Android
12. Start de geïnstalleerde app.
13. Diagnose moet Standalone = JA aangeven.

## Reader regressietest
Open daarna een PDF en controleer:
- single-page
- zoeken
- thumbnails
- continuous scroll
- fullscreen
- portrait/landscape

## Veiligheidscontrole
Deze versie mag uitsluitend oude PdfReader-serviceworkers opruimen. Andere GitHub Pages-projecten onder dezelfde `gasvdv-lab.github.io` origin mogen niet geraakt worden.

## Acceptatie
v0.2.5.2 is geslaagd wanneer de gebruiker altijd een zichtbare installatieroute heeft en Android vanuit een in-app browser naar volledige Chrome kan worden geleid.
