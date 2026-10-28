# Business Central: de case als code

> Wat: de enige extensie van het project (UC-VK-10), de testgevallen als AL-tests, en het oplossingsontwerp als installeerbare demo-inrichting, zodat een lege Business Central-sandbox in een paar minuten de Kalvaert-inrichting heeft. Voor wie: de developer (bouwt verder), de functional consultant (test en demonstreert), een reviewer (controleert). Vorige stap: [spec UC-VK-10](../docs/05-specs/uc-vk-10-verwijderingsbijdrage.md) · verder: [Azure-ontwikkelomgeving](../azure/README.md).

## Status

| | |
|---|---|
| Gebouwd | 3 AL-apps voor **Business Central 29.0, Belgische lokalisatie**, runtime 18.0, per-tenant extensions (`target: Cloud`) |
| Gecontroleerd | compileert tegen de echte symbolen van Microsoft, met CodeCop, UICop en PerTenantExtensionCop: **0 fouten, 0 waarschuwingen** (lokaal en in [CI](../.github/workflows/ci.yml), job `al`) · Nederlandse vertaling (nl-BE) volledig · structuurtests in [`tests/al.test.mjs`](../tests/al.test.mjs) |
| **Gedraaid** | **ja** — gepubliceerd in de sandbox `kalvaert-dev` (BE, 29.0), het oplossingsontwerp toegepast, de migratie geboekt en afgestemd, en de testgevallen uit de spec via de standaard verkooporder-API uitgevoerd. Resultaten: [VERIFICATION.md](VERIFICATION.md). |
| **Tests** | **12/12** AL-tests geslaagd in de sandbox, inclusief T6 (document kopiëren), dat via de standaard API niet te testen is. Ze draaien via Business Centrals eigen testrunner, gestart door een API van de testapp — `al runtests` zou een interactieve aanmelding vragen, en dat kan niet in een pipeline. |

> **Over de houdbaarheid.** `kalvaert-dev` is een **proefomgeving**. Business Central ruimt die na verloop van tijd op: de vorige sandbox van dit project stond na ongeveer tweeënhalve maand op *SoftDeleted* en was niet meer te herstellen. Dit rapport is daarom het blijvende bewijs, niet de omgeving zelf. Opnieuw opbouwen kost één commando (`node bc/scripts/sandbox.mjs all`) plus de tijd die Business Central nodig heeft om de apps te installeren — in de praktijk een halfuur.

