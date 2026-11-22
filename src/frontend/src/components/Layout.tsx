import { UserBadge } from "@/components/UserBadge";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { ClipboardList, NotebookPen } from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  {
    to: "/",
    label: "หน้าบันทึก",
    icon: NotebookPen,
    marker: "nav.log_link",
  },
  {
    to: "/entries",
    label: "รายการย้อนหลัง",
    icon: ClipboardList,
    marker: "nav.entries_link",
  },
] as const;

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-6">
          <div className="flex items-center justify-between gap-4">
            <Link
              to="/"
              data-ocid="nav.brand_link"
              className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              <span className="flex size-9 items-center justify-center rounded-xl border border-primary/40 bg-accent text-primary">
                <NotebookPen className="size-5" aria-hidden="true" />
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-display text-sm font-bold tracking-tight text-foreground">
                  COACHLOG
                </span>
                <span className="mt-1 text-sm font-semibold tracking-wide text-muted-foreground">
                  บันทึกการโค้ชชิ่งทีมแชทเซลส์
                </span>
              </span>
            </Link>
            <div className="md:hidden">
              <UserBadge />
            </div>
          </div>

          <nav aria-label="เมนูหลัก" className="flex items-center gap-1.5">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                data-ocid={item.marker}
                activeOptions={{ exact: item.to === "/" }}
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-transparent px-4 text-sm font-medium text-muted-foreground transition-smooth hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card md:flex-none"
                activeProps={{
                  className: cn(
                    "border-primary/50 bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground",
                  ),
                }}
              >
                <item.icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:block">
            <UserBadge />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 md:py-8">
        {children}
      </main>

      <footer className="border-t border-border bg-muted/40">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <p>COACHLOG · บันทึกการโค้ชชิ่งทีมแชทเซลส์</p>
          <p>
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
