import { Card, CardContent } from "@/components/ui/card";
import { accessCopy } from "@/lib/format";
import { clearPendingSignInEmail } from "@/lib/signInEmail";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, MailQuestion, ShieldAlert } from "lucide-react";

/**
 * Shown when the signed-in principal is not on the approved access list.
 * `reason` distinguishes a missing verified email from an unlisted email so the
 * guidance matches what the person actually needs to do.
 */
export function AccessDeniedScreen({
  reason = "notListed",
}: {
  reason?: "noEmail" | "notListed" | "emailMismatch";
}) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();
  const noEmail = reason === "noEmail";
  const emailMismatch = reason === "emailMismatch";

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-10 text-foreground">
      <div className="w-full max-w-md animate-fade-up motion-reduce:animate-none">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-xl border border-warning/40 bg-warning/15 text-warning">
            <ShieldAlert className="size-5" aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-sm font-bold tracking-tight">
              COACHLOG
            </span>
            <span className="mt-1 text-sm font-semibold text-muted-foreground">
              บันทึกการโค้ชชิ่งทีมแชทเซลส์
            </span>
          </span>
        </div>

        <Card
          data-ocid="access.denied_state"
          className="rounded-2xl border-border bg-card shadow-elevated"
        >
          <CardContent className="flex flex-col items-center gap-5 px-6 py-8 text-center md:px-8">
            <div className="flex flex-col gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight">
                {emailMismatch
                  ? accessCopy.emailMismatchTitle
                  : noEmail
                    ? accessCopy.noEmailTitle
                    : accessCopy.deniedTitle}
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {emailMismatch
                  ? accessCopy.emailMismatchBody
                  : noEmail
                    ? accessCopy.noEmailBody
                    : accessCopy.deniedBody}
              </p>
            </div>

            <div className="flex w-full items-start gap-3 rounded-xl border border-border bg-secondary/60 px-4 py-3 text-left">
              <MailQuestion
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <p className="text-sm leading-relaxed text-muted-foreground">
                {emailMismatch
                  ? "ออกจากระบบแล้วกรอกอีเมลที่ตรงกับบัญชี Google หรือ Microsoft ที่ใช้ยืนยันตัวตน"
                  : noEmail
                    ? "ออกจากระบบแล้วเข้าสู่ระบบใหม่ด้วยบัญชีอีเมลองค์กร (Google หรือ Microsoft) ที่ผูกกับอีเมลที่ได้รับอนุญาต"
                    : "แจ้งอีเมลที่ใช้เข้าสู่ระบบให้ผู้ดูแลระบบ เพื่อขอเพิ่มสิทธิ์การใช้งาน แล้วเข้าสู่ระบบอีกครั้ง"}
              </p>
            </div>

            <button
              type="button"
              data-ocid="access.denied_sign_out_button"
              onClick={() => {
                void queryClient.cancelQueries();
                queryClient.clear();
                clearPendingSignInEmail();
                clear();
              }}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-smooth hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              <LogOut className="size-4" aria-hidden="true" />
              {accessCopy.signOut}
            </button>
            <p className="text-sm text-muted-foreground">
              ต้องการใช้บัญชีอื่น? ออกจากระบบแล้วเข้าสู่ระบบใหม่ได้เลย
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
