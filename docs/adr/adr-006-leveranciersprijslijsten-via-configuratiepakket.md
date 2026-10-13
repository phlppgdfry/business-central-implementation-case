# ADR-006 — Leveranciersprijslijsten via sjabloon en configuratiepakket

- **Status:** aanvaard, opnieuw bekijken als een leverancier zijn formaat blijft wijzigen
- **Week:** 5
- **Beslist door:** aankoopverantwoordelijke

> Wat: hoe de maandelijkse prijslijsten (±38.000 regels) in Business Central komen. Hoort bij [AK-02](../03-fit-gap/fit-gap.md).

## Context

Drie grote leveranciers sturen elke maand een Excel-prijslijst. De opmaak verschilt per leverancier en "is elke maand anders" (W-AK).

## Opties

| Optie | Dagen | Voordelen | Nadelen |
|---|---:|---|---|
| a. Extensie: importtool per leveranciersformaat | 6 | één klik per lijst | breekt bij elke formaatwijziging van een leverancier; maatwerk |
| b. Vast sjabloon per leverancier + configuratiepakket | 1,5 | standaard, aankoper heeft de controle, validatie vóór toepassen | 15–30 minuten werk per lijst |

## Beslissing

Optie b. Een importtool die breekt zodra een leverancier een kolom verschuift, verschuift het probleem naar support.

## Gevolgen

- Taakkaart "prijslijst inlezen" met een steekproef van 5 prijzen vóór toepassen (toegevoegd na HC-06, decimalen ×100).
- Na zes maanden: per leverancier het aantal formaatwijzigingen tellen. Twee of meer per kwartaal → leverancier vragen om een vast formaat of opnieuw beslissen.
