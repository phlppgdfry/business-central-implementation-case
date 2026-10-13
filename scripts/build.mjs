// Builds everything that is derived from data/case.json and the migration CSVs:
//   - site/data/case.json            (data + computed results for the workbench)
//   - generated tables in docs/      (fit-gap register, workshops, posting matrix, reconciliation, UAT, hypercare)
//   - docs/03-fit-gap/fit-gap.csv    (opens in Excel)
//   - every <!--n:key-->…<!--/n--> number in the hand-written documents and the site
// CI runs this and fails if anything changed, so documents can never drift from the model.
// Run: node scripts/build.mjs
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import * as L from "../site/assets/case-logic.mjs";

const caseData = JSON.parse(readFileSync("data/case.json", "utf8"));
const ctl = caseData.migration.controls.customerReceivablesAtCutoff;
const v1 = L.parseCsv(readFileSync(ctl.rehearsalFile, "utf8"));
const v2 = L.parseCsv(readFileSync(ctl.file, "utf8"));
const recV1 = L.reconcile(v1, ctl.legacy);
const recV2 = L.reconcile(v2, ctl.legacy);
const decided = L.scenarioTotals(caseData);
const maxCustom = L.scenarioTotals(caseData, L.maximumCustomChoices(caseData));
const counts = L.countByClassification(caseData);
const hc = L.hypercareByCategory(caseData);
const gng = L.goNoGo(caseData, recV2);
const gngV1 = L.goNoGo(caseData, recV1);

const nl = (n, d = 2) => n.toLocaleString("nl-BE", { minimumFractionDigits: d, maximumFractionDigits: d });
const eur = (n, d = 2) => `€${nl(n, d)}`;
const label = Object.fromEntries(caseData.classifications.map((c) => [c.id, c.label]));
const reqById = Object.fromEntries(caseData.requirements.map((r) => [r.id, r]));
const GENERATED = "<!-- Gegenereerd door scripts/build.mjs uit data/case.json — niet met de hand aanpassen. -->";

// ---------- site data ----------
writeFileSync(
  "site/data/case.json",
  JSON.stringify({ ...caseData, migration: { ...caseData.migration, entries: { v1, v2 } } }, null, 1) + "\n",
);

// ---------- claims used in hand-written documents ----------
const v1Diff = recV1.reduce((s, r) => s + r.difference, 0);
const claims = {
  "req.total": caseData.requirements.length,
  "req.fit": caseData.requirements.filter((r) => r.fit === "fit").length,
  "req.gap": caseData.requirements.filter((r) => r.fit === "gap").length,
  "cls.standaard": counts.standaard,
  "cls.configuratie": counts.configuratie,
  "cls.stdconf": counts.standaard + counts.configuratie,
  "cls.app": counts.app,
  "cls.procesaanpassing": counts.procesaanpassing,
  "cls.extensie": counts.extensie,
  "cls.buiten-scope": counts["buiten-scope"],
  "workshops.total": caseData.workshops.length,
  "decided.days": nl(decided.days, 1),
  "decided.cost": eur(decided.costEur, 0),
  "max.days": nl(maxCustom.days, 1),
  "max.cost": eur(maxCustom.costEur, 0),
  "max.extensions": maxCustom.extensions,
  "max.saving.days": nl(maxCustom.days - decided.days, 1),
  "uat.total": caseData.uat.length,
  "defects.total": caseData.defects.length,
  "gng.total": caseData.goNoGo.length,
  "hc.total": caseData.hypercare.length,
  "hc.bug": hc.bug ?? 0,
  "hc.nonbug": caseData.hypercare.length - (hc.bug ?? 0),
  "hc.data": hc.data ?? 0,
  "hc.setup": hc.setup ?? 0,
  "hc.opleiding": hc.opleiding ?? 0,
  "mig.objects": caseData.migration.objects.length,
  "mig.entries.v2": v2.length,
  "mig.diff.v1": eur(v1Diff),
  "mig.inv.pct": nl(L.inventoryDeviationPct(caseData), 1),
  "setup.settings": caseData.setup.settings.length,
  "dayrate": eur(caseData.meta.dayRateEur, 0),
};
writeFileSync("site/data/claims.json", JSON.stringify(claims, null, 1) + "\n");

