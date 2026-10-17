// Pure comparisons for the sandbox verification, shared with the tests (no network here).
import { round2 } from "../../site/assets/case-logic.mjs";

/** Expected (postingPreview) vs real G/L entries of one posted invoice, summed per account. */
export function compareLedger(preview, glEntries) {
  const expected = {};
  for (const l of preview.lines) expected[l.no] = round2((expected[l.no] ?? 0) + l.debit - l.credit);
  const actual = {};
  for (const e of glEntries) actual[e.accountNumber] = round2((actual[e.accountNumber] ?? 0) + Number(e.debitAmount ?? 0) - Number(e.creditAmount ?? 0));
  const accounts = [...new Set([...Object.keys(expected), ...Object.keys(actual)])].sort();
  const rows = accounts.map((account) => {
    const exp = expected[account] ?? 0;
    const act = actual[account] ?? 0;
    return { account, expected: exp, actual: act, ok: round2(exp - act) === 0 };
  });
  return { rows, ok: rows.every((r) => r.ok) };
}

/** Open customer entries in BC (per posting group) vs the legacy control totals (per receivables account). */
export function reconcileOpenEntries(entries, legacy, customerPostingGroups) {
  const accountOf = Object.fromEntries(customerPostingGroups.map((g) => [g.code, g.receivables]));
  return Object.keys(legacy).map((account) => {
    const migrated = round2(entries.filter((e) => accountOf[e.customerPostingGroup] === account).reduce((s, e) => s + Number(e.remainingAmountLCY), 0));
    return { account, legacy: legacy[account], migrated, difference: round2(migrated - legacy[account]), ok: round2(migrated - legacy[account]) === 0 };
  });
}

/** The fee line the extension must have put under the item line (T1, through the standard API). */
export function checkFeeLine(lines, itemNo, qty, feePerUnit, feeAccount) {
  const item = lines.find((l) => l.lineType === "Item" && l.lineObjectNumber === itemNo);
  const fee = lines.filter((l) => l.lineType === "Account" && l.lineObjectNumber === feeAccount);
  const ok = Boolean(item) && fee.length === 1 && Number(fee[0].quantity) === qty && round2(Number(fee[0].unitPrice)) === feePerUnit && fee[0].sequence > item.sequence;
  return { ok, itemLine: item?.sequence ?? null, feeLines: fee.length, feeQuantity: fee[0]?.quantity ?? null, feeUnitPrice: fee[0]?.unitPrice ?? null };
}
