import type { CoachingEntry } from "@/backend";
import { StatusChip } from "@/components/EntryList";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  formatDuration,
  formatThaiDate,
  formatThaiWeekday,
  formatTimeRange,
} from "@/lib/format";
import { CalendarDays, Clock, Mail, Pencil, Trash2 } from "lucide-react";

interface EntryDetailDialogProps {
  entry: CoachingEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (entry: CoachingEntry) => void;
  onDelete: (entry: CoachingEntry) => void;
}

export function EntryDetailDialog({
  entry,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: EntryDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="log.detail_dialog"
        className="max-h-[90dvh] overflow-y-auto rounded-2xl border-border bg-card p-6 sm:max-w-2xl"
      >
        {entry ? (
          <>
            <DialogHeader className="gap-2 pr-8">
              <div className="flex flex-wrap items-center gap-2">
                <StatusChip status={entry.status} />
                <span className="text-sm text-muted-foreground">
                  รายละเอียดบันทึก
                </span>
              </div>
              <DialogTitle className="font-display text-2xl font-bold leading-snug tracking-tight">
                {entry.reason}
              </DialogTitle>
              <DialogDescription className="text-sm">
                เหตุผลที่ใช้สถานะนี้
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-5">
              <dl className="grid gap-3 rounded-xl border border-border bg-muted/20 p-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <dt className="text-sm font-semibold tracking-wide text-muted-foreground">
                    วันที่
                  </dt>
                  <dd className="inline-flex items-center gap-1.5 text-sm text-foreground text-tabular">
                    <CalendarDays
                      className="size-4 text-primary"
                      aria-hidden="true"
                    />
                    {formatThaiDate(entry.sessionDate)} ·{" "}
                    {formatThaiWeekday(entry.sessionDate)}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-sm font-semibold tracking-wide text-muted-foreground">
                    เวลา
                  </dt>
                  <dd className="inline-flex items-center gap-1.5 text-sm text-foreground text-tabular">
                    <Clock className="size-4 text-primary" aria-hidden="true" />
                    {formatTimeRange(entry.startTime, entry.endTime)}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-sm font-semibold tracking-wide text-muted-foreground">
                    ระยะเวลา
                  </dt>
                  <dd className="text-sm text-foreground text-tabular">
                    {formatDuration(entry.startTime, entry.endTime)}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-sm font-semibold tracking-wide text-muted-foreground">
                    สถานะ
                  </dt>
                  <dd>
                    <StatusChip status={entry.status} />
                  </dd>
                </div>
              </dl>

              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold tracking-wide text-muted-foreground">
                  ผู้อนุมัติ
                </h3>
                {entry.approverEmails.length === 0 ? (
                  <p className="text-sm text-muted-foreground">—</p>
                ) : (
                  <ul className="flex flex-wrap gap-1.5">
                    {entry.approverEmails.map((email) => (
                      <li key={email}>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-sm text-foreground">
                          <Mail
                            className="size-3.5 text-muted-foreground"
                            aria-hidden="true"
                          />
                          {email}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 border-t border-border pt-4 sm:justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onDelete(entry)}
                data-ocid="log.detail_delete_button"
                className="min-h-11 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" aria-hidden="true" />
                ลบบันทึกนี้
              </Button>
              <Button
                type="button"
                onClick={() => onEdit(entry)}
                data-ocid="log.detail_edit_button"
                className="min-h-11 rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <Pencil className="size-4" aria-hidden="true" />
                แก้ไขบันทึก
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
