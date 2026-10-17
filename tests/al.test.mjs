// The Business Central apps: object ids in range, every spec test case automated, generated setup = case data.
// Compiling against the real symbols is done by bc/scripts/compile.mjs (CI job "al"); this checks what node can check.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { caseData, v2, read } from "./helpers.mjs";
import { enterpriseNo, validEnterpriseNo, customerList, NEW_CUSTOMER_CREDIT_LIMIT } from "../scripts/al-gen.mjs";

const apps = ["removal-fee", "demo-setup", "removal-fee-test"];
const files = (app) => readdirSync(join("bc/apps", app, "src"), { recursive: true }).map(String).filter((f) => f.endsWith(".al")).map((f) => readFileSync(join("bc/apps", app, "src", f), "utf8"));
const manifest = (app) => JSON.parse(readFileSync(join("bc/apps", app, "app.json"), "utf8"));
const OBJECT = /^(table|tableextension|page|pageextension|codeunit|permissionset|permissionsetextension|query|report|enum|enumextension)\s+(\d+)\s+"([^"]+)"/gm;

test("every AL object id lies in its app's id range, ids and names are unique, names carry the KLV affix", () => {
  const seen = new Map();
  for (const app of apps) {
    const { idRanges } = manifest(app);
    for (const text of files(app)) {
      for (const [, type, id, name] of text.matchAll(OBJECT)) {
        assert.ok(idRanges.some((r) => +id >= r.from && +id <= r.to), `${app}: ${type} ${id} outside ${JSON.stringify(idRanges)}`);
        assert.ok(name.startsWith("KLV "), `${type} ${id} "${name}" without the KLV affix`);
        const key = `${type} ${id}`; // extensions have their own id space
        assert.ok(!seen.has(key), `${key} used twice`);
        seen.set(key, name);
        assert.ok(name.length <= 30, `${name} longer than 30 characters`);
      }
    }
  }
});

test("dependencies point to the app ids of the other Kalvaert apps", () => {
  const ids = Object.fromEntries(apps.map((a) => [manifest(a).name, manifest(a).id]));
  for (const app of apps) for (const d of manifest(app).dependencies.filter((d) => d.publisher === "Kalvaert Portfolio Case")) assert.equal(d.id, ids[d.name], `${app} → ${d.name}`);
});

test("every test case of the spec (T1–T9) and the tested exceptions exist as AL tests", () => {
  const spec = read("docs/05-specs/uc-vk-10-verwijderingsbijdrage.md");
  const specTests = [...spec.matchAll(/^\| (T\d) \|/gm)].map((m) => m[1]);
  const al = files("removal-fee-test").join("\n");
  const tests = [...al.matchAll(/\[Test\][\s\S]*?procedure (\w+)\(/g)].map((m) => m[1]);
  assert.equal(specTests.length, 9);
  for (const t of specTests) assert.ok(tests.some((n) => n.startsWith(`${t}_`)), `spec ${t} has no AL test`);
  for (const u of ["U4", "U5", "U7"]) assert.ok(tests.some((n) => n.startsWith(`${u}_`)), `${u} has no AL test`);
  for (const t of tests) assert.match(t, /^(T\d|U\d)_/, `${t} is not named after a spec case`);
});

test("the extension only subscribes to standard events and never modifies standard objects", () => {
  const al = files("removal-fee").join("\n");
  assert.ok(!/\bmodify\(\s*"?OnAction/i.test(al));
  const subs = [...al.matchAll(/\[EventSubscriber\(ObjectType::(\w+), (?:Database|Codeunit)::"([^"]+)", (\w+),/g)];
  assert.ok(subs.length >= 10);
  for (const [, , object] of subs) assert.ok(["Sales Line", "Sales Header", "Copy Document Mgt.", "Sales-Quote to Order", "Blanket Sales Order to Order", "Sales-Get Shipment", "Release Sales Document"].includes(object), object);
});

test("generated demo data matches the solution design and the migration export", () => {
  const al = read("bc/apps/demo-setup/src/generated/KLVDemoData.Codeunit.al");
  for (const a of caseData.setup.accounts) assert.ok(al.includes(`H.EnsureGLAccount('${a.no}'`), a.no);
  for (const g of caseData.setup.generalPostingSetup) assert.ok(al.includes(`H.EnsureGenPostingSetup('${g.bus}', '${g.prod}', '${g.sales}'`), `${g.bus}×${g.prod}`);
  for (const v of caseData.setup.vatPostingSetup) assert.ok(al.includes(`H.EnsureVATPostingSetup('${v.bus}', '${v.prod}', ${v.calc === "Btw verleggen"}`), `${v.bus}×${v.prod}`);
  for (const i of caseData.setup.items) assert.ok(al.includes(`H.EnsureItem('${i.no}'`) && al.includes(`${i.contribution == null ? "0" : i.contribution.toFixed(2)}, 'STUK')`), i.no);
  const entries = [...al.matchAll(/M\.AddEntry\((true|false), '([^']+)', '([^']+)', (\d+), (-?[\d.]+)\);/g)];
  assert.equal(entries.length, v2.length);
  const total = entries.reduce((s, e) => s + Number(e[5]), 0);
  assert.equal(Math.round(total * 100), Math.round(v2.reduce((s, r) => s + r.openstaand_bedrag, 0) * 100));
  assert.ok(entries.every((e) => (e[1] === "true") === (Number(e[5]) < 0)), "credit memos and only credit memos are negative");
  assert.ok(al.includes("H.ConfigureRemovalFee('BINNENL', '700900', 'BIJDRAGE'"));
});

test("every customer with an open entry is created, with a valid Belgian enterprise number when domestic", () => {
  const list = customerList(caseData, read(caseData.migration.controls.customerReceivablesAtCutoff.file));
  for (const no of new Set(v2.map((r) => r.klantnr))) assert.ok(list.some((c) => c.no === no), no);
  for (const c of list.filter((c) => c.genBus === "BINNENL")) assert.ok(validEnterpriseNo(c.enterpriseNo), `${c.no} ${c.enterpriseNo}`);
  assert.ok(validEnterpriseNo("0403.170.701"), "known-valid format check");
  assert.ok(!validEnterpriseNo("0403.170.702"));
  assert.equal(enterpriseNo("K10023"), enterpriseNo("K10023"), "deterministic");
  assert.ok(NEW_CUSTOMER_CREDIT_LIMIT > 0, "0 would mean no credit limit at all");
});

test("Dutch (nl-BE) translation files are complete", () => {
  for (const app of ["removal-fee", "demo-setup"]) {
    const { name } = manifest(app);
    const file = join("bc/apps", app, "Translations", `${name}.nl-BE.xlf`);
    assert.ok(existsSync(file), file);
    const xlf = readFileSync(file, "utf8");
    const units = (xlf.match(/<trans-unit /g) ?? []).length;
    const targets = (xlf.match(/<target state="translated">/g) ?? []).length;
    assert.ok(units > 10);
    assert.equal(targets, units, `${app}: ${units - targets} captions untranslated`);
  }
});

test("symbols are pinned to one Business Central release for all packages", () => {
  const { packages } = JSON.parse(read("bc/symbols.json"));
  const majors = new Set(packages.map((p) => p.version.split(".")[0]));
  assert.equal(majors.size, 1);
  for (const app of apps) assert.equal(manifest(app).application.split(".")[0], [...majors][0], app);
});
