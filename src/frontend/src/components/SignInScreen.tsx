import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setPendingSignInEmail } from "@/lib/signInEmail";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { NotebookPen } from "lucide-react";
import { type FormEvent, useState } from "react";

/** Branded sign-in screen shown to signed-out visitors. */
export function SignInScreen() {
  const [email, setEmail] = useState("");
  const { login, isInitializing, isLoggingIn, isLoginError } =
    useInternetIdentity();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPendingSignInEmail(email);
    // Keep the popup inside the user's activation frame: no await before login.
    login();
  }

  const isBusy = isInitializing || isLoggingIn;
  const buttonLabel = isInitializing
    ? "กำลังตรวจสอบสถานะการเข้าสู่ระบบ…"
    : isLoggingIn
      ? "กำลังเข้าสู่ระบบ…"
      : "เข้าสู่ระบบด้วย Internet Identity";

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 py-10 text-foreground">
      <div className="w-full max-w-md animate-fade-up motion-reduce:animate-none">
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <span className="flex size-10 items-center justify-center rounded-xl border border-primary/40 bg-accent text-primary">
            <NotebookPen className="size-5" aria-hidden="true" />
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

        <Card className="rounded-2xl border-border bg-card shadow-elevated">
          <CardContent className="flex flex-col items-center gap-5 px-6 py-8 text-center md:px-8">
            <div className="flex flex-col gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight">
                เข้าสู่ระบบเพื่อบันทึกการโค้ชชิ่ง
              </h1>
              <p className="text-sm leading-relaxed text-muted-foreground">
                กรอกอีเมลงานของคุณเพื่อดำเนินการยืนยันตัวตนด้วย Internet Identity
              </p>
            </div>

            <form
              className="flex w-full flex-col gap-4 text-left"
              onSubmit={handleSubmit}
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="sign-in-email">อีเมลที่ใช้เข้าสู่ระบบ</Label>
                <Input
                  id="sign-in-email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="name@company.com"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={isBusy}
                  className="min-h-12 rounded-xl"
                />
              </div>

              {isLoginError && (
                <p
                  role="alert"
                  data-ocid="auth.error_state"
                  className="text-sm text-destructive"
                >
                  ไม่สามารถเข้าสู่ระบบได้ กรุณาลองอีกครั้ง
                </p>
              )}

              <button
                type="submit"
                data-ocid="auth.button"
                disabled={isBusy}
                className="inline-flex min-h-14 w-full items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-smooth hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:opacity-60"
              >
                {buttonLabel}
              </button>
            </form>

            <p className="text-sm leading-relaxed text-muted-foreground">
              อีเมลที่กรอกต้องตรงกับอีเมลที่ Internet Identity ยืนยัน และอยู่ในรายชื่อผู้มีสิทธิ์
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
