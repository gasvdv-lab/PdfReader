# PdfReader v0.4.0 — PDF Editing Suite

Deze release bundelt de vijf geplande PDF-bewerkingen in één ZIP.

## De 5 functies

1. **Pagina roteren**
   - huidige pagina 90° rechtsom draaien
   - wijziging zit in de echte PDF-structuur

2. **Pagina verwijderen**
   - huidige pagina verwijderen
   - minimaal één pagina blijft verplicht
   - annotaties van latere pagina's schuiven mee

3. **Pagina dupliceren**
   - huidige pagina wordt direct erachter gekopieerd
   - annotaties van die pagina worden mee gedupliceerd

4. **Pagina herschikken**
   - huidige pagina één positie omhoog of omlaag
   - annotaties wisselen mee naar de juiste pagina

5. **PDF toevoegen / samenvoegen**
   - kies een tweede lokale PDF
   - alle pagina's worden achteraan toegevoegd
   - bestanden worden lokaal verwerkt

## Export
`Exporteren` maakt een nieuwe `*_bewerkt.pdf`.
Het originele lokale bestand wordt nooit overschreven.

## Engines
- PDF.js: lezen/renderen
- pdf-lib 1.17.1: echte PDF-bewerking en export

## Belangrijke beperking
De bestaande visuele annotaties (markeringen, tekst, pen, notities en vormen) worden nog niet in de geëxporteerde PDF ingebrand. Hun pagina-index wordt wel zo goed mogelijk bijgehouden tijdens pagina verwijderen, dupliceren en herschikken.

## Testlink
https://gasvdv-lab.github.io/PdfReader/?v=0.4.0

## Vaste app-link
https://gasvdv-lab.github.io/PdfReader/
