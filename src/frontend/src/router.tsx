import { AccessDeniedScreen } from "@/components/AccessDeniedScreen";
import { RequireAccess, RequireSignIn } from "@/components/InternetIdentity";
import { Layout } from "@/components/Layout";
import { SignInScreen } from "@/components/SignInScreen";
import { EntriesPage } from "@/pages/EntriesPage";
import { LogPage } from "@/pages/LogPage";
import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app",
  component: () => (
    <RequireSignIn fallback={<SignInScreen />}>
      <RequireAccess
        denied={(reason) => <AccessDeniedScreen reason={reason} />}
      >
        <Layout>
          <Outlet />
        </Layout>
      </RequireAccess>
    </RequireSignIn>
  ),
});

const logRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/",
  component: LogPage,
});

export type EntriesRange = "all" | "7d" | "30d" | "custom";

export interface EntriesSearch {
  range: EntriesRange;
  from: string;
  to: string;
  email: string;
  status: string;
}

function asRange(value: unknown): EntriesRange {
  return value === "7d" || value === "30d" || value === "custom"
    ? value
    : "all";
}

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export const entriesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "/entries",
  validateSearch: (search: Record<string, unknown>): EntriesSearch => ({
    range: asRange(search.range),
    from: asText(search.from),
    to: asText(search.to),
    email: asText(search.email),
    status: asText(search.status),
  }),
  component: EntriesPage,
});

const routeTree = rootRoute.addChildren([
  appRoute.addChildren([logRoute, entriesRoute]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
