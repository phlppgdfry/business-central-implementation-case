// Documents cite the model: every <!--n:key--> number equals what scripts/build.mjs computes.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, statSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { read } from "./helpers.mjs";

const root = new URL("..", import.meta.url).pathname;
const walk = (d) => readdirSync(join(root, d)).flatMap((f) => (statSync(join(root, d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const files = [...walk("docs"), ...walk("site"), ...(existsSync(join(root, "application-kit")) ? walk("application-kit") : []), "README.md", "START-HERE.md", "EVIDENCE.md", "CASE_STUDY.md"].filter((f) => /\.(md|html)$/.test(f));
const claims = JSON.parse(read("site/data/claims.json"));

test("elk getal tussen claim-markers is gelijk aan het model", () => {
  let n = 0;
  for (const f of files) {
    for (const m of readFileSync(join(root, f), "utf8").matchAll(/<!--n:([\w.-]+)-->(.*?)<!--\/n-->/g)) {
      n++;
      assert.ok(m[1] in claims, `${f}: onbekende claim ${m[1]}`);
      assert.equal(m[2], String(claims[m[1]]), `${f}: ${m[1]}`);
    }
  }
  assert.ok(n >= 20, `te weinig claims in de documenten (${n})`);
});

test("disclaimer staat in README en op elke sitepagina", () => {
  assert.match(read("README.md"), /fictieve organisatie/i);
  for (const f of files.filter((f) => f.endsWith(".html"))) assert.match(read(f), /fictieve organisatie/i, f);
});
