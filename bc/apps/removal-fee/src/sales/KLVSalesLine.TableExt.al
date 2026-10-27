namespace Kalvaert.RemovalFee;

using Microsoft.Sales.Document;

tableextension 50102 "KLV Sales Line" extends "Sales Line"
{
    fields
    {
        // Same field number on the posted and archived line tables, so TransferFields carries the flag along.
        field(50100; "KLV Removal Fee Line"; Boolean)
        {
            Caption = 'Removal Fee Line';
            ToolTip = 'Specifies that this line is the removal fee for the item line it is attached to. The line is managed automatically and cannot be changed by hand.';
            DataClassification = SystemMetadata;
            Editable = false;
        }

        field(50101; "KLV Attached to Line No."; Integer)
        {
            Caption = 'Fee For Line No.';
            ToolTip = 'Specifies the item line this removal fee belongs to. The extension keeps its own link: the standard field "Attached to Line No." marks a line as extended text, and Business Central then refuses to set the line type.';
            DataClassification = SystemMetadata;
            Editable = false;
        }
    }

    keys
    {
        key(KLVFeeLines; "Document Type", "Document No.", "KLV Attached to Line No.", "KLV Removal Fee Line") { }
    }
}
