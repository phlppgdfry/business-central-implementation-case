// Builds and checks the Kalvaert case in a real Business Central sandbox, through the APIs only.
//
//   node bc/scripts/sandbox.mjs status     environment, company, installed Kalvaert apps
//   node bc/scripts/sandbox.mjs publish    upload the three .app files from bc/out (automation API)
//   node bc/scripts/sandbox.mjs setup      apply the solution design (custom API action applySetup)
//   node bc/scripts/sandbox.mjs migrate    prepare + post the opening entries, reconcile with the legacy export
//   node bc/scripts/sandbox.mjs verify     T1 + T8 through the standard API: order → fee line → post → G/L = model
//   node bc/scripts/sandbox.mjs tests      run test codeunit 50150 with the AL CLI (al runtests)
//   node bc/scripts/sandbox.mjs all        everything above, then writes bc/VERIFICATION.md
//
// Connection (environment variables, or bc/sandbox.local.json which git ignores):
//   BC_TENANT       tenant id or domain            BC_ENVIRONMENT  sandbox name (default kalvaert-dev)
//   BC_COMPANY      company name (default KALVAERT)
// Token, first that works: BC_TOKEN · client credentials (BC_CLIENT_ID + BC_CLIENT_SECRET, an Entra app
// registered in BC under "Microsoft Entra Applications") · `az account get-access-token` of the signed-in user.
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import * as L from "../../site/assets/case-logic.mjs";
import { compareLedger, reconcileOpenEntries, checkFeeLine } from "./verify-lib.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const local = existsSync(join(root, "bc/sandbox.local.json")) ? JSON.parse(readFileSync(join(root, "bc/sandbox.local.json"), "utf8")) : {};
const cfg = {
  tenant: process.env.BC_TENANT ?? local.tenant,
  environment: process.env.BC_ENVIRONMENT ?? local.environment ?? "kalvaert-dev",
  company: process.env.BC_COMPANY ?? local.company ?? "KALVAERT",
};
if (!cfg.tenant) {
  console.error("Set BC_TENANT (or bc/sandbox.local.json). See bc/README.md.");
  process.exit(2);
}
const caseData = JSON.parse(readFileSync(join(root, "data/case.json"), "utf8"));
const API = `https://api.businesscentral.dynamics.com/v2.0/${cfg.tenant}/${cfg.environment}/api`;
const results = [];
const record = (step, ok, detail) => { results.push({ step, ok, detail }); console.log(`${ok ? "✓" : "✗"} ${step} — ${detail}`); };

let token;
async function getToken() {
  if (token) return token;
  if (process.env.BC_TOKEN) return (token = process.env.BC_TOKEN);
  if (process.env.BC_CLIENT_ID && process.env.BC_CLIENT_SECRET) {
    const res = await fetch(`https://login.microsoftonline.com/${cfg.tenant}/oauth2/v2.0/token`, {
      method: "POST",
      body: new URLSearchParams({ grant_type: "client_credentials", client_id: process.env.BC_CLIENT_ID, client_secret: process.env.BC_CLIENT_SECRET, scope: "https://api.businesscentral.dynamics.com/.default" }),
    });
    const json = await res.json();
    if (!json.access_token) throw new Error(`token: ${json.error_description ?? res.status}`);
    return (token = json.access_token);
  }
  return (token = execFileSync("az", ["account", "get-access-token", "--tenant", cfg.tenant, "--resource", "https://api.businesscentral.dynamics.com", "--query", "accessToken", "-o", "tsv"], { encoding: "utf8" }).trim());
}

