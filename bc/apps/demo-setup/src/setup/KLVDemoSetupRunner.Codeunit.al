namespace Kalvaert.DemoSetup;

codeunit 50203 "KLV Demo Setup Runner"
{
    procedure ApplySetup(): Integer
    var
        SetupRun: Record "KLV Demo Setup Run";
        Helpers: Codeunit "KLV Demo Helpers";
        DemoData: Codeunit "KLV Demo Data";
    begin
        DemoData.ApplySetup(Helpers);
        SetupRun.GetOrCreate();
        SetupRun."Setup Applied At" := CurrentDateTime();
        SetupRun."Setup Records" := Helpers.RecordsTouched();
        SetupRun."Data Version" := DemoData.DataVersion();
        SetupRun.Modify();
        exit(SetupRun."Setup Records");
    end;

    procedure PrepareMigration(CutoverDate: Date)
    var
        Migration: Codeunit "KLV Demo Migration";
        DemoData: Codeunit "KLV Demo Data";
    begin
        if CutoverDate = 0D then
            CutoverDate := WorkDate();
        Migration.Start(CutoverDate);
        DemoData.OpenCustomerEntries(Migration);
        Migration.Finish();
    end;

    procedure PostMigration()
    var
        Migration: Codeunit "KLV Demo Migration";
    begin
        Migration.Post();
    end;
}
