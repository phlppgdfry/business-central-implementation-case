# ADR-003 — Balieverkoop zonder kassa-app

- **Status:** aanvaard, opnieuw bekijken boven 80 tickets per dag
- **Week:** 5
- **Beslist door:** zaakvoerder

> Wat: hoe de balie in het filiaal verkoopt. Hoort bij [VK-03](../03-fit-gap/fit-gap.md).

## Context

Business Central heeft geen kassasysteem. Het filiaal schrijft nu ±40 papieren bonnen per dag (schatting verantwoordelijke filiaal, open vraag in W-VK).

## Opties

| Optie | Voordelen | Nadelen |
|---|---|---|
| a. Verkoopfactuur met betalingswijze CONTANT of KAART | standaard, geen licentie, betaling meteen geboekt | iets meer klikken per ticket; kaartterminal blijft los |
| b. Kassa-app uit AppSource | snel aan de toonbank, kassalade, terminalkoppeling | licentie per kassa, extra app om te testen bij updates, 6 dagen extra |

## Beslissing

Optie a. Bij 40 tickets per dag weegt de snelheid van een kassa niet op tegen licentie en extra beheer.

## Gevolgen

- Balieklant K99901 voor anonieme verkoop; installateurs met een rekening kopen op hun eigen klantnummer.
- Betalingswijze boekt de betaling direct op 570000 Kas balie of 550000 Bank (zie [boekingsmatrix](../04-oplossingsontwerp/boekingsmatrix.md)).
- Meten na de go-live: tickets per dag en wachttijd aan de balie.

## Wanneer ik anders zou kiezen

Boven ±80 tickets per dag, bij een tweede filiaal, of als de klant een kassalade en dagafsluiting per kassier nodig heeft.
