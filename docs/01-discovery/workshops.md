<!-- Gegenereerd door scripts/build.mjs uit data/case.json — niet met de hand aanpassen. -->
# Workshopverslagen

> Wat: de 5 analyseworkshops, met observatie, wens en open vraag gescheiden. Voor wie: klant (nalezen en corrigeren), projectteam. Vorige stap: [workshopplan](workshopplan.md) · volgende: [order-to-cash](../02-processen/order-to-cash.md) en [fit-gap](../03-fit-gap/fit-gap.md).
>
> *Fictieve workshops — illustratief.*

## W-VK — Verkoop: van offerte tot betaling (week 2)

**Aanwezig:** zaakvoerder, binnendienst verkoop (2), balie filiaal, functional consultant · **Werkwijze:** Voordoen met vijf echte orders van vorige week; geen BC-demo vooraf.

> "In TradeDesk typ ik gewoon de prijs over. Ik ken mijn klanten."

**Observaties (wat we zagen)**
- Prijsafspraken staan als vrije tekst in het notitieveld van de klant, bv. "-12% op merk A behalve thermostatisch". De binnendienst typt de prijs met de hand over.
- Een order wordt in schijven geleverd; de rest blijft als backorder op papier.
- Aan de balie wordt een papieren bon geschreven; de kassa staat los van TradeDesk.
- De eindejaarsbonus wordt in januari in Excel berekend uit een omzetexport.

**Wensen (wat ze vroegen)**
- Prijzen moeten automatisch kloppen zonder dat iemand ze moet onthouden.
- De zaakvoerder wil de bonus per kwartaal zien, niet pas in januari.

**Open vragen**

| Vraag | Eigenaar |
|---|---|
| Welke prijsafspraken zijn nog geldig? Er zijn er 420. | commercieel verantwoordelijke |
| Hoeveel balietickets per dag? Schatting 40. | verantwoordelijke filiaal |

**Requirements uit deze workshop:** VK-01 Klantspecifieke prijsafspraken automatisch toepassen · VK-02 Artikelcode van de klant op order en factuur · VK-03 Balieverkoop met directe betaling in het filiaal · VK-04 Deelleveringen en backorders · VK-05 Nieuwe klanten blokkeren boven kredietlimiet · VK-06 Eindejaarsbonus (rebate) voor installateurs op jaaromzet · VK-07 Retouren met terugnamekost · VK-08 Leveringsroutes per dag plannen · VK-10 Verwijderingsbijdrage op elektro-artikels automatisch op de order

## W-AK — Aankoop: van bestelling tot leveranciersfactuur (week 2)

**Aanwezig:** aankoopverantwoordelijke, magazijnverantwoordelijke, boekhouding, functional consultant · **Werkwijze:** Voordoen met een bestelling, een onvolledige levering en de bijhorende factuur.

> "De prijslijst van de grootste leverancier is elke maand anders opgemaakt."

**Observaties (wat we zagen)**
- Bestellingen boven €5.000 worden per mail aan de zaakvoerder voorgelegd; niemand ziet welke nog wachten.
- Drie grote leveranciers sturen maandelijks een prijslijst in Excel (samen ±38.000 regels).
- Onvolledige leveringen worden op de leveringsbon aangeduid, niet in het systeem.

**Wensen (wat ze vroegen)**
- Zien welke bestellingen op goedkeuring wachten.
- Prijslijsten inlezen zonder ze regel per regel over te typen.

**Open vragen**

| Vraag | Eigenaar |
|---|---|
| Welke leveranciers leveren hun prijslijst in een vast formaat? | aankoopverantwoordelijke |

**Requirements uit deze workshop:** AK-01 Goedkeuring van bestellingen boven €5.000 · AK-02 Prijslijsten van leveranciers inlezen · AK-03 Onvolledige leveringen registreren · AK-04 Factuur controleren tegen bestelling en ontvangst

