# Kalvaert naar Business Central — van workshop tot hypercare

**Een functional consultant brengt een technische groothandel van een 20 jaar oud pakket naar Microsoft Dynamics 365 Business Central.**

> Van <!--n:req.total-->25<!--/n--> wensen in vijf workshops naar een fit-gap met <!--n:cls.stdconf-->16<!--/n--> keer standaard of configuratie en <!--n:cls.extensie-->1<!--/n--> extensie, een inrichting waarvan elke boeking te verklaren is, en een go-live die pas groen wordt als de migratie tot op de cent klopt.

> *Onafhankelijke portfoliocase over een fictieve organisatie (Kalvaert Technische Groothandel). Bevat geen vertrouwelijke informatie van een echte werkgever of klant. Alle cijfers zijn illustratieve aannames.*

**[Live site](https://phlppgdfry.github.io/business-central-implementation-case/)** · **[Workbench met rondleiding van 2 min](https://phlppgdfry.github.io/business-central-implementation-case/workbench/?tour)** · **[Start hier](START-HERE.md)** · **[Bewijs per eis van de rol](EVIDENCE.md)** · **[Het volledige verhaal](CASE_STUDY.md)**

## Het traject

```text
Workshops (5, met voordoen)            docs/01-discovery
   ↓
Order-to-cash as-is → to-be            docs/02-processen
   ↓
Fit-gap: standaard eerst               docs/03-fit-gap + docs/adr
   ↓
Inrichting met boekingsgevolg          docs/04-oplossingsontwerp
   ↓
Spec voor de enige extensie            docs/05-specs
   ↓
Migratie met afstemming tot op de cent docs/06-migratie
   ↓
UAT → cutover → go/no-go → hypercare   docs/07-go-live
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
- **Hypercare naar oorzaak** — <!--n:hc.total-->8<!--/n--> meldingen, <!--n:hc.bug-->1<!--/n--> bug; elke melding met een structurele maatregel ([log](docs/07-go-live/hypercare.md)).

## Belangrijkste keuzes

1. **Standaard → configuratie → app → procesaanpassing → extensie**, met een beslisser bij de klant per gap — goedkoper en upgradeveilig ([ADR-001](docs/adr/adr-001-standaard-eerst.md)).
2. **De enige extensie is een wettelijke verplichting** (verwijderingsbijdrage), niet de luidste wens ([ADR-004](docs/adr/adr-004-verwijderingsbijdrage-als-extensie.md)).
3. **Geen historiek migreren**, wel openstaande posten per document tegen een overgangsrekening die op nul moet eindigen ([ADR-002](docs/adr/adr-002-historiek-niet-migreren.md), [migratieplan](docs/06-migratie/README.md)).

## Wat dit aantoont

| Wat een BC-functional consultant doet | Bewijs |
|---|---|
| Klantbehoeften vertalen naar BC (fit-gap) | [fit-gap-register](docs/03-fit-gap/fit-gap.md) + [ADR's](docs/adr/) |
| Bedrijfsprocessen analyseren en challengen | [workshops](docs/01-discovery/workshops.md), [order-to-cash](docs/02-processen/order-to-cash.md) |
| BC-kennis (financiën, btw, verkoop, aankoop, voorraad) | [oplossingsontwerp](docs/04-oplossingsontwerp/README.md), [boekingsmatrix](docs/04-oplossingsontwerp/boekingsmatrix.md) |
| Gedocumenteerde, haalbare oplossingen | [use case + spec](docs/05-specs/uc-vk-10-verwijderingsbijdrage.md) |
| Implementatie, uitrol en nazorg | [migratie](docs/06-migratie/README.md), [go-live](docs/07-go-live/README.md), [hypercare](docs/07-go-live/hypercare.md) |
| Schakel tussen klant, accountmanager, PM en developer | [RACI](docs/00-project/raci.md), [CR-01](docs/00-project/cr-01-eindejaarsbonus.md), [statusrapport](docs/00-project/statusrapport-week-07.md) |

Volledige mapping met "getoond / niet geclaimd": [EVIDENCE.md](EVIDENCE.md).

## Openen en controleren

| Wat | Hoe | Wat je moet zien |
|---|---|---|
| Workbench met rondleiding | [workbench/?tour](https://phlppgdfry.github.io/business-central-implementation-case/workbench/?tour) | 9 stappen, "stap 1 van 9" |
| Lokaal openen | `python3 -m http.server -d site 8000` → http://localhost:8000 | dezelfde site |
| Controles (Node 22+) | `node --test tests/*.test.mjs` | alle tests geslaagd: fit-gap-regels, traceerbaarheid, boekingen in evenwicht, afstemming, documenten = model |
| Documenten opnieuw opbouwen | `node scripts/build.mjs && git diff --stat` | geen verschil — elk getal in de documenten komt uit `data/case.json` |
| Links | `python3 scripts/check-links.py` | `OK` |

CI draait dezelfde controles bij elke push ([ci.yml](.github/workflows/ci.yml)).

## Als de demo niet laadt

Schermafbeeldingen van elke stap van de rondleiding: [docs/screenshots/](docs/screenshots/README.md).

## Mappen

| Map | Inhoud |
|---|---|
| `data/` | de enige bron: requirements, setup, migratie, UAT, hypercare (`case.json`) + gegenereerde migratie-exports |
| `docs/00-context/` · `00-project/` | klant, scope, aannames · plan, RACI/RAID, change request, statusrapport |
| `docs/01-…07-` | het traject, genummerd |
| `docs/adr/` | ontwerpbeslissingen |
| `site/` | GitHub Pages: landingspagina en workbench |
| `scripts/` · `tests/` | opbouw van documenten en sitedata · controles |

## Bronnen, data en licentie

| Bron | Gebruikt voor |
|---|---|
| Microsoft Learn — Business Central ([boekingsgroepen](https://learn.microsoft.com/en-us/dynamics365/business-central/finance-posting-groups), [dimensies](https://learn.microsoft.com/en-us/dynamics365/business-central/finance-dimensions), [RapidStart](https://learn.microsoft.com/en-us/dynamics365/business-central/admin-set-up-a-company-with-rapidstart), [migratie](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/administration/migrate-data)) | wat BC standaard doet |
| [Dynamics 365 Implementation Guide — Success by Design](https://learn.microsoft.com/en-us/dynamics365/guidance/implementation-guide/success-by-design) | fasering, standaard eerst |
| [VRT NWS over Peppol (2025-12-04)](https://www.vrt.be/vrtnws/nl/2025/12/04/peppol-ondernemingen-zaak-uitstel-factuur-online/) | Peppol-verplichting |
| Zelf gegenereerde seed-data | migratie en workbench |
| [Mermaid](https://mermaid.js.org/) 11.4.1 (MIT), via CDN | diagrammen op de site |

Code (scripts, tests, site-JS/CSS, workflows): [MIT](LICENSE). Documentatie, diagrammen en data: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

## Beperkingen en aannames

- **Fictief:** Kalvaert, TradeDesk, de workshops, de klanten en alle cijfers zijn verzonnen maar typisch voor een Vlaamse groothandel.
- **Niet in Business Central gebouwd:** de beschrijving van de standaard komt uit de Microsoft-documentatie en is niet in een sandbox geverifieerd voor deze case. De workbench simuleert de boekingslogica vereenvoudigd (één regel, geen kortingen, geen afrondingsregels).
- **Geen AL-code:** de extensie is gespecificeerd, niet gebouwd.
- **Geen klantervaring geclaimd:** dit toont hoe ik als functional consultant zou werken, niet wat ik bij een klant gedaan heb.
