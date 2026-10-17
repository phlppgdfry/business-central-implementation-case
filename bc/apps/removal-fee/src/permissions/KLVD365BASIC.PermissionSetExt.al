namespace Kalvaert.RemovalFee;

using System.Security.AccessControl;

// everyone who can make a sales document must be able to read the setup, otherwise order entry fails
permissionsetextension 50100 "KLV D365 BASIC" extends "D365 BASIC"
{
    IncludedPermissionSets = "KLV REMOVAL FEE";
}
