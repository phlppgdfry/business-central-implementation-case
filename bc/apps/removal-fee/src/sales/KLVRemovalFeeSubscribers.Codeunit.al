namespace Kalvaert.RemovalFee;

using Microsoft.Sales.Document;
using Microsoft.Utilities;

/// <summary>Where the extension listens. Only standard events; no change to standard code (upgrade risk: low).</summary>
codeunit 50102 "KLV Removal Fee Subscribers"
{
    Access = Internal;

    var
        RemovalFeeMgt: Codeunit "KLV Removal Fee Mgt.";
        FeeSession: Codeunit "KLV Removal Fee Session";

    // --- line by line, while a user (or the API) edits a document ---

    [EventSubscriber(ObjectType::Table, Database::"Sales Line", OnAfterInsertEvent, '', false, false)]
    local procedure OnAfterInsertSalesLine(var Rec: Record "Sales Line"; RunTrigger: Boolean)
    begin
        if RemovalFeeMgt.ShouldReact(Rec, RunTrigger) then
            RemovalFeeMgt.SyncItemLine(Rec);
    end;

    [EventSubscriber(ObjectType::Table, Database::"Sales Line", OnAfterModifyEvent, '', false, false)]
    local procedure OnAfterModifySalesLine(var Rec: Record "Sales Line"; var xRec: Record "Sales Line"; RunTrigger: Boolean)
    begin
        if RemovalFeeMgt.ShouldReact(Rec, RunTrigger) then
            RemovalFeeMgt.SyncItemLine(Rec);
    end;

    [EventSubscriber(ObjectType::Table, Database::"Sales Line", OnAfterDeleteEvent, '', false, false)]
    local procedure OnAfterDeleteSalesLine(var Rec: Record "Sales Line"; RunTrigger: Boolean)
    begin
        if Rec.IsTemporary() or Rec."KLV Removal Fee Line" then
            exit;
        if Rec.Type = Rec.Type::Item then
            RemovalFeeMgt.DeleteFeeLinesOf(Rec);
    end;

    // --- bulk operations in standard: stand aside, reconcile the document once at the end (U6, U8) ---

    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Copy Document Mgt.", OnBeforeCopySalesDocument, '', false, false)]
    local procedure OnBeforeCopySalesDocument(FromDocumentType: Option; FromDocumentNo: Code[20]; var ToSalesHeader: Record "Sales Header"; var IsHandled: Boolean)
    begin
        FeeSession.BeginBulk();
    end;

    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Copy Document Mgt.", OnAfterCopySalesDocument, '', false, false)]
    local procedure OnAfterCopySalesDocument(FromDocumentType: Option; FromDocumentNo: Code[20]; var ToSalesHeader: Record "Sales Header"; FromDocOccurenceNo: Integer; FromDocVersionNo: Integer; IncludeHeader: Boolean; RecalculateLines: Boolean; MoveNegLines: Boolean)
    begin
        FeeSession.EndBulk();
        RemovalFeeMgt.SyncDocument(ToSalesHeader);
    end;

    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Sales-Quote to Order", OnBeforeOnRun, '', false, false)]
    local procedure OnBeforeQuoteToOrder(var SalesHeader: Record "Sales Header")
    begin
        FeeSession.BeginBulk();
    end;

    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Sales-Quote to Order", OnAfterOnRun, '', false, false)]
    local procedure OnAfterQuoteToOrder(var SalesHeader: Record "Sales Header"; var SalesOrderHeader: Record "Sales Header")
    begin
        FeeSession.EndBulk();
        RemovalFeeMgt.SyncDocument(SalesOrderHeader);
    end;

    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Blanket Sales Order to Order", OnBeforeRun, '', false, false)]
    local procedure OnBeforeBlanketToOrder(var SalesHeader: Record "Sales Header"; var HideValidationDialog: Boolean; var SuppressCommit: Boolean)
    begin
        FeeSession.BeginBulk();
    end;

    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Blanket Sales Order to Order", OnAfterRun, '', false, false)]
    local procedure OnAfterBlanketToOrder(var SalesHeader: Record "Sales Header"; var SalesOrderHeader: Record "Sales Header")
    begin
        FeeSession.EndBulk();
        RemovalFeeMgt.SyncDocument(SalesOrderHeader);
    end;

    [EventSubscriber(ObjectType::Table, Database::"Sales Header", OnBeforeRecreateSalesLines, '', false, false)]
    local procedure OnBeforeRecreateSalesLines(var SalesHeader: Record "Sales Header")
    begin
        RemovalFeeMgt.DeleteAllFeeLines(SalesHeader);
        FeeSession.BeginBulk();
    end;

    [EventSubscriber(ObjectType::Table, Database::"Sales Header", OnAfterRecreateSalesLines, '', false, false)]
    local procedure OnAfterRecreateSalesLines(var SalesHeader: Record "Sales Header"; ChangedFieldName: Text[100])
    begin
        // U4: customer changed from BINNENL to EU on an open order
        FeeSession.EndBulk();
        RemovalFeeMgt.SyncDocument(SalesHeader);
    end;

    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Sales-Get Shipment", OnBeforeInsertLines, '', false, false)]
    local procedure OnBeforeGetShipmentLines(var SalesHeader: Record "Sales Header")
    begin
        FeeSession.BeginBulk();
    end;

    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Sales-Get Shipment", OnAfterInsertLines, '', false, false)]
    local procedure OnAfterGetShipmentLines(var SalesHeader: Record "Sales Header"; var SalesLine: Record "Sales Line")
    begin
        FeeSession.EndBulk();
        RemovalFeeMgt.SyncDocument(SalesHeader);
    end;

    // --- safety net: nothing leaves the building without a reconciled document ---

    [EventSubscriber(ObjectType::Codeunit, Codeunit::"Release Sales Document", OnBeforeReleaseSalesDoc, '', false, false)]
    local procedure OnBeforeReleaseSalesDoc(var SalesHeader: Record "Sales Header"; PreviewMode: Boolean; var IsHandled: Boolean; var SkipCheckReleaseRestrictions: Boolean; SkipWhseRequestOperations: Boolean)
    begin
        // a bulk operation that failed half-way must not switch the automation off for the rest of the session
        FeeSession.ResetBulk();
        RemovalFeeMgt.SyncDocument(SalesHeader);
    end;
}
