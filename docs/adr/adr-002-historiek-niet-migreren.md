# ADR-002 — Historiek niet migreren

- **Status:** aanvaard
- **Week:** 6
- **Beslist door:** financieel verantwoordelijke en extern boekhoudkantoor

> Wat: welke data niet naar Business Central gaat en waarom. Hoort bij het [migratieplan](../06-migratie/README.md).

## Context

De binnendienst vroeg om "alle facturen van de laatste vijf jaar" in BC, zodat ze oude prijzen kunnen opzoeken.

## Opties

| Optie | Voordelen | Nadelen |
|---|---|---|
| Volledige historiek als geboekte documenten | alles op één plek | grote migratie, foute boekingen in het grootboek, weken extra testwerk |
| Historiek als statistiek (omzet per klant per maand) | vergelijkingen in BC mogelijk | extra migratieobject, beperkte waarde |
| Geen historiek; TradeDesk 5 jaar raadpleegbaar in alleen-lezen | eenvoudig, geen risico op foute boekingen, wettelijke bewaarplicht blijft gedekt | twee plekken om te zoeken in het eerste jaar |

## Beslissing

Geen historiek. Alleen stamdata, openstaande posten, openingsbalans en voorraad (MIG-01 t.e.m. MIG-09). TradeDesk blijft vijf jaar beschikbaar in alleen-lezen.

## Gevolgen

- Eerste jaar: oude prijzen opzoeken in TradeDesk (taakkaart in de training).
- De omzetvergelijking met vorig jaar gebeurt in het eerste jaar met een export; Power BI-koppeling is fase 2.

## Wanneer ik anders zou kiezen

Als het oude systeem niet in alleen-lezen kan blijven draaien (licentie of hardware), dan migreer ik historiek als statistiek, niet als geboekte documenten.
