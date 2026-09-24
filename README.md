# PdfReader v0.1.1 — Mobile Layout Fix

Live app:

https://gasvdv-lab.github.io/PdfReader/

## Wat is gewijzigd t.o.v. v0.1.0

- compactere mobiele toolbar
- toolbar logisch opgesplitst in navigatie en zoom
- PDF-container neemt niet langer kunstmatig veel verticale ruimte in
- kleinere mobiele marges
- betere breedteberekening op Android
- automatische herberekening bij schermrotatie/resizen
- bestandsnaam zichtbaar op grotere schermen
- juiste repository- en Pages-naam: `PdfReader`
- `.nojekyll` toegevoegd voor robuustere GitHub Pages-publicatie
- PWA cacheversie bijgewerkt

## Installatie via GitHub Pages

Upload alle bestanden uit deze ZIP rechtstreeks naar de root van:

https://github.com/gasvdv-lab/PdfReader

GitHub Pages moet publiceren vanaf:

- Branch: `main`
- Folder: `/ (root)`

Live app:

https://gasvdv-lab.github.io/PdfReader/

## Privacy

De geopende PDF wordt lokaal in de browser verwerkt. De applicatie stuurt de PDF niet naar een eigen backend.

## Bekende beperking

PDF.js wordt in deze versie nog via jsDelivr geladen. Volledige offline bundeling staat gepland voor v0.2.0.