async function call(method, url, body, headers = {}) {
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${await getToken()}`, ...(body && !(body instanceof Uint8Array) ? { "Content-Type": "application/json" } : {}), ...headers },
    body: body instanceof Uint8Array ? body : body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${url.replace(API, "")}: HTTP ${res.status} ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
}
async function all(url) {
  const out = [];
  for (let next = url; next; ) {
    const page = await call("GET", next);
    out.push(...page.value);
    next = page["@odata.nextLink"];
  }
  return out;
}

let companyId;
async function company() {
  if (companyId) return companyId;
  const list = await all(`${API}/v2.0/companies`);
  const hit = list.find((c) => c.name === cfg.company);
  if (!hit) throw new Error(`company "${cfg.company}" not found (found: ${list.map((c) => c.name).join(", ")}). Create it with "Create New Company" → "Production - Setup Data Only".`);
  return (companyId = hit.id);
}
const std = async (path) => `${API}/v2.0/companies(${await company()})/${path}`;
const klv = async (path) => `${API}/kalvaert/implementation/v1.0/companies(${await company()})/${path}`;
const automation = async (path) => `${API}/microsoft/automation/v2.0/companies(${await company()})/${path}`;

async function status() {
  const id = await company();
  const apps = await all(await automation("extensions?$filter=publisher eq 'Kalvaert Portfolio Case'"));
  record("status", true, `environment ${cfg.environment}, company ${cfg.company} (${id}); Kalvaert apps: ${apps.map((a) => `${a.displayName} ${a.versionMajor}.${a.versionMinor} ${a.isInstalled ? "installed" : "not installed"}`).join("; ") || "none"}`);
}

async function publish() {
  const outDir = join(root, "bc/out");
  for (const name of ["Kalvaert Removal Fee", "Kalvaert Demo Setup", "Kalvaert Removal Fee Tests"]) {
    const file = readdirSync(outDir).find((f) => f.includes(`_${name}_`) && f.endsWith(".app"));
    if (!file) throw new Error(`${name}: no .app in bc/out — run node bc/scripts/compile.mjs first`);
    const upload = await call("POST", await automation("extensionUpload"), { schedule: "Current version", schemaSyncMode: "Add" });
    const id = upload.systemId ?? upload.id;
    await call("PATCH", await automation(`extensionUpload(${id})/extensionContent`), new Uint8Array(readFileSync(join(outDir, file))), { "Content-Type": "application/octet-stream", "If-Match": "*" });
    await call("POST", await automation(`extensionUpload(${id})/Microsoft.NAV.upload`));
    let state = "InProgress";
    for (let i = 0; i < 60 && state === "InProgress"; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const deployments = await all(await automation("extensionDeploymentStatus"));
      state = deployments.find((d) => d.name === name)?.status ?? "InProgress";
    }
    record(`publish ${name}`, state === "Completed", `deployment ${state}`);
  }
}

async function demoSetupRecord() {
  const list = await all(await klv("demoSetups"));
  return list[0];
}
async function setup() {
  const before = await demoSetupRecord();
  await call("POST", await klv(`demoSetups(${before.id})/Microsoft.NAV.applySetup`));
  const after = await demoSetupRecord();
  record("setup", after.setupRecords > 0, `${after.setupRecords} setup records, data version ${after.dataVersion}`);
}

async function migrate() {
  const run = await demoSetupRecord();
  if (!run.migrationPostedAt || run.migrationPostedAt.startsWith("0001")) {
    await call("POST", await klv(`demoSetups(${run.id})/Microsoft.NAV.prepareMigration`));
    await call("POST", await klv(`demoSetups(${run.id})/Microsoft.NAV.postMigration`));
  }
  const entries = await all(await klv("openCustomerEntries"));
  const ctl = caseData.migration.controls.customerReceivablesAtCutoff;
  const rec = reconcileOpenEntries(entries, ctl.legacy, caseData.setup.customerPostingGroups);
  for (const r of rec) record(`migration ${r.account}`, r.ok, `legacy €${r.legacy} · BC €${r.migrated} · difference €${r.difference}`);
  const suspense = await all(await std(`generalLedgerEntries?$filter=accountNumber eq '${caseData.migration.controls.migrationSuspense.account}'`));
  const balance = L.round2(suspense.reduce((s, e) => s + Number(e.debitAmount) - Number(e.creditAmount), 0));
  const expected = -L.round2(Object.values(ctl.legacy).reduce((s, v) => s + v, 0));
  record("suspense 499000 after the customer journal", balance === expected, `€${balance}; expected −(receivables) = €${expected} until the opening balance (MIG-08) clears it to 0`);
}

async function verify() {
  const preview = L.postingPreview(caseData.setup, "K10023", "A-220318", 2);
  const order = await call("POST", await std("salesOrders"), { customerNumber: "K10023" });
  await call("POST", await std(`salesOrders(${order.id})/salesOrderLines`), { lineType: "Item", lineObjectNumber: "A-220318", quantity: 2 });
  const lines = await all(await std(`salesOrders(${order.id})/salesOrderLines`));
  const fee = checkFeeLine(lines, "A-220318", 2, 3.5, "700900");
  record("T1 via the standard API", fee.ok, `order ${order.number}: ${fee.feeLines} fee line(s), quantity ${fee.feeQuantity}, unit price ${fee.feeUnitPrice}`);
  await call("POST", await std(`salesOrders(${order.id})/Microsoft.NAV.shipAndInvoice`));
  const invoices = await all(await std(`salesInvoices?$filter=orderNumber eq '${order.number}'`));
  const invoice = invoices[0];
  const gl = await all(await std(`generalLedgerEntries?$filter=documentNumber eq '${invoice.number}'`));
  const cmp = compareLedger(preview, gl);
  record("T8 G/L = posting matrix", cmp.ok, `invoice ${invoice.number}: ${cmp.rows.map((r) => `${r.account} ${r.actual}${r.ok ? "" : ` (model ${r.expected})`}`).join(", ")}`);
  return { order: order.number, invoice: invoice.number, ledger: cmp.rows };
}

function tests() {
  const cli = process.env.AL_CLI ?? "al";
  const res = spawnSync(cli, ["runtests", "50150", "--environmentname", cfg.environment, "--environmenttype", "Sandbox", "--tenant", cfg.tenant, "--company", cfg.company], { encoding: "utf8" });
  if (res.error) return record("AL tests", false, `AL CLI not available (${res.error.code}); install it, then: ${cli} auth login`);
  let parsed;
  try { parsed = JSON.parse(res.stdout); } catch { parsed = null; }
  const methods = parsed ? JSON.stringify(parsed).match(/"(?:result|outcome)":"(\w+)"/gi) ?? [] : [];
  const passed = methods.filter((m) => /pass|success/i.test(m)).length;
  record("AL tests (codeunit 50150)", res.status === 0, parsed ? `${passed}/${methods.length} passed` : res.stdout.slice(0, 400) || res.stderr.slice(0, 400));
}

function writeReport(extra) {
  const now = new Date().toISOString().slice(0, 16).replace("T", " ");
  const md = `# Verificatie in Business Central

> Gegenereerd door \`node bc/scripts/sandbox.mjs all\` op ${now} UTC. Omgeving \`${cfg.environment}\` (sandbox), bedrijf \`${cfg.company}\`. Fictieve data; een sandbox, geen productie.

| Stap | Resultaat | Detail |
|---|---|---|
${results.map((r) => `| ${r.step} | ${r.ok ? "✓" : "✗"} | ${String(r.detail).replaceAll("|", "\\|")} |`).join("\n")}
${extra?.ledger ? `\n## Boeking van ${extra.invoice} (order ${extra.order}) tegen de boekingsmatrix\n\n| Rekening | Model (workbench) | Business Central | |\n|---|---:|---:|---|\n${extra.ledger.map((r) => `| ${r.account} | ${r.expected} | ${r.actual} | ${r.ok ? "✓" : "✗"} |`).join("\n")}\n` : ""}`;
  writeFileSync(join(root, "bc/VERIFICATION.md"), md);
  console.log("→ bc/VERIFICATION.md");
}

const cmd = process.argv[2] ?? "status";
const steps = { status, publish, setup, migrate, verify, tests };
try {
  if (cmd === "all") {
    await status(); await publish(); await setup(); await migrate();
    const extra = await verify(); tests(); writeReport(extra);
  } else if (steps[cmd]) await steps[cmd]();
  else { console.error(`unknown command ${cmd}`); process.exit(2); }
} catch (e) {
  record(cmd, false, e.message);
  if (cmd === "all") writeReport();
  process.exit(1);
}
process.exit(results.every((r) => r.ok) ? 0 : 1);
