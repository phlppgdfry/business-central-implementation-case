# ADR-005 — Eindejaarsbonus: eerst proces, later beslissen over app of extensie

- **Status:** aanvaard (via [CR-01](../00-project/cr-01-eindejaarsbonus.md)); evaluatie zes maanden na de go-live
- **Week:** 7
- **Beslist door:** zaakvoerder, op voorstel van de projectmanager

> Wat: hoe de eindejaarsbonus (rebate) van installateurs berekend wordt. Hoort bij [VK-06](../03-fit-gap/fit-gap.md).

## Context

In week 7 vroeg de zaakvoerder om de bonus per kwartaal automatisch te berekenen en als creditnota klaar te zetten. Dat stond niet in de offerte. Business Central heeft geen rebatebeheer in de standaard.

## Opties

| Optie | Dagen | Voordelen | Nadelen |
|---|---:|---|---|
| a. Extensie rebatemodule | 8 | volledig automatisch, op maat | duurste optie; maatwerk dat bij elke update getest moet worden; zet de go-live onder druk |
| b. Kwartaalrapport omzet per klant + Excel-sjabloon + jaarlijkse creditnota | 1 | standaard, meteen klaar, stand per kwartaal zichtbaar | half manueel; jaarlijks werk voor de boekhouding |
| c. Rebate-app uit AppSource | 3 | automatisch zonder eigen maatwerk | licentie; eerst evalueren of ze de staffels van Kalvaert aankan |

## Beslissing

Optie b bij de go-live. Na zes maanden evalueren we optie c met de echte data van twee kwartalen. Optie a alleen als de app niet volstaat.

## Waarom

De go-live is vast door het einde van de support van TradeDesk en de Peppol-verplichting. Acht dagen extra maatwerk in week 7 zet die datum onder druk, terwijl de bonus pas aan het einde van het jaar uitbetaald wordt. De zaakvoerder krijgt wel meteen wat er gevraagd werd: de stand per kwartaal.

## Wanneer ik anders zou kiezen

Als de bonus een groot deel van de marge is en er geen vaste go-livedatum was, dan meteen de app of extensie — met de staffels als testgevallen.
