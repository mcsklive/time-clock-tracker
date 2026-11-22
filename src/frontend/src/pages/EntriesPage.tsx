import type { CoachingEntry, EmailSummary, EntryStatus } from "@/backend";
import { DeleteEntryDialog } from "@/components/DeleteEntryDialog";
import { EntryDetailDialog } from "@/components/EntryDetailDialog";
import {
  type EntryFilterValue,
  EntryFilters,
  matchesStatus,
} from "@/components/EntryFilters";
import { EntryForm } from "@/components/EntryForm";
import { StatusChip } from "@/components/EntryList";
import { PersonSummary } from "@/components/PersonSummary";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyEntries } from "@/hooks/useQueries";
import {
  formatDuration,
  formatThaiDate,
  formatThaiWeekday,
  formatTimeRange,
  fromDateInputValue,
  timestampToDate,
} from "@/lib/format";
import { entriesRoute } from "@/router";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  Mail,
  NotebookPen,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const DAY_MS = 86_400_000;

interface Notice {
  tone: "success" | "error";
  message: string;
}

function startOfDay(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

function entryDay(entry: CoachingEntry): number {
  const date = timestampToDate(entry.sessionDate);
  return date ? startOfDay(date) : 0;
}

function matchesRange(entry: CoachingEntry, filter: EntryFilterValue): boolean {
  if (filter.range === "all") return true;
  const day = entryDay(entry);
  if (day === 0) return false;
  const today = startOfDay(new Date());
  if (filter.range === "7d") return day >= today - 6 * DAY_MS;
  if (filter.range === "30d") return day >= today - 29 * DAY_MS;
  const from = filter.from ? fromDateInputValue(filter.from) : null;
  const to = filter.to ? fromDateInputValue(filter.to) : null;
  const fromDay = from
    ? startOfDay(timestampToDate(from) ?? new Date(0))
    : null;
  const toDay = to ? startOfDay(timestampToDate(to) ?? new Date(0)) : null;
  if (fromDay !== null && day < fromDay) return false;
  if (toDay !== null && day > toDay) return false;
  return true;
}

function matchesEmail(entry: CoachingEntry, email: string): boolean {
  if (email === "") return true;
  return entry.approverEmails.some(
    (candidate) => candidate.toLowerCase() === email.toLowerCase(),
  );
}

function EntryRow({
  entry,
  index,
  onOpen,
}: {
  entry: CoachingEntry;
  index: number;
  onOpen: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        data-ocid={`entries.list.item.${index + 1}`}
        onClick={onOpen}
        className="group flex w-full items-start gap-3 px-4 py-4 text-left transition-smooth hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring md:gap-4 md:px-5"
      >
        <span className="flex w-20 shrink-0 flex-col items-center rounded-lg border border-border bg-muted/40 px-2 py-1.5 text-center">
          <span className="text-sm text-tabular text-foreground">
            {formatThaiDate(entry.sessionDate)}
          </span>
          <span className="text-sm text-muted-foreground">
            {formatThaiWeekday(entry.sessionDate)}
          </span>
        </span>

        <span className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <StatusChip status={entry.status} />
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground text-tabular">
              <Clock className="size-3.5" aria-hidden="true" />
              {formatTimeRange(entry.startTime, entry.endTime)}
            </span>
            <span className="text-sm text-muted-foreground text-tabular">
              {formatDuration(entry.startTime, entry.endTime)}
            </span>
          </span>
          <span className="line-clamp-2 text-sm font-medium text-foreground">
            {entry.reason}
          </span>
          <span className="flex flex-wrap items-center gap-1.5">
            {entry.approverEmails.length === 0 ? (
              <span className="text-sm text-muted-foreground">
                ไม่ได้ระบุผู้อนุมัติ
              </span>
            ) : (
              entry.approverEmails.map((email) => (
                <span
                  key={email}
                  className="inline-flex max-w-full items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-sm text-secondary-foreground"
                >
                  <Mail className="size-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">{email}</span>
                </span>
              ))
            )}
          </span>
        </span>

        <ChevronRight
          className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </button>
    </li>
  );
}

function EditEntryDialog({
  entry,
  onOpenChange,
  onSaved,
}: {
  entry: CoachingEntry | null;
  onOpenChange: (open: boolean) => void;
  onSaved: (message: string) => void;
}) {
  return (
    <Dialog open={entry !== null} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="entries.edit.dialog"
        className="max-h-[90dvh] overflow-y-auto rounded-2xl border-border bg-card p-6 sm:max-w-2xl"
      >
        {entry && (
          <>
            <DialogHeader className="gap-1.5 pr-8">
              <DialogTitle className="font-display text-2xl font-bold leading-snug tracking-tight">
                แก้ไขบันทึก
              </DialogTitle>
              <DialogDescription className="text-sm">
                ปรับปรุงรายละเอียดของบันทึกที่เลือก แล้วกดบันทึกการแก้ไข
              </DialogDescription>
            </DialogHeader>
            <EntryForm
              key={entry.id.toString()}
              editingEntry={entry}
              onSaved={onSaved}
              onCancelEdit={() => onOpenChange(false)}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function LoadingRows() {
  const ids = Array.from({ length: 4 }, (_, i) => `entry-skeleton-${i}`);
  return (
    <ul data-ocid="entries.loading_state" className="divide-y divide-border">
      {ids.map((id) => (
        <li key={id} className="flex items-start gap-4 px-5 py-4">
          <Skeleton className="h-12 w-20 rounded-lg" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function EntriesPage() {
  const search = entriesRoute.useSearch();
  const navigate = entriesRoute.useNavigate();
  const entriesQuery = useMyEntries();
  const [openId, setOpenId] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<CoachingEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CoachingEntry | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const filter: EntryFilterValue = useMemo(
    () => ({
      range: search.range,
      from: search.from,
      to: search.to,
      email: search.email,
      status: (search.status || "all") as EntryStatus | "all",
    }),
    [search.range, search.from, search.to, search.email, search.status],
  );

  const updateFilter = (next: EntryFilterValue) => {
    void navigate({
      search: {
        range: next.range,
        from: next.from,
        to: next.to,
        email: next.email,
        status: next.status === "all" ? "" : next.status,
      },
      replace: true,
    });
  };

  const entries = useMemo(
    () =>
      [...(entriesQuery.data ?? [])].sort((a, b) =>
        a.sessionDate === b.sessionDate
          ? Number(b.createdAt - a.createdAt)
          : a.sessionDate < b.sessionDate
            ? 1
            : -1,
      ),
    [entriesQuery.data],
  );

  const filtered = useMemo(
    () =>
      entries.filter(
        (entry) =>
          matchesRange(entry, filter) &&
          matchesEmail(entry, filter.email) &&
          matchesStatus(entry, filter.status),
      ),
    [entries, filter],
  );

  const emailOptions = useMemo(() => {
    const seen = new Set<string>();
    for (const entry of entries) {
      for (const email of entry.approverEmails) seen.add(email);
    }
    return [...seen].sort((a, b) => a.localeCompare(b));
  }, [entries]);

  const summary: EmailSummary[] = useMemo(() => {
    const map = new Map<string, EmailSummary>();
    for (const entry of filtered) {
      for (const email of entry.approverEmails) {
        const existing = map.get(email);
        if (!existing) {
          map.set(email, {
            email,
            count: 1n,
            latestSessionDate: entry.sessionDate,
          });
          continue;
        }
        map.set(email, {
          email,
          count: existing.count + 1n,
          latestSessionDate:
            entry.sessionDate > existing.latestSessionDate
              ? entry.sessionDate
              : existing.latestSessionDate,
        });
      }
    }
    return [...map.values()].sort(
      (a, b) =>
        Number(b.count - a.count) ||
        Number(b.latestSessionDate - a.latestSessionDate),
    );
  }, [filtered]);

  const totalSessions = filtered.length;
  const totalApprovers = summary.length;
  const openEntry =
    entries.find((entry) => String(entry.id) === openId) ?? null;

  function handleEdit(entry: CoachingEntry) {
    setOpenId(null);
    setEditingEntry(entry);
  }

  function handleSaved(message: string) {
    setEditingEntry(null);
    setNotice({ tone: "success", message });
  }

  function requestDelete(entry: CoachingEntry) {
    setOpenId(null);
    setDeleteTarget(entry);
  }

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          รายการย้อนหลัง
        </h1>
        <p className="text-sm text-muted-foreground">
          ดูประวัติการโค้ชชิ่งย้อนหลัง กรองตามวันที่ สถานะ และผู้อนุมัติ
        </p>
      </header>

      {notice ? (
        <div
          role={notice.tone === "error" ? "alert" : "status"}
          data-ocid={
            notice.tone === "error"
              ? "entries.error_notice"
              : "entries.success_state"
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

      <EntryFilters
        value={filter}
        onChange={updateFilter}
        emailOptions={emailOptions}
        resultCount={filtered.length}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:items-start">
        <section
          data-ocid="entries.list.panel"
          aria-labelledby="entries-list-heading"
          className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-subtle"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-5">
            <h2
              id="entries-list-heading"
              className="flex items-center gap-2 font-display text-sm font-bold tracking-tight"
            >
              <ClipboardList
                className="size-4 text-primary"
                aria-hidden="true"
              />
              บันทึกทั้งหมด
            </h2>
            <span className="text-sm text-tabular text-muted-foreground">
              {filtered.length} รายการ
            </span>
          </div>

          {entriesQuery.isLoading ? (
            <LoadingRows />
          ) : entriesQuery.isError ? (
            <div
              data-ocid="entries.error_state"
              className="flex flex-col items-center gap-3 px-6 py-14 text-center"
            >
              <span className="flex size-11 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                <AlertCircle className="size-5" aria-hidden="true" />
              </span>
              <p className="text-sm text-muted-foreground">
                โหลดรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
              </p>
              <Button
                type="button"
                variant="outline"
                data-ocid="entries.retry_button"
                onClick={() => void entriesQuery.refetch()}
                className="rounded-lg border-border text-sm"
              >
                ลองใหม่
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            <div
              data-ocid="entries.empty_state"
              className="flex flex-col items-center gap-3 px-6 py-16 text-center"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-accent text-primary">
                <CalendarDays className="size-6" aria-hidden="true" />
              </span>
              <h3 className="font-display text-sm font-semibold">
                {entries.length === 0
                  ? "ยังไม่มีบันทึกการโค้ชชิ่ง"
                  : "ไม่พบบันทึกที่ตรงกับตัวกรอง"}
              </h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                {entries.length === 0
                  ? "เริ่มบันทึกการโค้ชชิ่งครั้งแรกของคุณได้เลย"
                  : "ลองปรับช่วงวันที่ สถานะ หรือเลือกผู้อนุมัติคนอื่น"}
              </p>
              {entries.length === 0 ? (
                <Button
                  type="button"
                  data-ocid="entries.empty_state.create_button"
                  onClick={() => void navigate({ to: "/" })}
                  className="rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  <NotebookPen className="size-4" aria-hidden="true" />
                  บันทึกการโค้ชชิ่งใหม่
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  data-ocid="entries.empty_state.reset_button"
                  onClick={() =>
                    updateFilter({
                      range: "all",
                      from: "",
                      to: "",
                      email: "",
                      status: "all",
                    })
                  }
                  className="rounded-lg border-border text-sm"
                >
                  ล้างตัวกรอง
                </Button>
              )}
            </div>
          ) : (
            <ul
              data-ocid="entries.list"
              className="flex flex-col divide-y divide-border"
            >
              {filtered.map((entry, index) => (
                <EntryRow
                  key={String(entry.id)}
                  entry={entry}
                  index={index}
                  onOpen={() => setOpenId(String(entry.id))}
                />
              ))}
            </ul>
          )}
        </section>

        <PersonSummary
          summary={summary}
          totalSessions={totalSessions}
          totalApprovers={totalApprovers}
          activeEmail={filter.email}
          onSelectEmail={(email) => updateFilter({ ...filter, email })}
        />
      </div>

      <EntryDetailDialog
        entry={openEntry}
        open={openEntry !== null}
        onOpenChange={(open) => {
          if (!open) setOpenId(null);
        }}
        onEdit={handleEdit}
        onDelete={requestDelete}
      />

      <EditEntryDialog
        entry={editingEntry}
        onOpenChange={(open) => {
          if (!open) setEditingEntry(null);
        }}
        onSaved={handleSaved}
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
