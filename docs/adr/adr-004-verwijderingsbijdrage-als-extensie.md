# ADR-004 — Verwijderingsbijdrage als (enige) extensie

- **Status:** aanvaard
- **Week:** 5
- **Beslist door:** zaakvoerder, na overleg met de developer over inschatting en updatebestendigheid

> Wat: waarom VK-10 de enige gap is die met maatwerk wordt opgelost. Spec: [UC-VK-10](../05-specs/uc-vk-10-verwijderingsbijdrage.md).

## Context

Op elektrische en elektronische toestellen (zoals boilers) moet de verwijderingsbijdrage apart op de factuur staan. Vandaag voegt de binnendienst die regel met de hand toe en vergeet ze geregeld. Een vergeten bijdrage betaalt Kalvaert zelf.

## Opties

| Optie | Voordelen | Nadelen |
|---|---|---|
| a. Kleine extensie: bijdrage per artikel, regel automatisch bij Belgische leveringen | nooit vergeten, gebruiker hoeft niets te doen | maatwerk: 3 dagen bouw + testen bij elke update |
| b. Procesaanpassing: binnendienst voegt de regel toe | geen maatwerk | precies het probleem van vandaag |
| c. App | — | in de marktscan geen app gevonden die enkel dit doet zonder een groter pakket (aanname) |

## Beslissing

Optie a. Het is een wettelijke verplichting, het gebeurt op honderden orderregels per maand en de fout kost geld. Dat haalt de drempel van [ADR-001](adr-001-standaard-eerst.md).

## Gevolgen

- De developer bouwt volgens de spec; de functional consultant schrijft de testgevallen en voert de eerste test uit.
- Eigen productboekingsgroep BIJDRAGE naar 700900, alleen voor BINNENL.
- In hypercare bleek een fout bij het kopiëren van orders (HC-07); het testgeval "order kopiëren" is aan de spec toegevoegd.

## Wanneer ik anders zou kiezen

Als een Belgische lokalisatie-app van de partner dit al bevat, dan die app (optie c) — geen eigen maatwerk naast iets dat al onderhouden wordt.
