// The posting simulator must produce what the setup design promises (docs/04-oplossingsontwerp).
import { test } from "node:test";
import assert from "node:assert/strict";
import { caseData, L } from "./helpers.mjs";

const s = caseData.setup;

test("elke combinatie klant × artikel heeft de nodige boekingsinstellingen en is in evenwicht", () => {
  for (const c of s.customers) for (const i of s.items) {
    const p = L.postingPreview(s, c.no, i.no, 3);
    assert.ok(p.balanced, `${c.no} × ${i.no}`);
  }
});

test("binnenland: 21% btw op artikel plus bijdrage, roosters 03 en 54", () => {
  const p = L.postingPreview(s, "K10023", "A-220318");
  assert.equal(p.totals.net, 423.5);
  assert.equal(p.totals.vat, 88.94);
  assert.deepEqual(p.grids, { "03": 423.5, "54": 88.94 });
  assert.ok(p.lines.some((l) => l.no === "700900" && l.credit === 3.5));
});

test("EU-klant: btw verlegd (geen btw op de factuur), geen bijdrage, rooster 46", () => {
  const p = L.postingPreview(s, "K20411", "A-220318");
  assert.equal(p.totals.vat, 0);
  assert.ok(!p.lines.some((l) => l.no === "700900"));
  assert.deepEqual(p.grids, { 46: 420 });
  assert.ok(p.lines.some((l) => l.no === "400100" && l.debit === 420));
});

test("export: 0% en rooster 47", () => {
  const p = L.postingPreview(s, "K30007", "A-114502", 2);
  assert.equal(p.totals.vat, 0);
  assert.deepEqual(p.grids, { 47: 372 });
});

test("balieverkoop contant: vordering wordt meteen vereffend via de kas", () => {
  const p = L.postingPreview(s, "K99901", "A-114502");
  const receivable = p.lines.filter((l) => l.no === "400000").reduce((sum, l) => sum + l.debit - l.credit, 0);
  assert.equal(receivable, 0);
  assert.ok(p.lines.some((l) => l.no === "570000" && l.debit === p.totals.gross));
});

test("dienst zonder kostprijs: geen voorraad- of kostprijsregel", () => {
  const p = L.postingPreview(s, "K10023", "S-LEVERING");
  assert.ok(!p.lines.some((l) => l.no === "340000" || l.no === "609000"));
});

test("elke rekening in de setup bestaat in het rekeningschema", () => {
  const accounts = new Set(s.accounts.map((a) => a.no));
  const used = [
    ...s.generalPostingSetup.flatMap((g) => [g.sales, g.purchase, g.cogs]),
    ...s.vatPostingSetup.flatMap((v) => [v.salesVat, v.purchVat]),
    ...s.customerPostingGroups.map((c) => c.receivables), ...s.vendorPostingGroups.map((v) => v.payables),
    ...s.inventoryPostingSetup.map((i) => i.inventory), ...s.paymentMethods.map((p) => p.balancingAccount),
  ].filter(Boolean);
  for (const a of used) assert.ok(accounts.has(a), a);
});
