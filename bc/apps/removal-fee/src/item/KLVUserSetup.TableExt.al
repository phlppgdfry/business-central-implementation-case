namespace Kalvaert.RemovalFee;

using System.Security.User;

tableextension 50101 "KLV User Setup" extends "User Setup"
{
    fields
    {
        field(50100; "KLV Can Edit Removal Fee"; Boolean)
        {
            Caption = 'Can Edit Removal Fee';
            ToolTip = 'Specifies whether the user may change the removal fee on items. In the Kalvaert case only purchasing gets this.';
            DataClassification = CustomerContent;
        }
    }
}