// ---------- generated documents ----------
const md = (rows) => rows.map((r) => `| ${r.map((c) => String(c ?? "—").replaceAll("|", "\\|").replaceAll("\n", " ")).join(" | ")} |`).join("\n");

const fitGapRows = caseData.requirements.map((r) => [
  `**${r.id}**`, r.title, r.fit === "fit" ? "fit" : "**gap**", label[r.classification], r.solution, nl(r.estimateDays, 1), r.upgradeRisk, r.decider,
  [r.adr && `[${r.adr}](../adr/${r.adr.toLowerCase()}-${adrSlug(r.adr)}.md)`, r.changeRequest && `[${r.changeRequest}](../00-project/cr-01-eindejaarsbonus.md)`, r.spec && `[spec](../05-specs/uc-vk-10-verwijderingsbijdrage.md)`].filter(Boolean).join(" · ") || "—",
]);
writeFileSync(
  "docs/03-fit-gap/fit-gap.md",
  `${GENERATED}
# Fit-gap-register — Kalvaert

> Wat: elke klantbehoefte uit de workshops naast Business Central gelegd, met classificatie, oplossing, inschatting en beslisser. Voor wie: klant (beslist), projectmanager (budget), developer (bouwt de extensie). Methode: [README](README.md). Vorige stap: [workshops](../01-discovery/workshops.md) · volgende: [oplossingsontwerp](../04-oplossingsontwerp/README.md).
>
> *Illustratieve aannames — geen echte bedrijfsdata.* Inschatting in dagen (consultant + developer), dagtarief ${eur(caseData.meta.dayRateEur, 0)}.

## Samenvatting

| Classificatie | Aantal |
|---|---:|
${caseData.classifications.map((c) => `| ${c.label} | ${counts[c.id]} |`).join("\n")}
| **Totaal** | **${caseData.requirements.length}** |

Gekozen scenario: **${nl(decided.days, 1)} dagen** (${eur(decided.costEur, 0)}), ${decided.extensions} extensie, ${decided.apps} app-requirements.
Als elke gap met maatwerk was opgelost: **${nl(maxCustom.days, 1)} dagen** (${eur(maxCustom.costEur, 0)}), ${maxCustom.extensions} extensies — en bij elke jaarlijkse BC-update ${maxCustom.extensions} keer hertesten.

## Register

| ID | Requirement | Fit | Classificatie | Oplossing | Dagen | Upgraderisico | Beslist door | Zie ook |
|---|---|---|---|---|---:|---|---|---|
${md(fitGapRows)}

## Afwegingen bij de gaps met meerdere opties

${caseData.requirements.filter((r) => r.options).map((r) => `### ${r.id} — ${r.title}

| Optie | Classificatie | Dagen | Upgraderisico | Licentie | Gekozen |
|---|---|---:|---|---|---|
${md(r.options.map((o) => [`${o.id}. ${o.label}`, label[o.classification], nl(o.estimateDays, 1), o.upgradeRisk, o.licence, o.chosen ? "**ja**" : ""]))}
`).join("\n")}`,
);

writeFileSync(
  "docs/03-fit-gap/fit-gap.csv",
  "\ufeff" + [["ID", "Domein", "Requirement", "Behoefte", "BC-standaard", "Fit", "Classificatie", "Oplossing", "Dagen", "Upgraderisico", "Beslist door", "Workshop"],
    ...caseData.requirements.map((r) => [r.id, r.domain, r.title, r.need, r.bcStandard, r.fit, label[r.classification], r.solution, String(r.estimateDays).replace(".", ","), r.upgradeRisk, r.decider, r.source])]
    .map((row) => row.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(";")).join("\r\n") + "\r\n",
);

