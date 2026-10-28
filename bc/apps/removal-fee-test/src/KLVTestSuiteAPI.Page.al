namespace Kalvaert.RemovalFee.Test;

using System.TestTools.TestRunner;

/// <summary>Starts the test suite: POST .../testSuites({id})/Microsoft.NAV.runTests</summary>
page 50152 "KLV Test Suite API"
{
    PageType = API;
    APIPublisher = 'kalvaert';
    APIGroup = 'implementation';
    APIVersion = 'v1.0';
    EntityName = 'testSuite';
    EntitySetName = 'testSuites';
    EntityCaption = 'Test Suite';
    EntitySetCaption = 'Test Suites';
    SourceTable = "AL Test Suite";
    ODataKeyFields = SystemId;
    Editable = false;
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
                field(name; Rec.Name) { Caption = 'Name'; }
                field(description; Rec.Description) { Caption = 'Description'; }
                field(testsToExecute; Rec."Tests to Execute") { Caption = 'Tests to Execute'; }
                field(failures; Rec.Failures) { Caption = 'Failures'; }
                field(lastRun; Rec."Last Run") { Caption = 'Last Run'; }
            }
        }
    }

    trigger OnOpenPage()
    var
        ALTestSuite: Record "AL Test Suite";
        TestRun: Codeunit "KLV Test Run";
    begin
        TestRun.EnsureSuite(ALTestSuite);
    end;

    [ServiceEnabled]
    procedure RunTests(var ActionContext: WebServiceActionContext)
    var
        TestRun: Codeunit "KLV Test Run";
    begin
        TestRun.RunAll();
        ActionContext.SetObjectType(ObjectType::Page);
        ActionContext.SetObjectId(Page::"KLV Test Suite API");
        ActionContext.AddEntityKey(Rec.FieldNo(SystemId), Rec.SystemId);
        ActionContext.SetResultCode(WebServiceActionResultCode::Updated);
    end;
}
