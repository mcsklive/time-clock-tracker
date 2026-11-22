import type {
  CoachingError,
  EntryStatus,
  PermissionLevel,
  Timestamp,
} from "@/backend";
import {
  EntryStatus as EntryStatusEnum,
  PermissionLevel as PermissionLevelEnum,
} from "@/backend";

const NANOS_PER_MS = 1_000_000n;
const NANOS_PER_DAY = 86_400_000n * NANOS_PER_MS;

/** Motoko `Time.now()` is a nanosecond bigint; convert before any Date math. */
export function timestampToDate(timestamp: Timestamp): Date | null {
  const date = new Date(Number(timestamp / NANOS_PER_MS));
  return Number.isNaN(date.getTime()) ? null : date;
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

/** Short Thai date such as "24 ต.ค. 2566". */
export function formatThaiDate(timestamp: Timestamp): string {
  const date = timestampToDate(timestamp);
  if (!date) return "ไม่ทราบวันที่";
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** Weekday label such as "วันอังคาร". */
export function formatThaiWeekday(timestamp: Timestamp): string {
  const date = timestampToDate(timestamp);
  if (!date) return "";
  return new Intl.DateTimeFormat("th-TH", { weekday: "long" }).format(date);
}

/** 24-hour clock label such as "09:30". */
export function formatTimeOfDay(timestamp: Timestamp): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Session window such as "09:30 – 11:00". */
export function formatTimeRange(start: Timestamp, end: Timestamp): string {
  return `${formatTimeOfDay(start)} – ${formatTimeOfDay(end)}`;
}

/** Duration in minutes between two timestamps, floored at zero. */
export function durationMinutes(start: Timestamp, end: Timestamp): number {
  if (end <= start) return 0;
  return Number((end - start) / (60n * NANOS_PER_MS));
}

/** Duration label such as "1 ชม. 30 น." */
export function formatDuration(start: Timestamp, end: Timestamp): string {
  const minutes = durationMinutes(start, end);
  if (minutes <= 0) return "—";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest} น.`;
  if (rest === 0) return `${hours} ชม.`;
  return `${hours} ชม. ${rest} น.`;
}

/** Value for an `<input type="date">` in local time. */
export function toDateInputValue(timestamp: Timestamp): string {
  const date = timestampToDate(timestamp);
  if (!date) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Parse a `date` input value into a nanosecond timestamp at local midnight. */
export function fromDateInputValue(value: string): Timestamp | null {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return BigInt(date.getTime()) * NANOS_PER_MS;
}

/** Today as a `date` input value. */
export function todayDateInputValue(): string {
  return toDateInputValue(BigInt(Date.now()) * NANOS_PER_MS);
}

/** Value for an `<input type="time">` in local time. */
export function toTimeInputValue(timestamp: Timestamp): string {
  const date = timestampToDate(timestamp);
  if (!date) return "";
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Combine a `date` and a `time` input value into one local timestamp. */
export function fromDateTimeInputs(
  dateValue: string,
  timeValue: string,
): Timestamp | null {
  if (!dateValue || !timeValue) return null;
  const date = new Date(`${dateValue}T${timeValue}:00`);
  if (Number.isNaN(date.getTime())) return null;
  return BigInt(date.getTime()) * NANOS_PER_MS;
}

/** Whole days between two timestamps (b - a), floored to calendar days. */
export function daysBetween(a: Timestamp, b: Timestamp): number {
  return Number((b - a) / NANOS_PER_DAY);
}

/** Split a textarea of one-email-per-line into a clean, de-duplicated list. */
export function parseEmailList(raw: string): string[] {
  const seen = new Set<string>();
  const emails: string[] = [];
  for (const line of raw.split(/[\n,;]+/)) {
    const email = line.trim().toLowerCase();
    if (email === "" || seen.has(email)) continue;
    seen.add(email);
    emails.push(email);
  }
  return emails;
}

/** Render an email list back into the one-per-line textarea format. */
export function formatEmailList(emails: string[]): string {
  return emails.join("\n");
}

/** Thai label for each of the three log statuses. */
export const statusLabels: Record<EntryStatus, string> = {
  [EntryStatusEnum.training]: "Training",
  [EntryStatusEnum.coaching]: "Coaching",
  [EntryStatusEnum.outboundChat]: "แชทขาออก",
};

/** Thai description of what each status covers. */
export const statusDescriptions: Record<EntryStatus, string> = {
  [EntryStatusEnum.training]: "การอบรมหรือสอนงานเป็นกลุ่ม",
  [EntryStatusEnum.coaching]: "การโค้ชชิ่งรายบุคคล",
  [EntryStatusEnum.outboundChat]: "การติดตามแชทขาออกของทีม",
};

/** Ordered status options for pickers and filters. */
export const statusOptions: { value: EntryStatus; label: string }[] = [
  { value: EntryStatusEnum.training, label: statusLabels.training },
  { value: EntryStatusEnum.coaching, label: statusLabels.coaching },
  { value: EntryStatusEnum.outboundChat, label: statusLabels.outboundChat },
];

/** Thai label for a status value, tolerant of unknown strings. */
export function statusLabel(status: EntryStatus): string {
  return statusLabels[status] ?? "ไม่ระบุสถานะ";
}

/** Tailwind classes for a status chip, keeping the existing palette. */
export function statusChipClass(status: EntryStatus): string {
  switch (status) {
    case EntryStatusEnum.training:
      return "border-primary/40 bg-primary/15 text-primary";
    case EntryStatusEnum.coaching:
      return "border-success/30 bg-success/15 text-success";
    case EntryStatusEnum.outboundChat:
      return "border-warning/40 bg-warning/15 text-warning";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

/** Thai label for each permission level granted to an approved person. */
export const permissionLabels: Record<PermissionLevel, string> = {
  [PermissionLevelEnum.allControl]: "จัดการได้ทั้งหมด",
  [PermissionLevelEnum.viewOnly]: "ดูข้อมูลได้เท่านั้น",
  [PermissionLevelEnum.logStatus]: "บันทึกสถานะได้",
};

/** Thai label for a permission level, tolerant of unknown values. */
export function permissionLabel(permission: PermissionLevel): string {
  return permissionLabels[permission] ?? "ไม่ระบุสิทธิ์";
}

/** Thai copy for the access states shown before any record is loaded. */
export const accessCopy = {
  checking: "กำลังตรวจสอบสิทธิ์การใช้งาน…",
  deniedTitle: "อีเมลของคุณไม่อยู่ในรายชื่อผู้มีสิทธิ์",
  deniedBody:
    "บัญชีที่ใช้เข้าสู่ระบบนี้ยังไม่ได้รับอนุญาตให้ใช้งาน COACHLOG กรุณาติดต่อผู้ดูแลระบบเพื่อขอเพิ่มอีเมลของคุณในรายชื่อผู้มีสิทธิ์",
  noEmailTitle: "ไม่พบอีเมลที่ยืนยันแล้ว",
  noEmailBody:
    "กรุณาเข้าสู่ระบบด้วยบัญชีอีเมลองค์กร (Google หรือ Microsoft) เพื่อให้ระบบตรวจสอบรายชื่อผู้มีสิทธิ์ได้",
  errorTitle: "ตรวจสอบสิทธิ์ไม่สำเร็จ",
  errorBody: "เกิดข้อผิดพลาดระหว่างตรวจสอบสิทธิ์ กรุณาลองใหม่อีกครั้ง",
  retry: "ลองอีกครั้ง",
  signOut: "ออกจากระบบ",
} as const;

/** Thai message for a backend coaching error variant. */
export function coachingErrorMessage(error: CoachingError): string {
  switch (error.__kind__) {
    case "invalidInput":
      return error.invalidInput || "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง";
    case "notFound":
      return "ไม่พบบันทึกนี้ อาจถูกลบไปแล้ว";
    case "notOwner":
      return "คุณไม่มีสิทธิ์แก้ไขบันทึกนี้";
    default:
      return "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
  }
}
