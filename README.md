# PdfReader v0.2.0.2 — Progressive Rendering Repair

Live app:
https://gasvdv-lab.github.io/PdfReader/

## Oorzaak van het probleem in v0.2.0 / v0.2.0.1

De reader probeerde na het kiezen van een PDF:
1. alle pagina's volledig te renderen;
2. daarna alle thumbnails te renderen;
3. dit op de hoge devicePixelRatio van Android.

Daardoor werd de eerste pagina niet onmiddellijk getoond en kon mobiel veel canvasgeheugen worden gebruikt.

Daarnaast bevatte v0.2.0.1:
- fout cache-id `pdfreader-v0.2.0.1.1`;
- een fout in `fitToWidth(false)`: de parameter werd feitelijk genegeerd.

## Reparatie v0.2.0.2

- pagina 1 wordt als eerste gerenderd;
- overige pagina's gebruiken lazy/progressive rendering;
- alleen pagina's dicht bij het scherm worden gerenderd;
- maximale render pixelratio is begrensd op 2;
- thumbnails worden pas na de eerste pagina opgebouwd;
- op Android pas wanneer de thumbnailbalk wordt geopend;
- expliciete foutmelding met technische fouttekst;
- Android-bestandstype `application/octet-stream` wordt geaccepteerd voor `.pdf`;
- cache-id gecorrigeerd naar `pdfreader-v0.2.0.2`.

## Upload

Vervang alle bestaande rootbestanden door de bestanden uit deze ZIP.

Cache-vrije testlink:
https://gasvdv-lab.github.io/PdfReader/?v=0.2.0.2
