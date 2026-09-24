# PdfReader v0.2.5.1 — Repository Cleanup & PWA Repair

## Doel
De GitHub repository en de live GitHub Pages-versie terug naar één consistente codebasis brengen.

## Wat deze release herstelt
- alle bestanden horen bij dezelfde versie
- PWA-manifest + PNG-iconen zijn aanwezig
- er wordt GEEN nieuwe service worker geregistreerd
- bestaande oude service workers worden bij openen actief uitgeschreven
- bestaande Cache Storage entries worden opgeschoond
- de readerbasis uit v0.2.4.1 blijft behouden
- PWA-installatiemetadata uit v0.2.5 blijft behouden

## Zeer belangrijk
Upload deze ZIP niet zomaar over oude repositorybestanden heen.

Lees eerst `REPOSITORY_RESET.md` en maak de repository-root schoon. Oude bestanden zoals `service-worker.js` moeten echt verwijderd worden.

## Cache-vrije testlink
https://gasvdv-lab.github.io/PdfReader/?v=0.2.5.1

## Vaste app-link
https://gasvdv-lab.github.io/PdfReader/
