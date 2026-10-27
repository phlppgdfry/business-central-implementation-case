namespace Kalvaert.RemovalFee;

using Microsoft.Sales.History;

tableextension 50103 "KLV Sales Invoice Line" extends "Sales Invoice Line"
{
    fields
    {
        field(50100; "KLV Removal Fee Line"; Boolean)
        {
            Caption = 'Removal Fee Line';
            ToolTip = 'Specifies that this line was the automatic removal fee for the item line above it.';
            DataClassification = SystemMetadata;
            Editable = false;
        }
        field(50101; "KLV Attached to Line No."; Integer)
        {
            Caption = 'Fee For Line No.';
            ToolTip = 'Specifies the item line this removal fee belonged to.';
            DataClassification = SystemMetadata;
            Editable = false;
        }
    }
}
