using './main.bicep'

// No secrets here. The BC client secret is passed on the command line (see azure/README.md) and lands only in Key Vault.
param prefix = 'kalvaert'
// West Europe would be the obvious choice for a Belgian case, but this development subscription
// is not accepted there ('location ineligible'). Germany West Central also keeps the data in the EU
// and supports Flex Consumption.
param location = 'germanywestcentral'
param alertEmail = readEnvironmentVariable('KALVAERT_ALERT_EMAIL', 'alerts@example.com')
param monthlyBudget = 5
param bcEnvironment = 'kalvaert-dev'
param bcCompany = 'KALVAERT'
