namespace Kalvaert.RemovalFee;

/// <summary>
/// Creates the setup record with the values from the solution design. It starts switched off: finance turns it on
/// after the accounts and posting groups exist and the data migration is done (cutover step, see docs/07-go-live).
/// </summary>
codeunit 50103 "KLV Removal Fee Install"
{
    Subtype = Install;
    Access = Internal;

    trigger OnInstallAppPerCompany()
    var
        Setup: Record "KLV Removal Fee Setup";
        DescriptionTxt: Label 'Verwijderingsbijdrage %1', Locked = true, Comment = 'Dutch on purpose: printed on Belgian invoices.';
    begin
        if Setup.Get() then
            exit;
        Setup.Init();
        Setup.Enabled := false;
        Setup."Gen. Bus. Posting Group" := 'BINNENL';
        Setup."Fee G/L Account No." := '700900';
        Setup."Gen. Prod. Posting Group" := 'BIJDRAGE';
        Setup."Description Template" := DescriptionTxt;
        Setup."Show Notifications" := true;
        Setup.Insert();
    end;
}
