// The logic of the functions, without Azure: the same case logic the workbench and the tests use.
// lib/ is copied from site/assets by scripts/build.mjs (CI fails if it drifts).
import { parseCsv, reconcile, round2 } from "../lib/case-logic.mjs";
import { reconcileOpenEntries } from "../lib/verify-lib.mjs";
import controls from "../lib/controls.json" with { type: "json" };

const REQUIRED = ["documenttype", "documentnr", "klantnr", "rekening", "dagen_voor_cutoff", "openstaand_bedrag"];

/**
 * MIG-06 before loading: is the export complete, and does it add up to the legacy balance at cutoff?
 * Returns a report the consultant can paste in the cutover log. Never throws on bad data; it reports it.
 */
export function migrationControl(csvText, legacy = controls.legacy) {
  const problems = [];
  const head = csvText.trim().split("\n")[0]?.split(";") ?? [];
  const missingColumns = REQUIRED.filter((c) => !head.includes(c));
  if (missingColumns.length) return { ok: false, problems: [`kolommen ontbreken: ${missingColumns.join(", ")}`], rows: 0, reconciliation: [] };
  const rows = parseCsv(csvText);
  const seen = new Set();
  rows.forEach((r, i) => {
    const where = `regel ${i + 2} (${r.documentnr || "?"})`;
    if (!r.documentnr) problems.push(`${where}: geen documentnummer`);
    if (seen.has(r.documentnr)) problems.push(`${where}: dubbel document`);
    seen.add(r.documentnr);
    if (!/^K\d{5}$/.test(r.klantnr)) problems.push(`${where}: klantnummer ${r.klantnr} heeft niet het formaat K00000`);
    if (!(r.rekening in legacy)) problems.push(`${where}: rekening ${r.rekening} hoort niet bij de klantenvorderingen`);
    if (!Number.isFinite(r.openstaand_bedrag) || r.openstaand_bedrag === 0) problems.push(`${where}: bedrag ontbreekt of is 0`);
    if (r.documenttype === "Creditnota" && r.openstaand_bedrag > 0) problems.push(`${where}: creditnota met positief bedrag`);
    if (r.documenttype === "Factuur" && r.openstaand_bedrag < 0) problems.push(`${where}: factuur met negatief bedrag`);
  });
  const reconciliation = reconcile(rows, legacy);
  const difference = round2(reconciliation.reduce((s, r) => s + r.difference, 0));
  return {
    ok: problems.length === 0 && reconciliation.every((r) => r.ok),
    rows: rows.length,
    total: round2(rows.reduce((s, r) => s + r.openstaand_bedrag, 0)),
    difference,
    reconciliation,
    problems,
    advice: difference === 0 ? "Klaar om te laden (MIG-06)." : `Niet laden: €${difference} verschil met het saldo in het oude pakket. Zoek documenten die na de export geboekt zijn (zie de generale repetitie, CN-0412).`,
  };
}

/** After loading: open customer entries in BC against the same legacy balances. fetchJson is injected (tests mock it). */
export async function bcReconciliation(fetchJson, legacy = controls.legacy, groups = controls.customerPostingGroups, documentNumbers = null) {
  const entries = [];
  for (let url = "openCustomerEntries"; url; ) {
    const page = await fetchJson(url);
    entries.push(...page.value);
    url = page["@odata.nextLink"] ?? null;
  }
  const reconciliation = reconcileOpenEntries(entries, legacy, groups, documentNumbers);
  return { ok: reconciliation.every((r) => r.ok), entries: entries.length, reconciliation };
}
