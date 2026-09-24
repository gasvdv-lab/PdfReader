# Repository reset — verplicht voor v0.2.5.1

## Waarom
Je repository bevatte bestanden uit verschillende oude releases door elkaar.
Alleen nieuwe bestanden uploaden verwijdert oude bestanden niet.

## Veilige herstelprocedure via GitHub-webinterface

1. Ga naar:
   https://github.com/gasvdv-lab/PdfReader

2. Verwijder ALLE bestanden in de repository-root die nog van eerdere releases komen.
   In het bijzonder moet `service-worker.js` verdwijnen als die nog aanwezig is.

3. Laat de repository zelf bestaan. Alleen de inhoud van de root moet schoon worden.

4. Pak `PdfReader_v0.2.5.1.zip` lokaal uit.

5. Upload ALLE bestanden uit de ZIP rechtstreeks naar de repository-root.
   Er mag geen extra map `PdfReader_v0.2.5.1/` rond staan.

6. De root moet daarna exact deze bestanden bevatten:
   - .nojekyll
   - README.md
   - ROADMAP.md
   - TESTING.md
   - REPOSITORY_RESET.md
   - app.js
   - icon.svg
   - icon-192.png
   - icon-512.png
   - index.html
   - manifest.webmanifest
   - styles.css

7. Wacht tot GitHub Pages opnieuw gedeployed is.

8. Open:
   https://gasvdv-lab.github.io/PdfReader/?v=0.2.5.1

9. Controleer zichtbaar dat de app v0.2.5.1 toont.

10. Herlaad daarna één keer. Deze release probeert oude service workers en caches actief te verwijderen.

## Niet doen
- geen oude `service-worker.js` laten staan
- geen bestanden uit v0.1.x/v0.2.2.x terug toevoegen
- geen ZIP-bestand zelf in de repo plaatsen als vervanging voor de uitgepakte inhoud