## W-VR — Voorraad en magazijn (week 3)

**Aanwezig:** magazijnverantwoordelijke, verantwoordelijke filiaal, functional consultant · **Werkwijze:** Rondgang in het magazijn en het filiaal; telling en transfer laten voordoen.

> "Als het filiaal belt, loop ik zelf kijken."

**Observaties (wat we zagen)**
- Het filiaal haalt twee keer per week goederen uit het hoofdmagazijn; dat wordt niet geregistreerd als transfer.
- Er zijn 38.000 artikels in TradeDesk, waarvan 12.400 in de laatste 24 maanden bewogen.
- Er wordt geplukt van een afgedrukte paklijst; de magazijnier vraagt al jaren om scanners.

**Wensen (wat ze vroegen)**
- Weten wat er in het filiaal ligt zonder te bellen.
- Scanners voor het picken.

**Open vragen**

| Vraag | Eigenaar |
|---|---|
| Wie beslist welke vermoedelijke dubbels (1.150) samengevoegd of geblokkeerd worden? | aankoopverantwoordelijke |

**Requirements uit deze workshop:** VR-01 Twee locaties en transfers naar het filiaal · VR-02 Jaarlijkse en cyclische telling · VR-03 Scanners voor orderpicking · VR-04 Alleen een propere artikelstam overnemen

## W-FIN — Financiën, BTW en afsluiting (week 3)

**Aanwezig:** financieel verantwoordelijke, extern boekhoudkantoor, functional consultant · **Werkwijze:** Doorlopen van de maandafsluiting en de laatste BTW-aangifte.

> "Het rekeningschema is van ons; daar wordt niet aan gemorreld."

**Observaties (wat we zagen)**
- Het boekhoudkantoor boekt in WinBooks en wil het eigen rekeningschema behouden.
- Bankafschriften komen als CODA-bestand; afpunten gebeurt bij het kantoor.
- Marge per vestiging wordt in Excel berekend uit twee exports.

**Wensen (wat ze vroegen)**
- Marge per vestiging en per afdeling zonder Excel.
- De BTW-aangifte moet blijven kloppen met wat het kantoor indient.

**Open vragen**

| Vraag | Eigenaar |
|---|---|
| Kostprijs verkopen op 604 of op 609? Keuze van het boekhoudkantoor. | extern boekhoudkantoor |

**Requirements uit deze workshop:** VK-09 Herinneringen en aanmaningen · FIN-01 Rekeningschema van het boekhoudkantoor behouden · FIN-02 BTW-aangifte en jaarlijkse klantenlisting · FIN-03 CODA-bankafschriften inlezen en afpunten · FIN-04 Marge per vestiging en per afdeling

## W-EF — E-facturatie en Belgische verplichtingen (week 4)

**Aanwezig:** financieel verantwoordelijke, binnendienst verkoop, functional consultant · **Werkwijze:** Huidige Peppol-workaround laten voordoen; lijst van klanten zonder ondernemingsnummer opvragen.

> "We doen alles nu twee keer."

**Observaties (wat we zagen)**
- Facturen worden in TradeDesk gemaakt en daarna nog eens in een Peppol-portaal ingegeven.
- Inkomende Peppol-facturen worden afgedrukt en manueel ingeboekt.
- Bij een steekproef van 50 klanten ontbrak bij 6 het ondernemingsnummer.

**Wensen (wat ze vroegen)**
- Facturen rechtstreeks vanuit het ERP via Peppol.
- Inkomende facturen niet meer overtypen.

**Open vragen**

| Vraag | Eigenaar |
|---|---|
| Welke Peppol-connector (access point)? Keuze tussen twee aanbieders. | financieel verantwoordelijke |

**Requirements uit deze workshop:** EF-01 Uitgaande facturen via Peppol · EF-02 Inkomende facturen via Peppol · EF-03 Ondernemingsnummer verplicht voor Belgische klanten