writeFileSync(
  "docs/01-discovery/workshops.md",
  `${GENERATED}
# Workshopverslagen

> Wat: de ${caseData.workshops.length} analyseworkshops, met observatie, wens en open vraag gescheiden. Voor wie: klant (nalezen en corrigeren), projectteam. Vorige stap: [workshopplan](workshopplan.md) · volgende: [order-to-cash](../02-processen/order-to-cash.md) en [fit-gap](../03-fit-gap/fit-gap.md).
>
> *Fictieve workshops — illustratief.*

${caseData.workshops.map((w) => `## ${w.id} — ${w.title} (week ${w.week})

**Aanwezig:** ${w.attendees.join(", ")} · **Werkwijze:** ${w.method}

> "${w.quote}"

**Observaties (wat we zagen)**
${w.observations.map((o) => `- ${o}`).join("\n")}

**Wensen (wat ze vroegen)**
${w.wishes.map((o) => `- ${o}`).join("\n")}

**Open vragen**

| Vraag | Eigenaar |
|---|---|
${md(w.openQuestions.map((q) => [q.q, q.owner]))}

**Requirements uit deze workshop:** ${caseData.requirements.filter((r) => r.source === w.id).map((r) => `${r.id} ${r.title}`).join(" · ")}
`).join("\n")}`,
);

const s = caseData.setup;
const accName = (no) => (no ? `${no} ${s.accounts.find((a) => a.no === no)?.name ?? "?"}` : "—");
writeFileSync(
  "docs/04-oplossingsontwerp/boekingsmatrix.md",
  `${GENERATED}
# Boekingsmatrix — welke rekening, welke btw

> Wat: de boekingsgroepen en btw-instellingen van Kalvaert als tabel. Voor wie: boekhoudkantoor (aftekenen), developer en support (begrijpen waarom een boeking ergens landt). Uitleg: [oplossingsontwerp](README.md). Probeer het zelf in de [workbench](../../site/workbench/index.html), stap "Boekingsgevolg".
>
> *Rekeningnummers volgen de logica van het Belgische minimumindelingsschema maar zijn illustratief; het definitieve schema komt van het boekhoudkantoor (FIN-01).*

## Algemene boekingsinstellingen (bedrijf × product)

| Bedrijfsgroep | Productgroep | Omzet | Aankoop | Kostprijs verkopen |
|---|---|---|---|---|
${md(s.generalPostingSetup.map((g) => [g.bus, g.prod, accName(g.sales), accName(g.purchase), accName(g.cogs)]))}

Bewust **geen** combinatie EU × BIJDRAGE of EXPORT × BIJDRAGE: de verwijderingsbijdrage wordt alleen bij leveringen in België toegevoegd ([UC-VK-10](../05-specs/uc-vk-10-verwijderingsbijdrage.md)). Ontbreekt een combinatie die wél gebruikt wordt, dan weigert BC de boeking — de check \`tests/posting.test.mjs\` vangt dat vooraf op.

## BTW-boekingsinstellingen

| BTW-bedrijf | BTW-product | Berekening | % | Btw-rekening verkoop | Btw-rekening aankoop | Rooster verkoop | Rooster aankoop | Vermelding |
|---|---|---|---:|---|---|---|---|---|
${md(s.vatPostingSetup.map((v) => [v.bus, v.prod, v.calc, v.pct, accName(v.salesVat), accName(v.purchVat), [v.salesGrids.base, v.salesGrids.vat].filter(Boolean).join(" / "), [v.purchGrids.base, v.purchGrids.vat].filter(Boolean).join(" / ") || "—", v.clause ?? v.purchNote ?? "—"]))}

## Klant-, leveranciers- en voorraadboekingsgroepen

| Soort | Code | Rekening |
|---|---|---|
${md([...s.customerPostingGroups.map((c) => ["klant", c.code, accName(c.receivables)]), ...s.vendorPostingGroups.map((v) => ["leverancier", v.code, accName(v.payables)]), ...s.inventoryPostingSetup.map((i) => ["voorraad", `${i.location} × ${i.group}`, accName(i.inventory)])])}

## Voorbeeld: wat BC boekt

${s.customers.map((c) => {
  const p = L.postingPreview(s, c.no, "A-220318");
  return `### ${c.no} (${c.description}) koopt 1 × ${p.item.description}

| Rekening | Debet | Credit | Waarom |
|---|---:|---:|---|
${md(p.lines.map((l) => [`${l.no} ${l.name}`, l.debit ? nl(l.debit) : "", l.credit ? nl(l.credit) : "", l.why]))}
| **Totaal** | **${nl(p.totals.debit)}** | **${nl(p.totals.credit)}** | |

Btw-roosters: ${Object.entries(p.grids).map(([g, a]) => `rooster ${g}: ${nl(a)}`).join(" · ")} · dimensies: VESTIGING=${p.dims.VESTIGING}, AFDELING=${p.dims.AFDELING}
`;
}).join("\n")}`,
);

