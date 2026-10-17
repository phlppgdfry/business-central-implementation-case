namespace Kalvaert.DemoSetup;

using Kalvaert.RemovalFee;
using Microsoft.Bank.BankAccount;
using Microsoft.Finance.Dimension;
using Microsoft.Finance.GeneralLedger.Account;
using Microsoft.Finance.GeneralLedger.Journal;
using Microsoft.Finance.GeneralLedger.Setup;
using Microsoft.Finance.VAT.Clause;
using Microsoft.Finance.VAT.Setup;
using Microsoft.Foundation.PaymentTerms;
using Microsoft.Foundation.UOM;
using Microsoft.Inventory.Item;
using Microsoft.Inventory.Location;
using Microsoft.Inventory.Transfer;
using Microsoft.Purchases.Vendor;
using Microsoft.Sales.Customer;

/// <summary>
/// Idempotent building blocks: each Ensure* creates the record or brings it to the designed values.
/// Running the setup twice gives the same company. The data itself is in the generated codeunit "KLV Demo Data".
/// </summary>
codeunit 50201 "KLV Demo Helpers"
{
    Access = Internal;

    var
        Count: Integer;

    procedure RecordsTouched(): Integer
    begin
        exit(Count);
    end;

    procedure EnsureGLAccount(No: Code[20]; Name: Text[100]; IsIncome: Boolean; DirectPosting: Boolean; SalesLineAccount: Boolean; GenProdGroup: Code[20]; VATProdGroup: Code[20])
    var
        GLAccount: Record "G/L Account";
    begin
        if not GLAccount.Get(No) then begin
            GLAccount.Init();
            GLAccount."No." := No;
            GLAccount.Insert(true);
        end;
        GLAccount.Validate(Name, Name);
        GLAccount.Validate("Account Type", GLAccount."Account Type"::Posting);
        if IsIncome then
            GLAccount.Validate("Income/Balance", GLAccount."Income/Balance"::"Income Statement")
        else
            GLAccount.Validate("Income/Balance", GLAccount."Income/Balance"::"Balance Sheet");
        GLAccount.Validate("Direct Posting", DirectPosting);
        if SalesLineAccount then begin
            GLAccount.Validate("Gen. Posting Type", GLAccount."Gen. Posting Type"::Sale);
            GLAccount.Validate("Gen. Prod. Posting Group", GenProdGroup);
            GLAccount.Validate("VAT Prod. Posting Group", VATProdGroup);
        end;
        GLAccount.Modify(true);
        Count += 1;
    end;

    procedure EnsureVATBusGroup(Code: Code[20]; Description: Text[100])
    var
        VATBusPostingGroup: Record "VAT Business Posting Group";
    begin
        if not VATBusPostingGroup.Get(Code) then begin
            VATBusPostingGroup.Init();
            VATBusPostingGroup.Code := Code;
            VATBusPostingGroup.Insert(true);
        end;
        VATBusPostingGroup.Description := Description;
        VATBusPostingGroup.Modify(true);
        Count += 1;
    end;

    procedure EnsureVATProdGroup(Code: Code[20]; Description: Text[100])
    var
        VATProdPostingGroup: Record "VAT Product Posting Group";
    begin
        if not VATProdPostingGroup.Get(Code) then begin
            VATProdPostingGroup.Init();
            VATProdPostingGroup.Code := Code;
            VATProdPostingGroup.Insert(true);
        end;
        VATProdPostingGroup.Description := Description;
        VATProdPostingGroup.Modify(true);
        Count += 1;
    end;

    procedure EnsureGenBusGroup(Code: Code[20]; Description: Text[100]; DefVATBusGroup: Code[20])
    var
        GenBusPostingGroup: Record "Gen. Business Posting Group";
    begin
        if not GenBusPostingGroup.Get(Code) then begin
            GenBusPostingGroup.Init();
            GenBusPostingGroup.Code := Code;
            GenBusPostingGroup.Insert(true);
        end;
        GenBusPostingGroup.Description := Description;
        GenBusPostingGroup."Def. VAT Bus. Posting Group" := DefVATBusGroup;
        GenBusPostingGroup."Auto Insert Default" := true;
        GenBusPostingGroup.Modify(true);
        Count += 1;
    end;

    procedure EnsureGenProdGroup(Code: Code[20]; Description: Text[100]; DefVATProdGroup: Code[20])
    var
        GenProductPostingGroup: Record "Gen. Product Posting Group";
    begin
        if not GenProductPostingGroup.Get(Code) then begin
            GenProductPostingGroup.Init();
            GenProductPostingGroup.Code := Code;
            GenProductPostingGroup.Insert(true);
        end;
        GenProductPostingGroup.Description := Description;
        GenProductPostingGroup."Def. VAT Prod. Posting Group" := DefVATProdGroup;
        GenProductPostingGroup."Auto Insert Default" := true;
        GenProductPostingGroup.Modify(true);
        Count += 1;
    end;

    procedure EnsureGenPostingSetup(BusGroup: Code[20]; ProdGroup: Code[20]; SalesAccount: Code[20]; PurchAccount: Code[20]; COGSAccount: Code[20])
    var
        GeneralPostingSetup: Record "General Posting Setup";
    begin
        if not GeneralPostingSetup.Get(BusGroup, ProdGroup) then begin
            GeneralPostingSetup.Init();
            GeneralPostingSetup."Gen. Bus. Posting Group" := BusGroup;
            GeneralPostingSetup."Gen. Prod. Posting Group" := ProdGroup;
            GeneralPostingSetup.Insert(true);
        end;
        GeneralPostingSetup."Sales Account" := SalesAccount;
        GeneralPostingSetup."Sales Credit Memo Account" := SalesAccount;
        GeneralPostingSetup."Purch. Account" := PurchAccount;
        GeneralPostingSetup."Purch. Credit Memo Account" := PurchAccount;
        GeneralPostingSetup."COGS Account" := COGSAccount;
        GeneralPostingSetup."Inventory Adjmt. Account" := COGSAccount;
        GeneralPostingSetup."Direct Cost Applied Account" := PurchAccount;
        GeneralPostingSetup.Modify(true);
        Count += 1;
    end;

    procedure EnsureVATClause(Code: Code[20]; Description: Text[250])
    var
        VATClause: Record "VAT Clause";
    begin
        if not VATClause.Get(Code) then begin
            VATClause.Init();
            VATClause.Code := Code;
            VATClause.Insert(true);
        end;
        VATClause.Description := CopyStr(Description, 1, MaxStrLen(VATClause.Description));
        VATClause.Modify(true);
        Count += 1;
    end;

    procedure EnsureVATPostingSetup(BusGroup: Code[20]; ProdGroup: Code[20]; ReverseCharge: Boolean; VATPct: Decimal; Identifier: Code[20]; SalesVATAccount: Code[20]; PurchVATAccount: Code[20]; ReverseChrgAccount: Code[20]; ClauseCode: Code[20])
    var
        VATPostingSetup: Record "VAT Posting Setup";
    begin
        if not VATPostingSetup.Get(BusGroup, ProdGroup) then begin
            VATPostingSetup.Init();
            VATPostingSetup."VAT Bus. Posting Group" := BusGroup;
            VATPostingSetup."VAT Prod. Posting Group" := ProdGroup;
            VATPostingSetup.Insert(true);
        end;
        if ReverseCharge then
            VATPostingSetup."VAT Calculation Type" := VATPostingSetup."VAT Calculation Type"::"Reverse Charge VAT"
        else
            VATPostingSetup."VAT Calculation Type" := VATPostingSetup."VAT Calculation Type"::"Normal VAT";
        VATPostingSetup."VAT %" := VATPct;
        VATPostingSetup."VAT Identifier" := Identifier;
        VATPostingSetup."Sales VAT Account" := SalesVATAccount;
        VATPostingSetup."Purchase VAT Account" := PurchVATAccount;
        VATPostingSetup."Reverse Chrg. VAT Acc." := ReverseChrgAccount;
        VATPostingSetup."VAT Clause Code" := ClauseCode;
        VATPostingSetup.Modify(true);
        Count += 1;
    end;

    procedure EnsureCustomerPostingGroup(Code: Code[20]; ReceivablesAccount: Code[20])
    var
        CustomerPostingGroup: Record "Customer Posting Group";
    begin
        if not CustomerPostingGroup.Get(Code) then begin
            CustomerPostingGroup.Init();
            CustomerPostingGroup.Code := Code;
            CustomerPostingGroup.Insert(true);
        end;
        CustomerPostingGroup."Receivables Account" := ReceivablesAccount;
        CustomerPostingGroup.Modify(true);
        Count += 1;
    end;

    procedure EnsureVendorPostingGroup(Code: Code[20]; PayablesAccount: Code[20])
    var
        VendorPostingGroup: Record "Vendor Posting Group";
    begin
        if not VendorPostingGroup.Get(Code) then begin
            VendorPostingGroup.Init();
            VendorPostingGroup.Code := Code;
            VendorPostingGroup.Insert(true);
        end;
        VendorPostingGroup."Payables Account" := PayablesAccount;
        VendorPostingGroup.Modify(true);
        Count += 1;
    end;

    procedure EnsureLocation(Code: Code[10]; Name: Text[100]; InTransit: Boolean)
    var
        Location: Record Location;
    begin
        if not Location.Get(Code) then begin
            Location.Init();
            Location.Code := Code;
            Location.Insert(true);
        end;
        Location.Name := Name;
        Location."Use As In-Transit" := InTransit;
        Location.Modify(true);
        Count += 1;
    end;

    procedure EnsureTransferRoute(FromCode: Code[10]; ToCode: Code[10]; InTransitCode: Code[10])
    var
        TransferRoute: Record "Transfer Route";
    begin
        if not TransferRoute.Get(FromCode, ToCode) then begin
            TransferRoute.Init();
            TransferRoute."Transfer-from Code" := FromCode;
            TransferRoute."Transfer-to Code" := ToCode;
            TransferRoute.Insert(true);
        end;
        TransferRoute."In-Transit Code" := InTransitCode;
        TransferRoute.Modify(true);
        Count += 1;
    end;

    procedure EnsureInventoryPostingGroup(Code: Code[20]; Description: Text[100])
    var
        InventoryPostingGroup: Record "Inventory Posting Group";
    begin
        if not InventoryPostingGroup.Get(Code) then begin
            InventoryPostingGroup.Init();
            InventoryPostingGroup.Code := Code;
            InventoryPostingGroup.Insert(true);
        end;
        InventoryPostingGroup.Description := Description;
        InventoryPostingGroup.Modify(true);
        Count += 1;
    end;

    procedure EnsureInventoryPostingSetup(LocationCode: Code[10]; GroupCode: Code[20]; InventoryAccount: Code[20])
    var
        InventoryPostingSetup: Record "Inventory Posting Setup";
    begin
        if not InventoryPostingSetup.Get(LocationCode, GroupCode) then begin
            InventoryPostingSetup.Init();
            InventoryPostingSetup."Location Code" := LocationCode;
            InventoryPostingSetup."Invt. Posting Group Code" := GroupCode;
            InventoryPostingSetup.Insert(true);
        end;
        InventoryPostingSetup."Inventory Account" := InventoryAccount;
        InventoryPostingSetup.Modify(true);
        Count += 1;
    end;

    procedure EnsurePaymentMethod(Code: Code[10]; Description: Text[100]; BalAccountNo: Code[20])
    var
        PaymentMethod: Record "Payment Method";
    begin
        if not PaymentMethod.Get(Code) then begin
            PaymentMethod.Init();
            PaymentMethod.Code := Code;
            PaymentMethod.Insert(true);
        end;
        PaymentMethod.Description := Description;
        if BalAccountNo <> '' then begin
            PaymentMethod."Bal. Account Type" := PaymentMethod."Bal. Account Type"::"G/L Account";
            PaymentMethod."Bal. Account No." := BalAccountNo;
        end;
        PaymentMethod.Modify(true);
        Count += 1;
    end;

    procedure EnsurePaymentTerms(Code: Code[10]; Description: Text[100]; DueDateFormula: Text)
    var
        PaymentTerms: Record "Payment Terms";
    begin
        if not PaymentTerms.Get(Code) then begin
            PaymentTerms.Init();
            PaymentTerms.Code := Code;
            PaymentTerms.Insert(true);
        end;
        PaymentTerms.Description := Description;
        Evaluate(PaymentTerms."Due Date Calculation", DueDateFormula);
        PaymentTerms.Modify(true);
        Count += 1;
    end;

    procedure EnsureDimension(Code: Code[20]; Name: Text[30])
    var
        Dimension: Record Dimension;
    begin
        if not Dimension.Get(Code) then begin
            Dimension.Init();
            Dimension.Code := Code;
            Dimension.Insert(true);
        end;
        Dimension.Name := Name;
        Dimension.Modify(true);
        Count += 1;
    end;

    procedure EnsureDimensionValue(DimensionCode: Code[20]; Code: Code[20]; Name: Text[50])
    var
        DimensionValue: Record "Dimension Value";
    begin
        if not DimensionValue.Get(DimensionCode, Code) then begin
            DimensionValue.Init();
            DimensionValue."Dimension Code" := DimensionCode;
            DimensionValue.Code := Code;
            DimensionValue.Insert(true);
        end;
        DimensionValue.Name := Name;
        DimensionValue.Modify(true);
        Count += 1;
    end;

    /// <summary>Only in a company without global dimensions yet; otherwise this is a job for "Change Global Dimensions".</summary>
    procedure SetGlobalDimensions(Dim1: Code[20]; Dim2: Code[20]): Boolean
    var
        GeneralLedgerSetup: Record "General Ledger Setup";
    begin
        GeneralLedgerSetup.Get();
        if (GeneralLedgerSetup."Global Dimension 1 Code" = Dim1) and (GeneralLedgerSetup."Global Dimension 2 Code" = Dim2) then
            exit(true);
        if (GeneralLedgerSetup."Global Dimension 1 Code" <> '') or (GeneralLedgerSetup."Global Dimension 2 Code" <> '') then
            exit(false);
        GeneralLedgerSetup."Global Dimension 1 Code" := Dim1;
        GeneralLedgerSetup."Global Dimension 2 Code" := Dim2;
        GeneralLedgerSetup."Shortcut Dimension 1 Code" := Dim1;
        GeneralLedgerSetup."Shortcut Dimension 2 Code" := Dim2;
        GeneralLedgerSetup.Modify(true);
        Count += 1;
        exit(true);
    end;

    /// <summary>FIN-04: "code mandatory" on a range of G/L accounts.</summary>
    procedure RequireDimensionOnAccounts(FromAccount: Code[20]; ToAccount: Code[20]; DimensionCode: Code[20])
    var
        GLAccount: Record "G/L Account";
    begin
        GLAccount.SetRange("No.", FromAccount, ToAccount);
        GLAccount.SetRange("Account Type", GLAccount."Account Type"::Posting);
        if GLAccount.FindSet() then
            repeat
                SetDefaultDimension(Database::"G/L Account", GLAccount."No.", DimensionCode, '', true);
            until GLAccount.Next() = 0;
    end;

    procedure SetDefaultDimension(TableId: Integer; No: Code[20]; DimensionCode: Code[20]; ValueCode: Code[20]; CodeMandatory: Boolean)
    var
        DefaultDimension: Record "Default Dimension";
    begin
        if not DefaultDimension.Get(TableId, No, DimensionCode) then begin
            DefaultDimension.Init();
            DefaultDimension.Validate("Table ID", TableId);
            DefaultDimension.Validate("No.", No);
            DefaultDimension.Validate("Dimension Code", DimensionCode);
            DefaultDimension.Insert(true);
        end;
        if ValueCode <> '' then
            DefaultDimension.Validate("Dimension Value Code", ValueCode);
        if CodeMandatory then
            DefaultDimension.Validate("Value Posting", DefaultDimension."Value Posting"::"Code Mandatory");
        DefaultDimension.Modify(true);
        Count += 1;
    end;

    procedure EnsureUnitOfMeasure(Code: Code[10]; Description: Text[50])
    var
        UnitOfMeasure: Record "Unit of Measure";
    begin
        if not UnitOfMeasure.Get(Code) then begin
            UnitOfMeasure.Init();
            UnitOfMeasure.Code := Code;
            UnitOfMeasure.Insert(true);
        end;
        UnitOfMeasure.Description := Description;
        UnitOfMeasure.Modify(true);
        Count += 1;
    end;

    procedure EnsureItem(No: Code[20]; Description: Text[100]; IsInventory: Boolean; GenProdGroup: Code[20]; VATProdGroup: Code[20]; InventoryPostingGroup: Code[20]; UnitPrice: Decimal; UnitCost: Decimal; RemovalFee: Decimal; BaseUnit: Code[10])
    var
        Item: Record Item;
    begin
        if not Item.Get(No) then begin
            Item.Init();
            Item."No." := No;
            Item.Insert(true);
        end;
        Item.Validate(Description, Description);
        if IsInventory then
            Item.Validate(Type, Item.Type::Inventory)
        else
            Item.Validate(Type, Item.Type::Service);
        Item.Validate("Base Unit of Measure", BaseUnit);
        Item.Validate("Gen. Prod. Posting Group", GenProdGroup);
        Item.Validate("VAT Prod. Posting Group", VATProdGroup);
        if IsInventory then
            Item.Validate("Inventory Posting Group", InventoryPostingGroup);
        Item.Validate("Unit Price", UnitPrice);
        Item.Validate("Unit Cost", UnitCost);
        // assigned, not validated: the setup runs as a technical user, not as purchasing
        Item."KLV Removal Fee" := RemovalFee;
        Item.Modify(true);
        Count += 1;
    end;

    procedure EnsureCustomer(No: Code[20]; Name: Text[100]; GenBusGroup: Code[20]; VATBusGroup: Code[20]; PostingGroup: Code[20]; PaymentMethodCode: Code[10]; PaymentTermsCode: Code[10]; LocationCode: Code[10]; CountryCode: Code[10]; EnterpriseNo: Text[50]; VATRegistrationNo: Text[20])
    var
        Customer: Record Customer;
    begin
        if not Customer.Get(No) then begin
            Customer.Init();
            Customer."No." := No;
            Customer.Insert(true);
        end;
        Customer.Validate(Name, Name);
        Customer."Country/Region Code" := CountryCode;
        Customer.Validate("Gen. Bus. Posting Group", GenBusGroup);
        Customer.Validate("VAT Bus. Posting Group", VATBusGroup);
        Customer.Validate("Customer Posting Group", PostingGroup);
        Customer.Validate("Payment Method Code", PaymentMethodCode);
        Customer.Validate("Payment Terms Code", PaymentTermsCode);
        Customer.Validate("Location Code", LocationCode);
        // fictitious numbers with a valid check digit; assigned so no online lookup is attempted
        Customer."Enterprise No." := EnterpriseNo;
        Customer."VAT Registration No." := VATRegistrationNo;
        Customer.Modify(true);
        Count += 1;
    end;

    procedure EnsureCustomerTemplate(Code: Code[20]; Description: Text[100]; GenBusGroup: Code[20]; VATBusGroup: Code[20]; PostingGroup: Code[20]; CreditLimit: Decimal; PaymentTermsCode: Code[10]; PaymentMethodCode: Code[10])
    var
        CustomerTempl: Record "Customer Templ.";
    begin
        if not CustomerTempl.Get(Code) then begin
            CustomerTempl.Init();
            CustomerTempl.Code := Code;
            CustomerTempl.Insert(true);
        end;
        CustomerTempl.Description := Description;
        CustomerTempl."Gen. Bus. Posting Group" := GenBusGroup;
        CustomerTempl."VAT Bus. Posting Group" := VATBusGroup;
        CustomerTempl."Customer Posting Group" := PostingGroup;
        CustomerTempl."Credit Limit (LCY)" := CreditLimit;
        CustomerTempl."Payment Terms Code" := PaymentTermsCode;
        CustomerTempl."Payment Method Code" := PaymentMethodCode;
        CustomerTempl.Modify(true);
        Count += 1;
    end;

    procedure ConfigureRemovalFee(GenBusGroup: Code[20]; FeeAccount: Code[20]; GenProdGroup: Code[20]; DescriptionTemplate: Text[80])
    var
        RemovalFeeSetup: Record "KLV Removal Fee Setup";
    begin
        if not RemovalFeeSetup.Get() then begin
            RemovalFeeSetup.Init();
            RemovalFeeSetup.Insert();
        end;
        RemovalFeeSetup."Gen. Bus. Posting Group" := GenBusGroup;
        RemovalFeeSetup."Fee G/L Account No." := FeeAccount;
        RemovalFeeSetup."Gen. Prod. Posting Group" := GenProdGroup;
        RemovalFeeSetup."Description Template" := CopyStr(DescriptionTemplate, 1, MaxStrLen(RemovalFeeSetup."Description Template"));
        RemovalFeeSetup.Enabled := true;
        RemovalFeeSetup.Modify();
        Count += 1;
    end;

    procedure EnsureMigrationBatch(TemplateName: Code[10]; BatchName: Code[10]; Description: Text[100]; SuspenseAccount: Code[20])
    var
        GenJournalTemplate: Record "Gen. Journal Template";
        GenJournalBatch: Record "Gen. Journal Batch";
    begin
        if not GenJournalTemplate.Get(TemplateName) then begin
            GenJournalTemplate.Init();
            GenJournalTemplate.Name := TemplateName;
            GenJournalTemplate.Validate(Type, GenJournalTemplate.Type::General);
            GenJournalTemplate.Insert(true);
        end;
        GenJournalTemplate.Description := CopyStr(Description, 1, MaxStrLen(GenJournalTemplate.Description));
        GenJournalTemplate.Modify(true);
        if not GenJournalBatch.Get(TemplateName, BatchName) then begin
            GenJournalBatch.Init();
            GenJournalBatch."Journal Template Name" := TemplateName;
            GenJournalBatch.Name := BatchName;
            GenJournalBatch.Insert(true);
        end;
        GenJournalBatch.Description := Description;
        GenJournalBatch."No. Series" := '';
        GenJournalBatch.Validate("Bal. Account Type", GenJournalBatch."Bal. Account Type"::"G/L Account");
        GenJournalBatch.Validate("Bal. Account No.", SuspenseAccount);
        GenJournalBatch.Modify(true);
    end;
}
