import AccessControl "mo:caffeineai-authorization/access-control";
import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  // Previously deployed stable shape (attendance app).
  public type OldActor = {
    accessControlState : AccessControl.AccessControlState;
    userStates : Map.Map<Principal, OldUserState>;
  };

  public type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    userStates : Map.Map<Principal, UserState>;
  };

  // Inlined old attendance state types (migrations must be self-contained).
  public type OldRecordId = Nat;
  public type OldTimestamp = Int;
  public type OldTimeRecord = {
    id : OldRecordId;
    owner : Principal;
    clockIn : OldTimestamp;
    clockOut : ?OldTimestamp;
    note : ?Text;
    createdAt : OldTimestamp;
    updatedAt : OldTimestamp;
  };
  public type OldUserState = {
    var nextId : Nat;
    records : Map.Map<OldRecordId, OldTimeRecord>;
  };

  // Inlined new coaching state types.
  public type RecordId = Nat;
  public type Timestamp = Int;
  public type CoachingEntry = {
    id : RecordId;
    owner : Principal;
    sessionDate : Timestamp;
    coachName : Text;
    coachedEmails : [Text];
    topic : Text;
    observation : Text;
    feedback : Text;
    actionItems : Text;
    followUpDate : ?Timestamp;
    notes : ?Text;
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
            entries = Map.empty();
          };
        }
      );
    };
  };
};
