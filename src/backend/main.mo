import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Challenges "mo:identity-attributes/Internal/Challenges";
import Verify "mo:identity-attributes/Internal/Verify";
import OQL "mo:caffeineai-oql";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Types "types/coaching";
import AccessTypes "types/access";
import CoachingApi "mixins/coaching-api";
import AccessApi "mixins/access-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;
  let userStates : Map.Map<Principal, Types.UserState>;
  let allowlist : AccessTypes.AllowlistState;
  let verifiedEmails : Map.Map<Principal, Text>;

  // Nonce store for the attribute-verification flow. `MixinAuthorization`
  // declares its own transient store; this one backs `refreshVerifiedEmail`.
  transient let refreshChallenges = Challenges.empty();

  // Rows for one subject (or all rows when `null`, used for schema seeding).
  func entriesFor(subject : ?Principal) : Iter.Iter<Types.CoachingEntry> {
    switch (subject) {
      case (?p) {
        switch (userStates.get(p)) {
          case (?s) { s.entries.values() };
          case null { Iter.empty() };
        };
      };
      case null {
        userStates.values().flatMap(func (s : Types.UserState) : Iter.Iter<Types.CoachingEntry> = s.entries.values());
      };
    };
  };

  transient let sampleOwner = Principal.fromText("aaaaa-aa");

  // Store the caller's verified email so the access query can match it against
  // the allowlist. Called from the sign-in attribute callback and from the
  // re-capture endpoint below (a restored session never re-runs the callback).
  func captureVerifiedEmail(caller : Principal, email : ?Text) {
    switch (email) {
      case (?value) { verifiedEmails.add(caller, value) };
      case null {};
    };
  };

  include MixinAuthorization(
    accessControlState,
    ?(func(caller : Principal, attrs : { name : ?Text; email : ?Text; sso : ?Text }) {
      captureVerifiedEmail(caller, attrs.email);
    }),
  );
  include CoachingApi(userStates, allowlist, verifiedEmails);
  include AccessApi(allowlist, verifiedEmails);

  // Re-run the Internet Identity attribute verification for the current caller
  // and store the verified email. The frontend calls this after a restored
  // session so the access query sees the email even when the sign-in callback
  // did not run. Returns the captured email, or null when the identity carries
  // no verified email (for example a passkey-only identity).
  public shared ({ caller }) func refreshVerifiedEmail() : async ?Text {
    let result = Verify.verify<system>(refreshChallenges);
    switch (result) {
      case (#ok attrs) {
        captureVerifiedEmail(caller, attrs.email);
        attrs.email;
      };
      case (#err _) { null };
    };
  };
  include Expose({
    entities = [
      OQL.Entity.manual<Types.CoachingEntry>("coachingEntry", func () : Iter.Iter<Types.CoachingEntry> = entriesFor(null), "CoachingEntry", "id")
        .payload("id", func (e : Types.CoachingEntry) : Nat = e.id)
        .payload("owner", func (e : Types.CoachingEntry) : Principal = e.owner)
        .payload("status", func (e : Types.CoachingEntry) : Text = switch (e.status) {
          case (#training) "Training";
          case (#coaching) "Coaching";
          case (#outboundChat) "แชทขาออก";
        })
        .payload("sessionDate", func (e : Types.CoachingEntry) : Int = e.sessionDate)
        .payload("startTime", func (e : Types.CoachingEntry) : Int = e.startTime)
        .payload("endTime", func (e : Types.CoachingEntry) : Int = e.endTime)
        .payload("reason", func (e : Types.CoachingEntry) : Text = e.reason)
        .payload("approverEmails", func (e : Types.CoachingEntry) : Text = e.approverEmails.values().join(", "))
        .payload("createdAt", func (e : Types.CoachingEntry) : Int = e.createdAt)
        .payload("updatedAt", func (e : Types.CoachingEntry) : Int = e.updatedAt)
        .sample({
          id = 0;
          owner = sampleOwner;
          status = #training;
          sessionDate = 0;
          startTime = 0;
          endTime = 0;
          reason = "";
          approverEmails = [];
          createdAt = 0;
          updatedAt = 0;
        })
        .ownedBy("owner")
        .scopedPerUser()
        .build(),
      OQL.Entity.manual<AccessTypes.AllowlistEntry>("allowlistEntry", func () : Iter.Iter<AccessTypes.AllowlistEntry> = allowlist.entries.values(), "AllowlistEntry", "email")
        .payload("email", func (e : AccessTypes.AllowlistEntry) : Text = e.email)
        .payload("displayName", func (e : AccessTypes.AllowlistEntry) : Text = e.displayName)
        .payload("role", func (e : AccessTypes.AllowlistEntry) : Text = e.role)
        .payload("permission", func (e : AccessTypes.AllowlistEntry) : Text = switch (e.permission) {
          case (#allControl) "allControl";
          case (#viewOnly) "viewOnly";
          case (#logStatus) "logStatus";
        })
        .sample({
          email = "";
          displayName = "";
          role = "";
          permission = #viewOnly;
        })
        .controllerOnly()
        .build(),
    ];
  });
  include ApiDocMixin();
};
