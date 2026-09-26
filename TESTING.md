# PdfReader v0.4.0 — Testing

## Testlink
https://gasvdv-lab.github.io/PdfReader/?v=0.4.0

## Basis
1. Upload alle bestanden naar repository-root.
2. Open testlink online.
3. Open een PDF met minstens 4 pagina's.
4. Kies menu → PDF bewerken.

## 1 — Roteren
1. Ga naar pagina 2.
2. Tik `↻ 90°`.
3. Pagina moet onmiddellijk gedraaid renderen.

## 2 — Verwijderen
1. Verwijder een tussenpagina.
2. Paginateller moet dalen.
3. Navigatie moet correct blijven.
4. De laatste resterende pagina mag niet verwijderd worden.

## 3 — Dupliceren
1. Dupliceer een pagina.
2. Paginateller moet stijgen.
3. De kopie moet direct achter de bronpagina verschijnen.

## 4 — Herschikken
1. Verplaats een pagina omhoog.
2. Verplaats ze daarna omlaag.
3. Controleer inhoud en paginavolgorde.

## 5 — PDF toevoegen
1. Tik `PDF toevoegen`.
2. Kies een tweede lokale PDF.
3. Alle pagina's daarvan moeten achteraan worden toegevoegd.

## Export
1. Tik `Exporteren`.
2. Open het bestand `*_bewerkt.pdf`.
3. Controleer alle vijf bewerkingen in een externe PDF-reader.
4. Het oorspronkelijke bestand mag niet gewijzigd zijn.

## Regressie
- markeren
- tekst
- pen
- notities
- vormen
- undo/redo
- fullscreen
- offline na eerste online initialisatie

## Acceptatie
De geëxporteerde PDF opent als geldige PDF en bevat de gewijzigde paginavolgorde/rotaties.
