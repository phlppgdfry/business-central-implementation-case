<!-- Gegenereerd door scripts/build.mjs uit data/case.json — niet met de hand aanpassen. -->
# Hypercare-log (eerste 12 werkdagen)

> Wat: elke melding na de go-live met de echte oorzaak en een structurele maatregel. Voor wie: projectmanager, support (overdracht in week 19), klant. Vorige stap: [go-live](README.md).
>
> *Fictief — illustratief.*

**8 meldingen, waarvan 1 bug.** Data: 3 · setup: 2 · opleiding: 2 · bug: 1.
De les voor de overdracht: wie hypercare-meldingen alleen oplost, krijgt ze terug. Daarom heeft elke melding een structurele maatregel.

| ID | Dag | Symptoom | Categorie | Oorzaak | Herstel | Structureel | Requirement |
|---|---:|---|---|---|---|---|---|
| HC-01 | 1 | Drie facturen geweigerd door het Peppol-netwerk | data | twee tikfouten in het ondernemingsnummer (bij migratie niet gecontroleerd op het controlegetal) en één klant die nog niet op Peppol geregistreerd was | nummers gecorrigeerd en opnieuw verzonden; derde klant gecontacteerd, factuur na registratie opnieuw verzonden | controle van het controlegetal (modulo 97) toegevoegd aan de opschoonlijst; wekelijkse lijst van e-documenten met fout | EF-03 Ondernemingsnummer verplicht voor Belgische klanten |
| HC-02 | 1 | Kassaticket aan de balie drukt niet af | setup | rapportselectie verkoopfactuur voor de baliegebruiker niet ingesteld | rapportselectie en printer ingesteld | printertest opgenomen in de go-live-checklist van een volgend filiaal | VK-03 Balieverkoop met directe betaling in het filiaal |
| HC-03 | 2 | Verkoper ziet de afgesproken prijs niet | opleiding | prijs stond in de prijslijst, maar de verkoper zocht in de artikelkaart | uitleg aan de binnendienst; taakkaart "waar komt mijn prijs vandaan" | taakkaart toegevoegd aan de training | VK-01 Klantspecifieke prijsafspraken automatisch toepassen |
| HC-04 | 3 | Factuur aan een Franse klant met 21% btw | data | 4 gemigreerde EU-klanten hadden in TradeDesk geen landcode; de mapping zette ze op BINNENL | boekingsgroepen gecorrigeerd, creditnota en nieuwe factuur | controlelijst: land ≠ BE en BTW-bedrijfsgroep BINNENL | FIN-02 BTW-aangifte en jaarlijkse klantenlisting |
| HC-05 | 4 | Transfer niet zichtbaar in het filiaal | opleiding | transfer verzonden maar nog niet ontvangen geboekt | uitleg verzenden versus ontvangen | ontvangst transfer in de dagelijkse werklijst van het filiaal | VR-01 Twee locaties en transfers naar het filiaal |
| HC-06 | 6 | Prijzen van een leverancier ×100 na import | data | leverancier stuurde decimalen met een punt in plaats van een komma | import teruggedraaid, sjabloon met vast getalformaat | controle in de taakkaart: steekproef van 5 prijzen vóór toepassen | AK-02 Prijslijsten van leveranciers inlezen |
| HC-07 | 9 | Bijdrageregel staat dubbel na order kopiëren | bug | extensie voegde de regel toe bij het kopiëren én bij het valideren van de artikelregel | developer past de extensie aan; hertest UAT-06 met kopieerscenario | testgeval "order kopiëren" toegevoegd aan de spec (UC-VK-10) | VK-10 Verwijderingsbijdrage op elektro-artikels automatisch op de order |
| HC-08 | 12 | Aanmaning naar klant met lopende creditnota | setup | creditnota nog niet afgepunt tegen de factuur | afpunten; aanmaning geannuleerd | afpunten van creditnota's toegevoegd aan de wekelijkse routine boekhouding | VK-09 Herinneringen en aanmaningen |
