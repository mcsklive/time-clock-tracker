import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Result "mo:core/Result";
import Time "mo:core/Time";
import Types "../types/coaching";
import AccessTypes "../types/access";
import CoachingLib "../lib/coaching";
import AccessLib "../lib/access";

mixin (
  userStates : Map.Map<Principal, Types.UserState>,
  allowlist : AccessTypes.AllowlistState,
  verifiedEmails : Map.Map<Principal, Text>,
) {
  // Trap unless the caller's verified email is on the allowlist.
  func requireAccess(caller : Principal) {
    AccessLib.requireAccess(allowlist, verifiedEmails.get(caller));
  };

  // Lazily create (and return) the caller's private state.
  func stateFor(caller : Principal) : Types.UserState {
    switch (userStates.get(caller)) {
      case (?s) { s };
      case null {
        let s = CoachingLib.newUserState();
        userStates.add(caller, s);
        s;
      };
    };
  };

  public shared ({ caller }) func createEntry(
    status : Types.EntryStatus,
    sessionDate : Types.Timestamp,
    startTime : Types.Timestamp,
    endTime : Types.Timestamp,
    reason : Text,
    approverEmails : [Text],
  ) : async Result.Result<Types.CoachingEntry, Types.CoachingError> {
    requireAccess(caller);
    let state = stateFor(caller);
    CoachingLib.createEntry(state, caller, status, sessionDate, startTime, endTime, reason, approverEmails, Time.now());
  };

  public query ({ caller }) func listMyEntries() : async [Types.CoachingEntry] {
    requireAccess(caller);
    switch (userStates.get(caller)) {
      case (?s) { CoachingLib.listEntries(s) };
      case null { [] };
    };
  };

  public shared ({ caller }) func updateMyEntry(
    id : Types.RecordId,
    status : Types.EntryStatus,
    sessionDate : Types.Timestamp,
    startTime : Types.Timestamp,
    endTime : Types.Timestamp,
    reason : Text,
    approverEmails : [Text],
  ) : async Result.Result<Types.CoachingEntry, Types.CoachingError> {
    requireAccess(caller);
    switch (userStates.get(caller)) {
      case null { #err(#notFound(id)) };
      case (?s) {
        CoachingLib.updateEntry(s, caller, id, status, sessionDate, startTime, endTime, reason, approverEmails, Time.now());
      };
    };
  };

  public shared ({ caller }) func deleteMyEntry(id : Types.RecordId) : async Result.Result<(), Types.CoachingError> {
    requireAccess(caller);
    switch (userStates.get(caller)) {
      case null { #err(#notFound(id)) };
      case (?s) { CoachingLib.deleteEntry(s, caller, id) };
    };
  };

  public query ({ caller }) func mySummary() : async [Types.EmailSummary] {
    requireAccess(caller);
    switch (userStates.get(caller)) {
      case (?s) { CoachingLib.summaryByEmail(s) };
      case null { [] };
    };
  };

  public query ({ caller }) func myTotals() : async Types.CoachingTotals {
    requireAccess(caller);
    switch (userStates.get(caller)) {
      case (?s) { CoachingLib.totals(s) };
      case null { { totalSessions = 0; totalApprovers = 0 } };
    };
  };
};
