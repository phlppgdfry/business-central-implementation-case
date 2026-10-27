import { app, output } from "@azure/functions";
import { migrationControl, bcReconciliation } from "../core.mjs";
import { bcFetcher } from "../bc.mjs";

// The audit trail of every rehearsal and of the cutover: the export and the verdict in one object.
// A Functions output binding writes it with the app's managed identity, so this package needs no Azure SDK.
const auditTrail = output.storageBlob({
  path: "migratie-rapport/{rand-guid}.json",
  connection: "AzureWebJobsStorage",
});

// POST /api/migratie/controle — body: the CSV export of open customer entries.
app.http("migratieControle", {
  route: "migratie/controle",
  methods: ["POST"],
  authLevel: "function",
  extraOutputs: [auditTrail],
  handler: async (request, context) => {
    const csv = await request.text();
    const report = migrationControl(csv);
    context.extraOutputs.set(auditTrail, JSON.stringify({ receivedAt: new Date().toISOString(), report, csv }, null, 1));
    context.log(`migration control: ${report.rows} rows, ok=${report.ok}, difference=${report.difference}`);
    return { status: report.ok ? 200 : 422, jsonBody: report };
  },
});

// GET /api/migratie/afstemming-bc — open customer entries in BC vs the legacy balances (go/no-go criterion).
app.http("afstemmingBc", {
  route: "migratie/afstemming-bc",
  methods: ["GET"],
  authLevel: "function",
  handler: async (_request, context) => {
    const fetchJson = bcFetcher();
    if (!fetchJson) return { status: 503, jsonBody: { ok: false, reason: "BC_CLIENT_ID / BC_CLIENT_SECRET not configured" } };
    const result = await bcReconciliation(fetchJson);
    context.log(`bc reconciliation: ${result.entries} entries, ok=${result.ok}`);
    return { status: result.ok ? 200 : 409, jsonBody: result };
  },
});
