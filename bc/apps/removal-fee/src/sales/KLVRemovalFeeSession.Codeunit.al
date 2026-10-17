namespace Kalvaert.RemovalFee;

/// <summary>
/// Session state. While standard Business Central copies many lines at once (copy document, quote to order,
/// recreate lines, get shipment lines) the line-by-line automation stands aside; the whole document is
/// reconciled once at the end. While this extension itself writes a fee line, its own events are ignored.
/// </summary>
codeunit 50101 "KLV Removal Fee Session"
{
    SingleInstance = true;
    Access = Internal;

    var
        BulkDepth: Integer;
        Managing: Boolean;

    procedure BeginBulk()
    begin
        BulkDepth += 1;
    end;

    procedure EndBulk()
    begin
        if BulkDepth > 0 then
            BulkDepth -= 1;
    end;

    procedure ResetBulk()
    begin
        BulkDepth := 0;
    end;

    procedure InBulk(): Boolean
    begin
        exit(BulkDepth > 0);
    end;

    procedure SetManaging(NewManaging: Boolean)
    begin
        Managing := NewManaging;
    end;

    procedure IsManaging(): Boolean
    begin
        exit(Managing);
    end;
}
