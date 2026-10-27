# Kalvaert naar Business Central — van workshop tot hypercare

**Een functional consultant brengt een technische groothandel van een 20 jaar oud pakket naar Microsoft Dynamics 365 Business Central.**

> Van <!--n:req.total-->25<!--/n--> wensen in vijf workshops naar een fit-gap met <!--n:cls.stdconf-->16<!--/n--> keer standaard of configuratie en <!--n:cls.extensie-->1<!--/n--> extensie, een inrichting waarvan elke boeking te verklaren is, en een go-live die pas groen wordt als de migratie tot op de cent klopt.

> *Onafhankelijke portfoliocase over een fictieve organisatie (Kalvaert Technische Groothandel). Bevat geen vertrouwelijke informatie van een echte werkgever of klant. Alle cijfers zijn illustratieve aannames.*

**[Live site](https://phlppgdfry.github.io/business-central-implementation-case/)** · **[Workbench met rondleiding van 2 min](https://phlppgdfry.github.io/business-central-implementation-case/workbench/?tour)** · **[Start hier](START-HERE.md)** · **[Bewijs per eis van de rol](EVIDENCE.md)** · **[Het volledige verhaal](CASE_STUDY.md)** · **[AL-code](bc/README.md)** · **[Azure](azure/README.md)**

## Het traject

```text
Workshops (5, met voordoen)            docs/01-discovery
   ↓
Order-to-cash en aankoop as-is → to-be docs/02-processen (+ BPMN 2.0)
   ↓
Fit-gap: standaard eerst               docs/03-fit-gap + docs/adr
   ↓
Inrichting met boekingsgevolg          docs/04-oplossingsontwerp
   ↓
Spec voor de enige extensie            docs/05-specs
   ↓
De extensie in AL, met tests            bc/  (Business Central 29.0 BE)
   ↓
Migratie met afstemming tot op de cent docs/06-migratie
   ↓
UAT → cutover → go/no-go → hypercare   docs/07-go-live  (+ azure/: migratiecontrole, telemetrie)
```

## Het probleem

Kalvaert (62 medewerkers, 1.480 installateurs als klant) werkt met TradeDesk, een lokaal groothandelspakket waarvan de support eind dit jaar stopt. Sinds 1 januari 2026 is Peppol-e-facturatie in België verplicht; TradeDesk kan het niet, dus wordt elke factuur twee keer ingegeven. Prijsafspraken staan als vrije tekst in notities, de eindejaarsbonus in Excel, en de artikelstam telt 38.000 artikels waarvan er 12.400 nog bewegen.

## Wat ik deed (als functional consultant in deze case)

- **Analyse met voordoen** — vijf workshops met echte documenten van vorige week; observatie, wens en open vraag gescheiden ([workshopplan](docs/01-discovery/workshopplan.md), [verslagen](docs/01-discovery/workshops.md)).
- **Fit-gap met een beslisser per regel** — <!--n:req.total-->25<!--/n--> requirements, zes klassen, inschatting en upgraderisico ([methode](docs/03-fit-gap/README.md), [register](docs/03-fit-gap/fit-gap.md), [CSV](docs/03-fit-gap/fit-gap.csv)).
- **Standaard eerst** — <!--n:decided.days-->29,0<!--/n--> dagen in plaats van <!--n:max.days-->40,5<!--/n--> als elke gap maatwerk was geworden; drie gaps bewust als procesaanpassing ([ADR-001](docs/adr/adr-001-standaard-eerst.md)).
- **Inrichting met boekingsgevolg** — boekingsgroepen, btw-matrix met Belgische roosters, dimensies; per instelling de reden ([ontwerp](docs/04-oplossingsontwerp/README.md), [boekingsmatrix](docs/04-oplossingsontwerp/boekingsmatrix.md)).
- **Spec voor de developer** — use case met acht uitzonderingen en testgevallen voor de enige extensie ([UC-VK-10](docs/05-specs/uc-vk-10-verwijderingsbijdrage.md)).
- **Change request** — de zaakvoerder vraagt midden in het project maatwerk; drie opties, de klant beslist ([CR-01](docs/00-project/cr-01-eindejaarsbonus.md)).
- **Migratie en go-live** — negen objecten met eigenaar; de generale repetitie geeft <!--n:mig.diff.v1-->€1.586,40<!--/n--> verschil, de oorzaak verandert het cutoverplan ([migratie](docs/06-migratie/README.md), [afstemming](docs/06-migratie/afstemming.md), [go-live](docs/07-go-live/README.md)).
- **De spec getoetst door ze te bouwen** — de extensie in AL voor Business Central 29.0 (BE), <!--n:al.tests-->12<!--/n--> AL-tests (één per testgeval), en het oplossingsontwerp als installeerbare demo-inrichting. Bij de bouw kwamen vier dingen boven die in de spec ontbraken, waaronder deelleveringen ([bc/](bc/README.md), [spec §5](docs/05-specs/uc-vk-10-verwijderingsbijdrage.md#5-gebouwd-in-al)).
- **Azure als hulpmiddel van het project** — migratiecontrole en afstemming als functie, telemetrie voor de hypercare, ±€1 per maand met budget ([azure/](azure/README.md), [ADR-008](docs/adr/adr-008-azure-voor-hypercare-en-migratiecontrole.md)).
- **Hypercare naar oorzaak** — <!--n:hc.total-->8<!--/n--> meldingen, <!--n:hc.bug-->1<!--/n--> bug; elke melding met een structurele maatregel ([log](docs/07-go-live/hypercare.md)).

## Belangrijkste keuzes

1. **Standaard → configuratie → app → procesaanpassing → extensie**, met een beslisser bij de klant per gap — goedkoper en upgradeveilig ([ADR-001](docs/adr/adr-001-standaard-eerst.md)).
2. **De enige extensie is een wettelijke verplichting** (verwijderingsbijdrage), niet de luidste wens ([ADR-004](docs/adr/adr-004-verwijderingsbijdrage-als-extensie.md)).
3. **Geen historiek migreren**, wel openstaande posten per document tegen een overgangsrekening die op nul moet eindigen ([ADR-002](docs/adr/adr-002-historiek-niet-migreren.md), [migratieplan](docs/06-migratie/README.md)).

## Gebouwd in Business Central en Azure

| | Wat | Status |
|---|---|---|
| [**`bc/apps/removal-fee`**](bc/apps/removal-fee/) | de enige extensie (VK-10): <!--n:al.fee.objects-->25<!--/n--> AL-objecten, <!--n:al.subscribers-->14<!--/n--> subscribers op standaard events, nl-BE-vertaling, telemetrie | ✓ compileert zonder waarschuwingen ([CI](.github/workflows/ci.yml)) · ✓ **draait in de sandbox `kalvaert-dev`** (BC 29.0 BE) |
| [**`bc/apps/removal-fee-test`**](bc/apps/removal-fee-test/) | <!--n:al.tests-->12<!--/n--> AL-tests: T1–T9 uit de spec plus U4, U5, U7 | ✓ compileert en is gepubliceerd · ✗ `al runtests` vraagt eerst een interactieve aanmelding |
| [**`bc/apps/demo-setup`**](bc/apps/demo-setup/) | het oplossingsontwerp als installeerbare inrichting, **gegenereerd uit `data/case.json`**: <!--n:al.customers-->28<!--/n--> klanten, <!--n:al.mig.lines-->40<!--/n--> openstaande posten tegen 499000, API om het zonder klikken te doen ([ADR-007](docs/adr/adr-007-inrichting-als-code-voor-de-sandbox.md)) | ✓ **toegepast in de sandbox**: de inrichting staat in Business Central en de migratie is geboekt |
| [**`bc/scripts/sandbox.mjs`**](bc/scripts/sandbox.mjs) | sandbox maken, publiceren, inrichten, migreren en afstemmen, de testgevallen uit de spec via de standaard API draaien → [`bc/VERIFICATION.md`](bc/VERIFICATION.md) | ✓ **gedraaid**: 8 van 8 testgevallen geslaagd, afstemming €0,00 |
| [**`azure/`**](azure/README.md) | Bicep: Application Insights met daglimiet, functies voor migratiecontrole en afstemming, Key Vault, budget, alert · 8 hypercare-queries in KQL | ✓ **uitgerold** (Germany West Central, ±€1/maand): functie live getest met beide exports, sandbox stuurt telemetrie hierheen |

**Waarom een functional consultant AL-code in een portfolio zet:** niet om developer te spelen. Een spec is pas goed als iemand ze kan bouwen zonder te gokken. Het bouwen vond vier gaten in de spec, en het *draaien* vond er nog twee die geen compiler ziet — waaronder een bijdrage die dubbel op de factuur belandde zodra iemand de hoeveelheid aanpaste ([§5](docs/05-specs/uc-vk-10-verwijderingsbijdrage.md#5-gebouwd-in-al)). In een echt project bouwt de developer; de consultant schrijft de testgevallen en draait de eerste test.

## Wat dit aantoont

| Wat een BC-functional consultant doet | Bewijs |
|---|---|
| Klantbehoeften vertalen naar BC (fit-gap) | [fit-gap-register](docs/03-fit-gap/fit-gap.md) + [ADR's](docs/adr/) |
| Bedrijfsprocessen analyseren en challengen | [workshops](docs/01-discovery/workshops.md), [order-to-cash](docs/02-processen/order-to-cash.md), [BPMN as-is/to-be](docs/02-processen/bpmn/) |
| BC-kennis (financiën, btw, verkoop, aankoop, voorraad) | [oplossingsontwerp](docs/04-oplossingsontwerp/README.md), [boekingsmatrix](docs/04-oplossingsontwerp/boekingsmatrix.md) |
| Gedocumenteerde, haalbare oplossingen | [use case + spec](docs/05-specs/uc-vk-10-verwijderingsbijdrage.md) |
| Implementatie, uitrol en nazorg | [migratie](docs/06-migratie/README.md), [go-live](docs/07-go-live/README.md), [hypercare](docs/07-go-live/hypercare.md), [migratiecontrole en telemetrie in Azure](azure/README.md) |
| Schakel met de developer | [de extensie in AL](bc/README.md), [testgevallen als AL-tests](bc/apps/removal-fee-test/src/KLVRemovalFeeTests.Codeunit.al) |
| Schakel tussen klant, accountmanager, PM en developer | [RACI](docs/00-project/raci.md), [CR-01](docs/00-project/cr-01-eindejaarsbonus.md), [statusrapport](docs/00-project/statusrapport-week-07.md) |

Volledige mapping met "getoond / niet geclaimd": [EVIDENCE.md](EVIDENCE.md).

## Openen en controleren

| Wat | Hoe | Wat je moet zien |
|---|---|---|
| Workbench met rondleiding | [workbench/?tour](https://phlppgdfry.github.io/business-central-implementation-case/workbench/?tour) | 9 stappen, "stap 1 van 9" |
| Vandaag en straks | [landingspagina](https://phlppgdfry.github.io/business-central-implementation-case/#voor-na) | schuif tussen TradeDesk en Business Central |
| Lokaal openen | `npm run serve` → http://localhost:8000 | dezelfde site |
| Controles (Node 22+) | `npm ci && npm test` | alle tests geslaagd: fit-gap-regels, traceerbaarheid, boekingen, afstemming, BPMN 2.0, AL-structuur, functielogica, documenten = model |
| Documenten, AL-data en BPMN opnieuw opbouwen | `npm run build && git diff --stat` | geen verschil — alles komt uit `data/case.json` en `models/` |
| AL compileren | `npm run al:symbols && npm run al:compile` (AL CLI van NuGet, zie [bc/](bc/README.md)) | 3 apps, 0 waarschuwingen |
| In een sandbox | `BC_TENANT=… npm run bc:sandbox -- all` | `bc/VERIFICATION.md` |
| Azure | `npm run azure:build` · deployen: [azure/README.md](azure/README.md) | Bicep zonder waarschuwingen |
| Links | `python3 scripts/check-links.py` | `OK` |

CI draait de controles, de AL-compilatie en de Bicep-build bij elke push ([ci.yml](.github/workflows/ci.yml)).

## Als de demo niet laadt

Schermafbeeldingen van elke stap van de rondleiding: [docs/screenshots/](docs/screenshots/README.md).

## Mappen

| Map | Inhoud |
|---|---|
| `data/` | de enige bron: requirements, setup, migratie, UAT, hypercare (`case.json`) + gegenereerde migratie-exports |
| `docs/00-context/` · `00-project/` | klant, scope, aannames · plan, RACI/RAID, change request, statusrapport |
| `docs/01-…07-` | het traject, genummerd |
| `docs/adr/` | ontwerpbeslissingen |
| `models/` | procesmodellen als JSON → BPMN 2.0 + SVG in `docs/02-processen/bpmn/` |
| `bc/` | de AL-apps (extensie, tests, demo-inrichting), symbolen, compile- en sandboxscripts |
| `azure/` | Bicep, functies voor migratiecontrole en afstemming, hypercare-queries (KQL) |
| `site/` | GitHub Pages: landingspagina, workbench, one-pager, deck |
| `application-kit/` | samenvatting op één pagina, deck + spreeknotities, demo van 2/5/15 minuten, views per lezer, rol-matrix ([exportplan](application-kit/export-plan.md)) |
| `scripts/` · `tests/` | opbouw van documenten, sitedata, AL-data en BPMN · controles |

## Bronnen, data en licentie

| Bron | Gebruikt voor |
|---|---|
| Microsoft Learn — Business Central ([boekingsgroepen](https://learn.microsoft.com/en-us/dynamics365/business-central/finance-posting-groups), [dimensies](https://learn.microsoft.com/en-us/dynamics365/business-central/finance-dimensions), [RapidStart](https://learn.microsoft.com/en-us/dynamics365/business-central/admin-set-up-a-company-with-rapidstart), [migratie](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/administration/migrate-data)) | wat BC standaard doet |
| [Dynamics 365 Implementation Guide — Success by Design](https://learn.microsoft.com/en-us/dynamics365/guidance/implementation-guide/success-by-design) | fasering, standaard eerst |
| [VRT NWS over Peppol (2025-12-04)](https://www.vrt.be/vrtnws/nl/2025/12/04/peppol-ondernemingen-zaak-uitstel-factuur-online/) | Peppol-verplichting |
| Zelf gegenereerde seed-data | migratie en workbench |
| Microsoft Learn — [AL-ontwikkeling](https://learn.microsoft.com/dynamics365/business-central/dev-itpro/developer/devenv-dev-overview), [events](https://learn.microsoft.com/dynamics365/business-central/dev-itpro/developer/devenv-events-in-al), [telemetrie-event-ID's](https://learn.microsoft.com/dynamics365/business-central/dev-itpro/administration/telemetry-event-ids), [Flex Consumption](https://learn.microsoft.com/azure/azure-functions/flex-consumption-plan) | de extensie, de queries, de Azure-omgeving |
| Symboolpakketten van Business Central 29.0 BE (Microsofts publieke NuGet-feed voor AL) | compileren zonder account |
| [Mermaid](https://mermaid.js.org/) 11.4.1 (MIT), via CDN · [bpmn-moddle](https://github.com/bpmn-io/bpmn-moddle) 9 (MIT) | diagrammen op de site · BPMN-validatie in de tests |

Code (scripts, tests, site-JS/CSS, workflows): [MIT](LICENSE). Documentatie, diagrammen en data: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

## Beperkingen en aannames

- **Fictief:** Kalvaert, TradeDesk, de workshops, de klanten en alle cijfers zijn verzonnen maar typisch voor een Vlaamse groothandel.
- **Sandbox, geen productie:** de AL-apps draaien in een Business Central-sandbox met fictieve data. De AL-testcodeunit zelf is nog niet gedraaid (`al runtests` vraagt een interactieve aanmelding); dezelfde testgevallen zijn wel via de standaard API uitgevoerd ([VERIFICATION.md](bc/VERIFICATION.md)).
- **Azure in een ontwikkelabonnement:** uitgerold in Germany West Central (West Europe liet dit abonnement niet toe), met een budget van €5 per maand. De functie die tegen de BC-API afstemt is bewust niet gekoppeld: dat vraagt een app-registratie met een secret.
- **Vereenvoudigd:** de workbench simuleert één verkoopregel, zonder kortingen of afrondingsregels.
- **Geen klantervaring geclaimd:** dit toont hoe ik als functional consultant zou werken, niet wat ik bij een klant gedaan heb. De AL-code is wat een developer zou bouwen; ze staat hier om de spec te toetsen.
