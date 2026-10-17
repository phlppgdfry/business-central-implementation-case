namespace Kalvaert.RemovalFee;

using Microsoft.Sales.Archive;

tableextension 50107 "KLV Sales Line Archive" extends "Sales Line Archive"
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
    }
}
