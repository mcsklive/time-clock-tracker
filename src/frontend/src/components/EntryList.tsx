import type { CoachingEntry, EntryStatus } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatDuration,
  formatThaiDate,
  formatThaiWeekday,
  formatTimeRange,
  statusChipClass,
  statusLabel,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { ChevronRight, Clock, Mail, Pencil, Trash2 } from "lucide-react";

interface EntryListProps {
  entries: CoachingEntry[];
  onOpen: (entry: CoachingEntry) => void;
  onEdit: (entry: CoachingEntry) => void;
  onRequestDelete: (entry: CoachingEntry) => void;
}

export function StatusChip({
  status,
  className,
}: {
  status: EntryStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full px-2.5 py-0.5 text-sm font-semibold",
        statusChipClass(status),
        className,
      )}
    >
      {statusLabel(status)}
    </Badge>
  );
}

export function EntryList({
  entries,
  onOpen,
  onEdit,
  onRequestDelete,
}: EntryListProps) {
  return (
    <ul data-ocid="log.entries_list" className="flex flex-col gap-3">
      {entries.map((entry, index) => (
        <li
          key={entry.id.toString()}
          data-ocid={`log.entry.item.${index + 1}`}
          className="group rounded-2xl border border-border bg-card shadow-subtle transition-smooth hover:bg-muted/40"
        >
          <div className="flex flex-col gap-3 p-4 md:flex-row md:items-start md:gap-5 md:p-5">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <StatusChip status={entry.status} />
                <span className="text-sm text-muted-foreground text-tabular">
                  {formatThaiDate(entry.sessionDate)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {formatThaiWeekday(entry.sessionDate)}
                </span>
                <span className="inline-flex items-center gap-1 text-sm text-muted-foreground text-tabular">
                  <Clock className="size-3.5" aria-hidden="true" />
                  {formatTimeRange(entry.startTime, entry.endTime)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onOpen(entry)}
                data-ocid={`log.entry.open_button.${index + 1}`}
                className="flex items-start gap-1.5 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              >
                <span className="font-display text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
                  {entry.reason}
                </span>
                <ChevronRight
                  className="mt-1 size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
              </button>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-sm text-muted-foreground">ผู้อนุมัติ</span>
                {entry.approverEmails.slice(0, 3).map((email) => (
                  <Badge
                    key={email}
                    variant="outline"
                    className="rounded-full border-border bg-muted/60 text-sm text-foreground"
                  >
                    <Mail className="size-3" aria-hidden="true" />
                    {email}
                  </Badge>
                ))}
                {entry.approverEmails.length > 3 ? (
                  <span className="text-sm text-muted-foreground">
                    +{entry.approverEmails.length - 3} คน
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 md:flex-col md:items-stretch">
              <span className="mr-auto inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground text-tabular md:mr-0 md:justify-center">
                {formatDuration(entry.startTime, entry.endTime)}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onEdit(entry)}
                data-ocid={`log.entry.edit_button.${index + 1}`}
                className="min-h-10 flex-1 rounded-lg border-border md:flex-none"
              >
                <Pencil className="size-4" aria-hidden="true" />
                แก้ไข
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRequestDelete(entry)}
                data-ocid={`log.entry.delete_button.${index + 1}`}
                className="min-h-10 flex-1 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive md:flex-none"
              >
                <Trash2 className="size-4" aria-hidden="true" />
                ลบ
              </Button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
