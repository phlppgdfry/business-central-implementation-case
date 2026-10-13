// Rules every fit-gap row must follow (see docs/03-fit-gap/README.md).
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync } from "node:fs";
import { caseData, L } from "./helpers.mjs";

test("geen traceerbaarheidsfouten: bron, beslisser, beslissing, instellingen, test of migratiecontrole", () => {
  assert.deepEqual(L.traceProblems(caseData), []);
});

test("requirement-ID's zijn uniek en het domein bestaat", () => {
  const ids = caseData.requirements.map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length);
  const domains = new Set(caseData.domains.map((d) => d.id));
  for (const r of caseData.requirements) assert.ok(domains.has(r.domain), r.id);
});

test("elke extensie heeft een spec en een ADR die bestaan", () => {
  for (const r of caseData.requirements.filter((r) => r.classification === "extensie")) {
    assert.ok(existsSync(new URL(`../${r.spec}`, import.meta.url)), `${r.id}: spec ontbreekt`);
  }
});

test("elke ADR waarnaar een requirement verwijst, bestaat als bestand", () => {
  const files = readdirSync(new URL("../docs/adr/", import.meta.url));
  for (const r of caseData.requirements.filter((r) => r.adr)) {
    assert.ok(files.some((f) => f.startsWith(`${r.adr.toLowerCase()}-`)), `${r.id}: ${r.adr} ontbreekt`);
  }
});

test("standaard eerst: het gekozen scenario is goedkoper en heeft minder extensies dan overal maatwerk", () => {
  const decided = L.scenarioTotals(caseData);
  const max = L.scenarioTotals(caseData, L.maximumCustomChoices(caseData));
  assert.ok(decided.days < max.days);
  assert.ok(decided.extensions < max.extensions);
  assert.equal(decided.extensions, 1);
});

test("een andere keuze in de workbench verandert de totalen zoals verwacht (VK-06 extensie: +7 dagen, +1 extensie)", () => {
  const base = L.scenarioTotals(caseData);
  const ext = L.scenarioTotals(caseData, { "VK-06": "a" });
  assert.equal(ext.days - base.days, 7);
  assert.equal(ext.extensions - base.extensions, 1);
});

test("elke change request verwijst naar een requirement dat de beslissing vastlegt", () => {
  for (const cr of caseData.changeRequests) {
    const r = caseData.requirements.find((x) => x.id === cr.req);
    assert.equal(r.changeRequest, cr.id);
    assert.equal(cr.inOffer, false);
  }
});
