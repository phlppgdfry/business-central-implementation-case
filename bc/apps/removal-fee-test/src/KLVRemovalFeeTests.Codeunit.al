namespace Kalvaert.RemovalFee.Test;

using Kalvaert.DemoSetup;
using Kalvaert.RemovalFee;
using Microsoft.Finance.GeneralLedger.Ledger;
using Microsoft.Finance.VAT.Ledger;
using Microsoft.Inventory.Item;
using Microsoft.Sales.Document;
using System.TestLibraries.Utilities;

/// <summary>
/// T1–T9 from UC-VK-10 §3, plus U4, U5 and U7 from §1. Same customers and items as the spec:
/// K10023 (BINNENL), K20411 (EU), A-220318 (boiler, fee 3.50), A-114502 (no fee).
/// </summary>
codeunit 50150 "KLV Removal Fee Tests"
{
    Subtype = Test;
    TestPermissions = Disabled;

    var
        Assert: Codeunit "Library Assert";
        LibrarySales: Codeunit "Library - Sales";
        RemovalFeeMgt: Codeunit "KLV Removal Fee Mgt.";
        IsInitialized: Boolean;
        DomesticCustomerTxt: Label 'K10023', Locked = true;
        EUCustomerTxt: Label 'K20411', Locked = true;
        FeeItemTxt: Label 'A-220318', Locked = true;
        NoFeeItemTxt: Label 'A-114502', Locked = true;
        FeeAccountTxt: Label '700900', Locked = true;
        ManagedErr: Label 'This removal fee line is managed automatically.', Locked = true;

    [Test]
    procedure T1_DomesticItemWithFeeGetsOneFeeLineDirectlyBelow()
    var
        SalesHeader: Record "Sales Header";
        ItemLine: Record "Sales Line";
        FeeLine: Record "Sales Line";
        NextLine: Record "Sales Line";
    begin
        Initialize();
        CreateOrder(SalesHeader, ItemLine, DomesticCustomerTxt, FeeItemTxt, 2);

        FindSingleFeeLine(FeeLine, ItemLine);
        Assert.AreEqual(2, FeeLine.Quantity, 'fee quantity follows the item');
        Assert.AreEqual(3.5, FeeLine."Unit Price", 'fee per unit from the item');
        Assert.AreEqual(FeeAccountTxt, FeeLine."No.", 'fee posts to the fee account');
        Assert.AreEqual(ItemLine."VAT Prod. Posting Group", FeeLine."VAT Prod. Posting Group", 'fee follows the VAT of the item');
        Assert.AreEqual(ItemLine."Dimension Set ID", FeeLine."Dimension Set ID", 'fee carries the dimensions of the item line');
        NextLine.SetRange("Document Type", ItemLine."Document Type");
        NextLine.SetRange("Document No.", ItemLine."Document No.");
        NextLine.SetFilter("Line No.", '>%1', ItemLine."Line No.");
        NextLine.FindFirst();
        Assert.AreEqual(FeeLine."Line No.", NextLine."Line No.", 'fee line is directly below the item line');
    end;

    [Test]
    procedure T2_QuantityChangeIsFollowed()
    var
        SalesHeader: Record "Sales Header";
        ItemLine: Record "Sales Line";
        FeeLine: Record "Sales Line";
    begin
        Initialize();
        CreateOrder(SalesHeader, ItemLine, DomesticCustomerTxt, FeeItemTxt, 2);

        ItemLine.Validate(Quantity, 5);
        ItemLine.Modify(true);

        FindSingleFeeLine(FeeLine, ItemLine);
        Assert.AreEqual(5, FeeLine.Quantity, 'fee quantity follows the new item quantity');
        Assert.AreEqual(3.5, FeeLine."Unit Price", 'price unchanged');
    end;

    [Test]
    procedure T3_DeletingTheItemLineDeletesTheFeeLine()
    var
        SalesHeader: Record "Sales Header";
        ItemLine: Record "Sales Line";
        FeeLine: Record "Sales Line";
    begin
        Initialize();
        CreateOrder(SalesHeader, ItemLine, DomesticCustomerTxt, FeeItemTxt, 2);

        ItemLine.Delete(true);

        FilterFeeLines(FeeLine, SalesHeader);
        Assert.RecordIsEmpty(FeeLine);
    end;

    [Test]
    procedure T4_EUCustomerGetsNoFeeLine()
    var
        SalesHeader: Record "Sales Header";
        ItemLine: Record "Sales Line";
        FeeLine: Record "Sales Line";
    begin
        Initialize();
        CreateOrder(SalesHeader, ItemLine, EUCustomerTxt, FeeItemTxt, 1);

        FilterFeeLines(FeeLine, SalesHeader);
        Assert.RecordIsEmpty(FeeLine);
    end;

    [Test]
    procedure T5_ItemWithoutFeeGetsNoFeeLine()
    var
        SalesHeader: Record "Sales Header";
        ItemLine: Record "Sales Line";
        FeeLine: Record "Sales Line";
    begin
        Initialize();
        CreateOrder(SalesHeader, ItemLine, DomesticCustomerTxt, NoFeeItemTxt, 3);

        FilterFeeLines(FeeLine, SalesHeader);
        Assert.RecordIsEmpty(FeeLine);
    end;

    [Test]
    procedure T6_CopyDocumentGivesExactlyOneFeeLinePerItemLine()
    var
        FromHeader: Record "Sales Header";
        ToHeader: Record "Sales Header";
        ItemLine: Record "Sales Line";
        FeeLine: Record "Sales Line";
    begin
        // HC-07: before the fix, a copied order had two fee lines under the boiler
        Initialize();
        CreateOrder(FromHeader, ItemLine, DomesticCustomerTxt, FeeItemTxt, 2);
        LibrarySales.CreateSalesHeader(ToHeader, ToHeader."Document Type"::Order, DomesticCustomerTxt);

        LibrarySales.CopySalesDocument(ToHeader, "Sales Document Type From"::Order, FromHeader."No.", true, false);

        FilterFeeLines(FeeLine, ToHeader);
        Assert.RecordCount(FeeLine, 1);
        FeeLine.FindFirst();
        Assert.AreEqual(2, FeeLine.Quantity, 'copied fee quantity');
    end;

    [Test]
    procedure T7_QuoteToOrderKeepsOneFeeLine()
    var
        QuoteHeader: Record "Sales Header";
        OrderHeader: Record "Sales Header";
        ItemLine: Record "Sales Line";
        FeeLine: Record "Sales Line";
        QuoteNo: Code[20];
    begin
        Initialize();
        LibrarySales.CreateSalesHeader(QuoteHeader, QuoteHeader."Document Type"::Quote, DomesticCustomerTxt);
        LibrarySales.CreateSalesLine(ItemLine, QuoteHeader, ItemLine.Type::Item, FeeItemTxt, 1);
        QuoteNo := QuoteHeader."No.";

        LibrarySales.QuoteMakeOrder(QuoteHeader);

        OrderHeader.SetRange("Document Type", OrderHeader."Document Type"::Order);
        OrderHeader.SetRange("Quote No.", QuoteNo);
        OrderHeader.FindFirst();
        FilterFeeLines(FeeLine, OrderHeader);
        Assert.RecordCount(FeeLine, 1);
    end;

    [Test]
    procedure T8_PostingCreditsFeeAccountAndVATIncludesTheFee()
    var
        SalesHeader: Record "Sales Header";
        ItemLine: Record "Sales Line";
        GLEntry: Record "G/L Entry";
        VATEntry: Record "VAT Entry";
        PostedInvoiceNo: Code[20];
    begin
        Initialize();
        CreateOrder(SalesHeader, ItemLine, DomesticCustomerTxt, FeeItemTxt, 2);

        PostedInvoiceNo := LibrarySales.PostSalesDocument(SalesHeader, true, true);

        GLEntry.SetRange("Document No.", PostedInvoiceNo);
        GLEntry.SetRange("G/L Account No.", FeeAccountTxt);
        GLEntry.CalcSums(Amount);
        Assert.AreEqual(-7, GLEntry.Amount, '700900 credit 7.00 (2 x 3.50)');
        VATEntry.SetRange("Document No.", PostedInvoiceNo);
        VATEntry.CalcSums(Base, Amount);
        Assert.AreEqual(-(2 * 420 + 7), VATEntry.Base, 'VAT base includes the fee');
        Assert.AreEqual(-Round((2 * 420 + 7) * 0.21), VATEntry.Amount, 'VAT 21% also on the fee');
    end;

    [Test]
    procedure T9_PartialShipmentShipsTheFeeWithTheGoods()
    var
        SalesHeader: Record "Sales Header";
        ItemLine: Record "Sales Line";
        FeeLine: Record "Sales Line";
    begin
        // U9, found while building: without it the whole fee would be invoiced with the first partial delivery
        Initialize();
        CreateOrder(SalesHeader, ItemLine, DomesticCustomerTxt, FeeItemTxt, 5);

        ItemLine.Validate("Qty. to Ship", 2);
        ItemLine.Modify(true);

        FindSingleFeeLine(FeeLine, ItemLine);
        Assert.AreEqual(5, FeeLine.Quantity, 'ordered fee quantity');
        Assert.AreEqual(2, FeeLine."Qty. to Ship", 'fee ships with the goods');
    end;

    [Test]
    procedure U4_CustomerChangedToEURemovesFeeLines()
    var
        SalesHeader: Record "Sales Header";
        ItemLine: Record "Sales Line";
        FeeLine: Record "Sales Line";
        GLLine: Record "Sales Line";
    begin
        Initialize();
        CreateOrder(SalesHeader, ItemLine, DomesticCustomerTxt, FeeItemTxt, 2);

        // Both dialogs of this step only exist in a session with a client: the confirm for recreating the
        // lines, and the notification that the fee was dropped. Switching them off keeps the test identical
        // whether it runs from the Test Tool or from a pipeline; what is asserted is the data.
        SilenceNotifications();
        SalesHeader.SetHideValidationDialog(true);
        SalesHeader.Validate("Sell-to Customer No.", EUCustomerTxt);
        SalesHeader.Modify(true);

        FilterFeeLines(FeeLine, SalesHeader);
        Assert.RecordIsEmpty(FeeLine);
        // and no unflagged copy of the fee left behind as an ordinary G/L line
        GLLine.SetRange("Document Type", SalesHeader."Document Type");
        GLLine.SetRange("Document No.", SalesHeader."No.");
        GLLine.SetRange("No.", FeeAccountTxt);
        Assert.RecordIsEmpty(GLLine);
    end;

    [Test]
    procedure U5_UserCannotChangeTheFeeLine()
    var
        SalesHeader: Record "Sales Header";
        ItemLine: Record "Sales Line";
        FeeLine: Record "Sales Line";
    begin
        Initialize();
        CreateOrder(SalesHeader, ItemLine, DomesticCustomerTxt, FeeItemTxt, 1);
        FindSingleFeeLine(FeeLine, ItemLine);

        asserterror RemovalFeeMgt.CheckUserChange(FeeLine);

        Assert.ExpectedError(ManagedErr);
    end;

    [Test]
    procedure U7_NewFeeAmountOnlyAffectsNewLines()
    var
        Item: Record Item;
        OldHeader: Record "Sales Header";
        NewHeader: Record "Sales Header";
        OldItemLine: Record "Sales Line";
        NewItemLine: Record "Sales Line";
        FeeLine: Record "Sales Line";
    begin
        Initialize();
        CreateOrder(OldHeader, OldItemLine, DomesticCustomerTxt, FeeItemTxt, 1);
        Item.Get(FeeItemTxt);
        Item."KLV Removal Fee" := 4;
        Item.Modify();

        CreateOrder(NewHeader, NewItemLine, DomesticCustomerTxt, FeeItemTxt, 1);

        FindSingleFeeLine(FeeLine, OldItemLine);
        Assert.AreEqual(3.5, FeeLine."Unit Price", 'open order keeps the old fee');
        FindSingleFeeLine(FeeLine, NewItemLine);
        Assert.AreEqual(4, FeeLine."Unit Price", 'new line gets the new fee');
    end;

    local procedure SilenceNotifications()
    var
        RemovalFeeSetup: Record "KLV Removal Fee Setup";
    begin
        RemovalFeeSetup.Get();
        RemovalFeeSetup."Show Notifications" := false;
        RemovalFeeSetup.Modify();
        Commit();
    end;

    local procedure Initialize()
    var
        DemoSetupRun: Record "KLV Demo Setup Run";
        DemoSetupRunner: Codeunit "KLV Demo Setup Runner";
    begin
        if IsInitialized then
            exit;
        if not DemoSetupRun.Get() or (DemoSetupRun."Setup Applied At" = 0DT) then
            DemoSetupRunner.ApplySetup();
        IsInitialized := true;
        Commit();
    end;

    local procedure CreateOrder(var SalesHeader: Record "Sales Header"; var ItemLine: Record "Sales Line"; CustomerNo: Code[20]; ItemNo: Code[20]; Qty: Decimal)
    begin
        LibrarySales.CreateSalesHeader(SalesHeader, SalesHeader."Document Type"::Order, CustomerNo);
        LibrarySales.CreateSalesLine(ItemLine, SalesHeader, ItemLine.Type::Item, ItemNo, Qty);
    end;

    local procedure FilterFeeLines(var FeeLine: Record "Sales Line"; SalesHeader: Record "Sales Header")
    begin
        FeeLine.SetRange("Document Type", SalesHeader."Document Type");
        FeeLine.SetRange("Document No.", SalesHeader."No.");
        FeeLine.SetRange("KLV Removal Fee Line", true);
    end;

    local procedure FindSingleFeeLine(var FeeLine: Record "Sales Line"; ItemLine: Record "Sales Line")
    begin
        FeeLine.SetRange("Document Type", ItemLine."Document Type");
        FeeLine.SetRange("Document No.", ItemLine."Document No.");
        FeeLine.SetRange("KLV Attached to Line No.", ItemLine."Line No.");
        FeeLine.SetRange("KLV Removal Fee Line", true);
        Assert.RecordCount(FeeLine, 1);
        FeeLine.FindFirst();
    end;

    [ConfirmHandler]
    procedure ConfirmYes(Question: Text[1024]; var Reply: Boolean)
    begin
        Reply := true;
    end;
}
