# Voor de manager consulting (5–10 minuten)

> Wat je als leidinggevende van consultants wil weten: kan deze persoon bij een klant zitten, scope bewaken, en een project mee live brengen? Onafhankelijke portfoliocase over een fictieve organisatie.

| Vraag die je jezelf stelt | Waar je het ziet |
|---|---|
| Begint de consultant bij het werk van de klant, of bij het pakket? | [workshopplan](../../docs/01-discovery/workshopplan.md): voordoen, geen demo vooraf |
| Durft de consultant "nee" te zeggen tegen maatwerk zonder de klant te verliezen? | [ADR-001](../../docs/adr/adr-001-standaard-eerst.md), [CR-01](../../docs/00-project/cr-01-eindejaarsbonus.md) |
| Blijft de beslissing bij de klant? | beslisser per regel in de [fit-gap](../../docs/03-fit-gap/fit-gap.md); [RACI](../../docs/00-project/raci.md): FC is niet eigenaar van scope of go/no-go |
| Kan een developer met de spec van deze consultant bouwen? | [UC-VK-10](../../docs/05-specs/uc-vk-10-verwijderingsbijdrage.md) |
| Begrijpt de consultant de boekhoudkant? | [boekingsmatrix](../../docs/04-oplossingsontwerp/boekingsmatrix.md) |
| Brengt de consultant een go-live gecontroleerd? | [afstemming](../../docs/06-migratie/afstemming.md), [go-live](../../docs/07-go-live/README.md) |
| Leert de consultant van fouten? | HC-07 → testgeval U6 in de spec; afstemmingsverschil → cutoverplan |

**Afwegingen in de case:** balie zonder kassa-app (kost vs snelheid), bonus als proces nu en app later (vaste go-live vs automatisatie), prijslijsten via sjabloon (controle vs gemak), geen historiek (eenvoud vs alles op één plek).

**Risico's die de case benoemt:** vervuilde stamdata, extern boekhoudkantoor, weerstand van ervaren gebruikers, scope creep, key user niet beschikbaar — zie [RAID](../../docs/00-project/raci.md).

**Wat de case niet toont:** ervaring bij echte klanten.
