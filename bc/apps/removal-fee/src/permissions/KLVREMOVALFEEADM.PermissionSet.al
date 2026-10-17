namespace Kalvaert.RemovalFee;

permissionset 50101 "KLV REMOVAL FEE ADM"
{
    Caption = 'Kalvaert removal fee – setup';
    Assignable = true;
    IncludedPermissionSets = "KLV REMOVAL FEE";
    Permissions = tabledata "KLV Removal Fee Setup" = RIMD;
}
