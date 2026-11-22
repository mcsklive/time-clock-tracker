import { createActor } from "@/backend";
import type { AccessStatus } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";

export const accessQueryKey = ["myAccess"] as const;

/** Why a caller was denied: no verified email, or an email outside the allowlist. */
export type AccessDenialReason = "noEmail" | "notListed";

/** Access status plus the denial reason the UI needs to pick the right guidance. */
export type AccessResult =
  | {
      __kind__: "allowed";
      allowed: Extract<AccessStatus, { __kind__: "allowed" }>["allowed"];
    }
  | { __kind__: "denied"; reason: AccessDenialReason };

/** How many times to re-capture the verified email before refusing access. */
const MAX_CAPTURE_ATTEMPTS = 4;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Caller-scoped access status: display name, role and permission when allowed.
 *
 * The backend only knows a caller's email after the sign-in attribute callback
 * stored it. That callback runs after the identity is already available, so the
 * first check can race it and see no email yet. A restored session never re-runs
 * the callback at all. In both cases we re-capture the verified email and check
 * again, a bounded number of times, before refusing. The allowlist match itself
 * stays entirely on the backend.
 */
export function useMyAccess() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: accessQueryKey,
    queryFn: async (): Promise<AccessResult> => {
      if (!actor) return { __kind__: "denied", reason: "noEmail" };

      const first = await actor.getMyAccess();
      if (first.__kind__ === "allowed") return first;

      let captured = false;
      for (let attempt = 0; attempt < MAX_CAPTURE_ATTEMPTS; attempt += 1) {
        if (attempt > 0) await wait(400 * attempt);
        let email: string | null = null;
        try {
          email = await actor.refreshVerifiedEmail();
        } catch {
          email = null;
        }
        if (!email) continue;
        captured = true;
        const retried = await actor.getMyAccess();
        if (retried.__kind__ === "allowed") return retried;
      }

      // The backend holds an email for this caller but it is not on the list.
      if (captured) return { __kind__: "denied", reason: "notListed" };

      // No email came back from the re-capture; fall back to what the backend
      // already stored so a stored-but-unlisted email is not reported as missing.
      const stored = await actor.getMyVerifiedEmail();
      return { __kind__: "denied", reason: stored ? "notListed" : "noEmail" };
    },
    enabled: !!actor && !isFetching,
    retry: false,
    staleTime: 60_000,
  });
}
