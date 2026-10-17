namespace Kalvaert.DemoSetup;

/// <summary>What has been applied in this company, so a script (or a person) can see the state at a glance.</summary>
table 50200 "KLV Demo Setup Run"
{
    Caption = 'Demo Setup Run';
    DataClassification = SystemMetadata;

    fields
    {
        field(1; "Primary Key"; Code[10]) { Caption = 'Primary Key'; AllowInCustomizations = Never; }
        field(2; "Setup Applied At"; DateTime) { Caption = 'Setup Applied At'; }
        field(3; "Setup Records"; Integer) { Caption = 'Setup Records'; }
        field(4; "Migration Prepared At"; DateTime) { Caption = 'Migration Prepared At'; }
        field(5; "Migration Lines"; Integer) { Caption = 'Migration Lines'; }
        field(6; "Migration Amount"; Decimal) { Caption = 'Migration Amount'; AutoFormatType = 1; }
        field(7; "Migration Posted At"; DateTime) { Caption = 'Migration Posted At'; }
        field(8; "Cutover Date"; Date) { Caption = 'Cutover Date'; }
        field(9; "Data Version"; Text[40]) { Caption = 'Data Version'; }
    }

    keys
    {
        key(PK; "Primary Key") { Clustered = true; }
    }

    procedure GetOrCreate()
    begin
        if not Get() then begin
            Init();
            Insert();
        end;
    end;
}
