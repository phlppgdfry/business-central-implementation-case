// Kalvaert BC — Azure development landscape next to the Business Central sandbox.
// Everything a BC partner typically puts in Azure for a project, sized for a portfolio: a few euros a month at most.
//   - Log Analytics + Application Insights: telemetry of the BC environment and of the extension (hypercare)
//   - Storage: landing zone for migration exports and the reports about them
//   - Function App (Flex Consumption): migration control and reconciliation against the BC API, same logic as the case
//   - Key Vault: the client secret of the Entra app that calls the BC API (never in app settings or git)
//   - Budget + alert: cost guard, and an alert when users get many error dialogs during hypercare
targetScope = 'resourceGroup'

@description('Short prefix for resource names.')
@maxLength(10)
param prefix string = 'kalvaert'

@description('Azure region. Germany West Central keeps the data in the EU, next to a Belgian BC environment, and supports Flex Consumption.')
param location string = resourceGroup().location

@description('E-mail for the budget and the hypercare alert.')
param alertEmail string

@description('Monthly budget in the billing currency.')
param monthlyBudget int = 5

@description('First day of the budget period, yyyy-MM-01.')
param budgetStartDate string = utcNow('yyyy-MM-01')

@description('Entra tenant of the Business Central environment.')
param bcTenantId string = tenant().tenantId

@description('Name of the BC sandbox environment.')
param bcEnvironment string = 'kalvaert-dev'

@description('Name of the BC company.')
param bcCompany string = 'KALVAERT'

@description('Client id of the Entra app registered in BC (Microsoft Entra Applications). Empty: reconciliation against BC is off.')
param bcClientId string = ''

@secure()
@description('Client secret of that app. Stored only in Key Vault.')
param bcClientSecret string = ''

var suffix = take(uniqueString(resourceGroup().id), 6)
var tags = { project: 'kalvaert-bc-case', environment: 'dev', purpose: 'portfolio' }

resource logs 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: 'log-${prefix}-${suffix}'
  location: location
  tags: tags
  properties: {
    sku: { name: 'PerGB2018' }
    retentionInDays: 30
    // hard cap: a chatty sandbox cannot run up the bill
    workspaceCapping: { dailyQuotaGb: json('0.2') }
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: 'appi-${prefix}-${suffix}'
  location: location
  kind: 'web'
  tags: tags
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logs.id
    IngestionMode: 'LogAnalytics'
    RetentionInDays: 30
  }
}

resource storage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: 'st${prefix}${suffix}'
  location: location
  tags: tags
  sku: { name: 'Standard_LRS' }
  kind: 'StorageV2'
  properties: {
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: false
    allowSharedKeyAccess: false
    supportsHttpsTrafficOnly: true
  }
}

resource blobService 'Microsoft.Storage/storageAccounts/blobServices@2023-05-01' = {
  parent: storage
  name: 'default'
}

resource containers 'Microsoft.Storage/storageAccounts/blobServices/containers@2023-05-01' = [for name in ['deployments', 'migratie-in', 'migratie-rapport']: {
  parent: blobService
  name: name
}]

resource vault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: 'kv-${prefix}-${suffix}'
  location: location
  tags: tags
  properties: {
    tenantId: tenant().tenantId
    sku: { family: 'A', name: 'standard' }
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 7
  }
}

resource bcSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = if (!empty(bcClientSecret)) {
  parent: vault
  name: 'bc-client-secret'
  properties: { value: bcClientSecret }
}

resource plan 'Microsoft.Web/serverfarms@2024-04-01' = {
  name: 'plan-${prefix}-${suffix}'
  location: location
  tags: tags
  kind: 'functionapp'
  sku: { tier: 'FlexConsumption', name: 'FC1' }
  properties: { reserved: true }
}

