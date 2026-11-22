import { accessQueryKey, useMyAccess } from "@/hooks/useAccess";
import { accessCopy } from "@/lib/format";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";
import { type ReactNode, useEffect, useRef, useState } from "react";

export function SignInButton({ className }: { className?: string }) {
  const { identity, login, clear, isInitializing, isLoggingIn, isLoginError } =
    useInternetIdentity();
  const queryClient = useQueryClient();
  const authenticated = !!identity && !identity.getPrincipal().isAnonymous();
  let label = authenticated ? "Sign out" : "Sign in with Internet Identity";
  if (isInitializing) {
    label = "Loading sign-in…";
  } else if (isLoggingIn) {
    label = "Signing in…";
  }
  return (
    <div>
      <button
        type="button"
        data-ocid="auth.button"
        className={className}
        disabled={isInitializing || isLoggingIn}
        onClick={() => {
          if (authenticated) {
            void queryClient.cancelQueries();
            queryClient.clear();
            clear();
          } else {
            // Keep the popup inside the user's activation frame: no await before login.
            // The provider requests the verified email attribute bundle on sign-in.
            login();
          }
        }}
      >
        {label}
      </button>
      {isLoginError && (
        <p role="alert" data-ocid="auth.error_state">
          Sign-in did not complete. Please try again.
        </p>
      )}
    </div>
  );
}

/** Each signed-in principal gets its own mounted cache boundary. */
function PrivateQueryBoundary({ children }: { children: ReactNode }) {
  const [queries] = useState(() => new QueryClient());
  useEffect(
    () => () => {
      void queries.cancelQueries();
      queries.clear();
    },
    [queries],
  );
  return <QueryClientProvider client={queries}>{children}</QueryClientProvider>;
}

/** Mount private queries only after sign-in, and isolate their cache when the principal changes. */
export function RequireSignIn({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { identity, isInitializing, isLoggingIn } = useInternetIdentity();
  const principal =
    identity && !identity.getPrincipal().isAnonymous()
      ? identity.getPrincipal().toText()
      : undefined;
  if (isInitializing || isLoggingIn) {
    return (
      <output data-ocid="auth.loading_state">Loading your session…</output>
    );
  }
  if (principal === undefined) {
    return <>{fallback ?? <SignInButton />}</>;
  }
  return (
    <PrivateQueryBoundary key={principal}>{children}</PrivateQueryBoundary>
  );
}

/** Access gate: checks the caller's access status before any coaching record is fetched. */
export function RequireAccess({
  children,
  denied,
}: {
  children: ReactNode;
  denied: (reason: "noEmail" | "notListed") => ReactNode;
}) {
  const { clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const access = useMyAccess();

  // The sign-in attribute callback lands after the identity is available, so a
  // check that ran mid-ceremony can be a stale refusal. Re-run it once the
  // ceremony settles so the stored verified email is seen.
  const settled = loginStatus === "success" || loginStatus === "idle";
  const lastSettled = useRef(settled);
  useEffect(() => {
    if (settled && !lastSettled.current) {
      void queryClient.invalidateQueries({ queryKey: accessQueryKey });
    }
    lastSettled.current = settled;
  }, [settled, queryClient]);

  if (access.isPending) {
    return (
      <div
        data-ocid="access.loading_state"
        className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background px-6 text-center text-foreground"
      >
        <span
          aria-hidden="true"
          className="size-8 animate-spin rounded-full border-2 border-border border-t-primary motion-reduce:animate-none"
        />
        <p className="text-sm text-muted-foreground">{accessCopy.checking}</p>
      </div>
    );
  }

  if (access.isError) {
    return (
      <div
        data-ocid="access.error_state"
        className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground"
      >
        <h1 className="font-display text-2xl font-bold">
          {accessCopy.errorTitle}
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          {accessCopy.errorBody}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            data-ocid="access.retry_button"
            onClick={() => void access.refetch()}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-smooth hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {accessCopy.retry}
          </button>
          <button
            type="button"
            data-ocid="access.sign_out_button"
            onClick={() => {
              void queryClient.cancelQueries();
              queryClient.clear();
              clear();
            }}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-border px-5 text-sm font-medium text-muted-foreground transition-smooth hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {accessCopy.signOut}
          </button>
        </div>
      </div>
    );
  }

  if (access.data.__kind__ !== "allowed") {
    return <>{denied(access.data.reason)}</>;
  }

  return <>{children}</>;
}

/** Complete first-generation private-app entry point: branded copy cannot remove the sign-in action. */
export function AuthenticatedApp({
  children,
  title = "Sign in to continue",
  description = "Sign in with Internet Identity to access your private workspace.",
  className,
  buttonClassName,
}: {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  buttonClassName?: string;
}) {
  return (
    <RequireSignIn
      fallback={
        <section
          aria-label="Sign in"
          data-ocid="auth.panel"
          className={
            className ??
            "flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground"
          }
        >
          <h1 className="font-display text-3xl font-semibold">{title}</h1>
          {description && (
            <p className="max-w-md text-muted-foreground">{description}</p>
          )}
          <SignInButton
            className={
              buttonClassName ??
              "rounded-md bg-primary px-5 py-3 font-medium text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
            }
          />
        </section>
      }
    >
      {children}
    </RequireSignIn>
  );
}
