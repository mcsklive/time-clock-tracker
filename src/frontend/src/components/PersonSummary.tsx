import type { EmailSummary } from "@/backend";
import { formatThaiDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

interface PersonSummaryProps {
  summary: EmailSummary[];
  totalSessions: number;
  totalApprovers: number;
  activeEmail: string;
  onSelectEmail: (email: string) => void;
}

function Stat({
  label,
  value,
  marker,
}: {
  label: string;
  value: number;
  marker: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-muted/30 px-4 py-3">
      <span className="text-sm font-semibold text-muted-foreground">
        {label}
      </span>
      <span
        data-ocid={marker}
        className="font-display text-3xl font-bold tracking-tight text-tabular text-foreground"
      >
        {value}
      </span>
    </div>
  );
}

export function PersonSummary({
  summary,
  totalSessions,
  totalApprovers,
  activeEmail,
  onSelectEmail,
}: PersonSummaryProps) {
  return (
    <section
      data-ocid="entries.summary.panel"
      aria-labelledby="summary-heading"
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 shadow-subtle md:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2
          id="summary-heading"
          className="font-display text-sm font-bold tracking-tight"
        >
          สรุปต่อผู้อนุมัติ
        </h2>
        <span className="text-sm text-muted-foreground">ตามตัวกรองปัจจุบัน</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat
          label="จำนวนครั้งรวม"
          value={totalSessions}
          marker="entries.summary.total_sessions"
        />
        <Stat
          label="ผู้อนุมัติ"
          value={totalApprovers}
          marker="entries.summary.total_approvers"
        />
      </div>

      {summary.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          ยังไม่มีข้อมูลผู้อนุมัติในช่วงนี้
        </p>
      ) : (
        <ul
          data-ocid="entries.summary.list"
          className="flex max-h-80 flex-col divide-y divide-border overflow-y-auto rounded-xl border border-border"
        >
          {summary.map((person, index) => {
            const active = person.email === activeEmail;
            return (
              <li key={person.email}>
                <button
                  type="button"
                  data-ocid={`entries.summary.item.${index + 1}`}
                  aria-pressed={active}
                  onClick={() => onSelectEmail(active ? "" : person.email)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                    active ? "bg-accent/60" : "hover:bg-muted/50",
                  )}
                >
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-sm text-foreground">
                      {person.email}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ล่าสุด {formatThaiDate(person.latestSessionDate)}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-sm text-tabular text-success">
                    <Users className="size-3.5" aria-hidden="true" />
                    {Number(person.count)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
