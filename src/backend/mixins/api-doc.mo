mixin () {
  public query func getApiDoc() : async Text {
    "# Coaching Log API\n" #
    "\n" #
    "This backend stores personal training/coaching log entries for each signed-in user. Every entry belongs to exactly one principal, and a caller can only read or change their own entries.\n" #
    "\n" #
    "## Authentication\n" #
    "\n" #
    "All methods take the caller's identity from the IC message. Every coaching method (`createEntry`, `listMyEntries`, `updateMyEntry`, `deleteMyEntry`, `mySummary`, `myTotals`) is gated on the allowlist: a caller whose verified email is not on the list traps with `Unauthorized: email is not on the allowlist`, so a non-allowlisted or anonymous caller cannot read or change any coaching record. `getMyAccess` never traps; it reports `#denied` instead.\n" #
    "\n" #
    "The app's frontend pins an Internet Identity derivation origin, published at `/.well-known/ii-derivation-origin` when available. An agent already holding the user's Internet Identity authorization derives the correct per-app principal against that origin (for example `icp identity link web <name> --app <host>`). Such a delegation acts with the user's full authority in this app until it expires.\n" #
    "\n" #
    "Registration: access is gated on the approved email list, not on a separate registration step. There is no self-registration endpoint: the allowlist is fixed in the canister and a caller cannot add themselves. A signed-in caller becomes usable only once the backend holds a verified email for their principal that matches an allowlist entry; until then every coaching method traps with `Unauthorized: email is not on the allowlist` and `getMyAccess` reports `#denied`. The verified email is captured by the Internet Identity attribute callback during sign-in, so a principal that never signed in through the app's frontend is unregistered even when it belongs to the app's owner, and a principal derived against a different origin is a different principal. The first caller to initialize the authorization state receives the `#admin` role and every later caller receives `#user`; that role governs only the authorization mixin's own admin methods and does not grant or bypass allowlist access to any coaching method.\n" #
    "\n" #
    "The verified email is captured only when the identity carries an Internet Identity attribute bundle signed by the trusted signer and matching the canister's configured frontend origins. A caller whose identity provides no such bundle stays `#denied` until it does.\n" #
    "\n" #
    "## Allowlist access\n" #
    "\n" #
    "Sign-in is restricted to an allowlist of work emails. At sign-in the backend stores the caller's Internet Identity verified email (when the identity provides one) and `getMyAccess()` reports whether that email is on the list. The allowlist is seeded with 34 people, each with a display name, a role and a permission level.\n" #
    "\n" #
    "- `getMyAccess() : AccessStatus` (query) — returns `#allowed({ displayName; role; permission })` when the caller's verified email matches an allowlist entry, otherwise `#denied`. Matching trims surrounding whitespace and ignores case. A caller with no verified email (for example a passkey-only identity) is always `#denied`.\n" #
    "- `getMyVerifiedEmail() : ?Text` (query) — the verified email the backend has stored for the caller, or `null` when none was captured yet.\n" #
    "- `refreshVerifiedEmail() : ?Text` (update) — re-runs Internet Identity attribute verification for the caller and stores the verified email, returning it (or `null` when the identity carries no verified email). Call this after a restored session so `getMyAccess` sees the email even when the sign-in callback did not run. It is idempotent: repeating it stores the same email. It never traps and does not itself grant access; the stored email must still match an allowlist entry.\n" #
    "- `permission` is one of `#allControl`, `#viewOnly`, `#logStatus`. `role` is a free-text job title (for example `Agent`, `Senior`, `Team Lead`).\n" #
    "\n" #
    "## Authorization\n" #
    "\n" #
    "Entries are scoped per owner. Every coaching method first requires the caller's verified email to be on the allowlist (otherwise it traps). `updateMyEntry` and `deleteMyEntry` return `#notOwner(id)` when the entry exists but belongs to another principal, and `#notFound(id)` when no entry with that id exists in the caller's store. Ids are per-user counters, so the same numeric id can exist for different users.\n" #
    "\n" #
    "## Units and encoding\n" #
    "\n" #
    "- `Timestamp` is `Int` nanoseconds since the Unix epoch (UTC). `Time.now()` supplies `createdAt` and `updatedAt`.\n" #
    "- `RecordId` is a `Nat`, assigned per user starting at 0 and increasing.\n" #
    "- `sessionDate`, `startTime` and `endTime` are caller-supplied timestamps (nanoseconds since epoch). All three are required (a zero value is rejected). `endTime` must not be earlier than `startTime`.\n" #
    "- `status` is one of `#training`, `#coaching`, `#outboundChat`.\n" #
    "- `reason` is the free-text reason for the status; it must be non-empty after trimming.\n" #
    "- `approverEmails` is a list of approver email addresses. The backend trims each address, drops blanks and duplicates, requires at least one, and rejects malformed addresses with `#invalidInput`.\n" #
    "\n" #
    "## Methods\n" #
    "\n" #
    "- `createEntry(status, sessionDate, startTime, endTime, reason, approverEmails) : Result<CoachingEntry, CoachingError>` — creates an entry owned by the caller with `createdAt = updatedAt = now`. Fails with `#invalidInput(text)` when a required field is missing, `endTime < startTime`, `reason` is empty, or an approver email is malformed.\n" #
    "- `listMyEntries() : [CoachingEntry]` — the caller's entries, newest first by `sessionDate`, then by descending id.\n" #
    "- `updateMyEntry(id, status, sessionDate, startTime, endTime, reason, approverEmails) : Result<CoachingEntry, CoachingError>` — replaces the entry's fields and sets `updatedAt = now`. Fails with `#notFound`, `#notOwner`, or `#invalidInput`.\n" #
    "- `deleteMyEntry(id) : Result<(), CoachingError>` — removes the entry. Fails with `#notFound` or `#notOwner`.\n" #
    "- `mySummary() : [EmailSummary]` — per approver email, the number of sessions and the latest session date, sorted by count descending then latest date.\n" #
    "- `myTotals() : CoachingTotals` — total sessions and total distinct approver emails across the caller's entries.\n" #
    "\n" #
    "## Lifecycle and polling\n" #
    "\n" #
    "Entries are created, updated and deleted explicitly; there is no state machine. `listMyEntries`, `mySummary` and `myTotals` are queries and can be polled freely.\n" #
    "\n" #
    "## Mutation retry safety\n" #
    "\n" #
    "`createEntry` is not idempotent: retrying after a successful call creates a second entry. `updateMyEntry` is idempotent for the same arguments. `deleteMyEntry` returns `#notFound` on a retry after a successful delete; treat `#notFound` as \"already done\" when retrying a delete. `refreshVerifiedEmail` is idempotent.\n" #
    "\n" #
    "## Errors\n" #
    "\n" #
    "`CoachingError` variants: `#notFound(id)`, `#notOwner(id)`, `#invalidInput(text)`. These are returned as values, not traps, so callers can branch on them. A caller not on the allowlist instead gets a trap (`Unauthorized: email is not on the allowlist`) from every coaching method.\n" #
    "\n" #
    "## Query layer\n" #
    "\n" #
    "The backend exposes `schema()` and `execute()` (OQL). The `coachingEntry` table is scoped per user: a signed-in caller reads only their own rows, and the platform controller reads all rows. The `allowlistEntry` table (columns `email`, `displayName`, `role`, `permission`) is controller-only: it holds the sign-in allowlist and is readable only by the platform controller, never by end users."
  };
};
