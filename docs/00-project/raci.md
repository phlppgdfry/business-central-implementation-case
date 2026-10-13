# RACI en RAID

> Wat: wie wat doet per fase, en de risico's, aannames, issues en afhankelijkheden. Voor wie: projectteam en klant. Hoort bij het [projectplan](plan.md).
>
> R = voert uit · A = eindverantwoordelijk (één per rij) · C = geconsulteerd · I = geïnformeerd. *Illustratief.*

## RACI

| Activiteit | Zaakvoerder | Fin. verantw. | Boekhoudkantoor | Key users | Accountmanager | Projectmanager | **Functional consultant** | Developer |
|---|---|---|---|---|---|---|---|---|
| Scope en budget | A | C | I | I | R | C | C | I |
| Workshops en verslagen | I | C | C | C | I | I | **A/R** | I |
| Fit-gap en classificatie | A (per gap: de beslisser) | C | C | C | I | C | **R** | C |
| Rekeningschema en btw-setup | I | C | A | I | — | I | **R** | — |
| Spec extensie VK-10 | I | I | — | C | — | I | **A/R** | C |
| Bouw extensie | — | — | — | — | — | I | C | A/R |
| Inrichting in sandbox | — | I | C | C | — | I | **A/R** | — |
| Change requests (impact, offerte) | A | C | — | I | R (offerte) | R (impact, planning) | C (inhoud, opties) | C (inschatting) |
| Migratie: opschonen data | A | R (financieel) | R (saldi) | R | — | I | C | — |
| Migratie: laden en afstemmen | I | C | C | I | — | I | **A/R** | — |
| Training key users | I | I | — | C | — | I | **A/R** | — |
| UAT uitvoeren en aftekenen | I | I | I | **A/R** | — | C | C (ondersteunt, triëert defects) | C |
| Go/no-go | A | C | C | C | I | R | R (advies inhoud) | I |
| Hypercare | I | C | I | C | I | A | **R** | R (bugs) |
| Overdracht aan support | I | I | — | I | I | A | **R** | C |

De functional consultant is **niet** eigenaar van scope, budget of de go/no-go. Die beslissingen liggen bij de klant; de consultant maakt ze beslisbaar.

## RAID

| ID | Soort | Omschrijving | Kans / impact | Eigenaar | Maatregel |
|---|---|---|---|---|---|
| R1 | risico | Prijsafspraken in vrije tekst (420) zijn niet eenduidig om te zetten | hoog / hoog | commercieel verantwoordelijke | opschoonsjabloon, steekproef 30 orders bij TM-2 (MIG-05) |
| R2 | risico | Artikelstam vervuild (1.150 dubbels) | hoog / middel | aankoop | beslissen vóór TM-1; alleen actief migreren |
| R3 | risico | Boekhoudkantoor tekent rekeningschema te laat af | middel / hoog | financieel verantwoordelijke | deadline week 5 in kick-off afgesproken |
| R4 | risico | Weerstand bij ervaren binnendienst ("ik typ de prijs over") | middel / middel | functional consultant | haar key user maken; training met haar eigen klanten |
| R5 | risico | Extra wensen tijdens het project zetten de vaste go-live onder druk | hoog / hoog | projectmanager | change-requestproces; zie CR-01 |
| R6 | risico | Key user magazijn niet beschikbaar in UAT-week (piek) | hoog / middel | magazijnverantwoordelijke | vervanger aangeduid; UAT-10 en UAT-15 eerder ingepland |
| R7 | risico | Afstemmingsverschil bij de echte cutover | middel / hoog | functional consultant | generale repetitie in week 14; exportmoment na bevriezing |
| A1 | aanname | ±40 balietickets per dag | — | verantwoordelijke filiaal | meten na go-live (ADR-003) |
| A2 | aanname | Peppol-connector beschikbaar in sandbox vanaf week 8 | — | financieel verantwoordelijke | testaccount aangevraagd in week 6 |
| I1 | issue | Generale repetitie: €1.586,40 verschil in openstaande klantposten | — | functional consultant | opgelost, zie [afstemming](../06-migratie/afstemming.md) |
| D1 | afhankelijkheid | Einde support TradeDesk eind dit jaar | — | zaakvoerder | go-live uiterlijk week 15 |
| D2 | afhankelijkheid | TradeDesk 5 jaar in alleen-lezen | — | zaakvoerder | licentie read-only verlengd (ADR-002) |
