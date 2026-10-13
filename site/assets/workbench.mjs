// Fit-Gap Workbench: renders data/case.json with the same logic the tests use (case-logic.mjs).
import * as L from "./case-logic.mjs";
import { createTour } from "./tour.js";

const $ = (s) => document.querySelector(s);
const nl = (n, d = 2) => n.toLocaleString("nl-BE", { minimumFractionDigits: d, maximumFractionDigits: d });
const eur = (n, d = 0) => `€${nl(n, d)}`;
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

const data = await (await fetch("../data/case.json")).json();
const label = Object.fromEntries(data.classifications.map((c) => [c.id, c.label]));
const reqById = Object.fromEntries(data.requirements.map((r) => [r.id, r]));
const withOptions = data.requirements.filter((r) => r.options);
const ctl = data.migration.controls.customerReceivablesAtCutoff;

const initial = () => ({ filter: "alle", selected: "VK-01", choices: {}, customer: "K10023", item: "A-220318", qty: 1, exportVersion: "v1" });
let state = initial();

function log(msg) {
  const li = document.createElement("li");
  li.textContent = `${new Date().toLocaleTimeString("nl-BE")} · ${msg}`;
  $("#log").prepend(li);
}
const cls = (id) => `<span class="cls cls-${id}">${esc(label[id])}</span>`;

function renderOverview() {
  $("#ov-why").textContent = `${data.org.activity}. ${data.org.why.join(" ")}`;
  const counts = L.countByClassification(data);
  $("#ov-stats").innerHTML = [
    [data.requirements.length, "requirements uit " + data.workshops.length + " workshops"],
    [counts.standaard + counts.configuratie, "standaard of configuratie"],
    [counts.app, "AppSource-app"],
    [counts.procesaanpassing, "procesaanpassing"],
    [counts.extensie, "extensie (maatwerk)"],
    [counts["buiten-scope"], "buiten scope"],
  ].map(([n, t]) => `<div class="stat"><b>${n}</b><span>${t}</span></div>`).join("");
}

function renderWorkshop() {
  const r = reqById[state.selected];
  const w = data.workshops.find((x) => x.id === r.source);
  $("#ws-body").innerHTML = `
    <p><strong>${esc(w.id)} — ${esc(w.title)}</strong> (week ${w.week}) · ${esc(w.method)}</p>
    <p class="quote">"${esc(w.quote)}"</p>
    <div class="detail"><dl>
      <dt>Observatie</dt><dd>${esc(w.observations[0])}</dd>
      <dt>Wens</dt><dd>${esc(w.wishes[0])}</dd>
      <dt>Open vraag</dt><dd>${esc(w.openQuestions[0].q)} <span class="small">(eigenaar: ${esc(w.openQuestions[0].owner)})</span></dd>
      <dt>Wordt</dt><dd><strong>${esc(r.id)}</strong> ${esc(r.title)} → ${cls(r.classification)}</dd>
    </dl></div>`;
}

function renderRegister() {
  const filters = [["alle", "Alle"], ["gaps", "Alleen gaps"], ...data.classifications.map((c) => [c.id, c.label])];
  $("#reg-filters").innerHTML = filters.map(([id, t]) => `<button type="button" data-filter="${id}" aria-pressed="${state.filter === id}">${esc(t)}</button>`).join("");
  const rows = data.requirements.filter((r) => state.filter === "alle" || (state.filter === "gaps" ? r.fit === "gap" : r.classification === state.filter));
  $("#reg-rows").innerHTML = rows.map((r) => `
    <tr class="clickable ${r.id === state.selected ? "selected" : ""}" data-req="${r.id}" tabindex="0">
      <td><strong>${r.id}</strong></td><td>${esc(r.title)}</td><td>${cls(r.classification)}</td><td class="num">${nl(r.estimateDays, 1)}</td><td>${esc(r.decider)}</td>
    </tr>`).join("");
  const r = reqById[state.selected];
  const uats = data.uat.filter((u) => u.reqs.includes(r.id)).map((u) => `${u.id} ${u.title}`);
  const hcs = data.hypercare.filter((h) => h.req === r.id).map((h) => `${h.id}: ${h.symptom}`);
  $("#reg-detail").innerHTML = `
    <h3>${r.id} — ${esc(r.title)}</h3>
    <dl>
      <dt>Behoefte</dt><dd>${esc(r.need)}</dd>
      <dt>BC standaard</dt><dd>${esc(r.bcStandard)}</dd>
      <dt>Fit / gap</dt><dd>${r.fit} → ${cls(r.classification)}</dd>
      <dt>Oplossing</dt><dd>${esc(r.solution)}</dd>
      <dt>Inschatting</dt><dd>${nl(r.estimateDays, 1)} dagen · upgraderisico ${esc(r.upgradeRisk)}</dd>
      <dt>Beslist door</dt><dd>${esc(r.decider)}${r.adr ? ` · ${r.adr}` : ""}${r.changeRequest ? ` · ${r.changeRequest}` : ""}</dd>
      <dt>Getest in</dt><dd>${esc(uats.join(" · ") || (r.noTestReason ?? "migratiecontrole " + (r.migrationRefs ?? []).join(", ")))}</dd>
      ${hcs.length ? `<dt>Hypercare</dt><dd>${esc(hcs.join(" · "))}</dd>` : ""}
    </dl>`;
}