**Wat het draaien opleverde:** twee fouten die de compiler én een UAT met één order niet zien. Beide staan nu in de spec ([§5](../docs/05-specs/uc-vk-10-verwijderingsbijdrage.md#5-gebouwd-in-al)):

1. `Validate(Type)` op een verkoopregel roept intern `Init()` aan en wist **ook de eigen velden van de extensie**. De bijdrageregel verloor zijn markering, dus bij elke hoeveelheidswijziging kwam er een regel bij — en op de factuur stond de bijdrage dubbel.
2. Het standaardveld *Gekoppeld aan regelnr.* markeert een regel als uitgebreide-tekstregel; Business Central weigert dan het regeltype te zetten. De extensie houdt nu haar eigen koppelveld bij.

## De drie apps

| App | Objecten | Wat | Voor de klant? |
|---|---:|---|---|
| [`apps/removal-fee`](apps/removal-fee/) — *Kalvaert Removal Fee* | <!--n:al.fee.objects-->25<!--/n--> | VK-10: veld *Verwijderingsbijdrage* op het artikel; op offerte, order, factuur, creditnota en retourorder voor BINNENL-klanten precies één bijdrageregel onder de artikelregel. Hoeveelheid en te verzenden hoeveelheid volgen, verdwijnt met de artikelregel of als de klant niet BINNENL is, niet met de hand te wijzigen. <!--n:al.subscribers-->14<!--/n--> event subscribers, alleen standaard events. Telemetrie naar Application Insights (KLV0001–0003). | ja — het enige maatwerk |
| [`apps/demo-setup`](apps/demo-setup/) — *Kalvaert Demo Setup* | <!--n:al.demo.objects-->9<!--/n--> | Het oplossingsontwerp als code: rekeningschema-uittreksel, boekings- en btw-groepen met vrijstellingsclausules, dimensies met "code verplicht", locaties en transferroute, artikels, <!--n:al.customers-->28<!--/n--> klanten met geldig ondernemingsnummer, klantsjablonen, en het migratiedagboek met de <!--n:al.mig.lines-->40<!--/n--> openstaande posten tegen 499000. Plus API-pagina's om dat zonder klikken te doen en af te stemmen. | nee — ontwikkel- en testgereedschap |
| [`apps/removal-fee-test`](apps/removal-fee-test/) — *Kalvaert Removal Fee Tests* | 4 | <!--n:al.tests-->12<!--/n--> AL-tests: T1–T9 uit de spec plus U4, U5, U7. Elke test heet naar het testgeval. Plus een API die Business Centrals eigen testrunner start, zodat de suite ook vanuit een script of pipeline kan draaien — `al runtests` vraagt namelijk een interactieve aanmelding. | nee |

**Waarom de inrichting als code, terwijl een consultant RapidStart gebruikt?** In het echte project vullen de key users configuratiepakketten (zie [migratieplan](../docs/06-migratie/README.md)). Voor een ontwikkel- en testomgeving die je elke week opnieuw wil opbouwen, werkt Microsoft zelf ook met demodata-apps (Contoso). Het voordeel hier: de data wordt **gegenereerd uit `data/case.json`** ([`scripts/al-gen.mjs`](../scripts/al-gen.mjs)), en de AL-compiler controleert elke tabel, elk veld en elke optie tegen Business Central. Wat op papier staat en wat in de sandbox komt, kan niet uit elkaar lopen.

## Wat de bouw aan de spec veranderde

Zie [UC-VK-10 §5](../docs/05-specs/uc-vk-10-verwijderingsbijdrage.md#5-gebouwd-in-al): deelleveringen (U9), het herschrijven van regels bij een andere klant, verplichte dimensies op de bijdrageregel, en bulkbewerkingen van de standaard. Plus één open punt voor de sandbox:

| # | Open punt | Antwoord |
|---|---|---|
| S-01 | Neemt *Document kopiëren* de koppeling van de bijdrageregel correct mee? | **Nog open.** De standaard API kent geen actie "document kopiëren", dus T6 is niet live getest. Wel getest: offerte → order (T7), waar dezelfde bulklogica speelt. Te doen in de client. |
| S-02 | Werkt de automatiek ook via de standaard API voor verkooporders (webshop later)? | **Ja.** De hele verificatie loopt via `salesOrders`/`salesOrderLines`: de bijdrageregel verschijnt, volgt de hoeveelheid en verdwijnt mee. |
| S-03 | Betekent kredietlimiet 0 in BC "geen limiet"? | **Nog open.** Het klantsjabloon NIEUW staat op €1 i.p.v. 0; te bevestigen met een order van €10 op een klant uit dat sjabloon. |

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

1. **Een Business Central-tenant met een licentie of proefversie.** Het script maakt de sandbox zelf aan.
2. **Aanmelden:** `az login` met een gebruiker van die tenant (of een Entra-app in BC onder *Microsoft Entra-toepassingen*, met `BC_CLIENT_ID` en `BC_CLIENT_SECRET`). Meer is er niet nodig: ook de AL-tests draaien met dezelfde aanmelding.

Daarna één commando:

```sh
BC_TENANT=<tenant> BC_COMPANY="My Company" node bc/scripts/sandbox.mjs all
```

| Stap | Wat er gebeurt | Wat moet kloppen |
|---|---|---|
| `envs` | toont de omgevingen op de tenant | — |
| `create` | maakt de Belgische sandbox `kalvaert-dev` (of meldt dat ze al actief is) | status *Active*, land BE |
| `company` | zoekt het bedrijf uit `BC_COMPANY` | zie de noot hieronder |
| `telemetry` | koppelt de omgeving aan de Application Insights uit [`azure/`](../azure/README.md) | gebeurtenissen komen binnen |
| `publish` | de drie `.app`-bestanden via de automation-API, in volgorde van afhankelijkheid | deployment *Completed* per app |
| `setup` | API-actie `applySetup` van de demo-inrichting | aantal instellingsrecords > 0, dataversie = `case.json` |
| `migrate` | migratiedagboek klaarzetten en boeken, dan per document afstemmen | 400000 = €170.703,53 · 400100 = €29.910,71 · verschil €0,00 |
| `verify` | T1–T5, T7, T8 en T9 uit de spec via de **standaard** verkooporder-API | één bijdrageregel onder het artikel, en elke rekening = de [boekingsmatrix](../docs/04-oplossingsontwerp/boekingsmatrix.md) |
| `tests` | start Business Centrals eigen testrunner via de API die de testapp blootstelt, en leest de uitslag per testmethode | 12/12 geslaagd |

Resultaat: [`bc/VERIFICATION.md`](VERIFICATION.md), met datum, omgeving en elk getal.

> **Over het bedrijf.** De README van een echt project zegt: maak een bedrijf `KALVAERT` via *Nieuw bedrijf maken → Productie - alleen setupgegevens*. Dat is een handeling in de client: een bedrijf aanmaken kan **niet** via de API ("Adding a company is not supported by Business Central OData web services"). Een nieuwe sandbox heeft al zo'n bedrijf — `My Company`, met het Belgische standaardrekeningschema en zonder klanten of artikels — en daar is Kalvaert in gebouwd. De demo-inrichting zet de bedrijfsgegevens (naam, ondernemingsnummer), zodat documenten *Kalvaert Technische Groothandel NV* tonen.

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
