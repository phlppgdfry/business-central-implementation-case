namespace Kalvaert.RemovalFee.Test;

using System.TestTools.TestRunner;

/// <summary>
/// Runs the test codeunit through Business Central's own test runner. The AL CLI (`al runtests`) needs an
/// interactive sign-in; this way the same tests can also be started from a script or a pipeline, with the
/// service-to-service credentials that the rest of the verification already uses.
/// </summary>
codeunit 50151 "KLV Test Run"
{
    Access = Internal;

    var
        SuiteNameTxt: Label 'KLV', Locked = true;
        CodeunitFilterTxt: Label '50150', Locked = true;
        NoTestsErr: Label 'No test methods were found for codeunit %1. Is the test app installed?', Comment = '%1 = codeunit filter';

    procedure SuiteName(): Code[10]
    begin
        exit(CopyStr(SuiteNameTxt, 1, 10));
    end;

    procedure EnsureSuite(var ALTestSuite: Record "AL Test Suite")
    var
        SuiteDescriptionTxt: Label 'Kalvaert removal fee (UC-VK-10)', Locked = true;
    begin
        if ALTestSuite.Get(SuiteName()) then
            exit;
        ALTestSuite.Init();
        ALTestSuite.Name := SuiteName();
        ALTestSuite.Description := CopyStr(SuiteDescriptionTxt, 1, MaxStrLen(ALTestSuite.Description));
        ALTestSuite.Insert(true);
    end;

    /// <summary>Rebuilds the suite from the test codeunit and runs every test method in it.</summary>
    procedure RunAll()
    var
        ALTestSuite: Record "AL Test Suite";
        TestMethodLine: Record "Test Method Line";
        TestSuiteMgt: Codeunit "Test Suite Mgt.";
    begin
        EnsureSuite(ALTestSuite);
        TestMethodLine.SetRange("Test Suite", ALTestSuite.Name);
        TestMethodLine.DeleteAll(true);
        TestSuiteMgt.SelectTestMethodsByRange(ALTestSuite, CodeunitFilterTxt);
        Commit();

        TestMethodLine.Reset();
        TestMethodLine.SetRange("Test Suite", ALTestSuite.Name);
        // the runner reads the suite from the record it is given, not from its filters,
        // so the record has to be positioned on a line first
        if not TestMethodLine.FindFirst() then
            Error(NoTestsErr, CodeunitFilterTxt);
        TestSuiteMgt.RunAllTests(TestMethodLine);
    end;
}
