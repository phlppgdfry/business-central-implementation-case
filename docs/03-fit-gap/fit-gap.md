<!-- Gegenereerd door scripts/build.mjs uit data/case.json — niet met de hand aanpassen. -->
# Fit-gap-register — Kalvaert

> Wat: elke klantbehoefte uit de workshops naast Business Central gelegd, met classificatie, oplossing, inschatting en beslisser. Voor wie: klant (beslist), projectmanager (budget), developer (bouwt de extensie). Methode: [README](README.md). Vorige stap: [workshops](../01-discovery/workshops.md) · volgende: [oplossingsontwerp](../04-oplossingsontwerp/README.md).
>
> *Illustratieve aannames — geen echte bedrijfsdata.* Inschatting in dagen (consultant + developer), dagtarief €900.

## Samenvatting

| Classificatie | Aantal |
|---|---:|
| Standaard | 6 |
| Configuratie | 10 |
| AppSource-app | 2 |
| Procesaanpassing | 4 |
| Extensie (maatwerk) | 1 |
| Buiten scope | 2 |
| **Totaal** | **25** |

Gekozen scenario: **29,0 dagen** (€26.100), 1 extensie, 2 app-requirements.
Als elke gap met maatwerk was opgelost: **40,5 dagen** (€36.450), 3 extensies — en bij elke jaarlijkse BC-update 3 keer hertesten.

## Register

| ID | Requirement | Fit | Classificatie | Oplossing | Dagen | Upgraderisico | Beslist door | Zie ook |
|---|---|---|---|---|---:|---|---|---|
| **VK-01** | Klantspecifieke prijsafspraken automatisch toepassen | fit | Configuratie | Prijslijsten per klantkortingsgroep + uitzonderingen per klant. De 420 vrije-tekstafspraken worden met de binnendienst omgezet in een opschoonsjabloon (MIG-05). | 3,0 | laag | commercieel verantwoordelijke | — |
| **VK-02** | Artikelcode van de klant op order en factuur | fit | Configuratie | Artikelreferenties voor de 15 grootste klanten; factuurlay-out toont de klantcode. | 1,0 | laag | commercieel verantwoordelijke | — |
| **VK-03** | Balieverkoop met directe betaling in het filiaal | **gap** | Procesaanpassing | Verkoopfactuur op een balieklant of de eigen klant, betalingswijze CONTANT of KAART boekt de betaling direct. Kaartterminal blijft los. Herbekijken boven 80 tickets per dag. | 2,0 | laag | zaakvoerder | [ADR-003](../adr/adr-003-balieverkoop-zonder-kassa-app.md) |
| **VK-04** | Deelleveringen en backorders | fit | Standaard | Standaard verkooporder; lijst "te verzenden" per klant als dagelijkse werklijst. | 0,5 | laag | binnendienst verkoop | — |
| **VK-05** | Nieuwe klanten blokkeren boven kredietlimiet | fit | Configuratie | Klantsjabloon NIEUW met kredietlimiet 0 en betalingsvoorwaarde VOORAF; waarschuwing op kredietlimiet voor alle klanten. | 0,5 | laag | financieel verantwoordelijke | — |
| **VK-06** | Eindejaarsbonus (rebate) voor installateurs op jaaromzet | **gap** | Procesaanpassing | Bij go-live: per kwartaal een standaard omzetrapport per klant + bonusstaffel in een vaste Excel-sjabloon; jaarlijks een creditnota per klant. Evaluatie na 6 maanden (CR-01). | 1,0 | laag | zaakvoerder | [ADR-005](../adr/adr-005-eindejaarsbonus-eerst-proces.md) · [CR-01](../00-project/cr-01-eindejaarsbonus.md) |
| **VK-07** | Retouren met terugnamekost | fit | Configuratie | Retourorder + standaardverkoopcode TERUGNAME (regel op grootboekrekening, 15% berekend door de binnendienst). Retourredenen ingesteld. | 1,0 | laag | commercieel verantwoordelijke | — |
| **VK-08** | Leveringsroutes per dag plannen | **gap** | Buiten scope | Niet in fase 1. Tijdelijk: lijst "te verzenden" gefilterd op verzendmethode per route, export naar Excel. Transportplanning bekijken na hypercare. | 0,5 | laag | zaakvoerder | — |
| **VK-09** | Herinneringen en aanmaningen | fit | Configuratie | Drie niveaus (herinnering, aanmaning, laatste aanmaning met kosten); posten met lopende creditnota uitsluiten. | 0,5 | laag | financieel verantwoordelijke | — |
| **VK-10** | Verwijderingsbijdrage op elektro-artikels automatisch op de order | **gap** | Extensie (maatwerk) | Kleine extensie: bijdrage per artikel (veld) en automatisch een regel BIJDRAGE onder de artikelregel bij Belgische leveringen. Use case en spec: UC-VK-10. | 3,0 | laag | zaakvoerder | [ADR-004](../adr/adr-004-verwijderingsbijdrage-als-extensie.md) · [spec](../05-specs/uc-vk-10-verwijderingsbijdrage.md) |
| **AK-01** | Goedkeuring van bestellingen boven €5.000 | fit | Configuratie | Workflow "goedkeuring aankooporder" met limiet €5.000 voor de aankoper; boven de limiet naar de zaakvoerder; melding in Teams/e-mail. | 1,0 | laag | zaakvoerder | — |
| **AK-02** | Prijslijsten van leveranciers inlezen | **gap** | Procesaanpassing | Bij go-live: vast Excel-sjabloon per leverancier, inlezen via configuratiepakket door de aankoper (taakkaart). Herbekijken als een leverancier zijn formaat blijft wijzigen. | 1,5 | laag | aankoopverantwoordelijke | [ADR-006](../adr/adr-006-leveranciersprijslijsten-via-configuratiepakket.md) |
| **AK-03** | Onvolledige leveringen registreren | fit | Standaard | Magazijn boekt ontvangst per regel met de werkelijke hoeveelheid. | 0,5 | laag | magazijnverantwoordelijke | — |
| **AK-04** | Factuur controleren tegen bestelling en ontvangst | fit | Standaard | Boekhouding maakt de factuur uit ontvangstregels; verschil met de leveranciersfactuur wordt een vraag aan aankoop. | 0,5 | laag | financieel verantwoordelijke | — |
| **VR-01** | Twee locaties en transfers naar het filiaal | fit | Configuratie | Locaties HQ en FILIAAL, transferroute met een in-transitlocatie; transfer twee keer per week. | 1,0 | laag | magazijnverantwoordelijke | — |
| **VR-02** | Jaarlijkse en cyclische telling | fit | Standaard | Telperiodes A (maandelijks) en C (jaarlijks) op de artikelkaart. | 0,5 | laag | magazijnverantwoordelijke | — |
| **VR-03** | Scanners voor orderpicking | **gap** | Buiten scope | Fase 2, na hypercare: eerst moet de artikelstam proper zijn (VR-04). Tot dan picken van de afgedrukte paklijst. | 0,0 | laag | zaakvoerder | — |
| **VR-04** | Alleen een propere artikelstam overnemen | **gap** | Procesaanpassing | Aankoop beslist over de dubbels vóór testmigratie 1; alleen artikels met beweging in 24 maanden worden gemigreerd; de rest blijft opvraagbaar in het archief van TradeDesk. | 2,0 | laag | aankoopverantwoordelijke | — |
| **FIN-01** | Rekeningschema van het boekhoudkantoor behouden | fit | Configuratie | Mapping van 212 WinBooks-rekeningen naar 168 BC-rekeningen, afgetekend door het kantoor; boekingsgroepen verwijzen naar dat schema. | 2,0 | laag | extern boekhoudkantoor | — |
| **FIN-02** | BTW-aangifte en jaarlijkse klantenlisting | fit | Standaard | BTW-boekingsinstellingen per bedrijfs- en productgroep met de juiste roosters; testaangifte in UAT naast de aangifte uit WinBooks. | 1,0 | laag | extern boekhoudkantoor | — |
| **FIN-03** | CODA-bankafschriften inlezen en afpunten | fit | Standaard | CODA-import per bankrekening; afpunten op gestructureerde mededeling. | 1,0 | laag | financieel verantwoordelijke | — |
| **FIN-04** | Marge per vestiging en per afdeling | fit | Configuratie | Globale dimensies VESTIGING en AFDELING; standaarddimensie op verkoper en locatie; regel "code verplicht" op omzet- en kostprijsrekeningen. | 1,0 | laag | financieel verantwoordelijke | — |
| **EF-01** | Uitgaande facturen via Peppol | fit | AppSource-app | E-documentdienst Peppol + connector-app van een access point (keuze uit twee aanbieders, beslist door financiën). | 2,0 | laag | financieel verantwoordelijke | — |
| **EF-02** | Inkomende facturen via Peppol | fit | AppSource-app | Zelfde connector; ontvangen documenten komen in een werklijst en worden gekoppeld aan de aankooporder. | 1,5 | laag | financieel verantwoordelijke | — |
| **EF-03** | Ondernemingsnummer verplicht voor Belgische klanten | fit | Configuratie | Ondernemingsnummer in het klantsjabloon BINNENL; opschoonlijst bij de migratie (MIG-02); wekelijkse lijst "klanten zonder ondernemingsnummer". | 1,0 | laag | financieel verantwoordelijke | — |

