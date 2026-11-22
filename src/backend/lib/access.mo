import Char "mo:core/Char";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Types "../types/access";

module {
  public type AllowlistEntry = Types.AllowlistEntry;
  public type AllowlistState = Types.AllowlistState;
  public type AccessStatus = Types.AccessStatus;
  public type PermissionLevel = Types.PermissionLevel;

  func isSpace(c : Char) : Bool = c == ' ' or c == '\t' or c == '\n' or c == '\r';

  // Trim surrounding whitespace and lowercase for case-insensitive matching.
  public func normalizeEmail(email : Text) : Text {
    email.trim(#predicate(isSpace)).toLower();
  };

  // True when the verified email is on the allowlist.
  public func isAllowed(state : AllowlistState, verifiedEmail : ?Text) : Bool {
    switch (verifiedEmail) {
      case null { false };
      case (?raw) { state.entries.get(normalizeEmail(raw)) != null };
    };
  };

  // Trap when the caller is not on the allowlist. Used to gate every
  // coaching method so non-allowlisted callers cannot read or change records.
  public func requireAccess(state : AllowlistState, verifiedEmail : ?Text) {
    if (not isAllowed(state, verifiedEmail)) {
      Runtime.trap("Unauthorized: email is not on the allowlist");
    };
  };

  // Resolve the caller's access from their verified email.
  public func checkAccess(state : AllowlistState, verifiedEmail : ?Text) : AccessStatus {
    switch (verifiedEmail) {
      case null { #denied };
      case (?raw) {
        switch (state.entries.get(normalizeEmail(raw))) {
          case null { #denied };
          case (?entry) {
            #allowed({
              displayName = entry.displayName;
              role = entry.role;
              permission = entry.permission;
            });
          };
        };
      };
    };
  };
};
