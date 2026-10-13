# Migratieplan — wat, van waar, door wie, en hoe we weten dat het klopt

> Wat: de <!--n:mig.objects-->9<!--/n--> migratieobjecten met bron, eigenaar, methode en controle. Voor wie: klant (eigenaars van de data), boekhoudkantoor (saldi), projectteam. Vorige stap: [spec VK-10](../05-specs/uc-vk-10-verwijderingsbijdrage.md) · volgende: [afstemming](afstemming.md).
>
> *Aantallen zijn illustratief.*

## Drie soorten data, drie aanpakken

| Soort | Voorbeelden | Hoe | Gecontroleerd door |
|---|---|---|---|
| **Stamdata** | rekeningschema, klanten, leveranciers, artikels, prijsafspraken | configuratiepakketten met sjablonen; eerst opschonen door de eigenaar | steekproeven en verplichte velden |
| **Openstaande posten en saldi** | onbetaalde facturen, leveranciersfacturen, openingsbalans, voorraad | per document (niet als één saldo), tegen overgangsrekening 499000 | afstemming tot op de cent met WinBooks |
| **Historiek** | gesloten facturen, oude orders | **niet** migreren ([ADR-002](../adr/adr-002-historiek-niet-migreren.md)) | TradeDesk blijft 5 jaar raadpleegbaar |

Openstaande posten migreer ik **per factuur**: anders kan de boekhouding in de eerste maand geen enkele betaling meer afpunten op de juiste factuur.

## Objecten

| ID | Object | Bron | Eigenaar (klant) | Methode | Scope | Controle |
|---|---|---|---|---|---|---|
| MIG-01 | Rekeningschema | WinBooks | boekhoudkantoor | configuratiepakket | 212 → 168 rekeningen | elke rekening met saldo heeft een doelrekening |
| MIG-02 | Klanten | TradeDesk | binnendienst | configuratiepakket + sjablonen | 1.480 actief van 3.900 | Belgische klant: ondernemingsnummer of op de opschoonlijst |
| MIG-03 | Leveranciers | TradeDesk | aankoop | configuratiepakket | 310 | IBAN en ondernemingsnummer |
| MIG-04 | Artikels | TradeDesk | aankoop | configuratiepakket + sjablonen | 12.400 actief; 1.150 dubbels vooraf beslist | geen dubbele leveranciersartikelnummers |
| MIG-05 | Prijsafspraken | notities in TradeDesk | commercieel verantwoordelijke | opschoonsjabloon → prijslijsten | 420 afspraken → 31 kortingsgroepen + 64 uitzonderingen | 30 orders: prijs gelijk aan TradeDesk |
| MIG-06 | Openstaande klantposten | TradeDesk | boekhouding | klantdagboek tegen 499000 | per document | som = saldo debiteuren in WinBooks |
| MIG-07 | Openstaande leveranciersposten | TradeDesk | boekhouding | leveranciersdagboek tegen 499000 | per document | som = saldo leveranciers in WinBooks |
| MIG-08 | Openingsbalans | WinBooks | boekhoudkantoor | dagboek openingsbalans | alle balansrekeningen behalve 400/440/340 | 499000 staat daarna op 0 |
| MIG-09 | Voorraad per locatie | TradeDesk | magazijn | artikeldagboek per locatie | hoeveelheid en kostprijs | waarde wijkt < 0,5% af |

## Waarom een overgangsrekening (499000)

Openstaande posten, voorraad en openingsbalans komen uit verschillende systemen en op verschillende momenten binnen. Elk wordt geboekt tegen 499000. Als alles klopt, staat 499000 na de laatste migratie op **nul**. Staat ze dat niet, dan zie je meteen dat er iets ontbreekt of dubbel is — nog vóór de eerste factuur in BC.

## Drie keer oefenen

| Wanneer | Wat | Resultaat |
|---|---|---|
| TM-1, week 8 | eerste testmigratie in de sandbox | 1.150 dubbele artikels gevonden; 212 klanten zonder ondernemingsnummer op de opschoonlijst |
| TM-2, week 10 | tweede testmigratie na opschoning | artikels en klanten zonder fouten; prijssteekproef 30/30 |
| Generale repetitie, week 14 | volledige cutover op een kopie van productie, met tijdmeting | verschil van <!--n:mig.diff.v1-->€1.586,40<!--/n--> in openstaande klantposten → [afstemming](afstemming.md) |

Een eerste testmigratie in week 8 voelt vroeg. Dat is het punt: in week 8 is een vervuilde artikelstam een taak voor aankoop; in week 14 is het een uitgestelde go-live.
