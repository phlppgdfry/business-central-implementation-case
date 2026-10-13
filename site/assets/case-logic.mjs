// Pure functions behind the workbench and the checks. The site and the tests import the same module,
// so what the demo shows is exactly what CI verifies.

export const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
export const RISK_SCORE = { laag: 1, middel: 3, hoog: 5 };

// The option a requirement uses: the one chosen in `choices` (scenario), else the recorded decision.
export function effective(req, choices = {}) {
  const pick = choices[req.id];
  const option = req.options?.find((o) => (pick ? o.id === pick : o.chosen));
  if (!option) return { classification: req.classification, estimateDays: req.estimateDays, upgradeRisk: req.upgradeRisk, licence: req.licence ?? "geen" };
  return { classification: option.classification, estimateDays: option.estimateDays, upgradeRisk: option.upgradeRisk, licence: option.licence, optionId: option.id };
}

export function countByClassification(caseData, choices = {}) {
  const counts = Object.fromEntries(caseData.classifications.map((c) => [c.id, 0]));
  for (const r of caseData.requirements) counts[effective(r, choices).classification]++;
  return counts;
}

export function scenarioTotals(caseData, choices = {}) {
  let days = 0, risk = 0, licences = 0;
  for (const r of caseData.requirements) {
    const e = effective(r, choices);
    if (e.classification === "buiten-scope") continue;
    days += e.estimateDays;
    risk += e.classification === "extensie" ? RISK_SCORE[e.upgradeRisk] : 0;
    if (e.licence && e.licence !== "geen" && !e.licence.startsWith("zelfde")) licences++;
  }
  const counts = countByClassification(caseData, choices);
  return { days: round2(days), costEur: Math.round(days * caseData.meta.dayRateEur), extensions: counts.extensie, apps: counts.app, upgradeRisk: risk, licences };
}

// "Everything custom": every requirement with an extension option takes it.
export function maximumCustomChoices(caseData) {
  const choices = {};
  for (const r of caseData.requirements) {
    const ext = r.options?.find((o) => o.classification === "extensie");
    if (ext) choices[r.id] = ext.id;
  }
  return choices;
}

const find = (list, pred, what) => {
  const hit = list.find(pred);
  if (!hit) throw new Error(`Ontbrekende instelling: ${what}`);
  return hit;
};

// The journal entries Business Central would create when posting a sales invoice with one item line.
// Simplified on purpose: one line, automatic cost posting on, no discounts, no rounding per VAT identifier.
export function postingPreview(setup, customerNo, itemNo, qty = 1) {
  const cust = find(setup.customers, (c) => c.no === customerNo, `klant ${customerNo}`);
  const item = find(setup.items, (i) => i.no === itemNo, `artikel ${itemNo}`);
  const acc = (no) => ({ no, name: setup.accounts.find((a) => a.no === no)?.name ?? "?" });
  const lines = [];
  const salesLines = [{ genProd: item.genProd, vatProd: item.vatProd, amount: round2(item.unitPrice * qty), label: item.description }];
  // VK-10: the contribution line is added only for deliveries in Belgium.
  if (item.contribution && cust.genBus === "BINNENL") {
    salesLines.push({ genProd: "BIJDRAGE", vatProd: item.vatProd, amount: round2(item.contribution * qty), label: "Verwijderingsbijdrage" });
  }
  const grids = {};
  let vatTotal = 0, netTotal = 0;
  for (const sl of salesLines) {
    const gps = find(setup.generalPostingSetup, (g) => g.bus === cust.genBus && g.prod === sl.genProd, `algemene boekingsinstelling ${cust.genBus} × ${sl.genProd}`);
    const vps = find(setup.vatPostingSetup, (v) => v.bus === cust.vatBus && v.prod === sl.vatProd, `BTW-boekingsinstelling ${cust.vatBus} × ${sl.vatProd}`);
    const vat = vps.calc === "Btw verleggen" ? 0 : round2((sl.amount * vps.pct) / 100);
    lines.push({ ...acc(gps.sales), debit: 0, credit: sl.amount, why: `omzet: algemene boekingsinstelling ${cust.genBus} × ${sl.genProd}` });
    if (vat) lines.push({ ...acc(vps.salesVat), debit: 0, credit: vat, why: `btw ${vps.pct}%: BTW-boekingsinstelling ${cust.vatBus} × ${sl.vatProd}` });
    vatTotal += vat; netTotal += sl.amount;
    grids[vps.salesGrids.base] = round2((grids[vps.salesGrids.base] ?? 0) + sl.amount);
    if (vps.salesGrids.vat) grids[vps.salesGrids.vat] = round2((grids[vps.salesGrids.vat] ?? 0) + vat);
  }
  const cpg = find(setup.customerPostingGroups, (p) => p.code === cust.postingGroup, `klantboekingsgroep ${cust.postingGroup}`);
  const gross = round2(netTotal + vatTotal);
  lines.unshift({ ...acc(cpg.receivables), debit: gross, credit: 0, why: `vordering: klantboekingsgroep ${cust.postingGroup}` });
  if (item.unitCost != null) {
    const gps = find(setup.generalPostingSetup, (g) => g.bus === cust.genBus && g.prod === item.genProd, "kostprijs");
    const inv = find(setup.inventoryPostingSetup, (p) => p.location === cust.location && p.group === item.genProd, `voorraadboekingsinstelling ${cust.location}`);
    const cost = round2(item.unitCost * qty);
    lines.push({ ...acc(gps.cogs), debit: cost, credit: 0, why: "kostprijs verkopen: algemene boekingsinstelling" });
    lines.push({ ...acc(inv.inventory), debit: 0, credit: cost, why: `voorraad: voorraadboekingsinstelling ${cust.location}` });
  }
  const pm = setup.paymentMethods.find((p) => p.code === cust.paymentMethod);
  if (pm?.balancingAccount) {
    lines.push({ ...acc(pm.balancingAccount), debit: gross, credit: 0, why: `betaling direct geboekt: betalingswijze ${pm.code}` });
    lines.push({ ...acc(cpg.receivables), debit: 0, credit: gross, why: "vordering meteen vereffend" });
  }
  const dims = { VESTIGING: cust.location, AFDELING: cust.afdeling };
  const debit = round2(lines.reduce((s, l) => s + l.debit, 0));
  const credit = round2(lines.reduce((s, l) => s + l.credit, 0));
  return { customer: cust, item, lines, grids, dims, totals: { net: round2(netTotal), vat: round2(vatTotal), gross, debit, credit }, balanced: debit === credit };
}

