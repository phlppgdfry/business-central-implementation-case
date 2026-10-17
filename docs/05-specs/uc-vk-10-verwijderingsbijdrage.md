# UC-VK-10 — Verwijderingsbijdrage automatisch op de verkooporder

> Wat: use case en functionele spec voor de enige extensie van het project. Voor wie: de AL-developer (bouwt), de functional consultant (test), de key user verkoop (tekent af). Beslissing: [ADR-004](../adr/adr-004-verwijderingsbijdrage-als-extensie.md). Vorige stap: [oplossingsontwerp](../04-oplossingsontwerp/README.md) · volgende: [migratie](../06-migratie/README.md).
>
> Een functional consultant schrijft **wat** het systeem moet doen, met uitzonderingen en testgevallen. **Hoe** (welke events, tabellen, code) beslist de developer.

## 1. Use case

| Veld | Inhoud |
|---|---|
| Naam | Bijdrageregel toevoegen bij een elektro-artikel |
| Requirement | VK-10 |
| Actor | binnendienst verkoop, balie (indirect: elke gebruiker die verkoopregels maakt) |
| Trigger | een artikel met een bijdragebedrag wordt op een verkoopdocument gezet of de hoeveelheid wijzigt |
| Voorwaarde | het artikel heeft een bijdragebedrag > 0; de klant heeft algemene bedrijfsboekingsgroep BINNENL |
| Resultaat | direct onder de artikelregel staat één regel "Verwijderingsbijdrage" met hoeveelheid = hoeveelheid artikel en prijs = bijdragebedrag |

### Hoofdscenario

1. De gebruiker zet artikel A-220318 (boiler, bijdrage €3,50) met hoeveelheid 2 op een verkooporder voor klant K10023 (BINNENL).
2. Het systeem voegt eronder een regel toe: type grootboekrekening via productboekingsgroep BIJDRAGE, omschrijving "Verwijderingsbijdrage A-220318", hoeveelheid 2, eenheidsprijs €3,50.
3. De gebruiker boekt de order; de bijdrage komt op 700900 en telt mee voor de btw (21%) — zie de [boekingsmatrix](../04-oplossingsontwerp/boekingsmatrix.md).

### Uitzonderingen en alternatieve paden

| # | Situatie | Verwacht gedrag |
|---|---|---|
| U1 | Hoeveelheid op de artikelregel wijzigt | hoeveelheid van de bijdrageregel volgt |
| U2 | Artikelregel wordt verwijderd | bijdrageregel wordt mee verwijderd |
| U3 | Klant is EU of EXPORT | geen bijdrageregel |
| U4 | Klant wijzigt van BINNENL naar EU op een bestaande order | bijdrageregels verdwijnen; melding aan de gebruiker |
| U5 | Gebruiker probeert de bijdrageregel zelf te wijzigen of te verwijderen | niet toegestaan; melding "wordt automatisch beheerd" |
| U6 | Order wordt gekopieerd (document kopiëren) of een retourorder wordt gemaakt uit een factuur | precies één bijdrageregel per artikelregel, niet dubbel *(toegevoegd na HC-07)* |
| U7 | Bijdragebedrag op het artikel wijzigt terwijl er open orders zijn | open orders blijven ongewijzigd; nieuwe regels krijgen het nieuwe bedrag |
| U8 | Offerte wordt omgezet naar order | bijdrageregel gaat mee, niet opnieuw toegevoegd |
| U9 | Deellevering: van 5 boilers worden er 2 verzonden | de bijdrageregel verzendt en factureert er ook 2, niet alles bij de eerste levering *(toegevoegd bij de bouw, zie §5)* |

## 2. Functionele spec voor de developer

**Data**
- Nieuw veld op de artikelkaart: *Bijdragebedrag* (decimaal, ≥ 0, standaard 0). Bewerkbaar door aankoop.
- Instelling (één record): *Rekening/productboekingsgroep voor bijdragen* = BIJDRAGE; *Omschrijving* = "Verwijderingsbijdrage %1" (artikelnummer).
- Koppeling tussen bijdrageregel en artikelregel (zodat U1, U2, U6 kunnen).

**Gedrag**
- Toevoegen, aanpassen en verwijderen volgens §1 voor verkoopofferte, -order, -factuur, -creditnota en -retourorder.
- Geen bijdrage als de algemene bedrijfsboekingsgroep van het document ≠ BINNENL.
- Bijdrageregel wordt mee afgedrukt op order, leveringsbon en factuur, direct onder het artikel.
- Geen eigen btw-logica: de bijdrageregel gebruikt de BTW-productboekingsgroep van het artikel.