writeFileSync(
  "docs/06-migratie/afstemming.md",
  `${GENERATED}
# Afstemming openstaande klantposten

> Wat: de controle die bepaalt of de migratie van openstaande klantposten (MIG-06) klopt. Voor wie: boekhoudkantoor en financieel verantwoordelijke (aftekenen), projectmanager (go/no-go GNG-03). Plan: [migratieplan](README.md) · volgende: [go-live](../07-go-live/README.md).
>
> *Fictieve posten, gegenereerd met \`scripts/generate-seed.mjs\`.*

**Regel:** de som van de gemigreerde openstaande posten per rekening moet **exact** gelijk zijn aan het saldo van die rekening in WinBooks op het cutoff-moment. Een verschil van één cent is een verschil.

## Generale repetitie (week 14) — export v1

| Rekening | Saldo WinBooks | Som gemigreerde posten | Verschil | Status |
|---|---:|---:|---:|---|
${md(recV1.map((r) => [accName(r.account), nl(r.legacy), nl(r.migrated), nl(r.difference), r.ok ? "ok" : "**verschil**"]))}

**Oorzaak:** ${ctl.note} Het verschil (${eur(v1Diff)}) is precies het bedrag van ${ctl.lateDocument}.
**Maatregel in het cutoverplan:** TradeDesk wordt om 16:00 bevroren (alleen lezen) *vóór* de export; het saldo in WinBooks wordt pas genomen nadat de export klaar is. Zie [cutover](../07-go-live/README.md#cutover).

## Na aanpassing — export v2 (${v2.length} posten)

| Rekening | Saldo WinBooks | Som gemigreerde posten | Verschil | Status |
|---|---:|---:|---:|---|
${md(recV2.map((r) => [accName(r.account), nl(r.legacy), nl(r.migrated), nl(r.difference), r.ok ? "ok" : "**verschil**"]))}

## Overige controles

| Controle | Oud systeem | Gemigreerd | Afwijking | Norm | Status |
|---|---:|---:|---:|---|---|
| Openstaande leveranciersposten (MIG-07) | ${nl(caseData.migration.controls.vendorPayables.legacy)} | ${nl(caseData.migration.controls.vendorPayables.migrated)} | ${nl(caseData.migration.controls.vendorPayables.migrated - caseData.migration.controls.vendorPayables.legacy)} | €0,00 | ok |
| Voorraadwaarde (MIG-09) | ${nl(caseData.migration.controls.inventoryValue.legacy)} | ${nl(caseData.migration.controls.inventoryValue.migrated)} | ${nl(L.inventoryDeviationPct(caseData), 1)}% | < ${nl(caseData.migration.controls.inventoryValue.tolerancePct, 1)}% | ok |
| Overgangsrekening 499000 na alle migraties | — | ${nl(caseData.migration.controls.migrationSuspense.balanceAfter)} | — | €0,00 | ok |

De norm voor voorraad is ruimer dan voor posten: de laatste waardering in TradeDesk gebruikt een gemiddelde kostprijs, BC herberekent per artikel. Wat binnen de norm valt, boekt het kantoor als voorraadcorrectie bij de eerste maandafsluiting.

## Go/no-go-effect

| Criterium | Met export v1 | Met export v2 |
|---|---|---|
${md(gng.map((g, i) => [`${g.id} ${g.criterion}`, gngV1[i].ok ? "ok" : "**no-go**", g.ok ? "ok" : "**no-go**"]))}
`,
);

