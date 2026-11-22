import Common "common";
import Map "mo:core/Map";

module {
  public type RecordId = Common.RecordId;
  public type Timestamp = Common.Timestamp;
  public type UserId = Common.UserId;

  // The three allowed statuses for a log entry.
  public type EntryStatus = {
    #training;
    #coaching;
    #outboundChat;
  };

  // A single training/coaching log entry owned by one user.
  public type CoachingEntry = {
    id : RecordId;
    owner : UserId;
    status : EntryStatus;
    sessionDate : Timestamp;
    startTime : Timestamp;
    endTime : Timestamp;
    reason : Text;
    approverEmails : [Text];
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  // Per-approver-email summary for the caller's entries.
  public type EmailSummary = {
    email : Text;
    count : Nat;
    latestSessionDate : Timestamp;
  };

  // Overall totals for the caller's entries.
  public type CoachingTotals = {
    totalSessions : Nat;
    totalApprovers : Nat;
  };

  // Caller-fixable failures for coaching operations.
  public type CoachingError = {
    #notFound : RecordId;
    #notOwner : RecordId;
    #invalidInput : Text;
  };

  // Mutable per-user state: entries plus the next id counter.
  public type UserState = {
    var nextId : Nat;
    entries : Map.Map<RecordId, CoachingEntry>;
  };
};
