import AccessControl "mo:caffeineai-authorization/access-control";
import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  public type OldActor = {};

  public type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    userStates : Map.Map<Principal, UserState>;
  };

  // Inlined attendance state types (migrations must be self-contained).
  public type RecordId = Nat;
  public type Timestamp = Int;
  public type TimeRecord = {
    id : RecordId;
    owner : Principal;
    clockIn : Timestamp;
    clockOut : ?Timestamp;
    note : ?Text;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };
  public type UserState = {
    var nextId : Nat;
    records : Map.Map<RecordId, TimeRecord>;
  };

  public func migration(_ : OldActor) : NewActor {
    {
      accessControlState = AccessControl.initState();
      userStates = Map.empty();
    };
  };
};
