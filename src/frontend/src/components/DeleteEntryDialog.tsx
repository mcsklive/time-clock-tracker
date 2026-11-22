import type { CoachingEntry } from "@/backend";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteMyEntry } from "@/hooks/useQueries";
import { coachingErrorMessage } from "@/lib/format";
import { Loader2, Trash2 } from "lucide-react";

interface DeleteEntryDialogProps {
  entry: CoachingEntry | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: (message: string) => void;
  onError: (message: string) => void;
}

export function DeleteEntryDialog({
  entry,
  onOpenChange,
  onDeleted,
  onError,
}: DeleteEntryDialogProps) {
  const deleteEntry = useDeleteMyEntry();

  function confirmDelete() {
    if (!entry) return;
    deleteEntry.mutate(entry.id, {
      onSuccess: (result) => {
        onOpenChange(false);
        if (result.__kind__ === "err") {
          onError(coachingErrorMessage(result.err));
          return;
        }
        onDeleted("ลบบันทึกเรียบร้อยแล้ว");
      },
      onError: () => {
        onOpenChange(false);
        onError("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      },
    });
  }

  return (
    <AlertDialog
      open={entry !== null}
      onOpenChange={(open) => {
        if (!open && !deleteEntry.isPending) onOpenChange(false);
      }}
    >
      <AlertDialogContent
        data-ocid="log.delete_dialog"
        className="rounded-2xl border-border bg-card"
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-xl">
            ยืนยันการลบบันทึก
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            {entry
              ? `ต้องการลบบันทึก “${entry.reason}” ใช่หรือไม่? การลบไม่สามารถย้อนกลับได้`
              : ""}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={deleteEntry.isPending}
            data-ocid="log.delete_cancel_button"
            className="min-h-11 rounded-xl"
          >
            ยกเลิก
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              confirmDelete();
            }}
            disabled={deleteEntry.isPending}
            data-ocid="log.delete_confirm_button"
            className="min-h-11 rounded-xl bg-destructive font-semibold text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteEntry.isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 className="size-4" aria-hidden="true" />
            )}
            ยืนยันลบ
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
