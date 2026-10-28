namespace Kalvaert.RemovalFee;

using Microsoft.Finance.GeneralLedger.Account;
using Microsoft.Finance.GeneralLedger.Setup;

/// <summary>
/// One record: which customers pay the removal fee, which account and product posting group the fee line uses,
/// and how the line is described. Functional owner: finance (UC-VK-10, §2 Data).
/// </summary>
table 50100 "KLV Removal Fee Setup"
{
    Caption = 'Removal Fee Setup';
    DataClassification = CustomerContent;
    DrillDownPageId = "KLV Removal Fee Setup";
    LookupPageId = "KLV Removal Fee Setup";

    fields
    {
        field(1; "Primary Key"; Code[10])
        {
            Caption = 'Primary Key';
            AllowInCustomizations = Never;
        }
        field(2; Enabled; Boolean)
        {
            Caption = 'Enabled';
            ToolTip = 'Specifies whether fee lines are added automatically. Turn this off during data migration.';
        }
        field(3; "Gen. Bus. Posting Group"; Code[20])
        {
            Caption = 'Applies to Gen. Bus. Posting Group';
            ToolTip = 'Specifies the general business posting group of the customers who pay the fee (domestic deliveries only).';
            TableRelation = "Gen. Business Posting Group";
        }
        field(4; "Fee G/L Account No."; Code[20])
        {
            Caption = 'Fee G/L Account No.';
            ToolTip = 'Specifies the revenue account the fee line posts to.';
            TableRelation = "G/L Account" where("Account Type" = const(Posting), Blocked = const(false));
        }
        field(5; "Gen. Prod. Posting Group"; Code[20])
        {
            Caption = 'Gen. Prod. Posting Group';
            ToolTip = 'Specifies the general product posting group of the fee line, so the fee is reported apart from the goods.';
            TableRelation = "Gen. Product Posting Group";
        }
        field(7; "Show Notifications"; Boolean)
        {
            Caption = 'Show Notifications';
            ToolTip = 'Specifies whether users get a notification when fee lines disappear because the customer is not domestic. Turn it off for unattended runs, such as an automated test or an integration.';
            InitValue = true;
        }
        field(6; "Description Template"; Text[80])
        {
            Caption = 'Description Template';
            ToolTip = 'Specifies the description of the fee line. %1 is replaced by the item number.';
        }
    }

    keys
    {
        key(PK; "Primary Key") { Clustered = true; }
    }

    procedure GetRecordOnce()
    begin
        if IsLoaded then
            exit;
        if not Get() then begin
            Init();
            Insert();
        end;
        IsLoaded := true;
    end;

    procedure IsActive(): Boolean
    begin
        GetRecordOnce();
        exit(Enabled and ("Gen. Bus. Posting Group" <> '') and ("Fee G/L Account No." <> ''));
    end;

    var
        IsLoaded: Boolean;
}
