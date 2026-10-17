namespace Kalvaert.RemovalFee;

using Microsoft.Inventory.Item;
using Microsoft.Sales.Document;

/// <summary>
/// UC-VK-10: keeps exactly one removal fee line directly under every item line that carries a fee,
/// on domestic sales quotes, orders, invoices, credit memos and return orders.
/// The spec numbers (U1–U9) refer to docs/05-specs/uc-vk-10-verwijderingsbijdrage.md.
/// </summary>
codeunit 50100 "KLV Removal Fee Mgt."
{
    Permissions = tabledata "Sales Line" = rimd;

    var
        Setup: Record "KLV Removal Fee Setup";
        FeeSession: Codeunit "KLV Removal Fee Session";
        ManagedErr: Label 'This removal fee line is managed automatically. Change or delete the item line above it instead.';
        RemovedMsg: Label 'Removal fee lines were removed from %1 %2: the fee only applies to deliveries in Belgium.', Comment = '%1 = document type, %2 = document number';
        DefaultDescriptionTxt: Label 'Verwijderingsbijdrage %1', Locked = true, Comment = 'Used when the setup has no description template. %1 = item number.';
        RemovedNotificationIdTxt: Label 'b7a4d1e2-3c58-4f0a-9e61-2d8c7b5a9f13', Locked = true;
        TelemetryCategoryTxt: Label 'KalvaertRemovalFee', Locked = true;
        FeeAddedTxt: Label 'Removal fee line added', Locked = true;
        FeeRemovedTxt: Label 'Removal fee lines removed: customer not domestic', Locked = true;
        DocumentSyncedTxt: Label 'Removal fee lines reconciled for document', Locked = true;

    /// <summary>Brings the fee line of one item line in line with the item line (U1, U3, U4, U6, U8, U9).</summary>
    procedure SyncItemLine(var ItemLine: Record "Sales Line")
    var
        FeeLine: Record "Sales Line";
        Item: Record Item;
        KeepLineNo: Integer;
    begin
        if ItemLine."KLV Removal Fee Line" or (ItemLine."Line No." = 0) then
            exit;
        FeeSession.SetManaging(true);
        FilterFeeLines(FeeLine, ItemLine);
        if not FeeApplies(ItemLine, Item) then begin
            if not FeeLine.IsEmpty() then begin
                FeeLine.DeleteAll(true);
                NotifyRemoved(ItemLine);
            end;
            FeeSession.SetManaging(false);
            exit;
        end;

        // keep one: preferably the line that came from a shipment (it carries the shipment link), else the first
        FeeLine.SetFilter("Shipment No.", '<>%1', '');
        if not FeeLine.FindFirst() then begin
            FeeLine.SetRange("Shipment No.");
            if not FeeLine.FindFirst() then begin
                InsertFeeLine(ItemLine, Item);
                FeeSession.SetManaging(false);
                exit;
            end;
        end;
        KeepLineNo := FeeLine."Line No.";
        UpdateFeeLine(FeeLine, ItemLine);
        FeeLine.SetRange("Shipment No.");
        FeeLine.SetFilter("Line No.", '<>%1', KeepLineNo);
        FeeLine.DeleteAll(true);
        FeeSession.SetManaging(false);
    end;

    /// <summary>Reconciles a whole document: removes orphaned fee lines, then syncs every item line.</summary>
    procedure SyncDocument(SalesHeader: Record "Sales Header")
    var
        FeeLine: Record "Sales Line";
        ParentLine: Record "Sales Line";
        ItemLine: Record "Sales Line";
        Orphan: Record "Sales Line";
        CustomDimensions: Dictionary of [Text, Text];
    begin
        if not Setup.IsActive() then
            exit;
        if not IsSupportedDocument(SalesHeader."Document Type") then
            exit;
        FeeSession.SetManaging(true);
        FeeLine.SetRange("Document Type", SalesHeader."Document Type");
        FeeLine.SetRange("Document No.", SalesHeader."No.");
        FeeLine.SetRange("KLV Removal Fee Line", true);
        if FeeLine.FindSet() then
            repeat
                if not IsValidParent(FeeLine, ParentLine) then begin
                    Orphan := FeeLine;
                    Orphan.Delete(true);
                end;
            until FeeLine.Next() = 0;
        FeeSession.SetManaging(false);

        ItemLine.SetRange("Document Type", SalesHeader."Document Type");
        ItemLine.SetRange("Document No.", SalesHeader."No.");
        ItemLine.SetRange(Type, ItemLine.Type::Item);
        ItemLine.SetRange("KLV Removal Fee Line", false);
        if ItemLine.FindSet() then
            repeat
                SyncItemLine(ItemLine);
            until ItemLine.Next() = 0;

        CustomDimensions.Add('DocumentType', Format(SalesHeader."Document Type"));
        Session.LogMessage('KLV0003', DocumentSyncedTxt, Verbosity::Normal, DataClassification::SystemMetadata, TelemetryScope::ExtensionPublisher, CustomDimensions);
    end;

    /// <summary>U2: an item line is deleted, its fee line goes with it.</summary>
    procedure DeleteFeeLinesOf(ItemLine: Record "Sales Line")
    var
        FeeLine: Record "Sales Line";
    begin
        if ItemLine."KLV Removal Fee Line" then
            exit;
        FeeSession.SetManaging(true);
        FilterFeeLines(FeeLine, ItemLine);
        FeeLine.DeleteAll(true);
        FeeSession.SetManaging(false);
    end;

    /// <summary>
    /// Before standard recreates all lines (another customer on the document), the fee lines go:
    /// the recreated copy would lose its flag and stay behind as an ordinary G/L line. They come back after the recreate.
    /// </summary>
    procedure DeleteAllFeeLines(SalesHeader: Record "Sales Header")
    var
        FeeLine: Record "Sales Line";
    begin
        FeeSession.SetManaging(true);
        FeeLine.SetRange("Document Type", SalesHeader."Document Type");
        FeeLine.SetRange("Document No.", SalesHeader."No.");
        FeeLine.SetRange("KLV Removal Fee Line", true);
        FeeLine.DeleteAll(true);
        FeeSession.SetManaging(false);
    end;

    /// <summary>U5: users cannot change or delete a fee line on the page.</summary>
    procedure CheckUserChange(SalesLine: Record "Sales Line")
    begin
        if SalesLine."KLV Removal Fee Line" and not FeeSession.IsManaging() then
            Error(ManagedErr);
    end;

    procedure ShouldReact(SalesLine: Record "Sales Line"; RunTrigger: Boolean): Boolean
    begin
        if not RunTrigger or SalesLine.IsTemporary() then
            exit(false);
        if FeeSession.IsManaging() or FeeSession.InBulk() then
            exit(false);
        if SalesLine."KLV Removal Fee Line" then
            exit(false);
        if not IsSupportedDocument(SalesLine."Document Type") then
            exit(false);
        exit(Setup.IsActive());
    end;

    procedure IsSupportedDocument(DocumentType: Enum "Sales Document Type"): Boolean
    begin
        exit(DocumentType in [DocumentType::Quote, DocumentType::Order, DocumentType::Invoice, DocumentType::"Credit Memo", DocumentType::"Return Order"]);
    end;

    local procedure FeeApplies(ItemLine: Record "Sales Line"; var Item: Record Item): Boolean
    begin
        if not Setup.IsActive() then
            exit(false);
        if (ItemLine.Type <> ItemLine.Type::Item) or (ItemLine."No." = '') then
            exit(false);
        if ItemLine."Gen. Bus. Posting Group" <> Setup."Gen. Bus. Posting Group" then
            exit(false);
        if not Item.Get(ItemLine."No.") then
            exit(false);
        exit(Item."KLV Removal Fee" > 0);
    end;

    local procedure IsValidParent(FeeLine: Record "Sales Line"; var ParentLine: Record "Sales Line"): Boolean
    begin
        if FeeLine."Attached to Line No." = 0 then
            exit(false);
        if not ParentLine.Get(FeeLine."Document Type", FeeLine."Document No.", FeeLine."Attached to Line No.") then
            exit(false);
        exit((ParentLine.Type = ParentLine.Type::Item) and not ParentLine."KLV Removal Fee Line");
    end;

    local procedure FilterFeeLines(var FeeLine: Record "Sales Line"; ItemLine: Record "Sales Line")
    begin
        FeeLine.SetRange("Document Type", ItemLine."Document Type");
        FeeLine.SetRange("Document No.", ItemLine."Document No.");
        FeeLine.SetRange("Attached to Line No.", ItemLine."Line No.");
        FeeLine.SetRange("KLV Removal Fee Line", true);
    end;

    local procedure InsertFeeLine(ItemLine: Record "Sales Line"; Item: Record Item)
    var
        FeeLine: Record "Sales Line";
        CustomDimensions: Dictionary of [Text, Text];
        DescriptionTemplate: Text;
    begin
        FeeLine.Init();
        FeeLine.Validate("Document Type", ItemLine."Document Type");
        FeeLine.Validate("Document No.", ItemLine."Document No.");
        FeeLine."Line No." := FindLineNoBelow(ItemLine);
        FeeLine."KLV Removal Fee Line" := true;
        FeeLine."Attached to Line No." := ItemLine."Line No.";
        FeeLine.Insert(true);

        FeeLine.Validate(Type, FeeLine.Type::"G/L Account");
        FeeLine.Validate("No.", Setup."Fee G/L Account No.");
        if Setup."Gen. Prod. Posting Group" <> '' then
            FeeLine.Validate("Gen. Prod. Posting Group", Setup."Gen. Prod. Posting Group");
        // no VAT logic of its own: the fee follows the VAT product posting group of the item (spec §2)
        FeeLine.Validate("VAT Prod. Posting Group", ItemLine."VAT Prod. Posting Group");
        DescriptionTemplate := Setup."Description Template";
        if DescriptionTemplate = '' then
            DescriptionTemplate := DefaultDescriptionTxt;
        FeeLine.Description := CopyStr(StrSubstNo(DescriptionTemplate, ItemLine."No."), 1, MaxStrLen(FeeLine.Description));
        FeeLine.Validate(Quantity, ItemLine.Quantity);
        // U7: the price is taken once, when the line is created; later changes on the item do not touch open documents
        FeeLine.Validate("Unit Price", Item."KLV Removal Fee");
        SyncQuantityToHandle(FeeLine, ItemLine);
        // revenue accounts require VESTIGING and AFDELING (FIN-04): the fee carries the dimensions of its item line
        FeeLine."Shortcut Dimension 1 Code" := ItemLine."Shortcut Dimension 1 Code";
        FeeLine."Shortcut Dimension 2 Code" := ItemLine."Shortcut Dimension 2 Code";
        FeeLine."Dimension Set ID" := ItemLine."Dimension Set ID";
        FeeLine."Attached to Line No." := ItemLine."Line No.";
        FeeLine.Modify(true);

        CustomDimensions.Add('DocumentType', Format(ItemLine."Document Type"));
        CustomDimensions.Add('ItemNo', ItemLine."No.");
        CustomDimensions.Add('Quantity', Format(ItemLine.Quantity, 0, 9));
        CustomDimensions.Add('FeePerUnit', Format(Item."KLV Removal Fee", 0, 9));
        Session.LogMessage('KLV0001', FeeAddedTxt, Verbosity::Normal, DataClassification::SystemMetadata, TelemetryScope::ExtensionPublisher, CustomDimensions);
    end;

    local procedure UpdateFeeLine(var FeeLine: Record "Sales Line"; ItemLine: Record "Sales Line")
    var
        UnitPrice: Decimal;
        Changed: Boolean;
    begin
        if FeeLine.Quantity <> ItemLine.Quantity then begin
            UnitPrice := FeeLine."Unit Price";
            FeeLine.Validate(Quantity, ItemLine.Quantity);
            if FeeLine."Unit Price" <> UnitPrice then
                FeeLine.Validate("Unit Price", UnitPrice);
            Changed := true;
        end;
        if SyncQuantityToHandle(FeeLine, ItemLine) then
            Changed := true;
        if FeeLine."Dimension Set ID" <> ItemLine."Dimension Set ID" then begin
            FeeLine."Shortcut Dimension 1 Code" := ItemLine."Shortcut Dimension 1 Code";
            FeeLine."Shortcut Dimension 2 Code" := ItemLine."Shortcut Dimension 2 Code";
            FeeLine."Dimension Set ID" := ItemLine."Dimension Set ID";
            Changed := true;
        end;
        if Changed then
            FeeLine.Modify(true);
    end;

    /// <summary>U9 (added while building): on a partial delivery the fee ships and is invoiced with the goods, not ahead of them.</summary>
    local procedure SyncQuantityToHandle(var FeeLine: Record "Sales Line"; ItemLine: Record "Sales Line"): Boolean
    begin
        case FeeLine."Document Type" of
            FeeLine."Document Type"::Order:
                if FeeLine."Qty. to Ship" <> ItemLine."Qty. to Ship" then begin
                    FeeLine.Validate("Qty. to Ship", ItemLine."Qty. to Ship");
                    exit(true);
                end;
            FeeLine."Document Type"::"Return Order":
                if FeeLine."Return Qty. to Receive" <> ItemLine."Return Qty. to Receive" then begin
                    FeeLine.Validate("Return Qty. to Receive", ItemLine."Return Qty. to Receive");
                    exit(true);
                end;
        end;
        exit(false);
    end;

    /// <summary>A free line number directly under the item line and any extended-text lines attached to it.</summary>
    local procedure FindLineNoBelow(ItemLine: Record "Sales Line"): Integer
    var
        SalesLine: Record "Sales Line";
        Anchor: Integer;
    begin
        Anchor := ItemLine."Line No.";
        SalesLine.SetRange("Document Type", ItemLine."Document Type");
        SalesLine.SetRange("Document No.", ItemLine."Document No.");
        SalesLine.SetRange("Attached to Line No.", ItemLine."Line No.");
        SalesLine.SetRange("KLV Removal Fee Line", false);
        if SalesLine.FindLast() then
            if SalesLine."Line No." > Anchor then
                Anchor := SalesLine."Line No.";

        SalesLine.Reset();
        SalesLine.SetRange("Document Type", ItemLine."Document Type");
        SalesLine.SetRange("Document No.", ItemLine."Document No.");
        SalesLine.SetFilter("Line No.", '>%1', Anchor);
        if not SalesLine.FindFirst() then
            exit(Anchor + 5000);
        if SalesLine."Line No." - Anchor >= 2 then
            exit(Anchor + (SalesLine."Line No." - Anchor) div 2);
        // no room under the item line: append at the end rather than fail the user's order entry
        SalesLine.SetRange("Line No.");
        SalesLine.FindLast();
        exit(SalesLine."Line No." + 10000);
    end;

    local procedure NotifyRemoved(ItemLine: Record "Sales Line")
    var
        RemovedNotification: Notification;
        CustomDimensions: Dictionary of [Text, Text];
    begin
        CustomDimensions.Add('DocumentType', Format(ItemLine."Document Type"));
        CustomDimensions.Add('GenBusPostingGroup', ItemLine."Gen. Bus. Posting Group");
        Session.LogMessage('KLV0002', FeeRemovedTxt, Verbosity::Normal, DataClassification::SystemMetadata, TelemetryScope::ExtensionPublisher, CustomDimensions);
        if not GuiAllowed() then
            exit;
        RemovedNotification.Id := RemovedNotificationIdTxt;
        RemovedNotification.Message := StrSubstNo(RemovedMsg, ItemLine."Document Type", ItemLine."Document No.");
        RemovedNotification.Scope := NotificationScope::LocalScope;
        RemovedNotification.Send();
    end;

    procedure TelemetryCategory(): Text
    begin
        exit(TelemetryCategoryTxt);
    end;
}
