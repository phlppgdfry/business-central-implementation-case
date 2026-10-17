namespace Kalvaert.RemovalFee;

using Microsoft.Inventory.Item;

pageextension 50101 "KLV Item List" extends "Item List"
{
    layout
    {
        addlast(Control1)
        {
            field("KLV Removal Fee"; Rec."KLV Removal Fee")
            {
                ApplicationArea = All;
                Visible = false;
            }
        }
    }
}