export function parseCsv(text) {
  const [head, ...rows] = text.trim().split("\n");
  const keys = head.split(";");
  return rows.map((r) => Object.fromEntries(r.split(";").map((v, i) => [keys[i], keys[i] === "openstaand_bedrag" || keys[i] === "dagen_voor_cutoff" ? Number(v) : v])));
}

export function reconcile(entries, legacy) {
  return Object.keys(legacy).map((account) => {
    const migrated = round2(entries.filter((e) => e.rekening === account).reduce((s, e) => s + e.openstaand_bedrag, 0));
    return { account, legacy: legacy[account], migrated, difference: round2(migrated - legacy[account]), ok: round2(migrated - legacy[account]) === 0 };
  });
}

export function goNoGo(caseData, reconciliation) {
  const c = caseData.migration.controls;
  const inv = c.inventoryValue;
  const invPct = round2((Math.abs(inv.migrated - inv.legacy) / inv.legacy) * 100);
  const checks = {
    uat: () => caseData.uat.every((u) => u.result.startsWith("geslaagd")),
    defects: () => caseData.defects.every((d) => d.status === "gesloten" || d.severity > 2),
    customerReceivables: () => reconciliation.every((r) => r.ok),
    vendorPayables: () => round2(c.vendorPayables.migrated - c.vendorPayables.legacy) === 0,
    inventoryValue: () => invPct < inv.tolerancePct,
    migrationSuspense: () => c.migrationSuspense.balanceAfter === 0,
  };
  return caseData.goNoGo.map((g) => ({ ...g, ok: g.check === "manual" ? g.status === "ok" : checks[g.check]() }));
}

export function inventoryDeviationPct(caseData) {
  const inv = caseData.migration.controls.inventoryValue;
  return round2((Math.abs(inv.migrated - inv.legacy) / inv.legacy) * 100);
}

// Consistency rules for the fit-gap register and the trace from workshop to test. Returns a list of problems.
export function traceProblems(caseData) {
  const problems = [];
  const ids = new Set(caseData.requirements.map((r) => r.id));
  const classes = new Set(caseData.classifications.map((c) => c.id));
  const workshops = new Set(caseData.workshops.map((w) => w.id));
  const settings = new Set(caseData.setup.settings.map((s) => s.id));
  const migrations = new Set(caseData.migration.objects.map((m) => m.id));
  const tested = new Set(caseData.uat.flatMap((u) => u.reqs));
  for (const r of caseData.requirements) {
    const p = (msg) => problems.push(`${r.id}: ${msg}`);
    if (!classes.has(r.classification)) p(`onbekende classificatie ${r.classification}`);
    if (!workshops.has(r.source)) p(`bron ${r.source} bestaat niet`);
    if (!r.decider) p("geen beslisser");
    if (r.decision !== "beslist") p("nog geen beslissing");
    if (!(r.estimateDays >= 0)) p("geen inschatting");
    if (r.fit === "fit" && ["extensie", "procesaanpassing", "buiten-scope"].includes(r.classification)) p("fit maar opgelost als gap");
    if (r.fit === "gap" && ["standaard", "configuratie"].includes(r.classification)) p("gap maar geclassificeerd als standaard/configuratie");
    for (const s of r.setupRefs ?? []) if (!settings.has(s)) p(`instelling ${s} bestaat niet`);
    for (const m of r.migrationRefs ?? []) if (!migrations.has(m)) p(`migratieobject ${m} bestaat niet`);
    if (r.options) {
      const chosen = r.options.filter((o) => o.chosen);
      if (chosen.length !== 1) p("opties zonder precies één gekozen optie");
      else if (chosen[0].classification !== r.classification || chosen[0].estimateDays !== r.estimateDays) p("gekozen optie wijkt af van de classificatie of inschatting");
    }
    if (r.classification === "extensie" && !(r.spec && r.adr)) p("extensie zonder spec of ADR");
    if (r.classification === "buiten-scope") {
      if (!r.noTestReason) p("buiten scope zonder reden");
    } else if (!tested.has(r.id) && !(r.migrationRefs?.length)) p("geen UAT-scenario en geen migratiecontrole");
  }
  for (const u of caseData.uat) for (const r of u.reqs) if (!ids.has(r)) problems.push(`${u.id}: requirement ${r} bestaat niet`);
  for (const h of caseData.hypercare) if (!ids.has(h.req)) problems.push(`${h.id}: requirement ${h.req} bestaat niet`);
  for (const d of caseData.defects) if (!caseData.uat.some((u) => u.id === d.uat)) problems.push(`${d.id}: UAT ${d.uat} bestaat niet`);
  for (const cr of caseData.changeRequests) if (!ids.has(cr.req)) problems.push(`${cr.id}: requirement ${cr.req} bestaat niet`);
  return problems;
}

export function hypercareByCategory(caseData) {
  const out = {};
  for (const h of caseData.hypercare) out[h.category] = (out[h.category] ?? 0) + 1;
  return out;
}
