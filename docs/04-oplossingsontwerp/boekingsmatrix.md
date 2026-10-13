<!-- Gegenereerd door scripts/build.mjs uit data/case.json — niet met de hand aanpassen. -->
# Boekingsmatrix — welke rekening, welke btw

> Wat: de boekingsgroepen en btw-instellingen van Kalvaert als tabel. Voor wie: boekhoudkantoor (aftekenen), developer en support (begrijpen waarom een boeking ergens landt). Uitleg: [oplossingsontwerp](README.md). Probeer het zelf in de [workbench](../../site/workbench/index.html), stap "Boekingsgevolg".
>
> *Rekeningnummers volgen de logica van het Belgische minimumindelingsschema maar zijn illustratief; het definitieve schema komt van het boekhoudkantoor (FIN-01).*

## Algemene boekingsinstellingen (bedrijf × product)

| Bedrijfsgroep | Productgroep | Omzet | Aankoop | Kostprijs verkopen |
|---|---|---|---|---|
| BINNENL | HANDELSGOED | 700000 Verkopen handelsgoederen binnenland | 604000 Aankopen handelsgoederen binnenland | 609000 Voorraadwijziging handelsgoederen (kostprijs verkopen) |
| EU | HANDELSGOED | 700100 Verkopen handelsgoederen EU (ICL) | 604100 Aankopen handelsgoederen EU | 609000 Voorraadwijziging handelsgoederen (kostprijs verkopen) |
| EXPORT | HANDELSGOED | 700200 Verkopen handelsgoederen export | 604100 Aankopen handelsgoederen EU | 609000 Voorraadwijziging handelsgoederen (kostprijs verkopen) |
| BINNENL | DIENST | 706000 Verkopen diensten (leveringskosten) | 613000 Transport en diensten | — |
| EU | DIENST | 706000 Verkopen diensten (leveringskosten) | 613000 Transport en diensten | — |
| EXPORT | DIENST | 706000 Verkopen diensten (leveringskosten) | 613000 Transport en diensten | — |
| BINNENL | BIJDRAGE | 700900 Doorgerekende verwijderingsbijdragen | 604900 Aankopen verwijderingsbijdragen | — |

Bewust **geen** combinatie EU × BIJDRAGE of EXPORT × BIJDRAGE: de verwijderingsbijdrage wordt alleen bij leveringen in België toegevoegd ([UC-VK-10](../05-specs/uc-vk-10-verwijderingsbijdrage.md)). Ontbreekt een combinatie die wél gebruikt wordt, dan weigert BC de boeking — de check `tests/posting.test.mjs` vangt dat vooraf op.

## BTW-boekingsinstellingen

| BTW-bedrijf | BTW-product | Berekening | % | Btw-rekening verkoop | Btw-rekening aankoop | Rooster verkoop | Rooster aankoop | Vermelding |
|---|---|---|---:|---|---|---|---|---|
| BINNENL | 21 | Normale btw | 21 | 451000 Te betalen btw | 411000 Terug te vorderen btw | 03 / 54 | 81 / 59 | — |
| EU | 21 | Btw verleggen | 21 | 451100 Te betalen btw (verlegd) | 411100 Terug te vorderen btw (verlegd) | 46 | 86 / 55 en 59 | Intracommunautaire levering vrijgesteld, art. 39bis W.btw |
| EXPORT | 21 | Normale btw | 0 | 451000 Te betalen btw | 411000 Terug te vorderen btw | 47 | — | Vrijgesteld, uitvoer art. 39 W.btw |

## Klant-, leveranciers- en voorraadboekingsgroepen

| Soort | Code | Rekening |
|---|---|---|
| klant | BINNENL | 400000 Handelsdebiteuren binnenland |
| klant | BUITENL | 400100 Handelsdebiteuren buitenland |
| leverancier | BINNENL | 440000 Leveranciers binnenland |
| leverancier | BUITENL | 440100 Leveranciers buitenland |
| voorraad | HQ × HANDELSGOED | 340000 Handelsgoederen (voorraad) |
| voorraad | FILIAAL × HANDELSGOED | 340000 Handelsgoederen (voorraad) |

## Voorbeeld: wat BC boekt

### K10023 (Installateur, regio Brugge) koopt 1 × Elektrische boiler 80 l

