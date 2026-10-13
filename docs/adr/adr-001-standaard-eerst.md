# ADR-001 — Standaard eerst: vaste volgorde om een gap op te lossen

- **Status:** aanvaard
- **Week:** 5 (fit-gap-review)
- **Beslist door:** zaakvoerder, op voorstel van de functional consultant en de projectmanager

> Wat: de regel waarmee elke gap in het [fit-gap-register](../03-fit-gap/fit-gap.md) een oplossing krijgt. Voor wie: klant, projectteam, developer.

## Context

Kalvaert komt van een pakket dat twintig jaar op hun maat werd aangepast. In de workshops begon bijna elke wens met "zoals in TradeDesk". Als we elke afwijking met maatwerk oplossen, wordt het project duurder en is elke jaarlijkse update van Business Central een risico.

## Opties

| Optie | Voordelen | Nadelen |
|---|---|---|
| Per gap ad hoc beslissen | flexibel | elke discussie begint opnieuw; maatwerk wint omdat het "precies doet wat we vroegen" |
| Vaste volgorde: standaard → configuratie → app → procesaanpassing → extensie | voorspelbaar, upgradeveilig, goedkoper | soms moet de klant anders werken; dat vraagt uitleg |
| Alles standaard, geen uitzonderingen | goedkoopst | negeert wat een bedrijf echt onderscheidt of wettelijk moet |

## Beslissing

Elke gap doorloopt de volgorde **standaard → configuratie → AppSource-app → procesaanpassing → extensie**. Een extensie kan alleen als (a) de lagere opties niet volstaan én (b) het een wettelijke verplichting is of een proces waarmee Kalvaert zich onderscheidt. Elke gap krijgt een beslisser bij de klant.

## Gevolgen

- Resultaat: <!--n:cls.stdconf-->16<!--/n--> van de <!--n:req.total-->25<!--/n--> requirements met standaard of configuratie, <!--n:cls.extensie-->1<!--/n--> extensie ([ADR-004](adr-004-verwijderingsbijdrage-als-extensie.md)).
- Gekozen scenario: <!--n:decided.days-->29,0<!--/n--> dagen tegenover <!--n:max.days-->40,5<!--/n--> dagen als elke gap met maatwerk was opgelost.
- Drie gaps worden een procesaanpassing met een afgesproken moment om ze opnieuw te bekijken (ADR-003, ADR-005, ADR-006).

## Wanneer ik anders zou kiezen

Bij een bedrijf waar het afwijkende proces de kern van het verdienmodel is (bijvoorbeeld een configurator voor maatwerkproducten) schuift de grens naar maatwerk — dan met een eigen app-architectuur en testautomatisatie.
