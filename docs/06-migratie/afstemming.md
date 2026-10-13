<!-- Gegenereerd door scripts/build.mjs uit data/case.json — niet met de hand aanpassen. -->
# Afstemming openstaande klantposten

> Wat: de controle die bepaalt of de migratie van openstaande klantposten (MIG-06) klopt. Voor wie: boekhoudkantoor en financieel verantwoordelijke (aftekenen), projectmanager (go/no-go GNG-03). Plan: [migratieplan](README.md) · volgende: [go-live](../07-go-live/README.md).
>
> *Fictieve posten, gegenereerd met `scripts/generate-seed.mjs`.*

**Regel:** de som van de gemigreerde openstaande posten per rekening moet **exact** gelijk zijn aan het saldo van die rekening in WinBooks op het cutoff-moment. Een verschil van één cent is een verschil.

## Generale repetitie (week 14) — export v1

| Rekening | Saldo WinBooks | Som gemigreerde posten | Verschil | Status |
|---|---:|---:|---:|---|
| 400000 Handelsdebiteuren binnenland | 170.703,53 | 172.289,93 | 1.586,40 | **verschil** |
| 400100 Handelsdebiteuren buitenland | 29.910,71 | 29.910,71 | 0,00 | ok |

**Oorzaak:** Saldo in WinBooks om 17:00 op de cutoff-dag. Export v1 liep om 16:00; creditnota CN-0412 werd om 16:40 geboekt. Het verschil (€1.586,40) is precies het bedrag van CN-0412.
**Maatregel in het cutoverplan:** TradeDesk wordt om 16:00 bevroren (alleen lezen) *vóór* de export; het saldo in WinBooks wordt pas genomen nadat de export klaar is. Zie [cutover](../07-go-live/README.md#cutover).

## Na aanpassing — export v2 (40 posten)

| Rekening | Saldo WinBooks | Som gemigreerde posten | Verschil | Status |
|---|---:|---:|---:|---|
| 400000 Handelsdebiteuren binnenland | 170.703,53 | 170.703,53 | 0,00 | ok |
| 400100 Handelsdebiteuren buitenland | 29.910,71 | 29.910,71 | 0,00 | ok |

## Overige controles

| Controle | Oud systeem | Gemigreerd | Afwijking | Norm | Status |
|---|---:|---:|---:|---|---|
| Openstaande leveranciersposten (MIG-07) | 186.240,55 | 186.240,55 | 0,00 | €0,00 | ok |
| Voorraadwaarde (MIG-09) | 2.418.300,00 | 2.411.042,10 | 0,3% | < 0,5% | ok |
| Overgangsrekening 499000 na alle migraties | — | 0,00 | — | €0,00 | ok |

De norm voor voorraad is ruimer dan voor posten: de laatste waardering in TradeDesk gebruikt een gemiddelde kostprijs, BC herberekent per artikel. Wat binnen de norm valt, boekt het kantoor als voorraadcorrectie bij de eerste maandafsluiting.

## Go/no-go-effect

| Criterium | Met export v1 | Met export v2 |
|---|---|---|
| GNG-01 Alle UAT-scenario's geslaagd en afgetekend door de key user | ok | ok |
| GNG-02 Geen open defects met ernst 1 of 2 | ok | ok |
| GNG-03 Openstaande klantposten = saldo debiteuren in WinBooks (verschil €0,00) | **no-go** | ok |
| GNG-04 Openstaande leveranciersposten = saldo leveranciers in WinBooks | ok | ok |
| GNG-05 Voorraadwaarde wijkt minder dan 0,5% af | ok | ok |
| GNG-06 Overgangsrekening 499000 staat op 0 | ok | ok |
| GNG-07 Testfactuur via Peppol verzonden en ontvangen | ok | ok |
| GNG-08 Key users getraind (minstens 90%) en TradeDesk beschikbaar in alleen-lezen voor rollback | ok | ok |