writeFileSync(
  "docs/07-go-live/uat.md",
  `${GENERATED}
# UAT-scenario's

> Wat: de ${caseData.uat.length} end-to-end scenario's die de key users zelf uitvoeren en aftekenen. Voor wie: key users, projectmanager (GNG-01). Elk scenario is gekoppeld aan requirements uit de [fit-gap](../03-fit-gap/fit-gap.md). Vorige stap: [afstemming](../06-migratie/afstemming.md) · volgende: [go-live](README.md).
>
> *Fictief — illustratief.*

| ID | Scenario | Key user | Requirements | Resultaat |
|---|---|---|---|---|
${md(caseData.uat.map((u) => [u.id, u.title, u.keyUser, u.reqs.join(", "), u.defect ? `${u.result} (${u.defect})` : u.result]))}

## Defects

| ID | UAT | Ernst | Wat | Oorzaak | Categorie | Herstel | Status |
|---|---|---:|---|---|---|---|---|
${md(caseData.defects.map((d) => [d.id, d.uat, d.severity, d.title, d.cause, d.category, d.fix, d.status]))}

## Requirements zonder UAT-scenario

| Requirement | Waarom geen scenario | Wel gecontroleerd via |
|---|---|---|
${md(caseData.requirements.filter((r) => !caseData.uat.some((u) => u.reqs.includes(r.id))).map((r) => [`${r.id} ${r.title}`, r.noTestReason ?? "migratieobject, geen gebruikersscenario", (r.migrationRefs ?? []).join(", ") || "—"]))}
`,
);

writeFileSync(
  "docs/07-go-live/hypercare.md",
  `${GENERATED}
# Hypercare-log (eerste ${Math.max(...caseData.hypercare.map((h) => h.day))} werkdagen)

> Wat: elke melding na de go-live met de echte oorzaak en een structurele maatregel. Voor wie: projectmanager, support (overdracht in week 19), klant. Vorige stap: [go-live](README.md).
>
> *Fictief — illustratief.*

**${caseData.hypercare.length} meldingen, waarvan ${hc.bug ?? 0} bug.** Data: ${hc.data ?? 0} · setup: ${hc.setup ?? 0} · opleiding: ${hc.opleiding ?? 0} · bug: ${hc.bug ?? 0}.
De les voor de overdracht: wie hypercare-meldingen alleen oplost, krijgt ze terug. Daarom heeft elke melding een structurele maatregel.

| ID | Dag | Symptoom | Categorie | Oorzaak | Herstel | Structureel | Requirement |
|---|---:|---|---|---|---|---|---|
${md(caseData.hypercare.map((h) => [h.id, h.day, h.symptom, h.category, h.cause, h.fix, h.structural, `${h.req} ${reqById[h.req].title}`]))}
`,
);

// ---------- fill claims in hand-written files ----------
const handWritten = [...walk("docs"), ...walk("site"), "README.md", "START-HERE.md", "EVIDENCE.md", "CASE_STUDY.md", ...walk("application-kit")]
  .filter((f) => /\.(md|html)$/.test(f));
const unknown = [];
for (const file of handWritten) {
  const text = readFileSync(file, "utf8");
  const next = text.replace(/<!--n:([\w.-]+)-->(.*?)<!--\/n-->/g, (_, key) => {
    if (!(key in claims)) { unknown.push(`${file}: ${key}`); return `<!--n:${key}-->?<!--/n-->`; }
    return `<!--n:${key}-->${claims[key]}<!--/n-->`;
  });
  if (next !== text) writeFileSync(file, next);
}
if (unknown.length) { console.error("Onbekende claims:\n" + unknown.join("\n")); process.exit(1); }
console.log(`ok — ${caseData.requirements.length} requirements, ${Object.keys(claims).length} claims`);

function walk(dir) {
  try {
    return readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
  } catch { return []; }
}
function adrSlug(id) {
  return { "ADR-003": "balieverkoop-zonder-kassa-app", "ADR-004": "verwijderingsbijdrage-als-extensie", "ADR-005": "eindejaarsbonus-eerst-proces", "ADR-006": "leveranciersprijslijsten-via-configuratiepakket" }[id];
}
