# ADR-008 — Azure voor telemetrie en migratiecontrole, niet als integratielaag

- **Status:** aanvaard
- **Week:** 8 (vóór testmigratie 1)
- **Beslist door:** projectmanager en zaakvoerder, op voorstel van de functional consultant

> Wat: welke Azure-diensten het project naast Business Central gebruikt, en welke bewust niet. Uitvoering: [`azure/`](../../azure/README.md).

## Context

Business Central draait als SaaS; Kalvaert heeft geen eigen servers nodig. Toch zijn er twee momenten waar het project zonder hulpmiddel blind is: de migratierepetities (klopt deze export, en klopt wat er geladen is?) en de hypercare (wat gaat er mis bij gebruikers, voor ze het melden?). De partner heeft een eigen Azure-abonnement voor projecten.

## Opties

| Optie | Kost | Voordelen | Nadelen |
|---|---|---|---|
| a. Niets in Azure; Excel voor de afstemming, mails voor de hypercare | €0 | eenvoudig | de generale repetitie van week 10 vond het verschil van €1.586,40 met de hand; hypercare reageert alleen op wat iemand meldt |
| b. Telemetrie (Application Insights) + een functie voor migratiecontrole en afstemming, met budget | ±€1/maand | elke export dezelfde controle met een spoor; foutmeldingen per pagina zichtbaar in de eerste weken | iemand moet de queries lezen; een Azure-resource om op te ruimen na hypercare |
| c. Volledige integratielaag (Logic Apps, Service Bus) voor webshop en EDI | €50+/maand + bouw | klaar voor fase 2 | geen vraag in fase 1 (VK-08, webshop buiten scope); maatwerk vóór de standaard draait |

## Beslissing

Optie b. Telemetrie en controle zijn hulpmiddelen van het project, geen onderdeel van de oplossing: de klant heeft na de hypercare niets in Azure nodig om te werken.

## Gevolgen

- De omgeving is code ([Bicep](../../azure/main.bicep)) met een daglimiet op logs en een budgetmelding; opruimen = één commando.
- De afstemming na het laden is een go/no-go-criterium dat zichzelf controleert, met dezelfde logica als de workbench.
- Het secret van de API-koppeling staat alleen in Key Vault.
- Na de hypercare beslist de klant: telemetrie houden (eigen abonnement) of opruimen.

## Wanneer ik anders zou kiezen

Als de webshop of EDI in fase 1 zit: dan optie c, maar pas nadat de standaard API voor verkooporders getest is (de extensie VK-10 werkt via die API, zie S-02).
