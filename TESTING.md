# PdfReader v0.2.0 — Testing

Cache-vrije testlink:
https://gasvdv-lab.github.io/PdfReader/?v=0.2.0

## Android

1. Open de cache-vrije testlink.
2. Controleer dat `v0.2.0` zichtbaar is.
3. Open een PDF met meerdere pagina's.
4. Controleer:
   - alle pagina's staan onder elkaar;
   - scrollen tussen pagina's werkt;
   - huidig paginanummer verandert tijdens scrollen;
   - vorige/volgende pagina werkt;
   - zoom +/− werkt;
   - `Breedte` werkt;
   - `Pagina` werkt.
5. Open de miniaturen via de menuknop.
6. Tik op een thumbnail en controleer dat de juiste pagina opent.
7. Zoek een woord dat meerdere keren voorkomt.
8. Gebruik ↑ en ↓ voor vorige/volgende zoekresultaat.

## Windows

Herhaal dezelfde test in Chrome of Edge.

Extra:
- controleer pijltjestoetsen links/rechts;
- verklein en vergroot het venster;
- thumbnails moeten links zichtbaar zijn op brede schermen.

## Cachetest

1. Klik `Controleer update`.
2. Controleer dat de pagina herlaadt met een nieuwe `?v=` parameter.

## Acceptatiecriterium

v0.2.0 is geslaagd wanneer een PDF van meerdere pagina's bruikbaar doorlopend kan worden gelezen, thumbnails werken en tekstzoekresultaten naar de juiste pagina navigeren.
