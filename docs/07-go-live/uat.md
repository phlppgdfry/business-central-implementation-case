<!-- Gegenereerd door scripts/build.mjs uit data/case.json — niet met de hand aanpassen. -->
# UAT-scenario's

> Wat: de 17 end-to-end scenario's die de key users zelf uitvoeren en aftekenen. Voor wie: key users, projectmanager (GNG-01). Elk scenario is gekoppeld aan requirements uit de [fit-gap](../03-fit-gap/fit-gap.md). Vorige stap: [afstemming](../06-migratie/afstemming.md) · volgende: [go-live](README.md).
>
> *Fictief — illustratief.*

| ID | Scenario | Key user | Requirements | Resultaat |
|---|---|---|---|---|
| UAT-01 | Order binnenland: deellevering, factuur via Peppol, CODA-betaling, afpunten | binnendienst verkoop | VK-01, VK-04, EF-01, FIN-03 | geslaagd |
| UAT-02 | Levering aan EU-klant: 0% btw met vermelding, rooster 46 | boekhouding | FIN-02 | geslaagd na herstel (DEF-01) |
| UAT-03 | Balieverkoop contant en met kaart | balie filiaal | VK-03 | geslaagd |
| UAT-04 | Nieuwe klant boven kredietlimiet wordt geblokkeerd | binnendienst verkoop | VK-05 | geslaagd |
| UAT-05 | Retour met terugnamekost | binnendienst verkoop | VK-07 | geslaagd |
| UAT-06 | Bijdrageregel bij boiler, niet bij EU-klant, niet dubbel bij order kopiëren | binnendienst verkoop | VK-10 | geslaagd |
| UAT-07 | Bestelling €7.200 ter goedkeuring; afwijzen en opnieuw indienen | aankoop | AK-01 | geslaagd |
| UAT-08 | Onvolledige levering en factuur uit ontvangstregels | aankoop | AK-03, AK-04 | geslaagd |
| UAT-09 | Inkomende Peppol-factuur van EU-leverancier met verlegging | boekhouding | EF-02, FIN-02 | geslaagd |
| UAT-10 | Transfer HQ naar filiaal | magazijn (vervanger) | VR-01 | geslaagd |
| UAT-11 | Marge per vestiging en afdeling in analyseweergave | financieel verantwoordelijke | FIN-04 | geslaagd |
| UAT-12 | Herinnering en aanmaning, post met creditnota uitgesloten | boekhouding | VK-09 | geslaagd |
| UAT-13 | Prijslijst leverancier inlezen via sjabloon | aankoop | AK-02 | geslaagd |
| UAT-14 | Klantartikelcode op order en factuur | binnendienst verkoop | VK-02 | geslaagd |
| UAT-15 | Cyclische telling klasse A | magazijn (vervanger) | VR-02 | geslaagd |
| UAT-16 | Kwartaalrapport omzet per klant en bonusberekening | financieel verantwoordelijke | VK-06 | geslaagd |
| UAT-17 | Nieuwe Belgische klant zonder ondernemingsnummer: factuur wordt niet verzonden | boekhouding | EF-03 | geslaagd |

## Defects

| ID | UAT | Ernst | Wat | Oorzaak | Categorie | Herstel | Status |
|---|---|---:|---|---|---|---|---|
| DEF-01 | UAT-02 | 2 | EU-klant krijgt 21% btw | klantsjabloon EU stond op BTW-bedrijfsboekingsgroep BINNENL | setup | klantsjabloon EU hersteld; hertest geslaagd | gesloten |

## Requirements zonder UAT-scenario

| Requirement | Waarom geen scenario | Wel gecontroleerd via |
|---|---|---|
| VK-08 Leveringsroutes per dag plannen | Buiten scope fase 1; de tijdelijke lijst is een standaardweergave. | — |
| VR-03 Scanners voor orderpicking | Buiten scope fase 1. | — |
| VR-04 Alleen een propere artikelstam overnemen | migratieobject, geen gebruikersscenario | MIG-04 |
| FIN-01 Rekeningschema van het boekhoudkantoor behouden | migratieobject, geen gebruikersscenario | MIG-01, MIG-08 |
