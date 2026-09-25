# PdfReader v0.3.1.1 — Highlight Stability Fix

## Waarom v0.3.1 niet betrouwbaar werkte
De belangrijkste fout zat in de selectieflow:

1. gebruiker selecteerde tekst;
2. gebruiker tikte daarna op `Markeren`;
3. die tik kon de browserselectie eerst laten verdwijnen;
4. pas daarna las v0.3.1 `window.getSelection()` uit;
5. resultaat: geen bruikbare selectie meer.

Dit komt vooral op Android voor, maar kan ook desktopgedrag beïnvloeden.

## Herbouwd
- elke geldige tekstselectie wordt onmiddellijk gecachet
- Android selectiehandles mogen de selectie blijven aanpassen; de cache wordt telkens bijgewerkt
- de knop `Markeren` gebruikt de gecachte geometrie als de native selectie intussen verdwenen is
- highlights onderscheppen geen touch/pointer-events meer van de tekstlaag
- bestaande highlight aantikken gebeurt via geometrische hit-testing op de pagina
- delete reset de highlight-actiebalk correct
- Escape en Delete/Backspace werken ook in highlightmodus
- pending selectie wordt gewist bij paginawissel
- technische foundation-annotatiemodus is uit de normale UI verborgen
- kleurkeuze sluit het menu op mobiel

## Testlink
https://gasvdv-lab.github.io/PdfReader/?v=0.3.1.1

## Vaste app-link
https://gasvdv-lab.github.io/PdfReader/
