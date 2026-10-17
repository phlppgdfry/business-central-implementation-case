#!/usr/bin/env bash
# Deploys the Kalvaert dev landscape into one resource group. Shows a what-if first and asks before creating anything.
#   KALVAERT_ALERT_EMAIL=you@example.com azure/scripts/deploy.sh [resource-group] [location]
# Optional: BC_CLIENT_ID and BC_CLIENT_SECRET (an Entra app registered in BC) to switch on the reconciliation against BC.
# Remove everything again: az group delete --name <resource-group>
set -euo pipefail
cd "$(dirname "$0")/.."
RG="${1:-rg-kalvaert-bc-dev}"
LOCATION="${2:-westeurope}"
: "${KALVAERT_ALERT_EMAIL:?set KALVAERT_ALERT_EMAIL}"

az account show --query "{subscription:name, tenant:tenantId, user:user.name}" -o table
az group create --name "$RG" --location "$LOCATION" --tags project=kalvaert-bc-case environment=dev -o none
az deployment group what-if --resource-group "$RG" --parameters dev.bicepparam \
  bcClientId="${BC_CLIENT_ID:-}" bcClientSecret="${BC_CLIENT_SECRET:-}"
read -r -p "Deploy this to $RG? [y/N] " answer
[[ "$answer" == "y" ]] || { echo "Stopped. Nothing was created except the empty resource group (az group delete --name $RG)."; exit 1; }
az deployment group create --resource-group "$RG" --parameters dev.bicepparam \
  bcClientId="${BC_CLIENT_ID:-}" bcClientSecret="${BC_CLIENT_SECRET:-}" \
  --query properties.outputs -o json | tee .deployment-outputs.json

FUNC=$(az deployment group show -g "$RG" -n main --query properties.outputs.functionAppName.value -o tsv)
(cd functions && npm ci --omit=dev && func azure functionapp publish "$FUNC" --javascript)
echo "Done. Connection string for BC telemetry: see azure/.deployment-outputs.json (appInsightsConnectionString)."
