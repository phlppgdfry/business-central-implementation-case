namespace Kalvaert.RemovalFee;

using Microsoft.Inventory.Item;
using System.Security.User;

pageextension 50100 "KLV Item Card" extends "Item Card"
{
    layout
    {
        addlast("Prices & Sales")
        {
            field("KLV Removal Fee"; Rec."KLV Removal Fee")
            {
                ApplicationArea = All;
                Editable = CanEditFee;
            }
        }
    }

    trigger OnOpenPage()
    var
        UserSetup: Record "User Setup";
    begin
        CanEditFee := UserSetup.Get(UserId()) and UserSetup."KLV Can Edit Removal Fee";
    end;

    var
        CanEditFee: Boolean;
}
