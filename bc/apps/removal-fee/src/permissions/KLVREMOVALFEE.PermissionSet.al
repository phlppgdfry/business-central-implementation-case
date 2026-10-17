namespace Kalvaert.RemovalFee;

permissionset 50100 "KLV REMOVAL FEE"
{
    Caption = 'Kalvaert removal fee – use';
    Assignable = true;
    Permissions =
        tabledata "KLV Removal Fee Setup" = R,
        table "KLV Removal Fee Setup" = X,
        page "KLV Removal Fee Setup" = X,
        codeunit "KLV Removal Fee Mgt." = X,
        codeunit "KLV Removal Fee Session" = X,
        codeunit "KLV Removal Fee Subscribers" = X;
}
