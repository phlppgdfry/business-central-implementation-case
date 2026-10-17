namespace Kalvaert.RemovalFee;

using Microsoft.Sales.Document;

pageextension 50107 "KLV Sales Return Order Subform" extends "Sales Return Order Subform"
{
    layout
    {
        // save and refresh right away, so the fee line under the item is visible while the user types
        modify("No.")
        {
            trigger OnAfterValidate()
            begin
                if Rec.Type = Rec.Type::Item then
                    CurrPage.Update(true);
            end;
        }
        modify(Quantity)
        {
            trigger OnAfterValidate()
            begin
                if Rec.Type = Rec.Type::Item then
                    CurrPage.Update(true);
            end;
        }
        modify("Return Qty. to Receive")
        {
            trigger OnAfterValidate()
            begin
                if Rec.Type = Rec.Type::Item then
                    CurrPage.Update(true);
            end;
        }
    }

    trigger OnModifyRecord(): Boolean
    begin
        RemovalFeeMgt.CheckUserChange(Rec);
    end;

    trigger OnDeleteRecord(): Boolean
    begin
        RemovalFeeMgt.CheckUserChange(Rec);
    end;

    var
        RemovalFeeMgt: Codeunit "KLV Removal Fee Mgt.";
}