function renderScenario() {
  $("#sc-options").innerHTML = withOptions.map((r) => `
    <fieldset>
      <legend>${r.id} ${esc(r.title)}</legend>
      ${r.options.map((o) => {
        const checked = (state.choices[r.id] ?? r.options.find((x) => x.chosen).id) === o.id;
        return `<label><input type="radio" name="opt-${r.id}" value="${o.id}" ${checked ? "checked" : ""}> ${esc(o.label)} · ${nl(o.estimateDays, 1)} d ${o.chosen ? "<em>(beslist)</em>" : ""}</label>`;
      }).join("")}
    </fieldset>`).join("");
  const base = L.scenarioTotals(data);
  const now = L.scenarioTotals(data, state.choices);
  const delta = (a, b, fmt = (x) => x) => (a === b ? "" : ` <span class="${a > b ? "delta-up" : "delta-down"}">(${a > b ? "+" : "−"}${fmt(Math.abs(a - b))})</span>`);
  $("#sc-totals").innerHTML = [
    [`${nl(now.days, 1)} d${delta(now.days, base.days, (x) => nl(x, 1))}`, "inschatting"],
    [`${eur(now.costEur)}${delta(now.costEur, base.costEur, eur)}`, `aan ${eur(data.meta.dayRateEur)} per dag`],
    [`${now.extensions}${delta(now.extensions, base.extensions)}`, "extensies om bij elke update te testen"],
    [`${now.licences}${delta(now.licences, base.licences)}`, "app-licenties"],
  ].map(([n, t]) => `<div class="stat"><b>${n}</b><span>${t}</span></div>`).join("");
}

function renderPosting() {
  $("#pp-customer").innerHTML = data.setup.customers.map((c) => `<option value="${c.no}" ${c.no === state.customer ? "selected" : ""}>${c.no} — ${esc(c.description)}</option>`).join("");
  $("#pp-item").innerHTML = data.setup.items.map((i) => `<option value="${i.no}" ${i.no === state.item ? "selected" : ""}>${i.no} — ${esc(i.description)}</option>`).join("");
  $("#pp-qty").value = String(state.qty);
  const p = L.postingPreview(data.setup, state.customer, state.item, state.qty);
  $("#pp-rows").innerHTML = p.lines.map((l) => `<tr><td>${l.no} ${esc(l.name)}</td><td class="num">${l.debit ? nl(l.debit) : ""}</td><td class="num">${l.credit ? nl(l.credit) : ""}</td><td class="small">${esc(l.why)}</td></tr>`).join("")
    + `<tr><td><strong>Totaal</strong></td><td class="num"><strong>${nl(p.totals.debit)}</strong></td><td class="num"><strong>${nl(p.totals.credit)}</strong></td><td class="${p.balanced ? "status-ok" : "status-bad"}">${p.balanced ? "in evenwicht" : "niet in evenwicht"}</td></tr>`;
  $("#pp-meta").textContent = `Btw-roosters: ${Object.entries(p.grids).map(([g, a]) => `${g}: ${nl(a)}`).join(" · ")} · dimensies VESTIGING=${p.dims.VESTIGING}, AFDELING=${p.dims.AFDELING}. Vereenvoudigd: één regel, geen kortingen. Rekeningen illustratief.`;
}

function reconciliation() {
  return L.reconcile(data.migration.entries[state.exportVersion], ctl.legacy);
}

