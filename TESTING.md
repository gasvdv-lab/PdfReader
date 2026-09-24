# PdfReader v0.1.1 — Testing

Live app:
https://gasvdv-lab.github.io/PdfReader/

## Android regressietest

1. Open de live app.
2. Open dezelfde test-PDF als bij v0.1.0.
3. Controleer dat:
   - toolbar compacter is;
   - navigatie op één logisch blok staat;
   - zoomfuncties op één logisch blok staan;
   - PDF-container direct onder de PDF stopt;
   - geen grote lege donkere ruimte meer onder één pagina staat;
   - PDF op breedte past;
   - zoomen werkt;
   - vorige/volgende werkt;
   - paginanummer werkt.
4. Draai de telefoon van portret naar landschap en terug.
5. Controleer dat de PDF opnieuw op breedte wordt gezet.

## Windows regressietest

1. Open de live app in Chrome of Edge.
2. Open een PDF van meerdere pagina's.
3. Test:
   - vorige/volgende;
   - paginanummer;
   - zoom +/−;
   - Breedte;
   - pijltjestoetsen;
   - venster verkleinen/vergroten.

## Acceptatiecriterium

v0.1.1 is geslaagd wanneer de mobiele layout merkbaar compacter is dan v0.1.0 en de grote lege ruimte onder het canvas verdwenen is.
