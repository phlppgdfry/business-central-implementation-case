# ADR-007 — Inrichting als code voor de ontwikkel- en testomgeving, RapidStart voor de klant

- **Status:** aanvaard
- **Week:** 6
- **Beslist door:** functional consultant en developer, met de projectmanager

> Wat: hoe de sandbox van het project aan de inrichting uit het [oplossingsontwerp](../04-oplossingsontwerp/README.md) komt, elke keer dat ze opnieuw opgebouwd wordt. Uitvoering: [`bc/apps/demo-setup`](../../bc/apps/demo-setup/).

## Context

De developer test VK-10 in een sandbox, de consultant bereidt er de UAT en de migratierepetities in voor, en een sandbox wordt geregeld vervangen (nieuwe versie, kopie van productie, kapotte testdata). Met de hand inrichten duurt een halve dag en verschilt telkens een beetje van het ontwerp: "bij mij werkt het" tussen developer en consultant.

## Opties

| Optie | Voordelen | Nadelen |
|---|---|---|
| a. Met de hand, volgens het ontwerp | geen extra werk vooraf | halve dag per keer, afwijkingen tussen omgevingen |
| b. Configuratiepakketten (RapidStart) | standaard, zo werkt ook de klant | pakketten moeten bij elke ontwerpwijziging met de hand bijgewerkt worden; niets controleert of ze nog met het ontwerp kloppen |
| c. Inrichting als AL-app, gegenereerd uit dezelfde data als het ontwerp | één klik of API-oproep, altijd gelijk aan het ontwerp, de compiler controleert elk veld | een tweede app om te onderhouden; alleen voor ontwikkel- en testomgevingen |

## Beslissing

Optie c voor de ontwikkel- en testomgevingen, optie b blijft de weg voor de klant: key users vullen in productie de configuratiepakketten (MIG-01 tot MIG-05) en leren zo hun eigen inrichting kennen.

## Gevolgen

- De demo-inrichting gaat nooit naar productie; ze staat los van de extensie VK-10.
- Een wijziging in het ontwerp (`data/case.json`) verandert de documenten, de site én de AL-code in één build. CI faalt als iets niet meer overeenkomt of niet meer compileert.
- Bij het genereren kwam één aanname boven die de klant moet weten: kredietlimiet 0 betekent volgens partnerdocumentatie in Business Central "geen limiet", dus klantsjabloon NIEUW krijgt €1 (VK-05). Bevestigen in de sandbox (S-03 in [bc/README.md](../../bc/README.md)).

## Wanneer ik anders zou kiezen

Bij een klein project zonder extensie en met één testomgeving: optie b. De extra app verdient zich pas terug als een sandbox meer dan twee keer opnieuw opgebouwd wordt.
