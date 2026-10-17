// Downloads the Business Central symbol packages pinned in bc/symbols.json into bc/.alpackages.
// A .nupkg is a zip; the .app inside is what the AL compiler needs. Cached: an existing .app is kept.
import { readFileSync, mkdirSync, existsSync, writeFileSync, readdirSync, rmSync, renameSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const bcDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const { feed, packages } = JSON.parse(readFileSync(join(bcDir, "symbols.json"), "utf8"));
const out = join(bcDir, ".alpackages");
mkdirSync(out, { recursive: true });

for (const p of packages) {
  const marker = join(out, `.${p.id}.${p.version}`);
  if (existsSync(marker)) continue;
  const id = p.id.toLowerCase();
  const url = `${feed}/${id}/${p.version}/${id}.${p.version}.nupkg`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${p.name}: HTTP ${res.status} for ${url}`);
  const work = join(tmpdir(), `bcsym-${process.pid}-${id}`);
  rmSync(work, { recursive: true, force: true });
  mkdirSync(work, { recursive: true });
  const nupkg = join(work, "p.nupkg");
  writeFileSync(nupkg, Buffer.from(await res.arrayBuffer()));
  execFileSync("unzip", ["-q", "-o", nupkg, "*.app", "-d", work]);
  const apps = readdirSync(work, { recursive: true }).filter((f) => String(f).endsWith(".app"));
  if (!apps.length) throw new Error(`${p.name}: no .app in ${url}`);
  for (const a of apps) renameSync(join(work, a), join(out, String(a).split("/").pop()));
  writeFileSync(marker, url);
  rmSync(work, { recursive: true, force: true });
  console.log(`${p.name} ${p.version}`);
}
console.log(`symbols in ${out}: ${readdirSync(out).filter((f) => f.endsWith(".app")).length} apps`);
