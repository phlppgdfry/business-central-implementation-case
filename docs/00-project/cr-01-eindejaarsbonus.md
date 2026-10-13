# CR-01 — Eindejaarsbonus per kwartaal automatisch

> Wat: een change request zoals die bij een partner loopt: vraag → impact → opties → beslissing door de klant. Voor wie: zaakvoerder (beslist), projectmanager (offerte en planning), functional consultant (inhoud en opties). Beslissing vastgelegd in [ADR-005](../adr/adr-005-eindejaarsbonus-eerst-proces.md).
>
> *Illustratief; dagtarief <!--n:dayrate-->€900<!--/n-->.*

| Veld | Inhoud |
|---|---|
| Aangevraagd | week 7, door de zaakvoerder, tijdens een demo van de verkooporder |
| Vraag | "De eindejaarsbonus moet per kwartaal automatisch berekend en als creditnota klaargezet worden." |
| In de offerte? | **Nee.** De fit-gap (afgetekend in week 5) had VK-06 als procesaanpassing: jaarlijks rapport + creditnota. |
| Requirement | VK-06 |

## 1. Wat ik als functional consultant doe

1. De vraag niet meteen beantwoorden met "kan" of "kan niet", maar vragen *waarom per kwartaal*. Antwoord: de zaakvoerder wil installateurs tussentijds kunnen tonen hoe dicht ze bij de volgende staffel zitten — een commercieel gesprek, geen boekhoudvraag.
2. Drie opties uitwerken met de developer (inschatting) en de projectmanager (planning).
3. Het voorstel via de projectmanager aan de zaakvoerder voorleggen, niet rechtstreeks toezeggen.

## 2. Impact

| Optie | Extra dagen | Extra kost | Planning | Updaterisico | Beantwoordt de echte vraag? |
|---|---:|---:|---|---|---|
| a. Extensie rebatemodule | +7 (8 i.p.v. 1) | ±€6.300 | go-live schuift ±1 week | middel | ja, volledig |
| b. Kwartaalrapport omzet per klant + staffelsjabloon; jaarlijkse creditnota | 0 | €0 | geen impact | laag | ja: stand per kwartaal zichtbaar voor het gesprek met de installateur |
| c. Rebate-app evalueren na 6 maanden | +2 (later) | licentie + ±€1.800 | na hypercare | laag | ja, als de app de staffels aankan |

## 3. Beslissing

Optie **b** bij de go-live, optie **c** evalueren na zes maanden met de data van twee kwartalen. Beslist door de zaakvoerder op voorstel van de projectmanager.

## 4. Wat dit toont

- Scope creep benoemen zonder nee te zeggen tegen de klant.
- De vraag achter de vraag zoeken: het doel (commercieel gesprek per kwartaal) kon zonder maatwerk.
- De beslissing ligt bij de klant; de consultant maakt ze beslisbaar met kost, planning en risico.

Probeer het zelf in de [workbench](../../site/workbench/index.html): kies bij VK-06 optie a en zie het totaal veranderen.
