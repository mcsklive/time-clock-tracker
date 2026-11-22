import AccessControl "mo:caffeineai-authorization/access-control";
import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  // Previously deployed stable shape (coaching log app).
  public type OldActor = {
    accessControlState : AccessControl.AccessControlState;
    userStates : Map.Map<Principal, OldUserState>;
  };

  public type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    userStates : Map.Map<Principal, UserState>;
    allowlist : AllowlistState;
    verifiedEmails : Map.Map<Principal, Text>;
  };

  // Inlined coaching state types (migrations must be self-contained).
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
  public type OldUserState = {
    var nextId : Nat;
    entries : Map.Map<RecordId, CoachingEntry>;
  };
  public type UserState = {
    var nextId : Nat;
    entries : Map.Map<RecordId, CoachingEntry>;
  };

  // Inlined allowlist state types.
  public type PermissionLevel = {
    #allControl;
    #viewOnly;
    #logStatus;
  };
  public type AllowlistEntry = {
    email : Text;
    displayName : Text;
    role : Text;
    permission : PermissionLevel;
  };
  public type AllowlistState = {
    entries : Map.Map<Text, AllowlistEntry>;
  };

  // Seed rows: (normalized email, display name, role, permission).
  let seed : [(Text, Text, Text, PermissionLevel)] = [
    ("moem.sankroong@shopeemobile-external.com", "Em.Sa", "Admin Senior", #allControl),
    ("doct.1001001@gmail.com", "Doctor", "Admin Senior", #allControl),
    ("mopure.soda@shopeemobile-external.com", "Pure.", "Agent", #viewOnly),
    ("mojoy.hinrang@shopeemobile-external.com", "Joy", "Agent", #viewOnly),
    ("mochay.janthasri@shopeemobile-external.com", "Chay", "Agent", #viewOnly),
    ("momaxx.janthon@shopeemobile-external.com", "Maxx", "Agent", #viewOnly),
    ("mooil.chongpukdee@shopeemobile-external.com", "Oil", "Agent", #viewOnly),
    ("moearth.saengngiw@shopeemobile-external.com", "Earth", "Agent", #viewOnly),
    ("monana.nongtali@shopeemobile-external.com", "Nana", "Agent", #viewOnly),
    ("mojune.rueanchimplee@shopeemobile-external.com", "June", "Agent", #viewOnly),
    ("mofai.naochang@shopeemobile-external.com", "Fai.N", "Agent", #viewOnly),
    ("mobifern.sujaritchat@shopeemobile-external.com", "Bifern", "Agent", #viewOnly),
    ("motangmay.vannawong@shopeemobile-external.com", "Tangmay", "Agent", #viewOnly),
    ("moamp.chaleawka@shopeemobile-external.com", "A", "Agent", #viewOnly),
    ("moploy.thongboo@shopeemobile-external.com", "Ploy", "Agent", #viewOnly),
    ("moza.ratwiset@shopeemobile-external.com", "Za", "Agent", #viewOnly),
    ("modear.raksawong@shopeemobile-external.com", "Dear", "Agent", #viewOnly),
    ("mofaii.phorung@shopeemobile-external.com", "Faii", "Agent", #viewOnly),
    ("mochompoo.riyaphan@shopeemobile-external.com", "Chompoo", "Agent", #viewOnly),
    ("monam.chaipetch@shopeemobile-external.com", "Nam", "Agent", #viewOnly),
    ("momay.pricha@shopeemobile-external.com", "May", "Agent", #viewOnly),
    ("monont.mungpin@shopeemobile-external.com", "Nont", "Agent", #viewOnly),
    ("mokit.nathakitthongsom@shopeemobile-external.com", "Kit", "Agent", #viewOnly),
    ("mopunch.ardyood@shopeemobile-external.com", "Punch", "Agent", #viewOnly),
    ("modream.promson@shopeemobile-external.com", "Dream", "Agent", #viewOnly),
    ("mobeam.chitklang@shopeemobile-external.com", "Beam", "Agent", #viewOnly),
    ("mojernjern.tatjoho@shopeemobile-external.com", "Jernjern", "Agent", #viewOnly),
    ("mofluke.jitpram@shopeemobile-external.com", "Fluke", "Senior", #logStatus),
    ("momanow.takrua@shopeemobile-external.com", "Manow", "Senior", #logStatus),
    ("momuch.khonthiang@shopeemobile-external.com", "Much", "Supervisor", #logStatus),
    ("mojoon.samunya@shopeemobile-external.com", "Joon.", "Team Lead", #logStatus),
    ("monan.sudta@shopeemobile-external.com", "Nan.S", "Trainer", #logStatus),
    ("namwhan.bunjong@shopee.com", "Namwhan", "IH", #viewOnly),
    ("view.srirak@shopee.com", "Alin", "IH", #viewOnly),
    ("amm.porpratub@shopee.com", "Amm", "IH", #viewOnly),
  ];

  public func migration(old : OldActor) : NewActor {
    let entries = Map.empty<Text, AllowlistEntry>();
    for ((email, displayName, role, permission) in seed.values()) {
      entries.add(email, { email; displayName; role; permission });
    };
    {
      accessControlState = old.accessControlState;
      userStates = old.userStates;
      allowlist = { entries };
      verifiedEmails = Map.empty();
    };
  };
};
