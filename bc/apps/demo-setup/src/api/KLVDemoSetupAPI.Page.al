namespace Kalvaert.DemoSetup;

using System.Reflection;

/// <summary>
/// So a script can build the sandbox without clicking: GET shows the state, the bound actions do the work.
/// POST .../api/kalvaert/implementation/v1.0/companies({id})/demoSetups({id})/Microsoft.NAV.applySetup
/// </summary>
page 50202 "KLV Demo Setup API"
{
    PageType = API;
    APIPublisher = 'kalvaert';
    APIGroup = 'implementation';
    APIVersion = 'v1.0';
    EntityName = 'demoSetup';
    EntitySetName = 'demoSetups';
    EntityCaption = 'Demo Setup';
    EntitySetCaption = 'Demo Setups';
    SourceTable = "KLV Demo Setup Run";
    ODataKeyFields = SystemId;
    DelayedInsert = true;
    InsertAllowed = false;
    DeleteAllowed = false;
    ModifyAllowed = false;
    Extensible = false;

    layout
    {
        area(Content)
        {
            repeater(Records)
            {
                field(id; Rec.SystemId) { Caption = 'Id'; }
                field(setupAppliedAt; Rec."Setup Applied At") { Caption = 'Setup Applied At'; }
                field(setupRecords; Rec."Setup Records") { Caption = 'Setup Records'; }
                field(dataVersion; Rec."Data Version") { Caption = 'Data Version'; }
                field(cutoverDate; Rec."Cutover Date") { Caption = 'Cutover Date'; }
                field(migrationLines; Rec."Migration Lines") { Caption = 'Migration Lines'; }
                field(migrationAmount; Rec."Migration Amount") { Caption = 'Migration Amount'; }
                field(migrationPreparedAt; Rec."Migration Prepared At") { Caption = 'Migration Prepared At'; }
                field(migrationPostedAt; Rec."Migration Posted At") { Caption = 'Migration Posted At'; }
            }
        }
    }

    trigger OnOpenPage()
    var
        Run: Record "KLV Demo Setup Run";
    begin
        Run.GetOrCreate();
    end;

    [ServiceEnabled]
    procedure ApplySetup(var ActionContext: WebServiceActionContext)
    var
        Runner: Codeunit "KLV Demo Setup Runner";
    begin
        Runner.ApplySetup();
        SetResult(ActionContext);
    end;

    [ServiceEnabled]
    procedure PrepareMigration(var ActionContext: WebServiceActionContext)
    var
        Runner: Codeunit "KLV Demo Setup Runner";
    begin
        Runner.PrepareMigration(WorkDate());
        SetResult(ActionContext);
    end;

    [ServiceEnabled]
    procedure PostMigration(var ActionContext: WebServiceActionContext)
    var
        Runner: Codeunit "KLV Demo Setup Runner";
    begin
        Runner.PostMigration();
        SetResult(ActionContext);
    end;

    local procedure SetResult(var ActionContext: WebServiceActionContext)
    begin
        ActionContext.SetObjectType(ObjectType::Page);
        ActionContext.SetObjectId(Page::"KLV Demo Setup API");
        ActionContext.AddEntityKey(Rec.FieldNo(SystemId), Rec.SystemId);
        ActionContext.SetResultCode(WebServiceActionResultCode::Updated);
    end;
}