function renderMigration() {
  document.querySelectorAll("[data-export]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.export === state.exportVersion)));
  const rec = reconciliation();
  const accName = (no) => `${no} ${data.setup.accounts.find((a) => a.no === no)?.name ?? ""}`;
  $("#mig-rows").innerHTML = rec.map((r) => `<tr><td>${esc(accName(r.account))}</td><td class="num">${nl(r.legacy)}</td><td class="num">${nl(r.migrated)}</td><td class="num">${nl(r.difference)}</td><td class="${r.ok ? "status-ok" : "status-bad"}">${r.ok ? "ok" : "verschil"}</td></tr>`).join("");
  const n = data.migration.entries[state.exportVersion].length;
  $("#mig-cause").textContent = state.exportVersion === "v1"
    ? `${n} posten. ${ctl.note} Het verschil is precies ${ctl.lateDocument}. Maatregel: TradeDesk eerst op alleen-lezen, dan exporteren, dan saldi opvragen.`
    : `${n} posten. Na de aanpassing in het cutoverplan sluit alles aan.`;
}

function renderGoNoGo() {
  const results = L.goNoGo(data, reconciliation());
  const go = results.every((g) => g.ok);
  $("#gng-verdict").innerHTML = go ? `<span class="status-ok">GO</span> — alle ${results.length} criteria groen.` : `<span class="status-bad">NO-GO</span> — ${results.filter((g) => !g.ok).map((g) => g.id).join(", ")} niet gehaald.`;
  $("#gng-list").innerHTML = results.map((g) => `<li><span class="${g.ok ? "status-ok" : "status-bad"}">${g.ok ? "✓" : "✗"}</span> ${g.id} ${esc(g.criterion)}</li>`).join("");
}

function renderHypercare() {
  const by = L.hypercareByCategory(data);
  const colors = { data: "#8a5a00", setup: "#1d5c63", opleiding: "#4b5f7a", bug: "#a3312a" };
  const total = data.hypercare.length;
  $("#hc-bar").innerHTML = Object.entries(by).map(([k, v]) => `<span style="width:${(v / total) * 100}%;background:${colors[k]}">${k} ${v}</span>`).join("");
  $("#hc-rows").innerHTML = data.hypercare.map((h) => `<tr><td class="num">${h.day}</td><td>${esc(h.symptom)}</td><td class="small">${esc(h.cause)}</td><td>${esc(h.category)}</td><td class="small">${esc(h.structural)}</td></tr>`).join("");
}

function renderAll() {
  renderOverview(); renderWorkshop(); renderRegister(); renderScenario(); renderPosting(); renderMigration(); renderGoNoGo(); renderHypercare();
}

// ---------- interaction ----------
function select(id) { state.selected = id; renderWorkshop(); renderRegister(); }
function setFilter(f) { state.filter = f; renderRegister(); log(`Filter: ${f}`); }
function choose(reqId, optionId) {
  state.choices = { ...state.choices, [reqId]: optionId };
  const o = reqById[reqId].options.find((x) => x.id === optionId);
  log(`Scenario: ${reqId} → ${o.label} (${o.estimateDays} d)`);
  renderScenario();
}
function setExport(v) { state.exportVersion = v; renderMigration(); renderGoNoGo(); log(`Afstemming met export ${v}: ${reconciliation().every((r) => r.ok) ? "sluit aan" : "verschil"}`); }
function setPosting(patch) { Object.assign(state, patch); renderPosting(); const p = L.postingPreview(data.setup, state.customer, state.item, state.qty); log(`Boeking ${state.customer} × ${state.item} × ${state.qty}: bruto ${nl(p.totals.gross)}, btw ${nl(p.totals.vat)}`); }

$("#reg-filters").addEventListener("click", (e) => { const b = e.target.closest("[data-filter]"); if (b) setFilter(b.dataset.filter); });
$("#reg-rows").addEventListener("click", (e) => { const tr = e.target.closest("[data-req]"); if (tr) select(tr.dataset.req); });
$("#reg-rows").addEventListener("keydown", (e) => { const tr = e.target.closest("[data-req]"); if (tr && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); select(tr.dataset.req); } });
$("#sc-options").addEventListener("change", (e) => { if (e.target.name?.startsWith("opt-")) choose(e.target.name.slice(4), e.target.value); });
$("#sc-decided").addEventListener("click", () => { state.choices = {}; renderScenario(); log("Scenario: zoals beslist"); });
$("#sc-max").addEventListener("click", () => { state.choices = L.maximumCustomChoices(data); renderScenario(); log("Scenario: alles maatwerk"); });
$("#pp-customer").addEventListener("change", (e) => setPosting({ customer: e.target.value }));
$("#pp-item").addEventListener("change", (e) => setPosting({ item: e.target.value }));
$("#pp-qty").addEventListener("change", (e) => setPosting({ qty: Number(e.target.value) }));
document.querySelectorAll("[data-export]").forEach((b) => b.addEventListener("click", () => setExport(b.dataset.export)));
$("#btn-reset").addEventListener("click", () => { state = initial(); renderAll(); log("Demo gereset"); });

