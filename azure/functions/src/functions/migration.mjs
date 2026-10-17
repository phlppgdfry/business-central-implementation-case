import { app } from "@azure/functions";
import { BlobServiceClient } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";
import { migrationControl, bcReconciliation } from "../core.mjs";
import { bcFetcher } from "../bc.mjs";

const blobs = () => new BlobServiceClient(`https://${process.env.AzureWebJobsStorage__accountName}.blob.core.windows.net`, new DefaultAzureCredential());

// POST /api/migratie/controle — body: the CSV export of open customer entries.
// Stores the export and the report (audit trail of every rehearsal and of the cutover) and returns the report.
app.http("migratieControle", {
  route: "migratie/controle",
  methods: ["POST"],
  authLevel: "function",
  handler: async (request, context) => {
    const csv = await request.text();
    const report = migrationControl(csv);
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    if (process.env.AzureWebJobsStorage__accountName) {
      const service = blobs();
      await service.getContainerClient("migratie-in").getBlockBlobClient(`${stamp}.csv`).upload(csv, Buffer.byteLength(csv));
      const body = JSON.stringify(report, null, 1);
      await service.getContainerClient("migratie-rapport").getBlockBlobClient(`${stamp}.json`).upload(body, Buffer.byteLength(body));
    }
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
