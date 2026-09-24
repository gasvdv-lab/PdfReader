# PdfReader v0.2.4 — Testing

## Cache-vrije testlink
https://gasvdv-lab.github.io/PdfReader/?v=0.2.4

## Android
1. Open een PDF met minstens 5 pagina's.
2. Open het menu.
3. Kies `Doorlopend scrollen`.
4. Controleer dat pagina's onder elkaar verschijnen.
5. Scroll langzaam naar beneden.
6. Controleer dat pagina's pas laden wanneer ze in/nabij beeld komen.
7. Controleer dat het huidige paginanummer bovenaan mee verandert.
8. Vul handmatig een ander paginanummer in.
9. Controleer dat de viewer naar die pagina scrollt.
10. Open thumbnails en kies een andere pagina.
11. Controleer dat continuous mode naar die pagina springt.
12. Zoek een woord op een andere pagina.
13. Controleer dat de viewer naar de juiste pagina springt.
14. Schakel via het menu terug naar `Single page weergave`.
15. Controleer dat swipe/pinch en fullscreen single-page opnieuw normaal werken.
16. Test continuous mode ook in fullscreen.
17. Draai portrait → landscape → portrait.

## Windows
Herhaal dezelfde test in Chrome of Edge.

## Acceptatie
v0.2.4 is geslaagd wanneer doorlopend scrollen soepel werkt, pagina's lazy laden, de actieve pagina correct wordt bijgehouden en terugschakelen naar single-page geen bestaande functies breekt.

Pas daarna doorgaan naar v0.2.5 — PWA Foundation.
