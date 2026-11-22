import type { CoachingEntry, EntryStatus } from "@/backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { statusOptions } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CalendarRange, RotateCcw, Users } from "lucide-react";

export type RangePreset = "all" | "7d" | "30d" | "custom";

export interface EntryFilterValue {
  range: RangePreset;
  from: string;
  to: string;
  email: string;
  status: EntryStatus | "all";
}

export const defaultFilterValue: EntryFilterValue = {
  range: "all",
  from: "",
  to: "",
  email: "",
  status: "all",
};

const rangeOptions: { value: RangePreset; label: string }[] = [
  { value: "all", label: "ทั้งหมด" },
  { value: "7d", label: "7 วันล่าสุด" },
  { value: "30d", label: "30 วันล่าสุด" },
  { value: "custom", label: "กำหนดเอง" },
];

interface EntryFiltersProps {
  value: EntryFilterValue;
  onChange: (next: EntryFilterValue) => void;
  emailOptions: string[];
  resultCount: number;
}

export function EntryFilters({
  value,
  onChange,
  emailOptions,
  resultCount,
}: EntryFiltersProps) {
  const isFiltered =
    value.range !== "all" ||
    value.email !== "" ||
    value.from !== "" ||
    value.to !== "" ||
    value.status !== "all";

  return (
    <section
      data-ocid="entries.filters.panel"
      aria-label="ตัวกรองรายการย้อนหลัง"
      className="rounded-2xl border border-border bg-card p-4 shadow-subtle md:p-5"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <CalendarRange className="size-4 text-primary" aria-hidden="true" />
            ช่วงวันที่
          </div>
          <p
            data-ocid="entries.filters.result_count"
            className="text-sm text-muted-foreground"
          >
            พบ{" "}
            <span className="text-tabular font-semibold text-foreground">
              {resultCount}
            </span>{" "}
            รายการ
          </p>
        </div>

        <fieldset className="flex flex-wrap gap-2">
          <legend className="absolute size-px overflow-hidden [clip:rect(0_0_0_0)]">
            เลือกช่วงวันที่
          </legend>
          {rangeOptions.map((option) => {
            const active = value.range === option.value;
            return (
              <button
                key={option.value}
                type="button"
                data-ocid={`entries.filters.range.${option.value}`}
                aria-pressed={active}
                onClick={() => onChange({ ...value, range: option.value })}
                className={cn(
                  "inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
                  active
                    ? "border-primary/50 bg-accent text-accent-foreground"
                    : "border-border bg-muted/40 text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </fieldset>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.2fr_1.2fr_auto] lg:items-end">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="filter-from"
              className="text-sm font-semibold text-muted-foreground"
            >
              ตั้งแต่วันที่
            </label>
            <Input
              id="filter-from"
              type="date"
              data-ocid="entries.filters.from_input"
              value={value.from}
              max={value.to || undefined}
              disabled={value.range !== "custom"}
              onChange={(event) =>
                onChange({
                  ...value,
                  range: "custom",
                  from: event.target.value,
                })
              }
              className="h-11 rounded-lg bg-background text-sm text-tabular"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="filter-to"
              className="text-sm font-semibold text-muted-foreground"
            >
              ถึงวันที่
            </label>
            <Input
              id="filter-to"
              type="date"
              data-ocid="entries.filters.to_input"
              value={value.to}
              min={value.from || undefined}
              disabled={value.range !== "custom"}
              onChange={(event) =>
                onChange({ ...value, range: "custom", to: event.target.value })
              }
              className="h-11 rounded-lg bg-background text-sm text-tabular"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="filter-status"
              className="text-sm font-semibold text-muted-foreground"
            >
              สถานะ
            </label>
            <Select
              value={value.status}
              onValueChange={(next) =>
                onChange({
                  ...value,
                  status: next === "all" ? "all" : (next as EntryStatus),
                })
              }
            >
              <SelectTrigger
                id="filter-status"
                data-ocid="entries.filters.status_select"
                className="h-11 w-full rounded-lg bg-background text-sm"
              >
                <SelectValue placeholder="ทุกสถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกสถานะ</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="filter-email"
              className="text-sm font-semibold text-muted-foreground"
            >
              ผู้อนุมัติ
            </label>
            <Select
              value={value.email === "" ? "all" : value.email}
              onValueChange={(next) =>
                onChange({ ...value, email: next === "all" ? "" : next })
              }
            >
              <SelectTrigger
                id="filter-email"
                data-ocid="entries.filters.email_select"
                className="h-11 w-full rounded-lg bg-background text-sm"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Users
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <SelectValue placeholder="ทุกคน" />
                </span>
              </SelectTrigger>
              <SelectContent className="max-h-72">
                <SelectItem value="all">ทุกคน</SelectItem>
                {emailOptions.map((email) => (
                  <SelectItem key={email} value={email}>
                    <span className="text-sm">{email}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            variant="outline"
            data-ocid="entries.filters.reset_button"
            disabled={!isFiltered}
            onClick={() => onChange(defaultFilterValue)}
            className="h-11 rounded-lg border-border px-4 text-sm"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            ล้างตัวกรอง
          </Button>
        </div>
      </div>
    </section>
  );
}

/** True when an entry matches the active filter value. */
export function matchesStatus(
  entry: CoachingEntry,
  status: EntryStatus | "all",
): boolean {
  return status === "all" || entry.status === status;
}
