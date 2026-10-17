# Kalvaert naar Business Central — samenvatting op één pagina

> Onafhankelijke portfoliocase over een fictieve organisatie. Alle cijfers zijn illustratieve aannames. PDF: [exports/one-pager.pdf](../exports/one-pager.pdf) · web: [site/one-pager](../../site/one-pager/index.html).

**Uitdaging.** Kalvaert, een technische groothandel in West-Vlaanderen (62 medewerkers, 1.480 installateurs als klant), moet weg van een 20 jaar oud pakket: de support stopt en Peppol-e-facturatie is sinds 2026 verplicht. Prijsafspraken staan in notities, facturen worden twee keer ingegeven, de artikelstam is vervuild.

**Aanpak.** Workshops → order-to-cash → fit-gap → inrichting → spec → migratie → UAT · cutover · go/no-go → hypercare.

**Wat ik uitwerkte (als functional consultant)**
1. Vijf procesworkshops met voordoen; observatie, wens en open vraag gescheiden.
2. Fit-gap met <!--n:req.total-->25<!--/n--> requirements: <!--n:cls.stdconf-->16<!--/n--> standaard of configuratie, <!--n:cls.app-->2<!--/n--> app, <!--n:cls.procesaanpassing-->4<!--/n--> procesaanpassing, <!--n:cls.extensie-->1<!--/n--> extensie — beslisser per regel.
3. Business Central-inrichting met boekingsgevolg: boekingsgroepen, btw-matrix met Belgische roosters, dimensies, workflow.
4. Use case en spec voor de enige extensie; change request met drie opties.
5. Migratie van negen objecten met afstemming tot op de cent; cutover en go/no-go met <!--n:gng.total-->8<!--/n--> criteria.
6. Hypercare-log naar oorzaak: <!--n:hc.bug-->1<!--/n--> bug op <!--n:hc.total-->8<!--/n--> meldingen.

**Resultaat (gesimuleerd, illustratief).** <!--n:decided.days-->29,0<!--/n--> dagen inschatting in plaats van <!--n:max.days-->40,5<!--/n--> bij maatwerk overal · afstemmingsverschil in de generale repetitie (<!--n:mig.diff.v1-->€1.586,40<!--/n-->) gevonden en opgelost vóór de go-live.

| Eis van de rol | Bewijs |
|---|---|
| Fit-Gap-documenten | register + ADR's |
| Bedrijfsprocessen analyseren | workshops, order-to-cash |
| Kennis van Business Central | oplossingsontwerp, boekingsmatrix |
| Use case / specificatie | UC-VK-10 |
| Implementatie en uitrol | migratie, cutover, go/no-go, UAT |
| Nazorg | hypercare-log |
| Schakel klant – PM – developer | RACI, CR-01 |

**Niet geclaimd:** klantervaring als functional consultant, een draaiende BC-omgeving (de AL-code compileert, maar is nog niet in een sandbox gedraaid), AL-ontwikkeling als beroep.
