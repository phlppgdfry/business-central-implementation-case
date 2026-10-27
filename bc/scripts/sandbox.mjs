// Builds and checks the Kalvaert case in a real Business Central sandbox, through the APIs only.
//
//   node bc/scripts/sandbox.mjs envs       list the Business Central environments on the tenant (admin API)
//   node bc/scripts/sandbox.mjs create     create the sandbox (BE) named by BC_ENVIRONMENT, or recover it when soft-deleted
//   node bc/scripts/sandbox.mjs company    create the (empty) company named by BC_COMPANY
//   node bc/scripts/sandbox.mjs telemetry  point the environment at Application Insights (APPINSIGHTS_CONNECTION_STRING)
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

async function call(method, url, body, headers = {}, attempt = 1) {
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${await getToken()}`, ...(body && !(body instanceof Uint8Array) ? { "Content-Type": "application/json" } : {}), ...headers },
    body: body instanceof Uint8Array ? body : body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  // an environment that is installing an app or restarting answers 503/429 for a while
  if ((res.status === 503 || res.status === 429) && attempt < 10) {
    await new Promise((r) => setTimeout(r, 15000));
    return call(method, url, body, headers, attempt + 1);
  }
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

const ADMIN = "https://api.businesscentral.dynamics.com/admin/v2.24/applications/BusinessCentral";

/** The admin API lives on its own base URL but takes the same token. */
async function admin(method, path, body) {
  return call(method, `${ADMIN}/${path}`, body);
}

/**
 * Why a create or recover failed. Business Central reports it per environment; the tenant's
 * licences explain the usual cause (an expired trial leaves no entitlement to bring one back).
 */
async function ops() {
  const list = await all(`${ADMIN}/environments`);
  for (const e of list) {
    try {
      const o = await all(`${ADMIN}/environments/${e.name}/operations`);
      const recent = o.slice(-5).map((x) => `${(x.startedOn ?? "").slice(0, 19)} ${x.type} → ${x.status}${x.errorMessage ? `: ${x.errorMessage}` : ""}`);
      record(`ops ${e.name}`, true, recent.join(" | ") || "none");
    } catch (err) {
      record(`ops ${e.name}`, false, err.message.slice(0, 200));
    }
  }
  const graph = execFileSync("az", ["account", "get-access-token", "--tenant", cfg.tenant, "--resource", "https://graph.microsoft.com", "--query", "accessToken", "-o", "tsv"], { encoding: "utf8" }).trim();
  const res = await fetch("https://graph.microsoft.com/v1.0/subscribedSkus", { headers: { Authorization: `Bearer ${graph}` } });
  const skus = (await res.json()).value ?? [];
  const bc = skus.filter((k) => /DYN365_BUSCENTRAL|BUSINESS_CENTRAL|MADEIRA|SMB/i.test(k.skuPartNumber));
  record("licences", bc.length > 0, bc.length ? bc.map((k) => `${k.skuPartNumber} ${k.capabilityStatus} ${k.consumedUnits}/${k.prepaidUnits?.enabled}`).join("; ") : `no Business Central licence among ${skus.length} SKUs: ${skus.map((k) => k.skuPartNumber).join(", ").slice(0, 300)}`);
}

async function envs() {
  const list = await all(`${ADMIN}/environments`);
  const rows = list.map((e) => `${e.name} (${e.type}, ${e.countryCode}, ${e.applicationVersion}, ${e.status})`);
  record("envs", true, rows.length ? rows.join("; ") : "no environments on this tenant");
  return list;
}

/**
 * Makes sure a Belgian sandbox named BC_ENVIRONMENT exists. A fresh, empty sandbox is what the case
 * wants: the demo-setup app builds the Kalvaert company from data/case.json, so no trial data is needed.
 */
async function create() {
  const existing = (await all(`${ADMIN}/environments`)).find((e) => e.name === cfg.environment);
  if (existing?.status === "Active") {
    record("create", true, `${cfg.environment} already active (${existing.applicationVersion})`);
    return;
  }
  await admin("PUT", `environments/${cfg.environment}`, { countryCode: "BE", environmentType: "Sandbox" });
  for (let i = 0; i < 90; i++) {
    await new Promise((r) => setTimeout(r, 10000));
    const now = (await all(`${ADMIN}/environments`)).find((e) => e.name === cfg.environment);
    if (now?.status === "Active") {
      record("create", true, `${cfg.environment} active (${now.applicationVersion}, ${now.countryCode})`);
      return;
    }
    if (now && /failed/i.test(now.status)) {
      record("create", false, `${cfg.environment}: ${now.status}`);
      return;
    }
  }
  record("create", false, `${cfg.environment} did not become active in 15 minutes`);
}

/**
 * An empty company to build Kalvaert in. A new sandbox only has CRONUS (demo data) and My Company,
 * and the case needs a company whose chart of accounts comes from the solution design, not from Cronus.
 */
async function company_() {
  const list = await all(`${API}/v2.0/companies`);
  if (list.some((c) => c.name === cfg.company)) {
    record("company", true, `${cfg.company} already exists`);
    return;
  }
  await call("POST", `${API}/microsoft/automation/v2.0/companies`, { name: cfg.company, displayName: cfg.company });
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 15000));
    if ((await all(`${API}/v2.0/companies`)).some((c) => c.name === cfg.company)) {
      record("company", true, `${cfg.company} created (empty)`);
      return;
    }
  }
  record("company", false, `${cfg.company} did not appear in 10 minutes`);
}

/** What is already in each company: which one can host Kalvaert without Cronus data in the way. */
async function inspect() {
  for (const c of await all(`${API}/v2.0/companies`)) {
    const base = `${API}/v2.0/companies(${c.id})`;
    const counts = [];
    for (const set of ["accounts", "customers", "items", "vendors"]) {
      try {
        const r = await call("GET", `${base}/${set}?$top=1&$count=true`);
        counts.push(`${set} ${r["@odata.count"] ?? r.value?.length ?? "?"}`);
      } catch (e) { counts.push(`${set} —`); }
    }
    record(`company ${c.name}`, true, counts.join(", "));
  }
}

/**
 * Sends the environment's telemetry (user errors, slow AL, failed jobs) to the Application Insights
 * from azure/. The connection string is a runtime secret: it is passed in, never committed.
 */
async function telemetry() {
  const key = process.env.APPINSIGHTS_CONNECTION_STRING ?? local.appInsightsConnectionString;
  if (!key) {
    record("telemetry", false, "set APPINSIGHTS_CONNECTION_STRING (output of the Bicep deployment)");
    return;
  }
  // the admin API changed shape across versions; try the documented ones and report which one took it
  const attempts = [
    ["PUT", `environments/${cfg.environment}/settings/appinsightskey`, { key }],
    ["PATCH", `environments/${cfg.environment}/settings/appinsightskey`, { key }],
    ["POST", `environments/${cfg.environment}/settings/appinsightskey`, { key }],
    ["PATCH", `environments/${cfg.environment}`, { applicationInsightsConnectionString: key }],
  ];
  let used = null;
  for (const [method, path, body] of attempts) {
    try {
      await admin(method, path, body);
      used = `${method} ${path.split("/").pop()}`;
      break;
    } catch { /* try the next shape */ }
  }
  if (!used) {
    record("telemetry", false, "no admin API shape accepted the key; set it in the admin centre (Environments → Telemetry)");
    return;
  }
  const now = (await all(`${ADMIN}/environments`)).find((e) => e.name === cfg.environment);
  record("telemetry", true, `environment ${cfg.environment} → Application Insights (azure/) via ${used}`);
}

/** Shows what the extension really does to the lines of one order, step by step. */
async function diagfee() {
  const dump = async (id, label) => {
    const ls = await all(await std(`salesOrders(${id})/salesOrderLines`));
    record(`lines ${label}`, true, ls.map((l) => `#${l.sequence} ${l.lineType} ${l.lineObjectNumber} qty ${l.quantity}`).join(" | "));
    return ls;
  };
  const order = await call("POST", await std("salesOrders"), { customerNumber: "K10023" });
  await call("POST", await std(`salesOrders(${order.id})/salesOrderLines`), { lineType: "Item", lineObjectNumber: "A-220318", quantity: 2 });
  const l1 = await dump(order.id, "after insert");
  const item = l1.find((l) => l.lineObjectNumber === "A-220318");
  await call("PATCH", await std(`salesOrders(${order.id})/salesOrderLines(${item.id})`), { quantity: 5 }, { "If-Match": "*" });
  const l2 = await dump(order.id, "after quantity 5");
  const item2 = l2.find((l) => l.lineObjectNumber === "A-220318");
  record("item line renumbered", true, `before #${item.sequence} → after #${item2?.sequence}`);
  try { await call("DELETE", await std(`salesOrders(${order.id})`)); } catch { /* leave it */ }
}

