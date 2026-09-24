# PdfReader v0.2.2.3 — True Fullscreen Viewport

## Doel
Fullscreen moet niet alleen technisch fullscreen zijn: de PDF-weergave moet de volledige viewport benutten.

## Nieuw
- fullscreen gebruikt exact 100vw × 100dvh
- standaard fullscreenmodus = `Vul scherm`
- extra fullscreenmodus `Vul scherm` in het overlaymenu
- `Pagina` = volledige pagina zichtbaar
- `Breedte` = volledige schermbreedte
- `Vul scherm` = scherm volledig gevuld, met panning waar nodig
- automatische herberekening bij schermrotatie
- horizontaal en verticaal pannen bij ingezoomde/fill-weergave
- swipe naar andere pagina alleen aan de horizontale rand van een gepande pagina
- fullscreen blijft document-first met alleen de `⋯`-handle permanent zichtbaar

## Belangrijk
Een A4-pagina en een smartphonescherm hebben verschillende beeldverhoudingen. `Vul scherm` gebruikt daarom een cover-schaal: het scherm is volledig gevuld, terwijl een deel van de pagina buiten de viewport kan vallen en via panning bereikbaar blijft.

## Nog niet
- thumbnails
- continuous scroll
- service worker
- PWA-cache

## Cache-vrije testlink
https://gasvdv-lab.github.io/PdfReader/?v=0.2.2.3

## Vaste app-link
https://gasvdv-lab.github.io/PdfReader/
