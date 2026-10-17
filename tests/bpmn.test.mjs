// Process models: valid BPMN 2.0 (checked with bpmn-moddle, the library behind bpmn.io), generated from models/*.json,
// and every requirement a step refers to exists.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import BpmnModdle from "bpmn-moddle";
import { toXml } from "../scripts/bpmn.mjs";
import { caseData } from "./helpers.mjs";

const specs = readdirSync("models").filter((f) => f.endsWith(".json")).map((f) => JSON.parse(readFileSync(`models/${f}`, "utf8")));
const reqIds = new Set(caseData.requirements.map((r) => r.id));

for (const spec of specs) {
  test(`${spec.file}.bpmn is valid BPMN 2.0 and up to date`, async () => {
    const xml = readFileSync(`docs/02-processen/bpmn/${spec.file}.bpmn`, "utf8");
    assert.equal(xml, toXml(spec), "regenerate with node scripts/build.mjs");
    const { rootElement, warnings } = await new BpmnModdle().fromXML(xml);
    assert.deepEqual(warnings.map((w) => w.message), []);
    const process = rootElement.rootElements.find((e) => e.$type === "bpmn:Process");
    const starts = process.flowElements.filter((e) => e.$type === "bpmn:StartEvent");
    const ends = process.flowElements.filter((e) => e.$type === "bpmn:EndEvent");
    assert.equal(starts.length, 1);
    assert.ok(ends.length >= 1);
    for (const el of process.flowElements.filter((e) => !e.$type.endsWith("SequenceFlow"))) {
      if (el.$type !== "bpmn:StartEvent") assert.ok(el.incoming?.length, `${el.id} has no incoming flow`);
      if (el.$type !== "bpmn:EndEvent") assert.ok(el.outgoing?.length, `${el.id} has no outgoing flow`);
    }
  });

  test(`${spec.file}: every requirement mentioned in a step exists`, () => {
    for (const n of spec.nodes) for (const id of `${n.name} ${n.doc ?? ""}`.match(/\b(VK|AK|VR|FIN|EF)-\d{2}\b/g) ?? []) assert.ok(reqIds.has(id), `${n.id}: ${id}`);
  });
}

test("TO-BE has fewer manual steps than AS-IS for each process, and the extension appears exactly once", () => {
  const byFile = Object.fromEntries(specs.map((s) => [s.file, s]));
  const manual = (s) => s.nodes.filter((n) => n.type === "manualTask").length;
  for (const p of ["o2c", "p2p"]) assert.ok(manual(byFile[`${p}-to-be`]) < manual(byFile[`${p}-as-is`]), p);
  const ext = specs.flatMap((s) => s.nodes).filter((n) => /bc\/apps\/removal-fee/.test(n.doc ?? ""));
  assert.equal(ext.length, 1);
});
