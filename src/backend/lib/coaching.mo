import Array "mo:core/Array";
import Char "mo:core/Char";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Result "mo:core/Result";
import Text "mo:core/Text";
import Types "../types/coaching";

module {
  public type CoachingEntry = Types.CoachingEntry;
  public type EntryStatus = Types.EntryStatus;
  public type EmailSummary = Types.EmailSummary;
  public type CoachingTotals = Types.CoachingTotals;
  public type CoachingError = Types.CoachingError;
  public type UserState = Types.UserState;

  func isSpace(c : Char) : Bool = c == ' ' or c == '\t' or c == '\n' or c == '\r';

  func trim(t : Text) : Text = t.trim(#predicate(isSpace));

  // Trim each address, drop blanks, and de-duplicate while preserving order.
  func normalizeEmails(raw : [Text]) : [Text] {
    let out = Array.empty<Text>();
    var acc = out;
    for (e in raw.values()) {
      let t = trim(e);
      if (t.size() > 0 and not acc.contains(t)) {
        acc := acc.concat([t]);
      };
    };
    acc;
  };

  // A pragmatic email check: one "@", non-empty local part, a dot in the domain,
  // and no whitespace.
  func isValidEmail(email : Text) : Bool {
    if (email.size() == 0) { return false };
    if (email.contains(#text " ")) { return false };
    let parts = email.split(#char '@').toArray();
    if (parts.size() != 2) { return false };
    let local = parts[0];
    let domain = parts[1];
    if (local.size() == 0 or domain.size() == 0) { return false };
    if (not domain.contains(#text ".")) { return false };
    if (domain.startsWith(#text ".") or domain.endsWith(#text ".")) { return false };
    true;
  };

  // Validate the shared fields of a create/update. Returns the normalized
  // approver emails on success, or a Thai error message.
  func validate(
    sessionDate : Types.Timestamp,
    startTime : Types.Timestamp,
    endTime : Types.Timestamp,
    reason : Text,
    approverEmails : [Text],
  ) : Result.Result<[Text], Text> {
    if (sessionDate == 0) {
      return #err("กรุณาระบุวันที่");
    };
    if (startTime == 0) {
      return #err("กรุณาระบุเวลาเริ่ม");
    };
    if (endTime == 0) {
      return #err("กรุณาระบุเวลาสิ้นสุด");
    };
    if (endTime < startTime) {
      return #err("เวลาสิ้นสุดต้องไม่ก่อนเวลาเริ่ม");
    };
    if (trim(reason).size() == 0) {
      return #err("กรุณาระบุเหตุผลที่ใช้สถานะ");
    };
    let emails = normalizeEmails(approverEmails);
    if (emails.size() == 0) {
      return #err("กรุณาระบุอีเมลผู้อนุมัติอย่างน้อยหนึ่งอีเมล");
    };
    for (e in emails.values()) {
      if (not isValidEmail(e)) {
        return #err("อีเมลผู้อนุมัติไม่ถูกต้อง: " # e);
      };
    };
    #ok(emails);
  };

  public func newUserState() : UserState {
    {
      var nextId = 0;
      entries = Map.empty();
    };
  };

  public func createEntry(
    state : UserState,
    owner : Types.UserId,
    status : Types.EntryStatus,
    sessionDate : Types.Timestamp,
    startTime : Types.Timestamp,
    endTime : Types.Timestamp,
    reason : Text,
    approverEmails : [Text],
    now : Types.Timestamp,
  ) : Result.Result<Types.CoachingEntry, Types.CoachingError> {
    switch (validate(sessionDate, startTime, endTime, reason, approverEmails)) {
      case (#err(msg)) { return #err(#invalidInput(msg)) };
      case (#ok(emails)) {
        let id = state.nextId;
        state.nextId := id + 1;
        let entry : Types.CoachingEntry = {
          id;
          owner;
          status;
          sessionDate;
          startTime;
          endTime;
          reason = trim(reason);
          approverEmails = emails;
          createdAt = now;
          updatedAt = now;
        };
        state.entries.add(id, entry);
        #ok(entry);
      };
    };
  };

  public func listEntries(state : UserState) : [Types.CoachingEntry] {
    let all = state.entries.values().toArray();
    all.sort(
      func(a, b) {
        if (a.sessionDate > b.sessionDate) { #less }
        else if (a.sessionDate < b.sessionDate) { #greater }
        else if (a.id > b.id) { #less }
        else if (a.id < b.id) { #greater }
        else { #equal };
      }
    );
  };

  public func updateEntry(
    state : UserState,
    owner : Types.UserId,
    id : Types.RecordId,
    status : Types.EntryStatus,
    sessionDate : Types.Timestamp,
    startTime : Types.Timestamp,
    endTime : Types.Timestamp,
    reason : Text,
    approverEmails : [Text],
    now : Types.Timestamp,
  ) : Result.Result<Types.CoachingEntry, Types.CoachingError> {
    switch (state.entries.get(id)) {
      case null { #err(#notFound(id)) };
      case (?existing) {
        if (existing.owner != owner) {
          return #err(#notOwner(id));
        };
        switch (validate(sessionDate, startTime, endTime, reason, approverEmails)) {
          case (#err(msg)) { #err(#invalidInput(msg)) };
          case (#ok(emails)) {
            let updated : Types.CoachingEntry = {
              id = existing.id;
              owner = existing.owner;
              status;
              sessionDate;
              startTime;
              endTime;
              reason = trim(reason);
              approverEmails = emails;
              createdAt = existing.createdAt;
              updatedAt = now;
            };
            state.entries.add(id, updated);
            #ok(updated);
          };
        };
      };
    };
  };

  public func deleteEntry(
    state : UserState,
    owner : Types.UserId,
    id : Types.RecordId,
  ) : Result.Result<(), Types.CoachingError> {
    switch (state.entries.get(id)) {
      case null { #err(#notFound(id)) };
      case (?existing) {
        if (existing.owner != owner) {
          return #err(#notOwner(id));
        };
        state.entries.remove(id);
        #ok(());
      };
    };
  };

  public func summaryByEmail(state : UserState) : [Types.EmailSummary] {
    let counts = Map.empty<Text, { var count : Nat; var latest : Types.Timestamp }>();
    for (entry in state.entries.values()) {
      for (email in entry.approverEmails.values()) {
        switch (counts.get(email)) {
          case (?agg) {
            agg.count := agg.count + 1;
            if (entry.sessionDate > agg.latest) {
              agg.latest := entry.sessionDate;
            };
          };
          case null {
            counts.add(email, { var count = 1; var latest = entry.sessionDate });
          };
        };
      };
    };
    let rows = counts.entries().toArray().map(
      func((email, agg)) : Types.EmailSummary = {
        email;
        count = agg.count;
        latestSessionDate = agg.latest;
      }
    );
    rows.sort(
      func(a, b) {
        if (a.count > b.count) { #less }
        else if (a.count < b.count) { #greater }
        else if (a.latestSessionDate > b.latestSessionDate) { #less }
        else if (a.latestSessionDate < b.latestSessionDate) { #greater }
        else { #equal };
      }
    );
  };

  public func totals(state : UserState) : Types.CoachingTotals {
    let emails = Map.empty<Text, Nat>();
    var sessions = 0;
    for (entry in state.entries.values()) {
      sessions += 1;
      for (email in entry.approverEmails.values()) {
        emails.add(email, 1);
      };
    };
    {
      totalSessions = sessions;
      totalApprovers = emails.size();
    };
  };
};
