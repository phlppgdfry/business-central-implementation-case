# Context — Kalvaert Technische Groothandel

> Wat: de fictieve klant, waarom het project nu loopt, wat in en buiten scope is, en welke aannames en bronnen de case gebruikt. Voor wie: iedereen die de case voor het eerst opent. Volgende stap: [projectplan](../00-project/plan.md).
>
> **Onafhankelijke portfoliocase over een fictieve organisatie.** Bevat geen vertrouwelijke informatie van een echte werkgever of klant. Alle cijfers zijn *illustratieve aannames — geen echte bedrijfsdata*.

## De klant

| | |
|---|---|
| Wat ze doen | groothandel in sanitair, verwarming en elektro-installatiemateriaal voor installateurs (B2B) |
| Waar | West-Vlaanderen: hoofdmagazijn (HQ) en een filiaal met balie |
| Grootte | 62 medewerkers, 28 toekomstige BC-gebruikers, 1.480 actieve klanten, 310 leveranciers |
| Artikelen | 38.000 in het oude pakket, 12.400 met beweging in de laatste 24 maanden |
| Systemen vandaag | TradeDesk 7 (fictief lokaal groothandelspakket, 20 jaar oud) · WinBooks bij het externe boekhoudkantoor · Excel voor prijsafspraken, bonus en routes · Peppol-portaal als workaround |
| Beslissers | zaakvoerder (scope en budget) · financieel verantwoordelijke · extern boekhoudkantoor (rekeningschema, btw) |
| Key users | binnendienst verkoop, balie, aankoop, magazijn, boekhouding |

## Waarom nu

1. De leverancier van TradeDesk stopt de support eind dit jaar.
2. E-facturatie via Peppol is in België verplicht voor B2B tussen btw-plichtigen sinds 1 januari 2026. TradeDesk kan het niet; facturen worden nu twee keer ingegeven.

Daardoor ligt de go-live vast. Dat bepaalt veel beslissingen in deze case (zie [ADR-005](../adr/adr-005-eindejaarsbonus-eerst-proces.md)).

## Scope

**In scope:** Business Central (SaaS) met financiën, verkoop, aankoop, voorraad op twee locaties, Belgische lokalisatie (btw, CODA), e-documenten via Peppol, één extensie (verwijderingsbijdrage), datamigratie, training, UAT, go-live en hypercare.

**Buiten scope (fase 2):** routeplanning (VK-08), scanners in het magazijn (VR-03), webshopkoppeling, Power BI, automatische rebateberekening (wordt geëvalueerd, [CR-01](../00-project/cr-01-eindejaarsbonus.md)).

## Mijn rol in deze case

Ik speel de **functional consultant** van de implementatiepartner. Ik leid de analyseworkshops, schrijf de fit-gap en het setup-ontwerp, schrijf de spec voor de developer, plan de migratie en de go-live, en volg de hypercare op. De projectmanager bewaakt planning, budget en change requests; de accountmanager de commerciële afspraak; de developer bouwt de extensie. Zie [RACI](../00-project/raci.md).

## Aannames

- Alle aantallen, bedragen, weken, rekeningnummers en het dagtarief zijn illustratief.
- Rekeningnummers volgen de logica van het Belgische minimumindelingsschema (MAR), maar het definitieve schema komt van het boekhoudkantoor.
- Btw-roosters zijn de gangbare roosters van de Belgische periodieke aangifte; in een echt project tekent het boekhoudkantoor de mapping af.
- De beschrijving van wat Business Central standaard doet, komt uit de Microsoft Learn-documentatie. De inrichting, de migratie en de testgevallen van VK-10 zijn **wel** in een sandbox uitgevoerd ([verificatie](../../bc/VERIFICATION.md)); de overige requirements zijn ontwerp.
- "TradeDesk 7" en "Kalvaert" bestaan niet.

## Data en bronnen

| Bron | Gebruikt voor |
|---|---|
| [Microsoft Learn — Business Central: boekingsgroepen](https://learn.microsoft.com/en-us/dynamics365/business-central/finance-posting-groups) | boekingsmatrix |
| [Microsoft Learn — dimensies](https://learn.microsoft.com/en-us/dynamics365/business-central/finance-dimensions) | FIN-04 |
| [Microsoft Learn — configuratiepakketten (RapidStart)](https://learn.microsoft.com/en-us/dynamics365/business-central/admin-set-up-a-company-with-rapidstart) | migratie, AK-02 |
| [Microsoft Learn — data migreren](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/administration/migrate-data) | migratieplan |
| [Dynamics 365 Implementation Guide — Success by Design](https://learn.microsoft.com/en-us/dynamics365/guidance/implementation-guide/success-by-design) | fasering, "standaard eerst" |
| [MB-800 study guide](https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/mb-800) | scope van de setup |
| [VRT NWS, 4 december 2025 — Peppol](https://www.vrt.be/vrtnws/nl/2025/12/04/peppol-ondernemingen-zaak-uitstel-factuur-online/) | Peppol-verplichting en overgangsperiode |
| Zelf gegenereerde seed-data (`data/`, `scripts/generate-seed.mjs`) | migratie-afstemming, workbench |

## Beperkingen

- Geen echte klant, workshops of gebruikers: de workshopverslagen en hypercare-meldingen zijn verzonnen maar typisch.
- Niet in een Business Central-omgeving gebouwd of getest; de workbench simuleert de boekingslogica vereenvoudigd (één regel, geen kortingen).
- De functional consultant schrijft de spec, de developer bouwt. In deze case staat de extensie toch in AL ([bc/](../../bc/README.md)), om de spec te toetsen — en ze draait in een sandbox ([verificatie](../../bc/VERIFICATION.md)).
- Geen productie-ervaring geclaimd: dit toont hoe ik zou werken, niet wat ik bij een klant gedaan heb.
