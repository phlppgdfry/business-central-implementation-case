using './main.bicep'

// No secrets here. The BC client secret is passed on the command line (see azure/README.md) and lands only in Key Vault.
param prefix = 'kalvaert'
param location = 'westeurope'
param alertEmail = readEnvironmentVariable('KALVAERT_ALERT_EMAIL', 'alerts@example.com')
param monthlyBudget = 5
param bcEnvironment = 'kalvaert-dev'
param bcCompany = 'KALVAERT'
