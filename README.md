# PdfReader v0.1.3 — Update & Cache Fix

Live app:

https://gasvdv-lab.github.io/PdfReader/

## Doel van deze release

Deze release lost het ontwikkelprobleem op waarbij Android/Chrome soms een oudere versie van PdfReader bleef tonen.

## Wijzigingen

- `index.html` en navigatie gebruiken nu **network-first**
- service worker gebruikt `updateViaCache: "none"`
- bij iedere start wordt actief `registration.update()` uitgevoerd
- oude `pdfreader-*` caches worden automatisch verwijderd
- statische bestanden gebruiken stale-while-revalidate
- knop **Controleer update** toegevoegd
- de actieve versie blijft permanent zichtbaar
- cacheversie verhoogd naar `v0.1.3`

## Uploaden

Upload alle bestanden uit deze ZIP rechtstreeks naar de root van:

https://github.com/gasvdv-lab/PdfReader

Vervang de bestaande bestanden.

## Testlink zonder oude cache

https://gasvdv-lab.github.io/PdfReader/?v=0.1.3

## Test

Na deployment moet bovenaan zichtbaar zijn:

`PdfReader  v0.1.3`

Klik eventueel onderaan op **Controleer update**. De app herlaadt dan met een unieke cache-buster.

## Privacy

PDF-bestanden blijven lokaal in de browser verwerkt. De app uploadt ze niet naar een eigen backend.