## Afwegingen bij de gaps met meerdere opties

### VK-03 — Balieverkoop met directe betaling in het filiaal

| Optie | Classificatie | Dagen | Upgraderisico | Licentie | Gekozen |
|---|---|---:|---|---|---|
| a. Procesaanpassing: verkoopfactuur + betalingswijze | Procesaanpassing | 2,0 | laag | geen | **ja** |
| b. Kassa-app (AppSource) | AppSource-app | 6,0 | middel | per kassa per maand |  |

### VK-06 — Eindejaarsbonus (rebate) voor installateurs op jaaromzet

| Optie | Classificatie | Dagen | Upgraderisico | Licentie | Gekozen |
|---|---|---:|---|---|---|
| a. Extensie: rebatemodule met staffels en automatische creditnota | Extensie (maatwerk) | 8,0 | middel | geen |  |
| b. Procesaanpassing: kwartaalrapport + jaarlijkse creditnota | Procesaanpassing | 1,0 | laag | geen | **ja** |
| c. Rebate-app (AppSource), te evalueren | AppSource-app | 3,0 | laag | per gebruiker per maand |  |

### VK-10 — Verwijderingsbijdrage op elektro-artikels automatisch op de order

| Optie | Classificatie | Dagen | Upgraderisico | Licentie | Gekozen |
|---|---|---:|---|---|---|
| a. Extensie: automatische bijdrageregel | Extensie (maatwerk) | 3,0 | laag | geen | **ja** |
| b. Procesaanpassing: binnendienst voegt de regel zelf toe | Procesaanpassing | 0,5 | laag | geen |  |

### AK-02 — Prijslijsten van leveranciers inlezen

| Optie | Classificatie | Dagen | Upgraderisico | Licentie | Gekozen |
|---|---|---:|---|---|---|
| a. Extensie: importtool per leveranciersformaat | Extensie (maatwerk) | 6,0 | middel | geen |  |
| b. Procesaanpassing: sjabloon + configuratiepakket | Procesaanpassing | 1,5 | laag | geen | **ja** |