| Rekening | Debet | Credit | Waarom |
|---|---:|---:|---|
| 400000 Handelsdebiteuren binnenland | 512,44 |  | vordering: klantboekingsgroep BINNENL |
| 700000 Verkopen handelsgoederen binnenland |  | 420,00 | omzet: algemene boekingsinstelling BINNENL × HANDELSGOED |
| 451000 Te betalen btw |  | 88,20 | btw 21%: BTW-boekingsinstelling BINNENL × 21 |
| 700900 Doorgerekende verwijderingsbijdragen |  | 3,50 | omzet: algemene boekingsinstelling BINNENL × BIJDRAGE |
| 451000 Te betalen btw |  | 0,74 | btw 21%: BTW-boekingsinstelling BINNENL × 21 |
| 609000 Voorraadwijziging handelsgoederen (kostprijs verkopen) | 290,00 |  | kostprijs verkopen: algemene boekingsinstelling |
| 340000 Handelsgoederen (voorraad) |  | 290,00 | voorraad: voorraadboekingsinstelling HQ |
| **Totaal** | **802,44** | **802,44** | |

Btw-roosters: rooster 54: 88,94 · rooster 03: 423,50 · dimensies: VESTIGING=HQ, AFDELING=BINNENDIENST

### K99901 (Balieklant contant (filiaal)) koopt 1 × Elektrische boiler 80 l

| Rekening | Debet | Credit | Waarom |
|---|---:|---:|---|
| 400000 Handelsdebiteuren binnenland | 512,44 |  | vordering: klantboekingsgroep BINNENL |
| 700000 Verkopen handelsgoederen binnenland |  | 420,00 | omzet: algemene boekingsinstelling BINNENL × HANDELSGOED |
| 451000 Te betalen btw |  | 88,20 | btw 21%: BTW-boekingsinstelling BINNENL × 21 |
| 700900 Doorgerekende verwijderingsbijdragen |  | 3,50 | omzet: algemene boekingsinstelling BINNENL × BIJDRAGE |
| 451000 Te betalen btw |  | 0,74 | btw 21%: BTW-boekingsinstelling BINNENL × 21 |
| 609000 Voorraadwijziging handelsgoederen (kostprijs verkopen) | 290,00 |  | kostprijs verkopen: algemene boekingsinstelling |
| 340000 Handelsgoederen (voorraad) |  | 290,00 | voorraad: voorraadboekingsinstelling FILIAAL |
| 570000 Kas balie | 512,44 |  | betaling direct geboekt: betalingswijze CONTANT |
| 400000 Handelsdebiteuren binnenland |  | 512,44 | vordering meteen vereffend |
| **Totaal** | **1.314,88** | **1.314,88** | |

Btw-roosters: rooster 54: 88,94 · rooster 03: 423,50 · dimensies: VESTIGING=FILIAAL, AFDELING=BALIE

### K20411 (Installateur, Noord-Frankrijk) koopt 1 × Elektrische boiler 80 l

| Rekening | Debet | Credit | Waarom |
|---|---:|---:|---|
| 400100 Handelsdebiteuren buitenland | 420,00 |  | vordering: klantboekingsgroep BUITENL |
| 700100 Verkopen handelsgoederen EU (ICL) |  | 420,00 | omzet: algemene boekingsinstelling EU × HANDELSGOED |
| 609000 Voorraadwijziging handelsgoederen (kostprijs verkopen) | 290,00 |  | kostprijs verkopen: algemene boekingsinstelling |
| 340000 Handelsgoederen (voorraad) |  | 290,00 | voorraad: voorraadboekingsinstelling HQ |
| **Totaal** | **710,00** | **710,00** | |

Btw-roosters: rooster 46: 420,00 · dimensies: VESTIGING=HQ, AFDELING=BINNENDIENST

### K30007 (Aannemer, Zwitserland) koopt 1 × Elektrische boiler 80 l

| Rekening | Debet | Credit | Waarom |
|---|---:|---:|---|
| 400100 Handelsdebiteuren buitenland | 420,00 |  | vordering: klantboekingsgroep BUITENL |
| 700200 Verkopen handelsgoederen export |  | 420,00 | omzet: algemene boekingsinstelling EXPORT × HANDELSGOED |
| 609000 Voorraadwijziging handelsgoederen (kostprijs verkopen) | 290,00 |  | kostprijs verkopen: algemene boekingsinstelling |
| 340000 Handelsgoederen (voorraad) |  | 290,00 | voorraad: voorraadboekingsinstelling HQ |
| **Totaal** | **710,00** | **710,00** | |

Btw-roosters: rooster 47: 420,00 · dimensies: VESTIGING=HQ, AFDELING=PROJECTEN