resource func 'Microsoft.Web/sites@2024-04-01' = {
  name: 'func-${prefix}-${suffix}'
  location: location
  tags: tags
  kind: 'functionapp,linux'
  identity: { type: 'SystemAssigned' }
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      minTlsVersion: '1.2'
      appSettings: [
        { name: 'AzureWebJobsStorage__accountName', value: storage.name }
        { name: 'APPLICATIONINSIGHTS_CONNECTION_STRING', value: appInsights.properties.ConnectionString }
        { name: 'BC_TENANT', value: bcTenantId }
        { name: 'BC_ENVIRONMENT', value: bcEnvironment }
        { name: 'BC_COMPANY', value: bcCompany }
        { name: 'BC_CLIENT_ID', value: bcClientId }
        { name: 'BC_CLIENT_SECRET', value: empty(bcClientSecret) ? '' : '@Microsoft.KeyVault(VaultName=${vault.name};SecretName=bc-client-secret)' }
      ]
    }
    functionAppConfig: {
      deployment: {
        storage: {
          type: 'blobContainer'
          value: '${storage.properties.primaryEndpoints.blob}deployments'
          authentication: { type: 'SystemAssignedIdentity' }
        }
      }
      scaleAndConcurrency: { maximumInstanceCount: 40, instanceMemoryMB: 512 }
      runtime: { name: 'node', version: '22' }
    }
  }
}

// least privilege for the function's managed identity
var roles = {
  storageBlobDataOwner: 'b7e6dc6d-f1e8-4753-8033-0f276bb0955b'
  keyVaultSecretsUser: '4633458b-17de-408a-b874-0445c86b69e6'
}

resource blobRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storage.id, func.id, roles.storageBlobDataOwner)
  scope: storage
  properties: {
    principalId: func.identity.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', roles.storageBlobDataOwner)
  }
}

resource vaultRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(vault.id, func.id, roles.keyVaultSecretsUser)
  scope: vault
  properties: {
    principalId: func.identity.principalId
    principalType: 'ServicePrincipal'
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', roles.keyVaultSecretsUser)
  }
}

resource actionGroup 'Microsoft.Insights/actionGroups@2023-01-01' = {
  name: 'ag-${prefix}-${suffix}'
  location: 'global'
  tags: tags
  properties: {
    groupShortName: 'kalvaert'
    enabled: true
    emailReceivers: [{ name: 'consultant', emailAddress: alertEmail, useCommonAlertSchema: true }]
  }
}

// hypercare: many error dialogs in an hour usually means a setup or permission problem, not twenty users making mistakes
resource errorDialogAlert 'Microsoft.Insights/scheduledQueryRules@2023-03-15-preview' = {
  name: 'alert-${prefix}-error-dialogs'
  location: location
  tags: tags
  properties: {
    displayName: 'Kalvaert BC: veel foutmeldingen bij gebruikers'
    description: 'More than 20 error dialogs (RT0030) in one hour in the Kalvaert environment. See azure/telemetry/hypercare.kql, query 1.'
    severity: 2
    enabled: true
    scopes: [appInsights.id]
    evaluationFrequency: 'PT1H'
    windowSize: 'PT1H'
    criteria: {
      allOf: [
        {
          query: 'traces | where customDimensions.eventId == "RT0030"'
          timeAggregation: 'Count'
          operator: 'GreaterThan'
          threshold: 20
          failingPeriods: { numberOfEvaluationPeriods: 1, minFailingPeriodsToAlert: 1 }
        }
      ]
    }
    actions: { actionGroups: [actionGroup.id] }
  }
}

resource budget 'Microsoft.Consumption/budgets@2023-11-01' = {
  name: 'budget-${prefix}'
  properties: {
    category: 'Cost'
    amount: monthlyBudget
    timeGrain: 'Monthly'
    timePeriod: { startDate: budgetStartDate }
    filter: { dimensions: { name: 'ResourceGroupName', operator: 'In', values: [resourceGroup().name] } }
    notifications: {
      actual80: { enabled: true, operator: 'GreaterThan', threshold: 80, thresholdType: 'Actual', contactEmails: [alertEmail] }
      forecast100: { enabled: true, operator: 'GreaterThan', threshold: 100, thresholdType: 'Forecasted', contactEmails: [alertEmail] }
    }
  }
}

@description('Paste in the BC admin center (environment → Telemetry) and in app.json "applicationInsightsConnectionString".')
output appInsightsConnectionString string = appInsights.properties.ConnectionString
output functionAppName string = func.name
output functionHost string = func.properties.defaultHostName
output storageAccountName string = storage.name
output keyVaultName string = vault.name
