# PdfReader v0.3.1.1 — Testing

## Testlink
https://gasvdv-lab.github.io/PdfReader/?v=0.3.1.1

## Kritieke Android-test
1. Open een PDF met echte selecteerbare tekst.
2. Kies ☰ → Markeren.
3. Selecteer één woord door lang te drukken.
4. Verplaats de Android-selectiehandles zodat meerdere woorden geselecteerd zijn.
5. Onderaan moet de tekst `Geselecteerd: ...` verschijnen.
6. Tik `Markeren`.
7. De selectie moet nu als highlight zichtbaar blijven.
8. Test een selectie over twee of meer regels.
9. Test alle vier kleuren.
10. Zoom in/uit en controleer uitlijning.
11. Draai portrait ↔ landscape.
12. Test fullscreen.
13. Ga naar een andere pagina en terug.
14. Tik kort op een bestaande highlight.
15. Kies `Verwijderen`.
16. De highlight én de oude delete-status moeten verdwijnen.

## Windows
Test dezelfde flow met muisselectie.
Test ook Delete/Backspace en Escape.

## Extra regressie
- bestaande highlights mogen nieuwe tekstselectie niet blokkeren
- paginawissel mag geen oude pending selectie meenemen
- continuous scroll schakelt highlightmodus uit
- offline engine blijft werken

## Acceptatie
De release is geslaagd wanneer tekstselectie eerst zichtbaar gecachet wordt en `Markeren` daarna betrouwbaar een blijvende highlight maakt.

Pas daarna v0.3.2.
