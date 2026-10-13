// Generates the synthetic open customer entries used by the migration reconciliation.
// Deterministic (fixed seed), so the CSV files and every number derived from them are reproducible.
// Run: node scripts/generate-seed.mjs   (rewrites data/migration/klantposten-export-v1.csv and -v2.csv)
import { writeFileSync } from "node:fs";

let state = 20261013;
const rand = () => ((state = (state * 1103515245 + 12345) % 2147483648) / 2147483648);
const cents = (n) => Math.round(n * 100) / 100;

const domestic = Array.from({ length: 24 }, (_, i) => `K1${String(23 + i * 37).padStart(4, "0")}`);
const foreign = ["K20411", "K20418", "K30007"];
const header = "documenttype;documentnr;klantnr;rekening;dagen_voor_cutoff;openstaand_bedrag";

const rows = [];
let inv = 26118;
for (const customer of [...domestic, ...foreign]) {
  const n = 1 + Math.floor(rand() * 2);
  for (let k = 0; k < n; k++) {
    const amount = cents(180 + rand() * 9800);
    rows.push(["Factuur", `VF-${inv++}`, customer, customer.startsWith("K1") ? "400000" : "400100", 5 + Math.floor(rand() * 80), amount]);
  }
}
rows.push(["Creditnota", "CN-0398", "K10208", "400000", 21, -312.4]);
const late = ["Creditnota", "CN-0412", "K10171", "400000", 0, -1586.4]; // booked at 16:40 on cut-off day, after export v1

const toCsv = (list) => [header, ...list.map((r) => r.map((v, i) => (i === 5 ? v.toFixed(2) : v)).join(";"))].join("\n") + "\n";
writeFileSync("data/migration/klantposten-export-v1.csv", toCsv(rows));
writeFileSync("data/migration/klantposten-export-v2.csv", toCsv([...rows, late]));
const sum = (list) => cents(list.reduce((s, r) => s + r[5], 0));
console.log(`v1: ${rows.length} posten, ${sum(rows).toFixed(2)} · v2: ${rows.length + 1} posten, ${sum([...rows, late]).toFixed(2)}`);
