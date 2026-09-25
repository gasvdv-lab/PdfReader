# PdfReader v0.3.2.3 — Cache Coherency & Runtime Recovery

## Kritieke fout opgelost
v0.3.2.2 kon nieuwe HTML combineren met oude JavaScript.

De oorzaak was `ignoreSearch:true` in de service worker. Daardoor kon een aanvraag zoals `app.js?v=0.3.2.2` toch een oudere `app.js` terugkrijgen.

## Fixes
- `ignoreSearch:true` volledig verwijderd
- exacte cachematching voor versiegevoelige assets
- HTML, app.js en service worker gebruiken dezelfde releaseversie
- runtimeversiecontrole via meta-tag + APP_VERSION
- service worker meldt zijn actieve versie aan de app
- gecontroleerde reload bij `controllerchange`
- atomische kritieke precache: ontbreekt één belangrijk bestand, dan wordt de nieuwe cache niet geactiveerd
- alleen oude `pdfreader-*` caches worden verwijderd
- fatale PDF-openfout reset de viewer volledig
- geen half-open viewer meer met `/ 0` en zwart canvas

## Testlink
https://gasvdv-lab.github.io/PdfReader/?v=0.3.2.3

## Vaste app-link
https://gasvdv-lab.github.io/PdfReader/
