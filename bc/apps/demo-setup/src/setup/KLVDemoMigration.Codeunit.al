namespace Kalvaert.DemoSetup;

using Microsoft.Finance.GeneralLedger.Journal;
using Microsoft.Finance.GeneralLedger.Posting;

/// <summary>
/// MIG-06: open customer entries per document, against suspense account 499000.
/// One journal line per legacy invoice or credit memo, so customers can still apply payments in January.
/// </summary>
codeunit 50202 "KLV Demo Migration"
{
    Access = Internal;

    var
        TemplateNameTxt: Label 'KLV-MIG', Locked = true;
        BatchNameTxt: Label 'KLANTEN', Locked = true;
        SuspenseAccountTxt: Label '499000', Locked = true;
        BatchDescriptionTxt: Label 'Migratie openstaande klantposten (MIG-06)', Locked = true;
        DaysBackFormulaTxt: Label '<-%1D>', Locked = true;
        LineDescriptionTxt: Label 'Migratie %1', Locked = true, Comment = '%1 = legacy document number';
        CutoverDate: Date;
        NextLineNo: Integer;
        LineCount: Integer;
        TotalAmount: Decimal;

    /// <summary>Empties the batch; the generated data then calls AddEntry per line; Finish records the totals.</summary>
    procedure Start(NewCutoverDate: Date)
    var
        GenJournalLine: Record "Gen. Journal Line";
        Helpers: Codeunit "KLV Demo Helpers";
    begin
        CutoverDate := NewCutoverDate;
        Helpers.EnsureMigrationBatch(TemplateNameTxt, BatchNameTxt, BatchDescriptionTxt, SuspenseAccountTxt);
        GenJournalLine.SetRange("Journal Template Name", TemplateNameTxt);
        GenJournalLine.SetRange("Journal Batch Name", BatchNameTxt);
        GenJournalLine.DeleteAll(true);
        NextLineNo := 0;
        LineCount := 0;
        TotalAmount := 0;
    end;

    procedure Finish()
    var
        SetupRun: Record "KLV Demo Setup Run";
    begin
        SetupRun.GetOrCreate();
        SetupRun."Migration Prepared At" := CurrentDateTime();
        SetupRun."Migration Lines" := LineCount;
        SetupRun."Migration Amount" := TotalAmount;
        SetupRun."Cutover Date" := CutoverDate;
        SetupRun.Modify();
    end;

    /// <summary>Called by the generated data, once per line of klantposten-export-v2.csv.</summary>
    procedure AddEntry(IsCreditMemo: Boolean; DocumentNo: Code[20]; CustomerNo: Code[20]; DaysBeforeCutover: Integer; OpenAmount: Decimal)
    var
        GenJournalLine: Record "Gen. Journal Line";
        PostingDateFormula: DateFormula;
    begin
        NextLineNo += 10000;
        GenJournalLine.Init();
        GenJournalLine."Journal Template Name" := TemplateNameTxt;
        GenJournalLine."Journal Batch Name" := BatchNameTxt;
        GenJournalLine."Line No." := NextLineNo;
        GenJournalLine.Insert(true);
        GenJournalLine.Validate("Posting Date", CutoverDate);
        if IsCreditMemo then
            GenJournalLine.Validate("Document Type", GenJournalLine."Document Type"::"Credit Memo")
        else
            GenJournalLine.Validate("Document Type", GenJournalLine."Document Type"::Invoice);
        GenJournalLine."Document No." := DocumentNo;
        GenJournalLine."External Document No." := DocumentNo;
        GenJournalLine.Validate("Account Type", GenJournalLine."Account Type"::Customer);
        GenJournalLine.Validate("Account No.", CustomerNo);
        Evaluate(PostingDateFormula, StrSubstNo(DaysBackFormulaTxt, DaysBeforeCutover));
        GenJournalLine.Validate("Document Date", CalcDate(PostingDateFormula, CutoverDate));
        GenJournalLine.Validate(Amount, OpenAmount);
        GenJournalLine.Validate("Bal. Account Type", GenJournalLine."Bal. Account Type"::"G/L Account");
        GenJournalLine.Validate("Bal. Account No.", SuspenseAccountTxt);
        GenJournalLine.Description := CopyStr(StrSubstNo(LineDescriptionTxt, DocumentNo), 1, MaxStrLen(GenJournalLine.Description));
        GenJournalLine.Modify(true);
        LineCount += 1;
        TotalAmount += OpenAmount;
    end;

    procedure Post()
    var
        GenJournalLine: Record "Gen. Journal Line";
        SetupRun: Record "KLV Demo Setup Run";
    begin
        GenJournalLine.SetRange("Journal Template Name", TemplateNameTxt);
        GenJournalLine.SetRange("Journal Batch Name", BatchNameTxt);
        GenJournalLine.FindFirst();
        Codeunit.Run(Codeunit::"Gen. Jnl.-Post Batch", GenJournalLine);
        SetupRun.GetOrCreate();
        SetupRun."Migration Posted At" := CurrentDateTime();
        SetupRun.Modify();
    end;
}
