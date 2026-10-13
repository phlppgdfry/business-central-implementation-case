// Migration reconciliation and go/no-go (docs/06-migratie, docs/07-go-live).
import { test } from "node:test";
import assert from "node:assert/strict";
import { caseData, L, v1, v2 } from "./helpers.mjs";

const ctl = caseData.migration.controls.customerReceivablesAtCutoff;

test("export v2 sluit exact aan op het saldo in WinBooks", () => {
  for (const r of L.reconcile(v2, ctl.legacy)) assert.equal(r.difference, 0, r.account);
});

test("export v1 wijkt precies af met het bedrag van het laat geboekte document", () => {
  const late = v2.find((e) => e.documentnr === ctl.lateDocument);
  assert.ok(late, "laat document ontbreekt in v2");
  assert.ok(!v1.some((e) => e.documentnr === ctl.lateDocument));
  const diff = L.reconcile(v1, ctl.legacy).reduce((s, r) => s + r.difference, 0);
  assert.equal(L.round2(diff), L.round2(-late.openstaand_bedrag));
});

test("geen dubbele documentnummers in de export", () => {
  const nos = v2.map((e) => e.documentnr);
  assert.equal(new Set(nos).size, nos.length);
});

test("go/no-go: no-go met export v1, alles groen met export v2", () => {
  const before = L.goNoGo(caseData, L.reconcile(v1, ctl.legacy));
  assert.equal(before.find((g) => g.id === "GNG-03").ok, false);
  for (const g of L.goNoGo(caseData, L.reconcile(v2, ctl.legacy))) assert.ok(g.ok, g.id);
});

test("hypercare: elke melding heeft een categorie, oorzaak en structurele maatregel", () => {
  const allowed = new Set(["data", "setup", "opleiding", "bug"]);
  for (const h of caseData.hypercare) {
    assert.ok(allowed.has(h.category), h.id);
    assert.ok(h.cause && h.structural, h.id);
  }
});
