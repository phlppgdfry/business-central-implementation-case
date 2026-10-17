namespace Kalvaert.DemoSetup;

using Microsoft.Sales.Receivables;

/// <summary>
/// Read-only: open customer entries per document, for the reconciliation after the migration
/// (the Azure function and bc/scripts/sandbox.mjs compare them with the legacy export).
/// </summary>
page 50203 "KLV Open Cust. Entries API"
{
    PageType = API;
    APIPublisher = 'kalvaert';
    APIGroup = 'implementation';
    APIVersion = 'v1.0';
    EntityName = 'openCustomerEntry';
    EntitySetName = 'openCustomerEntries';
    EntityCaption = 'Open Customer Entry';
    EntitySetCaption = 'Open Customer Entries';
    SourceTable = "Cust. Ledger Entry";
    SourceTableView = where(Open = const(true));
    ODataKeyFields = SystemId;
    Editable = false;
    InsertAllowed = false;
    ModifyAllowed = false;
    DeleteAllowed = false;
    DataAccessIntent = ReadOnly;
    Extensible = false;

    layout
    {
        area(Content)
        {
            repeater(Records)
            {
                field(id; Rec.SystemId) { Caption = 'Id'; }
                field(entryNo; Rec."Entry No.") { Caption = 'Entry No.'; }
                field(customerNo; Rec."Customer No.") { Caption = 'Customer No.'; }
                field(documentType; Rec."Document Type") { Caption = 'Document Type'; }
                field(documentNo; Rec."Document No.") { Caption = 'Document No.'; }
                field(externalDocumentNo; Rec."External Document No.") { Caption = 'External Document No.'; }
                field(postingDate; Rec."Posting Date") { Caption = 'Posting Date'; }
                field(customerPostingGroup; Rec."Customer Posting Group") { Caption = 'Customer Posting Group'; }
                field(remainingAmountLCY; Rec."Remaining Amt. (LCY)") { Caption = 'Remaining Amount (LCY)'; }
            }
        }
    }
}
