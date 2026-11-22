import type { CoachingEntry } from "@/backend";
import { DeleteEntryDialog } from "@/components/DeleteEntryDialog";
import { EntryDetailDialog } from "@/components/EntryDetailDialog";
import { EntryForm } from "@/components/EntryForm";
import { EntryList } from "@/components/EntryList";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyEntries, useMyTotals } from "@/hooks/useQueries";
import { formatThaiDate, formatTimeRange, statusLabel } from "@/lib/format";
import { CheckCircle2, NotebookPen, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const RECENT_LIMIT = 5;

interface Notice {
  tone: "success" | "error";
  message: string;
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-semibold text-muted-foreground">
        {label}
      </span>
      <span className="font-display text-3xl font-bold tracking-tight text-tabular text-foreground">
        {value}
      </span>
    </div>
  );
}

export function LogPage() {
  const entriesQuery = useMyEntries();
  const totalsQuery = useMyTotals();

  const [editingEntry, setEditingEntry] = useState<CoachingEntry | null>(null);
  const [detailEntry, setDetailEntry] = useState<CoachingEntry | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CoachingEntry | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const entries = entriesQuery.data ?? [];
  const recentEntries = useMemo(
    () =>
      [...entries]
        .sort((a, b) => Number(b.sessionDate - a.sessionDate))
        .slice(0, RECENT_LIMIT),
    [entries],
  );
  const totals = totalsQuery.data ?? null;

  function handleSaved(message: string) {
    setNotice({ tone: "success", message });
    setEditingEntry(null);
  }

  function handleEdit(entry: CoachingEntry) {
    setDetailOpen(false);
    setEditingEntry(entry);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openDetail(entry: CoachingEntry) {
    setDetailEntry(entry);
    setDetailOpen(true);
  }

  function requestDelete(entry: CoachingEntry) {
    setDetailOpen(false);
    setDeleteTarget(entry);
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          บันทึกการโค้ชชิ่งใหม่
        </h1>
        <p className="text-sm text-muted-foreground">
          บันทึกการอบรมและโค้ชชิ่งทีมแชทเซลส์ตามแบบฟอร์ม Training Coaching Log
        </p>
      </header>

      {notice ? (
        <div
          role={notice.tone === "error" ? "alert" : "status"}
          data-ocid={
            notice.tone === "error" ? "log.error_state" : "log.success_state"
          }
          className={
            notice.tone === "error"
              ? "flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive"
              : "flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 px-4 py-3 text-sm font-medium text-success"
          }
        >
          <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
          {notice.message}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)] lg:items-start">
        <Card
          data-ocid="log.form_panel"
          className="animate-fade-up rounded-2xl border-border bg-card shadow-elevated hairline-top motion-reduce:animate-none"
        >
          <CardContent className="flex flex-col gap-5 px-5 py-6 md:px-7 md:py-7">
            <div className="flex flex-col gap-1">
              <h2 className="font-display text-2xl font-bold tracking-tight">
                {editingEntry ? "แก้ไขบันทึก" : "ฟอร์มบันทึกครั้งใหม่"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {editingEntry
                  ? "ปรับปรุงรายละเอียดของบันทึกที่เลือก แล้วกดบันทึกการแก้ไข"
                  : "กรอกข้อมูลให้ครบถ้วนเพื่อเก็บไว้เป็นหลักฐานการโค้ชชิ่ง"}
              </p>
            </div>
            <EntryForm
              key={editingEntry ? editingEntry.id.toString() : "new"}
              editingEntry={editingEntry}
              onSaved={handleSaved}
              onCancelEdit={() => setEditingEntry(null)}
            />
          </CardContent>
        </Card>

        <aside className="flex flex-col gap-4">
          <Card
            data-ocid="log.summary_panel"
            className="animate-fade-up rounded-2xl border-border bg-card shadow-subtle motion-reduce:animate-none"
          >
            <CardContent className="flex flex-col gap-5 px-5 py-6">
              <h2 className="font-display text-sm font-bold tracking-tight">
                ภาพรวมการโค้ชชิ่ง
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <StatBlock
                  label="ครั้งที่บันทึก"
                  value={totals ? totals.totalSessions.toString() : "—"}
                />
                <StatBlock
                  label="ผู้อนุมัติ"
                  value={totals ? totals.totalApprovers.toString() : "—"}
                />
              </div>

              <div className="flex flex-col gap-2 border-t border-border pt-4">
                <h3 className="text-sm font-semibold text-muted-foreground">
                  บันทึกล่าสุด
                </h3>
                {entriesQuery.isLoading ? (
                  <div className="flex flex-col gap-2">
                    {["s1", "s2", "s3"].map((id) => (
                      <Skeleton key={id} className="h-10 w-full rounded-lg" />
                    ))}
                  </div>
                ) : recentEntries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">ยังไม่มีบันทึก</p>
                ) : (
                  <ul className="flex flex-col gap-1.5">
                    {recentEntries.slice(0, 4).map((entry) => (
                      <li
                        key={entry.id.toString()}
                        className="flex items-center justify-between gap-3 rounded-lg bg-muted/40 px-3 py-2"
                      >
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate text-sm text-foreground">
                            {statusLabel(entry.status)}
                          </span>
                          <span className="text-sm text-muted-foreground text-tabular">
                            {formatThaiDate(entry.sessionDate)} ·{" "}
                            {formatTimeRange(entry.startTime, entry.endTime)}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-2xl font-bold tracking-tight">
            บันทึกล่าสุด
          </h2>
          <p className="text-sm text-muted-foreground">
            เปิดดูรายละเอียด แก้ไข หรือลบบันทึกที่เพิ่งบันทึกไว้
          </p>
        </div>

        {entriesQuery.isLoading ? (
          <div
            data-ocid="log.loading_state"
            className="flex flex-col gap-3"
            aria-busy="true"
          >
            {["l1", "l2", "l3"].map((id) => (
              <Skeleton key={id} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
        ) : entriesQuery.isError ? (
          <Card
            data-ocid="log.list_error_state"
            className="rounded-2xl border-destructive/40 bg-card"
          >
            <CardContent className="flex flex-col items-center gap-3 px-6 py-12 text-center">
              <p className="text-sm font-medium text-destructive">
                ไม่สามารถโหลดรายการได้ กรุณาลองใหม่อีกครั้ง
              </p>
              <button
                type="button"
                onClick={() => void entriesQuery.refetch()}
                data-ocid="log.retry_button"
                className="min-h-11 rounded-xl border border-border px-4 text-sm font-medium hover:bg-secondary"
              >
                ลองอีกครั้ง
              </button>
            </CardContent>
          </Card>
        ) : recentEntries.length === 0 ? (
          <Card
            data-ocid="log.empty_state"
            className="rounded-2xl border-border bg-card shadow-subtle"
          >
            <CardContent className="flex flex-col items-center gap-3 px-6 py-14 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-accent text-primary">
                <NotebookPen className="size-6" aria-hidden="true" />
              </span>
              <h3 className="font-display text-sm font-semibold">
                ยังไม่มีบันทึกการโค้ชชิ่ง
              </h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                เริ่มบันทึกครั้งแรกจากฟอร์มด้านบน เพื่อเก็บประวัติการโค้ชชิ่งและติดตามผลได้ง่ายขึ้น
              </p>
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="size-3.5" aria-hidden="true" />
                ข้อมูลของคุณจะถูกเก็บเป็นส่วนตัว
              </span>
            </CardContent>
          </Card>
        ) : (
          <EntryList
            entries={recentEntries}
            onOpen={openDetail}
            onEdit={handleEdit}
            onRequestDelete={requestDelete}
          />
        )}
      </section>

      <EntryDetailDialog
        entry={detailEntry}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={handleEdit}
        onDelete={requestDelete}
      />

      <DeleteEntryDialog
        entry={deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onDeleted={(message) => setNotice({ tone: "success", message })}
        onError={(message) => setNotice({ tone: "error", message })}
      />
    </div>
  );
}
