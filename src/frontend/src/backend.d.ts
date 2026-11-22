import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type AccessStatus = {
    __kind__: "allowed";
    allowed: {
        permission: PermissionLevel;
        displayName: string;
        role: string;
    };
} | {
    __kind__: "denied";
    denied: null;
};
export interface Cell {
    value: Value;
    name: string;
}
export interface CoachingEntry {
    id: RecordId;
    startTime: Timestamp;
    status: EntryStatus;
    sessionDate: Timestamp;
    endTime: Timestamp;
    owner: UserId;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    approverEmails: Array<string>;
    reason: string;
}
export type CoachingError = {
    __kind__: "invalidInput";
    invalidInput: string;
} | {
    __kind__: "notFound";
    notFound: RecordId;
} | {
    __kind__: "notOwner";
    notOwner: RecordId;
};
export interface CoachingTotals {
    totalApprovers: bigint;
    totalSessions: bigint;
}
export interface EmailSummary {
    latestSessionDate: Timestamp;
    count: bigint;
    email: string;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export type RecordId = bigint;
export type Result = {
    __kind__: "ok";
    ok: CoachingEntry;
} | {
    __kind__: "err";
    err: CoachingError;
};
export type Result_1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: CoachingError;
};
export type Result_2 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface Result__1 {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Timestamp = bigint;
export type UserId = Principal;
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum EntryStatus {
    coaching = "coaching",
    outboundChat = "outboundChat",
    training = "training"
}
export enum PermissionLevel {
    viewOnly = "viewOnly",
    logStatus = "logStatus",
    allControl = "allControl"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createEntry(status: EntryStatus, sessionDate: Timestamp, startTime: Timestamp, endTime: Timestamp, reason: string, approverEmails: Array<string>): Promise<Result>;
    deleteMyEntry(id: RecordId): Promise<Result_1>;
    execute(qJson: string): Promise<Result__1>;
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    getMyAccess(): Promise<AccessStatus>;
    getMyVerifiedEmail(): Promise<string | null>;
    isCallerAdmin(): Promise<boolean>;
    listMyEntries(): Promise<Array<CoachingEntry>>;
    mySummary(): Promise<Array<EmailSummary>>;
    myTotals(): Promise<CoachingTotals>;
    refreshVerifiedEmail(): Promise<string | null>;
    schema(): Promise<string>;
    updateMyEntry(id: RecordId, status: EntryStatus, sessionDate: Timestamp, startTime: Timestamp, endTime: Timestamp, reason: string, approverEmails: Array<string>): Promise<Result>;
}
