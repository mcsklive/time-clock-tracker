import Map "mo:core/Map";

module {
  // Permission level granted to an allowlisted person.
  public type PermissionLevel = {
    #allControl;
    #viewOnly;
    #logStatus;
  };

  // One allowlisted person: sign-in email, display name, role and permission.
  public type AllowlistEntry = {
    email : Text;
    displayName : Text;
    role : Text;
    permission : PermissionLevel;
  };

  // Stored allowlist keyed by normalized (trimmed, lowercased) email.
  public type AllowlistState = {
    entries : Map.Map<Text, AllowlistEntry>;
  };

  // Access status returned to the frontend for the signed-in caller.
  public type AccessStatus = {
    #allowed : {
      displayName : Text;
      role : Text;
      permission : PermissionLevel;
    };
    #denied;
  };
};
