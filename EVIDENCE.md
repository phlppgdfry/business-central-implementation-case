# Bewijs per eis van de rol

> Wat een functional consultant Business Central bij een implementatiepartner doet, en waar je dat in deze case ziet. De laatste kolom zegt eerlijk wat de case toont en wat ik **niet** claim.
>
> *Onafhankelijke portfoliocase over een fictieve organisatie. Alle cijfers zijn illustratieve aannames.*

| Eis van de rol | Bewijs in deze repo | Waar in 30 seconden | Getoond / niet geclaimd |
|---|---|---|---|
| Functionele behoeften vertalen naar Business Central; **fit-gap-documenten** | [fit-gap-register](docs/03-fit-gap/fit-gap.md) met <!--n:req.total-->25<!--/n--> requirements, classificatie, oplossing, inschatting, upgraderisico, beslisser; [methode](docs/03-fit-gap/README.md); [CSV](docs/03-fit-gap/fit-gap.csv) | workbench stap 3–4 | **Getoond:** de methode en een volledig register. **Niet geclaimd:** fit-gaps bij echte klanten. |
| Bedrijfsprocessen analyseren, op locatie; knelpunten en verbeterpunten in kaart | [workshopplan](docs/01-discovery/workshopplan.md) (voordoen met echte documenten), [5 verslagen](docs/01-discovery/workshops.md), [order-to-cash](docs/02-processen/order-to-cash.md) | workbench stap 2 | **Getoond:** hoe ik een workshop voorbereid en verslaat. **Niet geclaimd:** workshops met groepen geleid in een betaalde rol. |
| Processen kritisch in vraag stellen, helikopterview | [ADR-001 standaard eerst](docs/adr/adr-001-standaard-eerst.md), [ADR-003](docs/adr/adr-003-balieverkoop-zonder-kassa-app.md), [ADR-005](docs/adr/adr-005-eindejaarsbonus-eerst-proces.md), [ADR-006](docs/adr/adr-006-leveranciersprijslijsten-via-configuratiepakket.md) | workbench stap 4 | **Getoond:** <!--n:max.saving.days-->11,5<!--/n--> dagen maatwerk vermeden met een reden per keuze (illustratief). |
| Kennis van Business Central en ERP | [oplossingsontwerp](docs/04-oplossingsontwerp/README.md): boekingsgroepen, btw-matrix met Belgische roosters, dimensies, workflow, locaties, e-documenten; [boekingsmatrix](docs/04-oplossingsontwerp/boekingsmatrix.md) | workbench stap 5 | **Getoond:** begrip van de BC-standaard en het boekingsgevolg. **Niet geclaimd:** ervaring met BC bij klanten; de inrichting is niet in een sandbox gebouwd. |
| Duidelijk gedocumenteerde, haalbare oplossingen; specificaties in een use case | [UC-VK-10](docs/05-specs/uc-vk-10-verwijderingsbijdrage.md): use case, 8 uitzonderingen, spec, 8 testgevallen | README → spec | **Getoond:** een spec die een developer kan inschatten. **Niet geclaimd:** AL-ontwikkeling. |
| Implementatie en uitrol begeleiden | [migratieplan](docs/06-migratie/README.md) met 9 objecten, [afstemming](docs/06-migratie/afstemming.md), [cutover en go/no-go](docs/07-go-live/README.md), [UAT](docs/07-go-live/uat.md) | workbench stap 6–7 | **Getoond:** plan, controles en het effect van één verschil op de go/no-go. |
| Eerste nazorg | [hypercare-log](docs/07-go-live/hypercare.md): <!--n:hc.total-->8<!--/n--> meldingen naar oorzaak, elk met structurele maatregel; overdracht | workbench stap 8 | **Getoond:** hoe ik meldingen triëer. **Niet geclaimd:** hypercare bij een echte go-live. |
| Schakel tussen klant, accountmanager, projectmanager en technische collega's | [RACI en RAID](docs/00-project/raci.md), [CR-01](docs/00-project/cr-01-eindejaarsbonus.md), [statusrapport](docs/00-project/statusrapport-week-07.md) | README → CR-01 | **Getoond:** rolverdeling en een change request via de PM. **Niet geclaimd:** werk in een implementatieteam. |
| Projectfases coördineren | [projectplan](docs/00-project/plan.md) met afhankelijkheden en testmigraties | — | **Getoond:** fasering vanuit de consultant. De planning is van de projectmanager. |
| Belgische context | btw-roosters, CODA, Peppol (EF-01–03), verwijderingsbijdrage | [boekingsmatrix](docs/04-oplossingsontwerp/boekingsmatrix.md) | **Getoond:** wat een BE-implementatie in 2026 raakt. Roosters af te stemmen met een boekhouder. |
| Werk dat te controleren is | `node --test tests/*.test.mjs`, `node scripts/build.mjs` in [CI](.github/workflows/ci.yml): fit-gap-regels, traceerbaarheid, boekingen in evenwicht, afstemming, documenten = model | README → Openen en controleren | **Getoond:** elk getal in de documenten komt uit één bron. |

## Wat deze case niet toont

- Ervaring als functional consultant bij betalende klanten.
- Een echte Business Central-omgeving, AL-code of gebouwde Peppol-koppeling.
- Groepsworkshops of trainingen die ik effectief gegeven heb.
