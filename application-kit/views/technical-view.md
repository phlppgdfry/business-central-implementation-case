# Voor de senior consultant (vakspecialist, 30 minuten)

> De plekken waar je de grens van de Business Central-kennis kan aftasten. Onafhankelijke portfoliocase over een fictieve organisatie; ontworpen op basis van de Microsoft-documentatie; de extensie en de inrichting draaien in een Business Central-sandbox (29.0, Belgisch); zie het [verificatierapport](../../bc/VERIFICATION.md).

| Onderwerp | Waar | Wat je kan vragen |
|---|---|---|
| Algemene boekingsinstellingen | [boekingsmatrix](../../docs/04-oplossingsontwerp/boekingsmatrix.md) | "Waarom geen EU × BIJDRAGE? Wat gebeurt er als die toch nodig is?" |
| BTW-boekingsinstellingen | idem | "Waarom 'btw verleggen' voor EU en niet 0% normale btw? Welke roosters bij een aankoop uit Duitsland?" |
| Dimensies | [oplossingsontwerp](../../docs/04-oplossingsontwerp/README.md) | "Globale vs snelkoppelingsdimensies? Waarom code verplicht op omzet?" |
| Prijzen | VK-01 in de [fit-gap](../../docs/03-fit-gap/fit-gap.md) | "Prijslijsten per klantkortingsgroep: hoe migreer je 420 vrije-tekstafspraken?" |
| Datamigratie | [migratieplan](../../docs/06-migratie/README.md) | "Configuratiepakket of cloud-migratie? Waarom per document? Wat met openingsbalans en voorraad?" |
| Extensie | [UC-VK-10](../../docs/05-specs/uc-vk-10-verwijderingsbijdrage.md) | "Welke uitzondering zou je nog toevoegen? Hoe test je dit bij een update?" |
| E-documenten | EF-01–03 | "Wat doet de standaard, wat de connector-app?" |
| Controles | `tests/`, `scripts/build.mjs` | "Hoe weet je dat het setup-document en de fit-gap niet uit elkaar lopen?" |
| AL-extensie | [bc/apps/removal-fee](../../bc/apps/removal-fee/) | "Waarom de koppeling via 'Gekoppeld aan regelnr.'? Wat gebeurt er bij Sales-Get Shipment? Waarom geen eigen tabel?" |
| Demo-inrichting | [ADR-007](../../docs/adr/adr-007-inrichting-als-code-voor-de-sandbox.md), [al-gen.mjs](../../scripts/al-gen.mjs) | "Waarom geen RapidStart voor de sandbox? Wat als de klant al globale dimensies heeft?" |
| Azure | [azure/](../../azure/README.md), [hypercare.kql](../../azure/telemetry/hypercare.kql) | "Welke telemetrie-events lees je in week 1? Waar staat het secret?" |
| Wat het draaien opleverde | [spec §5](../../docs/05-specs/uc-vk-10-verwijderingsbijdrage.md#5-gebouwd-in-al), [VERIFICATION.md](../../bc/VERIFICATION.md) | "Waarom wist `Validate(Type)` je eigen velden? Hoe zou je dit in een UAT-scenario vangen?" |