renderAll();
log(`Geladen: ${data.requirements.length} requirements, ${data.uat.length} UAT-scenario's, ${data.migration.entries.v2.length} openstaande posten`);

// ---------- guided tour ----------
const before = (patch) => () => { state = { ...initial(), ...patch }; renderAll(); };
const tour = createTour([
  { focus: "#wb-overview", before: before({}), text: " Kalvaert, een technische groothandel, moet weg van een 20 jaar oud pakket: de support stopt en Peppol-e-facturatie is sinds 2026 verplicht. De go-live ligt dus vast. 25 wensen, vijf workshops." },
  { focus: "#wb-workshop", before: before({ selected: "VK-01" }), text: " Ik begin bij het werk, niet bij het pakket. In de verkoopworkshop zagen we dat prijsafspraken als vrije tekst in notities staan. Dat wordt VK-01: prijslijsten per klantgroep — configuratie, geen maatwerk." },
  { focus: "#wb-register", before: before({ filter: "gaps", selected: "VK-10" }), text: " Het register, gefilterd op gaps. Elke regel heeft een classificatie, een inschatting en een beslisser bij de klant. Ik maak beslissingen beslisbaar; de klant neemt ze. De enige extensie is VK-10: een wettelijke bijdrage die vandaag vergeten wordt." },
  { focus: "#wb-scenario", before: before({ choices: { "VK-06": "a" } }), text: " Midden in het project vraagt de zaakvoerder de eindejaarsbonus automatisch per kwartaal (CR-01). Als extensie: +7 dagen en een extensie extra bij elke update. Gekozen werd een kwartaalrapport nu en een app-evaluatie na zes maanden — het doel was het commerciële gesprek, niet de automatisatie." },
  { focus: "#wb-posting", before: before({ customer: "K10023", item: "A-220318" }), text: " Elke instelling heeft een boekingsgevolg. Een boiler aan een Belgische installateur: omzet 700000, bijdrage 700900, 21% btw in rooster 03/54, kostprijs en voorraad per vestiging. Kies een Franse klant en de btw wordt verlegd en de bijdrage valt weg." },
  { focus: "#wb-migration", before: before({ exportVersion: "v1" }), text: " Generale repetitie in week 14: de openstaande klantposten wijken €1.586,40 af van WinBooks. Oorzaak: een creditnota die na de export geboekt werd. Een verschil van één cent is een verschil." },
  { focus: "#wb-gonogo", before: before({ exportVersion: "v2" }), text: " Na de aanpassing van het cutoverplan (eerst bevriezen, dan exporteren) sluit alles aan en zijn alle 8 go/no-go-criteria groen. Met export v1 was het no-go. De zaakvoerder beslist zondag 18:00, niet maandag om 10 uur." },
  { focus: "#wb-hypercare", before: before({ exportVersion: "v2" }), text: " Acht meldingen in de hypercare, één bug. De rest is data, setup of opleiding. Elke melding krijgt een structurele maatregel, zodat support na de overdracht niet dezelfde vragen krijgt." },
  { focus: "#wb-limits", before: before({ exportVersion: "v2" }), text: " Wat dit is: hoe ik als functional consultant zou werken, met een fictieve klant en illustratieve cijfers. Niet in Business Central gebouwd, geen AL-code, geen klantervaring geclaimd. Alle documenten staan op GitHub." },
], { label: "Rondleiding", labels: { step: "Stap", of: "van", back: "Terug", next: "Volgende", finish: "Klaar", close: "Sluiten" } });
$("#btn-tour").addEventListener("click", () => tour.start());
// ?tour=4 opens the tour at step 4 (used for the screenshots in docs/screenshots/).
const startAt = Number(new URLSearchParams(location.search).get("tour"));
if (startAt >= 1) setTimeout(() => {
  document.querySelectorAll(".tour-flash").forEach((e) => e.classList.remove("tour-flash"));
  tour.show(startAt - 1);
  // &shot: screenshot mode — light theme, only the focused panel, so a static capture shows the right step.
  if (new URLSearchParams(location.search).has("shot")) {
    document.documentElement.dataset.theme = "light";
    const focus = document.querySelector(".tour-flash");
    document.querySelectorAll(".wb-panel").forEach((p) => { if (p !== focus) p.style.display = "none"; });
    focus?.classList.remove("tour-flash");
  }
}, 50);
