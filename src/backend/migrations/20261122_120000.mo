import AccessControl "mo:caffeineai-authorization/access-control";
import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  // Previously deployed stable shape (coaching app, old coaching fields).
  public type OldActor = {
    accessControlState : AccessControl.AccessControlState;
    userStates : Map.Map<Principal, OldUserState>;
  };

  public type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    userStates : Map.Map<Principal, UserState>;
  };

  // Inlined old coaching state types (migrations must be self-contained).
  public type OldRecordId = Nat;
  public type OldTimestamp = Int;
  public type OldCoachingEntry = {
    id : OldRecordId;
    owner : Principal;
    sessionDate : OldTimestamp;
    coachName : Text;
    coachedEmails : [Text];
    topic : Text;
    observation : Text;
    feedback : Text;
    actionItems : Text;
    followUpDate : ?OldTimestamp;
    notes : ?Text;
    createdAt : OldTimestamp;
    updatedAt : OldTimestamp;
  };
  public type OldUserState = {
    var nextId : Nat;
    entries : Map.Map<OldRecordId, OldCoachingEntry>;
  };

  // Inlined new log state types.
  public type RecordId = Nat;
  public type Timestamp = Int;
  public type EntryStatus = {
    #training;
    #coaching;
    #outboundChat;
  };
  public type CoachingEntry = {
    id : RecordId;
    owner : Principal;
    status : EntryStatus;
    sessionDate : Timestamp;
    startTime : Timestamp;
    endTime : Timestamp;
    reason : Text;
    approverEmails : [Text];
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };
  public type UserState = {
    var nextId : Nat;
    entries : Map.Map<RecordId, CoachingEntry>;
  };

  public func migration(old : OldActor) : NewActor {
    {
      accessControlState = old.accessControlState;
      userStates = old.userStates.map(
        func(_owner, s) {
          {
            var nextId = s.nextId;
            entries = s.entries.map(
              func(_id, e) {
                {
                  id = e.id;
                  owner = e.owner;
                  status = #coaching;
                  sessionDate = e.sessionDate;
                  startTime = e.sessionDate;
                  endTime = e.sessionDate;
                  reason = e.topic;
                  approverEmails = e.coachedEmails;
                  createdAt = e.createdAt;
                  updatedAt = e.updatedAt;
                };
              }
            );
          };
        }
      );
    };
  };
};
