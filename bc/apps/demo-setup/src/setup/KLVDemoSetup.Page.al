namespace Kalvaert.DemoSetup;

page 50201 "KLV Demo Setup"
{
    Caption = 'Kalvaert Demo Setup';
    PageType = Card;
    SourceTable = "KLV Demo Setup Run";
    UsageCategory = Tasks;
    ApplicationArea = All;
    InsertAllowed = false;
    DeleteAllowed = false;
    Editable = false;

    layout
    {
        area(Content)
        {
            group(SetupGroup)
            {
                Caption = 'Solution design';
                field("Setup Applied At"; Rec."Setup Applied At") { ToolTip = 'Specifies when the setup from the solution design was last applied.'; }
                field("Setup Records"; Rec."Setup Records") { ToolTip = 'Specifies how many setup records were created or updated.'; }
                field("Data Version"; Rec."Data Version") { ToolTip = 'Specifies the version of data/case.json the setup was generated from.'; }
            }
            group(MigrationGroup)
            {
                Caption = 'Migration (MIG-06)';
                field("Cutover Date"; Rec."Cutover Date") { ToolTip = 'Specifies the posting date of the opening entries.'; }
                field("Migration Lines"; Rec."Migration Lines") { ToolTip = 'Specifies the number of open customer entries in the migration journal.'; }
                field("Migration Amount"; Rec."Migration Amount") { ToolTip = 'Specifies the total of the open customer entries. It must match the receivables in the legacy system.'; }
                field("Migration Prepared At"; Rec."Migration Prepared At") { ToolTip = 'Specifies when the migration journal was prepared.'; }
                field("Migration Posted At"; Rec."Migration Posted At") { ToolTip = 'Specifies when the migration journal was posted.'; }
            }
        }
    }

    actions
    {
        area(Processing)
        {
            action(ApplySetup)
            {
                Caption = 'Apply solution design';
                ToolTip = 'Creates or updates accounts, posting groups, VAT setup, dimensions, locations, items, customers and the removal fee setup.';
                Image = Setup;

                trigger OnAction()
                var
                    Runner: Codeunit "KLV Demo Setup Runner";
                    AppliedMsg: Label '%1 setup records created or updated.', Comment = '%1 = number of records';
                begin
                    Message(AppliedMsg, Runner.ApplySetup());
                    CurrPage.Update(false);
                end;
            }
            action(PrepareMigration)
            {
                Caption = 'Prepare migration journal';
                ToolTip = 'Fills journal KLV-MIG / KLANTEN with one line per open legacy document, against suspense account 499000, with the work date as cutover date.';
                Image = Journal;

                trigger OnAction()
                var
                    Runner: Codeunit "KLV Demo Setup Runner";
                begin
                    Runner.PrepareMigration(WorkDate());
                    CurrPage.Update(false);
                end;
            }
            action(PostMigration)
            {
                Caption = 'Post migration journal';
                ToolTip = 'Posts the migration journal. Afterwards the receivables accounts must match the legacy balances to the cent.';
                Image = Post;

                trigger OnAction()
                var
                    Runner: Codeunit "KLV Demo Setup Runner";
                begin
                    Runner.PostMigration();
                    CurrPage.Update(false);
                end;
            }
        }
        area(Promoted)
        {
            actionref(ApplySetup_Promoted; ApplySetup) { }
            actionref(PrepareMigration_Promoted; PrepareMigration) { }
            actionref(PostMigration_Promoted; PostMigration) { }
        }
    }

    trigger OnOpenPage()
    begin
        Rec.GetOrCreate();
    end;
}
