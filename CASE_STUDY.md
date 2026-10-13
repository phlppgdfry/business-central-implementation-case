# Case study — Kalvaert naar Business Central

> Het volledige verhaal in ±10 minuten, in de volgorde waarin een functional consultant het zou vertellen. Elke stap linkt naar het document met de details.
>
> *Onafhankelijke portfoliocase over een fictieve organisatie. Alle cijfers zijn illustratieve aannames. Ik claim geen klantervaring: dit toont hoe ik zou werken.*

## 1. Het probleem

Kalvaert is een technische groothandel in West-Vlaanderen: 62 medewerkers, 1.480 installateurs als klant, een hoofdmagazijn en een filiaal met balie. Ze werken met TradeDesk, een lokaal pakket van twintig jaar oud. Twee dingen dwingen nu tot verandering: de support van TradeDesk stopt eind dit jaar, en sinds 1 januari 2026 moeten B2B-facturen in België via Peppol. TradeDesk kan dat niet, dus wordt vandaag elke factuur twee keer ingegeven.

De go-live ligt daardoor vast. Dat is de belangrijkste randvoorwaarde van het hele project. → [context](docs/00-context/README.md), [plan](docs/00-project/plan.md)

## 2. Hoe ik begon: kijken, niet demonstreren

In deze case geef ik geen Business Central-demo vóór de analyse. Wie eerst het pakket ziet, gaat zijn proces erin proppen of ertegen verdedigen. In vijf workshops laat ik het werk voordoen met echte documenten van vorige week: vijf orders, een onvolledige levering, de laatste btw-aangifte, de bonus-Excel.

Elke notitie is één van vier soorten: observatie, wens, voorstel, open vraag met eigenaar. Dat klinkt formeel, maar het voorkomt de klassieke fout: een wens ("ik wil de prijs kunnen overtypen") opschrijven als een requirement, terwijl de observatie ("prijsafspraken staan in vrije tekst bij 420 klanten") het echte probleem is. → [workshopplan](docs/01-discovery/workshopplan.md), [verslagen](docs/01-discovery/workshops.md)

## 3. Wat ik vond

<!--n:req.total-->25<!--/n--> requirements in vijf domeinen. De belangrijkste knelpunten in order-to-cash: prijzen overtypen, facturen dubbel ingeven, backorders op papier, marge per vestiging alleen in Excel. → [order-to-cash](docs/02-processen/order-to-cash.md)

En vier soorten rommeligheid die elk project heeft: een vervuilde artikelstam (1.150 vermoedelijke dubbels), een extern boekhoudkantoor dat zijn rekeningschema wil houden, een ervaren medewerker die liever overtypt, en een zaakvoerder die midden in het project een extra wens heeft.

## 4. De fit-gap: standaard eerst

Elke wens doorloopt dezelfde volgorde: doet BC het standaard → met instellingen → met een app → kan de klant anders werken → pas dan maatwerk. Maatwerk alleen als het wettelijk moet of Kalvaert onderscheidt. → [ADR-001](docs/adr/adr-001-standaard-eerst.md)

Resultaat: <!--n:cls.standaard-->6<!--/n--> standaard, <!--n:cls.configuratie-->10<!--/n--> configuratie, <!--n:cls.app-->2<!--/n--> app (Peppol-connector), <!--n:cls.procesaanpassing-->4<!--/n--> procesaanpassing, <!--n:cls.extensie-->1<!--/n--> extensie, <!--n:cls.buiten-scope-->2<!--/n--> bewust buiten scope. Elke regel heeft een beslisser bij de klant: ik maak beslissingen beslisbaar, ik neem ze niet. → [register](docs/03-fit-gap/fit-gap.md)

Drie voorbeelden van "standaard eerst":
- **Balie zonder kassa-app.** Bij 40 tickets per dag volstaat een verkoopfactuur met betalingswijze. Opnieuw bekijken boven 80. → [ADR-003](docs/adr/adr-003-balieverkoop-zonder-kassa-app.md)
- **Leveranciersprijslijsten via een sjabloon**, niet via een importtool die breekt zodra een leverancier een kolom verschuift. → [ADR-006](docs/adr/adr-006-leveranciersprijslijsten-via-configuratiepakket.md)
- **De enige extensie** is de verwijderingsbijdrage op elektro-artikels: wettelijk verplicht, honderden regels per maand, en vandaag vaak vergeten. → [ADR-004](docs/adr/adr-004-verwijderingsbijdrage-als-extensie.md)

