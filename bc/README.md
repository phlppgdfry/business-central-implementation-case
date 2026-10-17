# Business Central: de case als code

> Wat: de enige extensie van het project (UC-VK-10), de testgevallen als AL-tests, en het oplossingsontwerp als installeerbare demo-inrichting, zodat een lege Business Central-sandbox in een paar minuten de Kalvaert-inrichting heeft. Voor wie: de developer (bouwt verder), de functional consultant (test en demonstreert), een reviewer (controleert). Vorige stap: [spec UC-VK-10](../docs/05-specs/uc-vk-10-verwijderingsbijdrage.md) · verder: [Azure-ontwikkelomgeving](../azure/README.md).

## Status

| | |
|---|---|
| Gebouwd | 3 AL-apps voor **Business Central 29.0 (2026 release wave 2), Belgische lokalisatie**, runtime 18.0, per-tenant extensions (`target: Cloud`) |
| Gecontroleerd | compileert tegen de echte symbolen van Microsoft, met CodeCop, UICop en PerTenantExtensionCop: **0 fouten, 0 waarschuwingen** (lokaal en in [CI](../.github/workflows/ci.yml), job `al`) · Nederlandse vertaling (nl-BE) volledig · structuurtests in [`tests/al.test.mjs`](../tests/al.test.mjs) |
| **Nog niet** | **gepubliceerd in en gedraaid tegen een sandbox.** De AL-tests en de verificatie via de API wachten op een omgeving ([hieronder](#in-een-sandbox-zetten)). Tot dan is "werkt" een verwachting: de compiler controleert namen, types en events, niet het gedrag. |

## De drie apps

| App | Objecten | Wat | Voor de klant? |
|---|---:|---|---|
| [`apps/removal-fee`](apps/removal-fee/) — *Kalvaert Removal Fee* | <!--n:al.fee.objects-->25<!--/n--> | VK-10: veld *Verwijderingsbijdrage* op het artikel; op offerte, order, factuur, creditnota en retourorder voor BINNENL-klanten precies één bijdrageregel onder de artikelregel. Hoeveelheid en te verzenden hoeveelheid volgen, verdwijnt met de artikelregel of als de klant niet BINNENL is, niet met de hand te wijzigen. <!--n:al.subscribers-->14<!--/n--> event subscribers, alleen standaard events. Telemetrie naar Application Insights (KLV0001–0003). | ja — het enige maatwerk |
| [`apps/demo-setup`](apps/demo-setup/) — *Kalvaert Demo Setup* | <!--n:al.demo.objects-->9<!--/n--> | Het oplossingsontwerp als code: rekeningschema-uittreksel, boekings- en btw-groepen met vrijstellingsclausules, dimensies met "code verplicht", locaties en transferroute, artikels, <!--n:al.customers-->28<!--/n--> klanten met geldig ondernemingsnummer, klantsjablonen, en het migratiedagboek met de <!--n:al.mig.lines-->40<!--/n--> openstaande posten tegen 499000. Plus API-pagina's om dat zonder klikken te doen en af te stemmen. | nee — ontwikkel- en testgereedschap |
| [`apps/removal-fee-test`](apps/removal-fee-test/) — *Kalvaert Removal Fee Tests* | 1 | <!--n:al.tests-->12<!--/n--> AL-tests: T1–T9 uit de spec plus U4, U5, U7. Elke test heet naar het testgeval. | nee |

**Waarom de inrichting als code, terwijl een consultant RapidStart gebruikt?** In het echte project vullen de key users configuratiepakketten (zie [migratieplan](../docs/06-migratie/README.md)). Voor een ontwikkel- en testomgeving die je elke week opnieuw wil opbouwen, werkt Microsoft zelf ook met demodata-apps (Contoso). Het voordeel hier: de data wordt **gegenereerd uit `data/case.json`** ([`scripts/al-gen.mjs`](../scripts/al-gen.mjs)), en de AL-compiler controleert elke tabel, elk veld en elke optie tegen Business Central. Wat op papier staat en wat in de sandbox komt, kan niet uit elkaar lopen.

## Wat de bouw aan de spec veranderde

Zie [UC-VK-10 §5](../docs/05-specs/uc-vk-10-verwijderingsbijdrage.md#5-gebouwd-in-al): deelleveringen (U9), het herschrijven van regels bij een andere klant, verplichte dimensies op de bijdrageregel, en bulkbewerkingen van de standaard. Plus één open punt voor de sandbox:

| # | Open punt | Aanname nu | Hoe te bevestigen |
|---|---|---|---|
| S-01 | Neemt *Document kopiëren* het veld "Gekoppeld aan regelnr." correct mee voor een G/L-regel? | ja, zoals voor uitgebreide tekst; zo niet ruimt de afstemming na het kopiëren op en maakt een nieuwe regel | test T6 |
| S-02 | Werkt de automatiek ook via de standaard API voor verkooporders (webshop later)? | ja, API-pagina's voeren de triggers uit | `sandbox.mjs verify` (T1 via de API) |
| S-03 | Betekent kredietlimiet 0 in BC "geen limiet"? | ja (partnerdocumentatie), dus klantsjabloon NIEUW krijgt €1 i.p.v. 0 | klant uit sjabloon NIEUW, order van €10 |

## Lokaal compileren

Node 22+, .NET 8+, en de AL CLI van Microsoft (NuGet, geen account nodig):

```sh
dotnet tool install -g Microsoft.Dynamics.BusinessCentral.Development.Tools --version 18.1.43.24897
node bc/scripts/symbols.mjs     # BC 29.0 BE-symbolen van Microsofts publieke feed → bc/.alpackages (±10 s)
node bc/scripts/compile.mjs     # 3 apps → bc/out/*.app, 0 waarschuwingen vereist, nl-BE-vertaling
```

In VS Code: open [`bc/kalvaert.code-workspace`](kalvaert.code-workspace) met de AL-extensie. Kopieer [`launch.example.json`](launch.example.json) naar `apps/<app>/.vscode/launch.json` om te publiceren met F5.

## In een sandbox zetten

Wat nodig is, eenmalig:

1. **Een Business Central-omgeving.** Een [gratis proefversie](https://learn.microsoft.com/dynamics365/business-central/trial-signup) op een eigen Microsoft 365-tenant, of een sandbox bij een partner. In het beheercentrum: een sandbox `kalvaert-dev` (land BE, versie 29.x).
2. **Een leeg bedrijf `KALVAERT`**: in Business Central *Nieuw bedrijf maken* → *Productie - alleen setupgegevens* (dan bestaan nummerreeksen en landcodes, maar geen Cronus-rekeningen).
3. **Aanmelden**: `az login` met een gebruiker van die tenant (of een Entra-app in BC onder *Microsoft Entra-toepassingen*, met `BC_CLIENT_ID` en `BC_CLIENT_SECRET`), en voor de AL-tests `al auth login`.

Daarna één commando:

```sh
BC_TENANT=<tenant> node bc/scripts/sandbox.mjs all
```

| Stap | Wat er gebeurt | Wat moet kloppen |
|---|---|---|
| `publish` | de drie `.app`-bestanden via de automation-API | deployment *Completed* |
| `setup` | API-actie `applySetup` van de demo-inrichting | aantal instellingsrecords > 0, dataversie = `case.json` |
| `migrate` | migratiedagboek klaarzetten en boeken, dan per document afstemmen | 400000 = €170.703,53 · 400100 = €29.910,71 · verschil €0,00 |
| `verify` | order K10023 met 2 boilers via de **standaard** API → bijdrageregel? → verzenden en factureren → grootboekposten | één bijdrageregel 2 × €3,50 · elke rekening = de [boekingsmatrix](../docs/04-oplossingsontwerp/boekingsmatrix.md) |
| `tests` | `al runtests 50150` | 12/12 geslaagd |

Resultaat: `bc/VERIFICATION.md`, met datum, omgeving en elk getal. Pas daarna mag in de README "gedraaid in Business Central" staan.

## Bestanden

```text
bc/
  symbols.json              vastgepinde symboolpakketten (BC 29.0, BE)
  kalvaert.code-workspace   VS Code-werkruimte met de drie apps en de code-analyzers
  apps/removal-fee/         de extensie (src/sales, item, history, setup, permissions, install) + Translations/*.nl-BE.xlf
  apps/demo-setup/          src/setup (helpers, migratie, pagina), src/api, src/generated (← scripts/al-gen.mjs)
  apps/removal-fee-test/    de testcodeunit
  scripts/symbols.mjs       symbolen downloaden
  scripts/compile.mjs       compileren met analyzers + vertaling
  scripts/sandbox.mjs       publiceren, inrichten, migreren, verifiëren, testen in een echte sandbox
  scripts/verify-lib.mjs    de vergelijkingen (gedeeld met de tests en de Azure-functies)
```
