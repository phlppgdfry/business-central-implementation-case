# Start hier

> Onafhankelijke portfoliocase over een fictieve organisatie. Alle cijfers zijn illustratieve aannames.

## 2 minuten

1. **[Workbench met rondleiding](https://phlppgdfry.github.io/business-central-implementation-case/workbench/?tour)** — 9 stappen: van workshop via fit-gap en boekingsgevolg naar migratie, go/no-go en hypercare.
2. Of lees de bovenkant van de [README](README.md).

## 5 minuten

1. [Fit-gap-methode](docs/03-fit-gap/README.md) — hoe een wens een beslissing wordt.
2. [Fit-gap-register](docs/03-fit-gap/fit-gap.md) — <!--n:req.total-->25<!--/n--> requirements, kijk vooral naar de gaps met meerdere opties onderaan.
3. [Afstemming](docs/06-migratie/afstemming.md) — waarom de go-live eerst "no-go" was.
4. [Spec §5 — wat bouwen én draaien veranderden](docs/05-specs/uc-vk-10-verwijderingsbijdrage.md#5-gebouwd-in-al) + [het verificatierapport](bc/VERIFICATION.md) — de spec getoetst door ze te bouwen en in een sandbox te draaien.
5. [EVIDENCE.md](EVIDENCE.md) — eis van de rol → bewijs.

## 15 minuten (het traject in volgorde)

1. [Context](docs/00-context/README.md) en [projectplan](docs/00-project/plan.md)
2. [Workshopplan](docs/01-discovery/workshopplan.md) → [verslagen](docs/01-discovery/workshops.md)
3. [Order-to-cash as-is → to-be](docs/02-processen/order-to-cash.md), ook als [BPMN](docs/02-processen/bpmn/)
4. [Fit-gap](docs/03-fit-gap/fit-gap.md) + [ADR-001 standaard eerst](docs/adr/adr-001-standaard-eerst.md)
5. [Oplossingsontwerp](docs/04-oplossingsontwerp/README.md) + [boekingsmatrix](docs/04-oplossingsontwerp/boekingsmatrix.md)
6. [Spec VK-10](docs/05-specs/uc-vk-10-verwijderingsbijdrage.md) → [de extensie in AL](bc/README.md) + [ADR-007](docs/adr/adr-007-inrichting-als-code-voor-de-sandbox.md)
7. [Change request CR-01](docs/00-project/cr-01-eindejaarsbonus.md)
8. [Migratieplan](docs/06-migratie/README.md) → [afstemming](docs/06-migratie/afstemming.md) → [migratiecontrole in Azure](azure/README.md)
9. [Go-live](docs/07-go-live/README.md) → [UAT](docs/07-go-live/uat.md) → [hypercare](docs/07-go-live/hypercare.md) + [telemetrie-queries](azure/telemetry/hypercare.kql)

## Per vraag

| Je vraag | Lees |
|---|---|
| Kent de consultant Business Central? | [oplossingsontwerp](docs/04-oplossingsontwerp/README.md), [boekingsmatrix](docs/04-oplossingsontwerp/boekingsmatrix.md) |
| Durft de consultant nee te zeggen tegen maatwerk? | [ADR-001](docs/adr/adr-001-standaard-eerst.md), [CR-01](docs/00-project/cr-01-eindejaarsbonus.md) |
| Kan de consultant een developer een bruikbare spec geven? | [UC-VK-10](docs/05-specs/uc-vk-10-verwijderingsbijdrage.md), gebouwd in [bc/apps/removal-fee](bc/apps/removal-fee/) en [gedraaid in een sandbox](bc/VERIFICATION.md) |
| Wat zet een partner naast BC in Azure, en wat kost dat? | [azure/README.md](azure/README.md), [ADR-008](docs/adr/adr-008-azure-voor-hypercare-en-migratiecontrole.md) |
| Brengt de consultant een project gecontroleerd live? | [migratie](docs/06-migratie/README.md), [go-live](docs/07-go-live/README.md) |
| Wat is echt, wat is gesimuleerd? | [beperkingen](README.md#beperkingen-en-aannames) |
