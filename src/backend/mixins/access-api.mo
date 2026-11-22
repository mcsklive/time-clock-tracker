import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Types "../types/access";
import AccessLib "../lib/access";

mixin (
  allowlist : Types.AllowlistState,
  verifiedEmails : Map.Map<Principal, Text>,
) {
  // The signed-in caller's access status, with display name, role and
  // permission level when their verified email is on the allowlist.
  public query ({ caller }) func getMyAccess() : async Types.AccessStatus {
    AccessLib.checkAccess(allowlist, verifiedEmails.get(caller));
  };

  // The verified email captured for the caller at sign-in, if any. Used by the
  // frontend to confirm the backend holds the email before gating the app.
  public query ({ caller }) func getMyVerifiedEmail() : async ?Text {
    verifiedEmails.get(caller);
  };
};
