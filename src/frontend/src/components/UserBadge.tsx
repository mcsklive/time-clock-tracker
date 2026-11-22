import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useMyAccess } from "@/hooks/useAccess";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";

function initialsOf(name: string): string {
  const trimmed = name.trim();
  if (trimmed === "") return "?";
  return trimmed.slice(0, 2).toUpperCase();
}

/** Signed-in person's display name and role with a sign-out action. */
export function UserBadge() {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const access = useMyAccess();
  const allowed =
    access.data?.__kind__ === "allowed" ? access.data.allowed : null;
  const displayName = allowed?.displayName?.trim() || "ผู้ใช้งาน";
  const roleText = allowed?.role?.trim() || "ไม่ระบุบทบาท";

  return (
    <div className="flex items-center gap-2.5">
      <Avatar className="size-9 border border-border">
        <AvatarFallback className="bg-secondary font-display text-sm font-semibold text-secondary-foreground">
          {initialsOf(displayName)}
        </AvatarFallback>
      </Avatar>
      <div className="hidden min-w-0 flex-col leading-tight sm:flex">
        <span
          data-ocid="auth.display_name"
          className="max-w-[12rem] truncate text-sm font-semibold text-foreground"
          title={displayName}
        >
          {displayName}
        </span>
        <span
          data-ocid="auth.role"
          className="max-w-[12rem] truncate text-sm text-muted-foreground"
          title={roleText}
        >
          {roleText}
        </span>
      </div>
      <button
        type="button"
        data-ocid="auth.sign_out_button"
        onClick={() => {
          void queryClient.cancelQueries();
          queryClient.clear();
          clear();
        }}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border px-3 text-sm font-medium text-muted-foreground transition-smooth hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
      >
        <LogOut className="size-3.5" aria-hidden="true" />
        ออกจากระบบ
      </button>
    </div>
  );
}
