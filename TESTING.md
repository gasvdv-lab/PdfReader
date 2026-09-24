# PdfReader v0.1.3 — Testing

Testlink zonder oude cache:

https://gasvdv-lab.github.io/PdfReader/?v=0.1.3

## Android

1. Upload v0.1.3 naar GitHub.
2. Wacht tot GitHub Pages klaar is.
3. Open de cache-busted testlink.
4. Controleer dat `v0.1.3` zichtbaar is.
5. Open een PDF.
6. Test vorige/volgende, paginanummer, zoom en Breedte.
7. Klik onderaan op `Controleer update`.
8. Controleer dat de pagina opnieuw opent met een nieuwe `?v=` parameter.

## Cache-regressietest

1. Laat v0.1.3 eenmaal laden.
2. Sluit de browser.
3. Open opnieuw.
4. Controleer dat de versie nog steeds v0.1.3 is.
5. Bij een latere release moet dezelfde test aantonen dat de nieuwe versie zichtbaar wordt zonder handmatig sitegegevens te wissen.

## Windows

Herhaal dezelfde test in Chrome of Edge.

## Acceptatiecriterium

De app mag na een nieuwe deployment niet structureel op een oude HTML-versie blijven hangen. De versie-indicatie moet overeenkomen met de laatste gedeployde release.