**Buiten deze spec**
- Bijdragen bij aankoop (604900) blijven handmatig — de leverancier factureert ze al apart.
- Rapportering aan het beheersorganisme gebeurt uit een standaardrapport op rekening 700900.

**Niet-functioneel**
- Geen merkbare vertraging bij het invoeren van een order met 100 regels.
- Werkt met de standaard API voor verkooporders (webshop later).
- Machtiging: alleen aankoop kan het bijdragebedrag op het artikel wijzigen.

## 3. Testgevallen (door de functional consultant, vóór UAT-06)

| Test | Stappen | Verwacht |
|---|---|---|
| T1 | K10023, A-220318 × 2 | één bijdrageregel, 2 × 3,50 |
| T2 | T1, hoeveelheid naar 5 | bijdrageregel 5 × 3,50 |
| T3 | T1, artikelregel verwijderen | bijdrageregel weg |
| T4 | K20411 (EU), A-220318 × 1 | geen bijdrageregel |
| T5 | A-114502 (geen bijdrage) | geen bijdrageregel |
| T6 | order uit T1 kopiëren naar nieuwe order | precies één bijdrageregel per artikel *(toegevoegd na HC-07)* |
| T7 | offerte met A-220318 omzetten naar order | één bijdrageregel |
| T8 | boeken T1 | 700900 credit 7,00; btw 21% ook op de bijdrage |
| T9 | order met A-220318 × 5, te verzenden 2 | bijdrageregel: hoeveelheid 5, te verzenden 2 *(toegevoegd bij de bouw)* |

## 4. Inschatting en aftekening

- Inschatting developer: 2 dagen bouw + 1 dag test en documentatie = **3 dagen** (zie fit-gap).
- Aftekening spec: key user verkoop en zaakvoerder (week 6). Aftekening test: UAT-06.
- Updaterisico: laag — de extensie gebruikt alleen standaard events op verkoopregels; test T1–T8 bij elke jaarlijkse update.

## 5. Gebouwd in AL

De spec is gebouwd als per-tenant-extensie in [`bc/apps/removal-fee`](../../bc/apps/removal-fee/) (<!--n:al.fee.objects-->25<!--/n--> objecten, <!--n:al.subscribers-->14<!--/n--> event subscribers, alleen standaard events). De testgevallen staan als AL-testcodeunit in [`bc/apps/removal-fee-test`](../../bc/apps/removal-fee-test/src/KLVRemovalFeeTests.Codeunit.al): <!--n:al.tests-->12<!--/n--> tests, één per testgeval T1–T9 plus U4, U5 en U7. Alles compileert tegen de Belgische symbolen van Business Central 29.0 met CodeCop, UICop en PerTenantExtensionCop, zonder één waarschuwing ([bc/README.md](../../bc/README.md)).

Wat de bouw aan de spec veranderde, en waarom een functional consultant dat moet weten:

| Bij het bouwen bleek | Gevolg voor de spec |
|---|---|
| Een G/L-regel op een order wordt standaard volledig verzonden bij de eerste levering. Bij een deellevering (VK-04) zou de bijdrage voor 5 boilers mee gefactureerd worden terwijl er 2 vertrekken. | **U9 en T9 toegevoegd**: de te verzenden hoeveelheid van de bijdrage volgt de artikelregel. |
| Als de klant op een order verandert, maakt Business Central alle regels opnieuw aan. De kopie van de bijdrageregel zou haar markering verliezen en als gewone regel op 700900 blijven staan. | Bijdrageregels gaan eruit vóór het herschrijven en komen terug als de nieuwe klant BINNENL is (test U4 controleert dat er geen gewone 700900-regel achterblijft). |
| Omzetrekeningen 700000–706000 hebben "code verplicht" voor VESTIGING en AFDELING (FIN-04). Een bijdrageregel zonder dimensies blokkeert het boeken. | De bijdrageregel neemt de dimensies van de artikelregel over (T1 controleert het). |
| Standaard kopieert en zet om met veel regels tegelijk (document kopiëren, offerte naar order, verzendregels ophalen). Regel per regel ingrijpen geeft dubbele regels of botsende regelnummers. | Tijdens zo'n bewerking staat de automatiek stil; daarna wordt het hele document één keer afgestemd. Bij vrijgeven en boeken nog een keer, als vangnet. |

**Status:** gecompileerd en statisch gecontroleerd, nog **niet gedraaid in een Business Central-sandbox**. De tests draaien pas met `node bc/scripts/sandbox.mjs tests` in een sandbox; tot dan is "werkt" een verwachting, geen resultaat.

