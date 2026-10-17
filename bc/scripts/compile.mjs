// Compiles every AL app in bc/apps in dependency order against the symbols in bc/.alpackages,
// with CodeCop, UICop and PerTenantExtensionCop. Fails on any error or warning.
// Then writes the nl-BE XLIFF from i18n/nl-BE.json and fails if a caption has no translation.
//
//   node bc/scripts/compile.mjs            compile + translate
//   AL_CLI=/path/to/al node bc/scripts/compile.mjs
//
// The AL CLI comes from NuGet: dotnet tool install -g Microsoft.Dynamics.BusinessCentral.Development.Tools
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, copyFileSync, realpathSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const bcDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORDER = ["removal-fee", "demo-setup", "removal-fee-test"];
const cache = join(bcDir, ".alpackages");
const outDir = join(bcDir, "out");
mkdirSync(outDir, { recursive: true });

function findCli() {
  if (process.env.AL_CLI) return process.env.AL_CLI;
  const which = spawnSync("sh", ["-c", "command -v al"], { encoding: "utf8" });
  if (which.status === 0) return which.stdout.trim();
  throw new Error("AL CLI not found. Install: dotnet tool install -g Microsoft.Dynamics.BusinessCentral.Development.Tools --version 18.1.43.24897");
}

// the analyzers ship inside the tool package, next to the compiler
function findAnalyzers(cli) {
  const real = realpathSync(cli);
  const roots = [join(dirname(cli), ".store"), join(dirname(real), ".store"), dirname(real)];
  for (const root of roots) {
    if (!existsSync(root)) continue;
    const hit = readdirSync(root, { recursive: true }).map(String).find((f) => /tools\/net\d+\.0\/any\/Microsoft\.Dynamics\.Nav\.CodeCop\.dll$/.test(f));
    if (hit) return dirname(join(root, hit));
  }
  throw new Error("CodeCop.dll not found next to the AL CLI");
}

const cli = findCli();
const analyzers = findAnalyzers(cli);
const cops = ["CodeCop", "UICop", "PerTenantExtensionCop"].map((c) => `/analyzer:${join(analyzers, `Microsoft.Dynamics.Nav.${c}.dll`)}`);
const report = [];
let failed = false;

for (const name of ORDER) {
  const project = join(bcDir, "apps", name);
  if (!existsSync(join(project, "app.json"))) continue;
  const app = JSON.parse(readFileSync(join(project, "app.json"), "utf8"));
  const file = `${app.publisher}_${app.name}_${app.version}.app`;
  const out = join(outDir, file);
  const res = spawnSync(cli, ["compile", `/project:${project}`, `/packagecachepath:${cache}`, `/out:${out}`, ...cops], { encoding: "utf8" });
  const text = `${res.stdout}\n${res.stderr}`;
  const diagnostics = text.split("\n").filter((l) => /: (error|warning) [A-Z]+\d+/.test(l));
  const ok = res.status === 0 && diagnostics.length === 0 && existsSync(out);
  if (!ok) failed = true;
  // dependants compile against this app
  if (existsSync(out)) copyFileSync(out, join(cache, file));
  const objects = countObjects(project);
  report.push({ app: app.name, version: app.version, ok, objects, diagnostics });
  console.log(`${ok ? "✓" : "✗"} ${app.name} ${app.version} — ${Object.entries(objects).map(([k, v]) => `${v} ${k}`).join(", ")}`);
  for (const d of diagnostics) console.log(`    ${d.trim()}`);
  if (res.status !== 0 && !diagnostics.length) console.log(text);
  translate(project, app.name);
}

writeFileSync(join(outDir, "build-report.json"), JSON.stringify({ compiler: execFileSync(cli, ["--version"], { encoding: "utf8" }).trim(), apps: report }, null, 1) + "\n");
process.exit(failed ? 1 : 0);

function countObjects(project) {
  const counts = {};
  for (const f of readdirSync(join(project, "src"), { recursive: true }).map(String).filter((f) => f.endsWith(".al"))) {
    for (const m of readFileSync(join(project, "src", f), "utf8").matchAll(/^(table|tableextension|page|pageextension|codeunit|permissionset|permissionsetextension|query|report|enum|enumextension)\s+\d+/gm)) {
      counts[m[1]] = (counts[m[1]] ?? 0) + 1;
    }
  }
  return counts;
}

function translate(project, appName) {
  const dict = join(project, "i18n", "nl-BE.json");
  const generated = join(project, "Translations", `${appName}.g.xlf`);
  if (!existsSync(dict) || !existsSync(generated)) return;
  const nl = JSON.parse(readFileSync(dict, "utf8"));
  const xlf = readFileSync(generated, "utf8").replace(/^﻿/, "");
  const missing = new Set();
  const decode = (s) => s.replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&quot;", '"').replaceAll("&apos;", "'").replaceAll("&amp;", "&");
  const encode = (s) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  const result = xlf
    .replace('target-language="en-US"', 'target-language="nl-BE"')
    .replace(/(<source>)([\s\S]*?)(<\/source>)/g, (all, a, src, b) => {
      const t = nl[decode(src)];
      if (t === undefined) { missing.add(decode(src)); return all; }
      return `${a}${src}${b}\n          <target state="translated">${encode(t)}</target>`;
    });
  writeFileSync(join(project, "Translations", `${appName}.nl-BE.xlf`), result);
  if (missing.size) {
    failed = true;
    console.log(`  ✗ nl-BE: ${missing.size} captions without a translation in i18n/nl-BE.json:`);
    for (const m of missing) console.log(`      ${JSON.stringify(m)}`);
  } else console.log(`  ✓ nl-BE: ${Object.keys(nl).length} translations`);
}
