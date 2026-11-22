import type { CoachingEntry, EntryStatus } from "@/backend";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  type CoachingEntryInput,
  useCreateEntry,
  useUpdateMyEntry,
} from "@/hooks/useQueries";
import {
  coachingErrorMessage,
  formatEmailList,
  fromDateInputValue,
  fromDateTimeInputs,
  parseEmailList,
  statusDescriptions,
  statusOptions,
  toDateInputValue,
  toTimeInputValue,
  todayDateInputValue,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Loader2, Save } from "lucide-react";
import { type FormEvent, useState } from "react";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormValues {
  status: EntryStatus | "";
  sessionDate: string;
  startTime: string;
  endTime: string;
  reason: string;
  approvers: string;
}

type FieldErrors = Partial<
  Record<
    "status" | "sessionDate" | "startTime" | "endTime" | "reason" | "approvers",
    string
  >
>;

function emptyValues(): FormValues {
  return {
    status: "",
    sessionDate: todayDateInputValue(),
    startTime: "",
    endTime: "",
    reason: "",
    approvers: "",
  };
}

function valuesFromEntry(entry: CoachingEntry): FormValues {
  return {
    status: entry.status,
    sessionDate: toDateInputValue(entry.sessionDate),
    startTime: toTimeInputValue(entry.startTime),
    endTime: toTimeInputValue(entry.endTime),
    reason: entry.reason,
    approvers: formatEmailList(entry.approverEmails),
  };
}

const fieldClass =
  "min-h-11 rounded-lg border-input bg-background text-sm md:text-sm";

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p
      id={id}
      data-ocid={`log.${id}`}
      className="flex items-start gap-1.5 text-sm font-medium text-destructive"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

interface EntryFormProps {
  editingEntry: CoachingEntry | null;
  onSaved: (message: string) => void;
  onCancelEdit: () => void;
}