Gekozen scenario: <!--n:decided.days-->29,0<!--/n--> dagen. Als elke gap maatwerk was geworden: <!--n:max.days-->40,5<!--/n--> dagen en <!--n:max.extensions-->3<!--/n--> extensies om bij elke jaarlijkse update te hertesten.

## 5. De change request

In week 7 vraagt de zaakvoerder om de eindejaarsbonus per kwartaal automatisch te berekenen. Niet in de offerte. Ik vraag eerst *waarom per kwartaal*: om installateurs tussentijds te tonen hoe dicht ze bij de volgende staffel zitten. Dat doel kon met een standaardrapport per kwartaal. Drie opties, met kost en planning, via de projectmanager voorgelegd; de zaakvoerder koos het rapport nu en een app-evaluatie na zes maanden. → [CR-01](docs/00-project/cr-01-eindejaarsbonus.md), [ADR-005](docs/adr/adr-005-eindejaarsbonus-eerst-proces.md)

## 6. De inrichting: elke boeking verklaarbaar

Boekingsgroepen, btw-matrix met Belgische roosters, dimensies, workflow, locaties, e-documenten — elke instelling met de requirement waar ze vandaan komt. Samen met het boekhoudkantoor gekozen: omzet per markt op aparte rekeningen (zodat btw-roosters 03, 46 en 47 per rekening af te punten zijn), kostprijs op 609, EU-klanten met btw-verlegging. → [oplossingsontwerp](docs/04-oplossingsontwerp/README.md), [boekingsmatrix](docs/04-oplossingsontwerp/boekingsmatrix.md)

Voor de extensie schrijf ik een use case met acht uitzonderingen en acht testgevallen. Wat, niet hoe: de developer kiest de techniek. → [UC-VK-10](docs/05-specs/uc-vk-10-verwijderingsbijdrage.md)

## 7. Migratie: tot op de cent

Negen objecten, elk met een eigenaar bij de klant. Stamdata via configuratiepakketten na opschoning; openstaande posten per document tegen een overgangsrekening die na alle migraties op nul moet staan; historiek niet. Drie keer geoefend: week 8, week 10 en een generale repetitie in week 14. → [migratieplan](docs/06-migratie/README.md)

In de generale repetitie verschilden de openstaande klantposten <!--n:mig.diff.v1-->€1.586,40<!--/n--> met WinBooks. Oorzaak: een creditnota die om 16:40 geboekt werd, na de export van 16:00. Gevolg voor het cutoverplan: TradeDesk eerst op alleen-lezen, dan pas exporteren en saldi opvragen. Met export v1 was de go/no-go **no-go**; met export v2 klopt alles. → [afstemming](docs/06-migratie/afstemming.md)

## 8. Go-live en hypercare

<!--n:uat.total-->17<!--/n--> UAT-scenario's, uitgevoerd en afgetekend door de key users, één defect (fout klantsjabloon voor EU-klanten). Cutover over een weekend, go/no-go zondag 18:00 met <!--n:gng.total-->8<!--/n--> criteria en een rollback die zondag beslist wordt, niet maandag. → [go-live](docs/07-go-live/README.md), [UAT](docs/07-go-live/uat.md)

In de hypercare <!--n:hc.total-->8<!--/n--> meldingen, waarvan <!--n:hc.bug-->1<!--/n--> bug. De rest was data, setup of opleiding. Elke melding kreeg een structurele maatregel, zodat support na de overdracht niet dezelfde vragen krijgt. → [hypercare-log](docs/07-go-live/hypercare.md)

## 9. Wat dit over mijn manier van werken zegt

- Ik begin bij het werk van mensen, niet bij het pakket.
- Ik maak beslissingen beslisbaar — met kost, risico en een beslisser — en laat ze bij de klant.
- Ik denk bij elke instelling aan het boekingsgevolg.
- Ik vertrouw een migratie pas als de cijfers tot op de cent aansluiten.

## 10. Wat deze case niet is

Fictief, niet in een Business Central-omgeving gebouwd, geen AL-code, geen klantervaring. De workbench vereenvoudigt de boekingslogica. → [beperkingen](README.md#beperkingen-en-aannames)
