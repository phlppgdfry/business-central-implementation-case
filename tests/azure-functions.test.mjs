// The Azure Functions' logic, without Azure: migration control before loading, reconciliation against BC after.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { caseData, v2, read, L } from "./helpers.mjs";
import { migrationControl, bcReconciliation } from "../azure/functions/src/core.mjs";
import { compareLedger, checkFeeLine } from "../bc/scripts/verify-lib.mjs";

const ctl = caseData.migration.controls.customerReceivablesAtCutoff;

test("migration control: the rehearsal export (v1) is stopped with the €1.586,40 difference, the final export (v2) passes", () => {
  const r1 = migrationControl(read(ctl.rehearsalFile));
  assert.equal(r1.ok, false);
  assert.equal(r1.difference, 1586.4);
  assert.match(r1.advice, /Niet laden/);
  const r2 = migrationControl(read(ctl.file));
  assert.equal(r2.ok, true, JSON.stringify(r2.problems));
  assert.equal(r2.rows, 40);
  assert.equal(r2.difference, 0);
});

test("migration control reports bad rows instead of loading them", () => {
  const csv = read(ctl.file).trim().split("\n");
  const broken = [...csv, csv[1], "Factuur;VF-99999;X1;400000;3;10.00", "Creditnota;CN-9999;K10023;400000;3;25.00"].join("\n");
  const r = migrationControl(broken);
  assert.equal(r.ok, false);
  assert.ok(r.problems.some((p) => /dubbel document/.test(p)));
  assert.ok(r.problems.some((p) => /formaat K00000/.test(p)));
  assert.ok(r.problems.some((p) => /creditnota met positief bedrag/.test(p)));
  assert.equal(migrationControl("a;b\n1;2").ok, false);
});

// what BC's API page openCustomerEntries returns after posting the migration journal
const accountToGroup = Object.fromEntries(caseData.setup.customerPostingGroups.map((g) => [g.receivables, g.code]));
const bcEntries = v2.map((r, i) => ({ entryNo: i + 1, documentNo: r.documentnr, customerNo: r.klantnr, customerPostingGroup: accountToGroup[r.rekening], remainingAmountLCY: r.openstaand_bedrag }));
const paged = (entries, size = 15) => {
  const pages = [];
  for (let i = 0; i < entries.length; i += size) pages.push(entries.slice(i, i + size));
  return async (url) => {
    const n = url === "openCustomerEntries" ? 0 : Number(url.split("page=")[1]);
    return { value: pages[n] ?? [], ...(n + 1 < pages.length ? { "@odata.nextLink": `https://bc/next?page=${n + 1}` } : {}) };
  };
};

test("reconciliation against BC follows the API paging and matches the legacy balances to the cent", async () => {
  const r = await bcReconciliation(paged(bcEntries));
  assert.equal(r.entries, 40);
  assert.ok(r.ok, JSON.stringify(r.reconciliation));
});

test("reconciliation against BC fails when one document is missing", async () => {
  const r = await bcReconciliation(paged(bcEntries.filter((e) => e.documentNo !== "CN-0412")));
  assert.equal(r.ok, false);
  assert.equal(r.reconciliation.find((x) => x.account === "400000").difference, 1586.4);
});

test("posting check: the model's journal for T8 equals the G/L entries BC would return", () => {
  const preview = L.postingPreview(caseData.setup, "K10023", "A-220318", 2);
  // BC combines VAT per VAT identifier: one 451000 entry for goods + fee
  const vat = preview.lines.filter((l) => l.no === "451000").reduce((s, l) => s + l.credit, 0);
  const gl = [
    ...preview.lines.filter((l) => l.no !== "451000").map((l) => ({ accountNumber: l.no, debitAmount: l.debit, creditAmount: l.credit })),
    { accountNumber: "451000", debitAmount: 0, creditAmount: L.round2(vat) },
  ];
  const cmp = compareLedger(preview, gl);
  assert.ok(cmp.ok, JSON.stringify(cmp.rows));
  assert.equal(cmp.rows.find((r) => r.account === "700900").actual, -7);
  const wrong = compareLedger(preview, gl.map((e) => (e.accountNumber === "700900" ? { ...e, accountNumber: "700000" } : e)));
  assert.equal(wrong.ok, false);
});

test("fee line check on API lines: exactly one fee line, below the item, right quantity and price", () => {
  const lines = [
    { sequence: 10000, lineType: "Item", lineObjectNumber: "A-220318", quantity: 2, unitPrice: 420 },
    { sequence: 15000, lineType: "Account", lineObjectNumber: "700900", quantity: 2, unitPrice: 3.5 },
  ];
  assert.ok(checkFeeLine(lines, "A-220318", 2, 3.5, "700900").ok);
  assert.equal(checkFeeLine([...lines, { ...lines[1], sequence: 17500 }], "A-220318", 2, 3.5, "700900").ok, false);
  assert.equal(checkFeeLine([lines[0], { ...lines[1], sequence: 5000 }], "A-220318", 2, 3.5, "700900").ok, false);
});

test("the function package carries the same logic as the site (copied by the build)", () => {
  const site = readFileSync("site/assets/case-logic.mjs", "utf8");
  assert.ok(readFileSync("azure/functions/lib/case-logic.mjs", "utf8").endsWith(site));
  const controls = JSON.parse(readFileSync("azure/functions/lib/controls.json", "utf8"));
  assert.deepEqual(controls.legacy, ctl.legacy);
});

test("Azure guardrails: daily log cap, budget, no shared keys, no public blobs, secret only in Key Vault", () => {
  const bicep = readFileSync("azure/main.bicep", "utf8");
  assert.match(bicep, /dailyQuotaGb/);
  assert.match(bicep, /Microsoft\.Consumption\/budgets/);
  assert.match(bicep, /allowSharedKeyAccess: false/);
  assert.match(bicep, /allowBlobPublicAccess: false/);
  assert.match(bicep, /@secure\(\)[\s\S]*param bcClientSecret/);
  assert.match(bicep, /@Microsoft\.KeyVault\(/);
  assert.doesNotMatch(readFileSync("azure/dev.bicepparam", "utf8"), /bcClientSecret\s*=/);
});
