namespace Kalvaert.RemovalFee;

using Microsoft.Inventory.Item;
using System.Security.User;

tableextension 50100 "KLV Item" extends Item
{
    fields
    {
        field(50100; "KLV Removal Fee"; Decimal)
        {
            Caption = 'Removal Fee';
            ToolTip = 'Specifies the removal fee per unit (verwijderingsbijdrage). Domestic sales documents get a fee line for this amount under the item line. Only users allowed in User Setup can change it.';
            DataClassification = CustomerContent;
            AutoFormatType = 2;
            MinValue = 0;

            trigger OnValidate()
            var
                UserSetup: Record "User Setup";
                NotAllowedErr: Label 'You are not allowed to change the removal fee. Ask purchasing, or ask an administrator to turn on %1 for you in User Setup.', Comment = '%1 = field caption';
            begin
                if Rec."KLV Removal Fee" = xRec."KLV Removal Fee" then
                    exit;
                if not UserSetup.Get(UserId()) or not UserSetup."KLV Can Edit Removal Fee" then
                    Error(NotAllowedErr, UserSetup.FieldCaption("KLV Can Edit Removal Fee"));
            end;
        }
    }
}
