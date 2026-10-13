import { readFileSync } from "node:fs";
import * as L from "../site/assets/case-logic.mjs";

export const caseData = JSON.parse(readFileSync(new URL("../data/case.json", import.meta.url), "utf8"));
const ctl = caseData.migration.controls.customerReceivablesAtCutoff;
const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");
export const v1 = L.parseCsv(read(ctl.rehearsalFile));
export const v2 = L.parseCsv(read(ctl.file));
export { L, read };
