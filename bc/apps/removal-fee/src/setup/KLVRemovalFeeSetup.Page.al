namespace Kalvaert.RemovalFee;

page 50100 "KLV Removal Fee Setup"
{
    Caption = 'Removal Fee Setup';
    PageType = Card;
    SourceTable = "KLV Removal Fee Setup";
    UsageCategory = Administration;
    ApplicationArea = All;
    InsertAllowed = false;
    DeleteAllowed = false;

    layout
    {
        area(Content)
        {
            group(General)
            {
                Caption = 'General';
                field(Enabled; Rec.Enabled) { }
                field("Gen. Bus. Posting Group"; Rec."Gen. Bus. Posting Group") { }
            }
            group(FeeLine)
            {
                Caption = 'Fee line';
                field("Fee G/L Account No."; Rec."Fee G/L Account No.") { }
                field("Gen. Prod. Posting Group"; Rec."Gen. Prod. Posting Group") { }
                field("Description Template"; Rec."Description Template") { }
                field("Show Notifications"; Rec."Show Notifications") { }
            }
        }
    }

    trigger OnOpenPage()
    begin
        Rec.Reset();
        if not Rec.Get() then begin
            Rec.Init();
            Rec.Insert();
        end;
    end;
}
