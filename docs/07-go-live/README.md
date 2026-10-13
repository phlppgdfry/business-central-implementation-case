# Go-live: UAT, cutover, go/no-go en hypercare

> Wat: hoe Kalvaert gecontroleerd overschakelt en hoe de eerste weken opgevolgd worden. Voor wie: zaakvoerder (beslist go/no-go), projectmanager, key users, support. Vorige stap: [afstemming](../06-migratie/afstemming.md). Details: [UAT](uat.md) · [hypercare-log](hypercare.md).
>
> *Illustratief.*

## UAT

<!--n:uat.total-->17<!--/n--> end-to-end scenario's, uitgevoerd en afgetekend door de key users zelf — niet door de consultant. Elk scenario hangt aan requirements uit de fit-gap; requirements zonder scenario hebben een reden of een migratiecontrole ([uat.md](uat.md)). <!--n:defects.total-->1<!--/n--> defect gevonden en opgelost (DEF-01: EU-klant kreeg 21% btw door een fout klantsjabloon).

## Cutover

Het cutoverplan na de generale repetitie (week 14). De aanpassing na het afstemmingsverschil staat vetgedrukt.

| Wanneer | Wat | Wie | Controle |
|---|---|---|---|
| vr 12:00 | laatste aankoopontvangsten en transfers in TradeDesk | magazijn | — |
| vr 15:30 | laatste facturen in TradeDesk; sync naar WinBooks | binnendienst, boekhouding | — |
| **vr 16:00** | **TradeDesk op alleen-lezen** | partner (FC) | **login als binnendienst faalt** |
| vr 16:15 | export openstaande posten, voorraad, saldi | FC | aantallen per export genoteerd |
| vr 17:00 | saldi WinBooks opgevraagd (na de export) | boekhoudkantoor | — |
| za | import MIG-06 t.e.m. MIG-09 in productie | FC | afstemming per object |
| zo 12:00 | afstemming met het boekhoudkantoor | FC + kantoor | [afstemming](../06-migratie/afstemming.md): verschil €0,00 |
| zo 18:00 | **go/no-go** | zaakvoerder, PM, FC, financieel verantwoordelijke | 8 criteria hieronder |
| ma 7:30 | eerste order en eerste balieticket in BC, met de consultant ter plaatse | key users | eerste Peppol-factuur ontvangen door een testklant |

**Rollback:** blijft het no-go, dan gaat TradeDesk maandag 7:00 terug naar lezen-en-schrijven; niets in BC productie wordt gebruikt. De beslissing om terug te gaan neemt de zaakvoerder zondag 18:00, niet maandag om 10:00 als het misloopt.

## Go/no-go-criteria

| ID | Criterium |
|---|---|
| GNG-01 | Alle UAT-scenario's geslaagd en afgetekend door de key user |
| GNG-02 | Geen open defects met ernst 1 of 2 |
| GNG-03 | Openstaande klantposten = saldo debiteuren in WinBooks (verschil €0,00) |
| GNG-04 | Openstaande leveranciersposten = saldo leveranciers in WinBooks |
| GNG-05 | Voorraadwaarde wijkt minder dan 0,5% af (gemigreerd: <!--n:mig.inv.pct-->0,3<!--/n-->%) |
| GNG-06 | Overgangsrekening 499000 staat op 0 |
| GNG-07 | Testfactuur via Peppol verzonden en ontvangen |
| GNG-08 | Key users getraind (minstens 90%) en TradeDesk beschikbaar in alleen-lezen voor rollback |

Met export v1 van de generale repetitie was het antwoord **no-go** (GNG-03). Met export v2 zijn alle <!--n:gng.total-->8<!--/n--> criteria groen. Zie de tabel onderaan de [afstemming](../06-migratie/afstemming.md).

## Hypercare

Vier weken, dag 1–5 met de consultant ter plaatse, daarna dagelijks een kwartier met de key users. Elke melding krijgt een **oorzaakcategorie** — data, setup, opleiding of bug — en een **structurele maatregel**.

Resultaat: <!--n:hc.total-->8<!--/n--> meldingen, waarvan <!--n:hc.bug-->1<!--/n--> bug. De andere <!--n:hc.nonbug-->7<!--/n--> waren data (<!--n:hc.data-->3<!--/n-->), setup (<!--n:hc.setup-->2<!--/n-->) of opleiding (<!--n:hc.opleiding-->2<!--/n-->). Wie dat niet onderscheidt, laat de developer zoeken naar fouten die er niet zijn. Volledig log: [hypercare.md](hypercare.md).

## Overdracht aan support (week 19)

- Kennisbank: de taakkaarten uit de training + elke hypercare-melding met oorzaak en oplossing.
- Open punten: CR-01 (evaluatie rebate-app over zes maanden), VK-08 en VR-03 (fase 2).
- Overdrachtsgesprek met support en de key users samen: support moet de key users kennen, niet alleen de documenten.
