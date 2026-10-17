namespace Kalvaert.DemoSetup;

permissionset 50200 "KLV DEMO SETUP"
{
    Caption = 'Kalvaert demo setup – run';
    Assignable = true;
    Permissions =
        tabledata "KLV Demo Setup Run" = RIMD,
        table "KLV Demo Setup Run" = X,
        page "KLV Demo Setup" = X,
        page "KLV Demo Setup API" = X,
        page "KLV Open Cust. Entries API" = X,
        codeunit "KLV Demo Helpers" = X,
        codeunit "KLV Demo Migration" = X,
        codeunit "KLV Demo Setup Runner" = X,
        codeunit "KLV Demo Data" = X;
}
