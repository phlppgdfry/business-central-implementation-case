# Verificatie in Business Central

> Gegenereerd door `node bc/scripts/sandbox.mjs all` op 2026-10-28 01:22 UTC. Omgeving `kalvaert-dev` (sandbox), bedrijf `My Company`. Fictieve data; een sandbox, geen productie.

| Stap | Resultaat | Detail |
|---|---|---|
| envs | ✓ | kalvaert-dev (Sandbox, BE, 29.0.54011.56690, Active); al-dev-2610150817-261023082241 (Sandbox, BE, 28.5.54976.56550, SoftDeleted); Production-261015083258 (Production, BE, 28.5.54151.55799, SoftDeleted) |
| create | ✓ | kalvaert-dev already active (29.0.54011.56690) |
| company | ✓ | My Company already exists |
| status | ✓ | environment kalvaert-dev, company My Company; installed: Kalvaert Demo Setup 1.0.6.0; Kalvaert Removal Fee 1.0.7.0; Kalvaert Removal Fee Tests 1.0.9.0 |
| publish Kalvaert Removal Fee | ✓ | 1.0.7.0 already installed |
| publish Kalvaert Demo Setup | ✓ | 1.0.6.0 already installed |
| publish Kalvaert Removal Fee Tests | ✓ | 1.0.9.0 already installed |
| setup | ✓ | 200 setup records, data version a3bfcac63f0d |
| migration 400000 | ✓ | legacy €170703.53 · BC €170703.53 · difference €0 |
| migration 400100 | ✓ | legacy €29910.71 · BC €29910.71 · difference €0 |
| suspense 499000 after the customer journal | ✓ | €-200614.24; expected −(receivables) = €-200614.24 until the opening balance (MIG-08) clears it to 0 |
| T1 one fee line below the item | ✓ | order 101027: 1 fee line(s), quantity 2, unit price 3.5 |
| T2 quantity change is followed | ✓ | fee quantity 5 |
| T9 partial delivery ships the fee with the goods | ✓ | fee: ordered 5, to ship 2 |
| T3 deleting the item line removes the fee | ✓ | no fee line left |
| T4 EU customer gets no fee line | ✓ | no fee line, as designed |
| T5 item without a fee gets no fee line | ✓ | no fee line |
| T7 quote to order keeps one fee line | ✓ | order 101030: 1 fee line(s), quantity 3 |
| T8 posted entries = posting matrix | ✓ | invoice 103006: 340000 -580, 400000 1024.87, 451000 -177.87, 609000 580, 700000 -840, 700900 -7 |
| AL tests (codeunit 50150) | ✓ | 12/12 passed: T1_DomesticItemWithFeeGetsOneFeeLineDirectlyBelow, T2_QuantityChangeIsFollowed, T3_DeletingTheItemLineDeletesTheFeeLine, T4_EUCustomerGetsNoFeeLine, T5_ItemWithoutFeeGetsNoFeeLine, T6_CopyDocumentGivesExactlyOneFeeLinePerItemLine, T7_QuoteToOrderKeepsOneFeeLine, T8_PostingCreditsFeeAccountAndVATIncludesTheFee, T9_PartialShipmentShipsTheFeeWithTheGoods, U4_CustomerChangedToEURemovesFeeLines, U5_UserCannotChangeTheFeeLine, U7_NewFeeAmountOnlyAffectsNewLines |

## Boeking van 103006 (order 101031) tegen de boekingsmatrix

| Rekening | Model (workbench) | Business Central | |
|---|---:|---:|---|
| 340000 | -580 | -580 | ✓ |
| 400000 | 1024.87 | 1024.87 | ✓ |
| 451000 | -177.87 | -177.87 | ✓ |
| 609000 | 580 | 580 | ✓ |
| 700000 | -840 | -840 | ✓ |
| 700900 | -7 | -7 | ✓ |
