# PdfReader v0.2.5 — Testing

## Cache-vrije testlink
https://gasvdv-lab.github.io/PdfReader/?v=0.2.5

## Android / Chrome
1. Upload alle bestanden uit de ZIP naar de GitHub repo-root.
2. Open de cache-vrije testlink.
3. Controleer dat PdfReader normaal opent.
4. Open een PDF en test single-page, thumbnails, continuous scroll en fullscreen.
5. Open Chrome-menu.
6. Controleer of `App installeren` of `Toevoegen aan startscherm` beschikbaar is.
7. Als het menu-item `App installeren` in PdfReader verschijnt, test dit.
8. Installeer de app.
9. Start PdfReader vanaf het Android-startscherm.
10. Controleer dat de app als standalone venster opent.
11. Controleer dat er geen oude offline/cacheversie wordt geladen.
12. Verwijder de geïnstalleerde testapp desgewenst na validatie.

## Windows / Chrome of Edge
1. Open dezelfde Pages-link.
2. Controleer of de browser installatie aanbiedt.
3. Installeer PdfReader.
4. Start via Startmenu/appvenster.
5. Controleer standalone gedrag en alle readerfuncties.

## Kritieke controle
Deze release bevat bewust GEEN service worker. Als de browser offline wordt gezet, hoeft de app dus nog niet te laden.

## Acceptatie
v0.2.5 is geslaagd wanneer Android en Windows de app correct als web-app kunnen installeren/aan startscherm toevoegen en alle readerfuncties online ongewijzigd blijven werken.

Pas daarna v0.2.6 — Offline Engine.
