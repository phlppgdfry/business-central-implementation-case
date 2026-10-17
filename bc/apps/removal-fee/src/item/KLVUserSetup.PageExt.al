namespace Kalvaert.RemovalFee;

using System.Security.User;

pageextension 50102 "KLV User Setup" extends "User Setup"
{
    layout
    {
        addlast(Control1)
        {
            field("KLV Can Edit Removal Fee"; Rec."KLV Can Edit Removal Fee")
            {
                ApplicationArea = All;
            }
        }
    }
}
