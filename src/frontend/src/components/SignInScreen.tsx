import { SignInButton } from "@/components/InternetIdentity";
import { Card, CardContent } from "@/components/ui/card";
import { NotebookPen } from "lucide-react";

/** Branded sign-in screen shown to signed-out visitors. */
export function SignInScreen() {
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
                ใช้ Internet Identity เพื่อยืนยันตัวตน
                บันทึกการโค้ชชิ่งของคุณจะถูกเก็บเป็นส่วนตัวและเห็นได้เฉพาะคุณเท่านั้น
              </p>
            </div>
            <SignInButton className="inline-flex min-h-14 w-full items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-smooth hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card disabled:opacity-60" />
            <p className="text-sm text-muted-foreground">
              ยังไม่มีบัญชี? สร้างได้ทันทีในขั้นตอนเข้าสู่ระบบ
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