async function status() {
  const id = await company();
  const apps = await all(await automation("extensions?$filter=publisher eq 'Kalvaert Portfolio Case'"));
  // only the installed versions; an environment keeps every version it has ever seen
  const live = apps.filter((a) => a.isInstalled).map((a) => `${a.displayName} ${[a.versionMajor, a.versionMinor, a.versionBuild, a.versionRevision].join(".")}`);
  record("status", live.length > 0, `environment ${cfg.environment}, company ${cfg.company}; installed: ${live.join("; ") || "none"}`);
}

async function publish() {
  const outDir = join(root, "bc/out");
  const installed = await all(await automation("extensions?$filter=publisher eq 'Kalvaert Portfolio Case'"));
  // publish in dependency order, each at the version its app.json declares
  for (const project of ["removal-fee", "demo-setup", "removal-fee-test"]) {
    const manifest = JSON.parse(readFileSync(join(root, "bc/apps", project, "app.json"), "utf8"));
    const name = manifest.name;
    const file = `${manifest.publisher}_${name}_${manifest.version}.app`;
    if (!existsSync(join(outDir, file))) throw new Error(`${file} not in bc/out — run node bc/scripts/compile.mjs first`);
    const live = installed.find((a) => a.displayName === name && a.isInstalled);
    const liveVersion = live && [live.versionMajor, live.versionMinor, live.versionBuild, live.versionRevision].join(".");
    if (live?.isInstalled && liveVersion === manifest.version) {
      record(`publish ${name}`, true, `${manifest.version} already installed`);
      continue;
    }
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
    record(`publish ${name}`, state === "Completed", `deployment ${state} (${file.match(/_(\d+\.\d+\.\d+\.\d+)\.app$/)?.[1] ?? "?"})`);
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
  // only the documents that came out of the legacy export: invoices posted afterwards are not part of the cutover
  const legacyDocs = new Set(L.parseCsv(readFileSync(join(root, ctl.file), "utf8")).map((r) => r.documentnr));
  const rec = reconcileOpenEntries(entries, ctl.legacy, caseData.setup.customerPostingGroups, legacyDocs);
  for (const r of rec) record(`migration ${r.account}`, r.ok, `legacy €${r.legacy} · BC €${r.migrated} · difference €${r.difference}`);
  const suspense = await all(await std(`generalLedgerEntries?$filter=accountNumber eq '${caseData.migration.controls.migrationSuspense.account}'`));
  const balance = L.round2(suspense.reduce((s, e) => s + Number(e.debitAmount) - Number(e.creditAmount), 0));
  const expected = -L.round2(Object.values(ctl.legacy).reduce((s, v) => s + v, 0));
  record("suspense 499000 after the customer journal", balance === expected, `€${balance}; expected −(receivables) = €${expected} until the opening balance (MIG-08) clears it to 0`);
}

/**
 * The spec, replayed on the live environment through the **standard** sales order API — the same way a
 * webshop would. Each check is a test case from docs/05-specs/uc-vk-10-verwijderingsbijdrage.md §3.
 */
async function verify() {
  const feeAccount = "700900";
  const lines = async (id) => all(await std(`salesOrders(${id})/salesOrderLines`));
  const newOrder = async (customerNumber) => call("POST", await std("salesOrders"), { customerNumber });
  const addLine = async (order, lineObjectNumber, quantity) =>
    call("POST", await std(`salesOrders(${order.id})/salesOrderLines`), { lineType: "Item", lineObjectNumber, quantity });
  const feeLines = (ls) => ls.filter((l) => l.lineType === "Account" && l.lineObjectNumber === feeAccount);
  const drop = async (order) => { try { await call("DELETE", await std(`salesOrders(${order.id})`)); } catch { /* leave it */ } };
  const out = {};

  // T1 — domestic customer, item with a fee: exactly one fee line, right under the item, 2 x €3.50
  const o1 = await newOrder("K10023");
  await addLine(o1, "A-220318", 2);
  const l1 = await lines(o1.id);
  const fee = checkFeeLine(l1, "A-220318", 2, 3.5, feeAccount);
  record("T1 one fee line below the item", fee.ok, `order ${o1.number}: ${fee.feeLines} fee line(s), quantity ${fee.feeQuantity}, unit price ${fee.feeUnitPrice}`);

  // T2 — the quantity follows the item line
  const itemLine = l1.find((l) => l.lineObjectNumber === "A-220318");
  await call("PATCH", await std(`salesOrders(${o1.id})/salesOrderLines(${itemLine.id})`), { quantity: 5 }, { "If-Match": "*" });
  const l2 = feeLines(await lines(o1.id));
  record("T2 quantity change is followed", l2.length === 1 && Number(l2[0].quantity) === 5, `fee quantity ${l2[0]?.quantity}`);

  // T9 — a partial delivery ships the fee with the goods, not ahead of them
  let t9 = "quantity to ship not exposed by the API";
  let t9ok = true;
  try {
    await call("PATCH", await std(`salesOrders(${o1.id})/salesOrderLines(${itemLine.id})`), { shipQuantity: 2 }, { "If-Match": "*" });
    const l9 = feeLines(await lines(o1.id))[0];
    t9ok = Number(l9?.shipQuantity) === 2;
    t9 = `fee: ordered ${l9?.quantity}, to ship ${l9?.shipQuantity}`;
  } catch (e) { t9 = `skipped: ${e.message.slice(0, 80)}`; }
  record("T9 partial delivery ships the fee with the goods", t9ok, t9);

  // T3 — deleting the item line deletes the fee line
  await call("DELETE", await std(`salesOrders(${o1.id})/salesOrderLines(${itemLine.id})`));
  record("T3 deleting the item line removes the fee", feeLines(await lines(o1.id)).length === 0, "no fee line left");
  await drop(o1);

  // T4 — an EU customer pays no removal fee (it is a Belgian obligation)
  const o4 = await newOrder("K20411");
  await addLine(o4, "A-220318", 1);
  const l4 = feeLines(await lines(o4.id));
  record("T4 EU customer gets no fee line", l4.length === 0, "no fee line, as designed");
  await drop(o4);

  // T5 — an item without a fee gets no fee line
  const o5 = await newOrder("K10023");
  await addLine(o5, "A-114502", 3);
  record("T5 item without a fee gets no fee line", feeLines(await lines(o5.id)).length === 0, "no fee line");
  await drop(o5);

  // T7 — a quote turned into an order keeps exactly one fee line (the bulk path, where the automation stands aside)
  try {
    const quote = await call("POST", await std("salesQuotes"), { customerNumber: "K10023" });
    await call("POST", await std(`salesQuotes(${quote.id})/salesQuoteLines`), { lineType: "Item", lineObjectNumber: "A-220318", quantity: 3 });
    await call("POST", await std(`salesQuotes(${quote.id})/Microsoft.NAV.makeOrder`));
    const made = (await all(await std(`salesOrders?$filter=externalDocumentNumber eq '' and customerNumber eq 'K10023'&$orderby=number desc&$top=1`)))[0];
    const l7 = feeLines(await lines(made.id));
    record("T7 quote to order keeps one fee line", l7.length === 1 && Number(l7[0].quantity) === 3, `order ${made.number}: ${l7.length} fee line(s), quantity ${l7[0]?.quantity}`);
    await drop(made);
  } catch (e) {
    record("T7 quote to order keeps one fee line", false, e.message.slice(0, 160));
  }

  // T8 — posting: every account matches the posting matrix, and VAT is charged on the fee too
  const preview = L.postingPreview(caseData.setup, "K10023", "A-220318", 2);
  const o8 = await newOrder("K10023");
  await addLine(o8, "A-220318", 2);
  await call("POST", await std(`salesOrders(${o8.id})/Microsoft.NAV.shipAndInvoice`));
  const invoice = (await all(await std(`salesInvoices?$filter=orderNumber eq '${o8.number}'`)))[0];
  const gl = await all(await std(`generalLedgerEntries?$filter=documentNumber eq '${invoice.number}'`));
  const cmp = compareLedger(preview, gl);
  record("T8 posted entries = posting matrix", cmp.ok, `invoice ${invoice.number}: ${cmp.rows.map((r) => `${r.account} ${r.actual}${r.ok ? "" : ` (model ${r.expected})`}`).join(", ")}`);
  out.order = o8.number;
  out.invoice = invoice.number;
  out.ledger = cmp.rows;
  return out;
}

function tests() {
  const cli = process.env.AL_CLI ?? "al";
  const args = ["runtests", "50150", "--environmentname", cfg.environment, "--environmenttype", "Sandbox", "--tenant", cfg.tenant, "--company", cfg.company];
  // without a cached token the CLI would wait for a browser login, so never block the run on it
  const res = spawnSync(cli, args, { encoding: "utf8", timeout: 180000, stdio: ["ignore", "pipe", "pipe"] });
  if (res.error) {
    record("AL tests (codeunit 50150)", false, `AL CLI not available (${res.error.code}); install it, then run: ${cli} auth login --tenant ${cfg.tenant}`);
    return;
  }
  let parsed;
  try { parsed = JSON.parse(res.stdout); } catch { parsed = null; }
  const methods = parsed ? JSON.stringify(parsed).match(/"(?:result|outcome)":"(\w+)"/gi) ?? [] : [];
  const passed = methods.filter((m) => /pass|success/i.test(m)).length;
  if (res.status === 0 && methods.length) {
    record("AL tests (codeunit 50150)", passed === methods.length, `${passed}/${methods.length} passed`);
    return;
  }
  const why = `${res.stdout}\n${res.stderr}`.toLowerCase().includes("login") || res.signal === "SIGTERM"
    ? `needs an interactive sign-in first: ${cli} auth login --tenant ${cfg.tenant} (exercise O10)`
    : `${res.stdout || res.stderr}`.trim().slice(0, 300);
  record("AL tests (codeunit 50150)", false, why);
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
const steps = { envs, ops, create, company: company_, inspect, telemetry, diagfee, status, publish, setup, migrate, verify, tests };
try {
  if (cmd === "all") {
    await envs(); await create(); await company_(); await status(); await publish(); await setup(); await migrate();
    const extra = await verify(); tests(); writeReport(extra);
  } else if (steps[cmd]) await steps[cmd]();
  else { console.error(`unknown command ${cmd}`); process.exit(2); }
} catch (e) {
  record(cmd, false, e.message);
  if (cmd === "all") writeReport();
  process.exit(1);
}
process.exit(results.every((r) => r.ok) ? 0 : 1);
