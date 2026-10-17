namespace Kalvaert.RemovalFee;

using Microsoft.Sales.History;

tableextension 50106 "KLV Return Receipt Line" extends "Return Receipt Line"
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
