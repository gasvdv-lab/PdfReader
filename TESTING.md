# PdfReader v0.3.2.3 — Testing

## Testlink
https://gasvdv-lab.github.io/PdfReader/?v=0.3.2.3

## Kritieke test
1. Upload alle bestanden naar de repository-root.
2. Open de testlink online.
3. Controleer footer v0.3.2.3.
4. Open dezelfde PDF die in v0.3.2.2 faalde.
5. `Cannot set properties of null` mag niet meer verschijnen.
6. Paginateller moet correct zijn.
7. Canvas moet PDF tonen.
8. Test tekst toevoegen, grootte, kleur, opmaak en verplaatsen.
9. Herlaad de pagina.
10. Geen terugval naar oudere code/UI.

## Offline
1. Start eerst online.
2. Sluit app.
3. Internet uit.
4. App opnieuw openen.
5. Lokale PDF openen.

## Foutafhandeling
Bij een ongeldige PDF:
- viewer sluit terug naar beginscherm
- geen `/ 0`
- geen zwart canvas
- duidelijke foutmelding

## Acceptatie
HTML, app.js en service worker behoren tot dezelfde release en PDF-openen blijft stabiel.