export function EntryForm({
  editingEntry,
  onSaved,
  onCancelEdit,
}: EntryFormProps) {
  const createEntry = useCreateEntry();
  const updateEntry = useUpdateMyEntry();
  const [values, setValues] = useState<FormValues>(() =>
    editingEntry ? valuesFromEntry(editingEntry) : emptyValues(),
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const isEditing = editingEntry !== null;
  const isPending = createEntry.isPending || updateEntry.isPending;

  function setField<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function validate(): FieldErrors {
    const next: FieldErrors = {};

    if (!values.status) {
      next.status = "กรุณาเลือกสถานะ";
    }
    if (!values.sessionDate) {
      next.sessionDate = "กรุณาเลือกวันที่";
    }
    if (!values.startTime) {
      next.startTime = "กรุณากรอกเวลาเริ่ม";
    }
    if (!values.endTime) {
      next.endTime = "กรุณากรอกเวลาสิ้นสุด";
    }
    if (
      values.startTime &&
      values.endTime &&
      values.endTime < values.startTime
    ) {
      next.endTime = "เวลาสิ้นสุดต้องไม่ก่อนเวลาเริ่ม";
    }
    if (values.reason.trim() === "") {
      next.reason = "กรุณากรอกเหตุผลที่ใช้สถานะนี้";
    }

    const approverEmails = parseEmailList(values.approvers);
    if (approverEmails.length === 0) {
      next.approvers = "กรุณากรอกอีเมลผู้อนุมัติอย่างน้อยหนึ่งรายการ";
    } else {
      const invalid = approverEmails.filter(
        (email) => !EMAIL_PATTERN.test(email),
      );
      if (invalid.length > 0) {
        next.approvers = `รูปแบบอีเมลไม่ถูกต้อง: ${invalid.join(", ")}`;
      }
    }

    return next;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});

    const sessionDate = fromDateInputValue(values.sessionDate);
    const startTime = fromDateTimeInputs(values.sessionDate, values.startTime);
    const endTime = fromDateTimeInputs(values.sessionDate, values.endTime);
    if (!sessionDate || !startTime || !endTime || !values.status) {
      setFormError("ข้อมูลไม่ครบถ้วน กรุณาตรวจสอบอีกครั้ง");
      return;
    }

    const input: CoachingEntryInput = {
      status: values.status,
      sessionDate,
      startTime,
      endTime,
      reason: values.reason.trim(),
      approverEmails: parseEmailList(values.approvers),
    };

    if (isEditing) {
      updateEntry.mutate(
        { ...input, id: editingEntry.id },
        {
          onSuccess: (result) => {
            if (result.__kind__ === "err") {
              setFormError(coachingErrorMessage(result.err));
              return;
            }
            onSaved("บันทึกการแก้ไขเรียบร้อยแล้ว");
          },
          onError: () => setFormError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"),
        },
      );
      return;
    }

    createEntry.mutate(input, {
      onSuccess: (result) => {
        if (result.__kind__ === "err") {
          setFormError(coachingErrorMessage(result.err));
          return;
        }
        setValues(emptyValues());
        onSaved("บันทึกการโค้ชชิ่งเรียบร้อยแล้ว");
      },
      onError: () => setFormError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      data-ocid="log.form"
      className="flex flex-col gap-5"
    >
      <fieldset
        className="flex flex-col gap-2"
        aria-describedby={errors.status ? "status-error" : undefined}
      >
        <legend className="mb-2 text-sm font-semibold text-foreground">
          สถานะ
        </legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {statusOptions.map((option) => {
            const active = values.status === option.value;
            return (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer flex-col gap-0.5 rounded-xl border px-3 py-2.5 transition-smooth focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-card",
                  active
                    ? "border-primary/60 bg-accent text-accent-foreground"
                    : "border-border bg-muted/30 text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={active}
                    onChange={() => setField("status", option.value)}
                    data-ocid={`log.status_radio.${option.value}`}
                    className="size-4 accent-primary"
                  />
                  <span className="text-sm font-semibold">{option.label}</span>
                </span>
                <span className="pl-6 text-sm leading-snug">
                  {statusDescriptions[option.value]}
                </span>
              </label>
            );
          })}
        </div>
        <FieldError id="status-error" message={errors.status} />
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="sessionDate">วันที่</Label>
          <Input
            id="sessionDate"
            type="date"
            required
            value={values.sessionDate}
            onChange={(event) => setField("sessionDate", event.target.value)}
            aria-invalid={errors.sessionDate ? true : undefined}
            aria-describedby={
              errors.sessionDate ? "sessionDate-error" : undefined
            }
            data-ocid="log.session_date_input"
            className={cn(fieldClass, "text-tabular")}
          />
          <FieldError id="sessionDate-error" message={errors.sessionDate} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="startTime">เวลาเริ่ม</Label>
          <Input
            id="startTime"
            type="time"
            required
            value={values.startTime}
            onChange={(event) => setField("startTime", event.target.value)}
            aria-invalid={errors.startTime ? true : undefined}
            aria-describedby={errors.startTime ? "startTime-error" : undefined}
            data-ocid="log.start_time_input"
            className={cn(fieldClass, "text-tabular")}
          />
          <FieldError id="startTime-error" message={errors.startTime} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="endTime">เวลาสิ้นสุด</Label>
          <Input
            id="endTime"
            type="time"
            required
            value={values.endTime}
            onChange={(event) => setField("endTime", event.target.value)}
            aria-invalid={errors.endTime ? true : undefined}
            aria-describedby={errors.endTime ? "endTime-error" : undefined}
            data-ocid="log.end_time_input"
            className={cn(fieldClass, "text-tabular")}
          />
          <FieldError id="endTime-error" message={errors.endTime} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="reason">เหตุผลที่ใช้สถานะนี้</Label>
        <Textarea
          id="reason"
          required
          rows={3}
          value={values.reason}
          onChange={(event) => setField("reason", event.target.value)}
          placeholder="อธิบายสั้น ๆ ว่าเหตุใดจึงใช้สถานะนี้ เช่น ฝึกสคริปต์ปิดการขายกับทีมใหม่"
          aria-invalid={errors.reason ? true : undefined}
          aria-describedby={errors.reason ? "reason-error" : undefined}
          data-ocid="log.reason_textarea"
          className={fieldClass}
        />
        <FieldError id="reason-error" message={errors.reason} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="approvers">ผู้อนุมัติ (อีเมลงาน)</Label>
        <Textarea
          id="approvers"
          required
          rows={3}
          value={values.approvers}
          onChange={(event) => setField("approvers", event.target.value)}
          placeholder={"หนึ่งอีเมลต่อบรรทัด\nmanager@company.com"}
          aria-invalid={errors.approvers ? true : undefined}
          aria-describedby={errors.approvers ? "approvers-error" : undefined}
          data-ocid="log.approvers_textarea"
          className={cn(fieldClass, "text-sm")}
        />
        {errors.approvers ? (
          <FieldError id="approvers-error" message={errors.approvers} />
        ) : (
          <p className="text-sm text-muted-foreground">
            ใส่หนึ่งอีเมลต่อบรรทัด ระบบจะตัดช่องว่างและข้ามบรรทัดว่างให้
          </p>
        )}
      </div>

      {formError ? (
        <p
          role="alert"
          data-ocid="log.form_error"
          className="flex items-start gap-1.5 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {formError}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <Button
          type="submit"
          disabled={isPending}
          data-ocid="log.save_button"
          className="min-h-14 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-elevated transition-smooth hover:bg-primary/90 sm:flex-1"
        >
          {isPending ? (
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
          ) : isEditing ? (
            <CheckCircle2 className="size-5" aria-hidden="true" />
          ) : (
            <Save className="size-5" aria-hidden="true" />
          )}
          {isPending
            ? "กำลังบันทึก..."
            : isEditing
              ? "บันทึกการแก้ไข"
              : "บันทึกการโค้ชชิ่ง"}
        </Button>
        {isEditing ? (
          <Button
            type="button"
            variant="outline"
            onClick={onCancelEdit}
            disabled={isPending}
            data-ocid="log.cancel_edit_button"
            className="min-h-12 rounded-xl border-border text-sm"
          >
            ยกเลิกการแก้ไข
          </Button>
        ) : null}
      </div>
    </form>
  );
}
