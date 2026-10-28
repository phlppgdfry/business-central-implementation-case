namespace Kalvaert.RemovalFee.Test;

using System.TestTools.TestRunner;

/// <summary>One row per test method, with its result: what a pipeline reads after running the suite.</summary>
page 50153 "KLV Test Result API"
{
    PageType = API;
    APIPublisher = 'kalvaert';
    APIGroup = 'implementation';
    APIVersion = 'v1.0';
    EntityName = 'testResult';
    EntitySetName = 'testResults';
    EntityCaption = 'Test Result';
    EntitySetCaption = 'Test Results';
    SourceTable = "Test Method Line";
    ODataKeyFields = SystemId;
    Editable = false;
    InsertAllowed = false;
    DeleteAllowed = false;
    ModifyAllowed = false;
    DataAccessIntent = ReadOnly;
    Extensible = false;

    layout
    {
        area(Content)
        {
            repeater(Records)
            {
                field(id; Rec.SystemId) { Caption = 'Id'; }
                field(testSuite; Rec."Test Suite") { Caption = 'Test Suite'; }
                field(lineNo; Rec."Line No.") { Caption = 'Line No.'; }
                field(lineType; Rec."Line Type") { Caption = 'Line Type'; }
                field(testCodeunit; Rec."Test Codeunit") { Caption = 'Test Codeunit'; }
                field(name; Rec.Name) { Caption = 'Name'; }
                field(function; Rec.Function) { Caption = 'Function'; }
                field(result; Rec.Result) { Caption = 'Result'; }
                field(errorMessage; Rec."Error Message Preview") { Caption = 'Error Message'; }
            }
        }
    }
}
