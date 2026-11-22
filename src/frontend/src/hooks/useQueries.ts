import { createActor } from "@/backend";
import type {
  CoachingEntry,
  EntryStatus,
  RecordId,
  Timestamp,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const entriesQueryKey = ["coachingEntries"] as const;
export const summaryQueryKey = ["coachingSummary"] as const;
export const totalsQueryKey = ["coachingTotals"] as const;

export function useMyEntries() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: entriesQueryKey,
    queryFn: async (): Promise<CoachingEntry[]> => {
      if (!actor) return [];
      return actor.listMyEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMySummary() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: summaryQueryKey,
    queryFn: async () => {
      if (!actor) return [];
      return actor.mySummary();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyTotals() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: totalsQueryKey,
    queryFn: async () => {
      if (!actor) return null;
      return actor.myTotals();
    },
    enabled: !!actor && !isFetching,
  });
}

function useInvalidateCoaching() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: entriesQueryKey });
    void queryClient.invalidateQueries({ queryKey: summaryQueryKey });
    void queryClient.invalidateQueries({ queryKey: totalsQueryKey });
  };
}

/** Payload for a Training / Coaching / outbound-chat log entry. */
export interface CoachingEntryInput {
  status: EntryStatus;
  sessionDate: Timestamp;
  startTime: Timestamp;
  endTime: Timestamp;
  reason: string;
  approverEmails: string[];
}

export function useCreateEntry() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateCoaching();
  return useMutation({
    mutationFn: async (input: CoachingEntryInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createEntry(
        input.status,
        input.sessionDate,
        input.startTime,
        input.endTime,
        input.reason,
        input.approverEmails,
      );
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export interface UpdateEntryInput extends CoachingEntryInput {
  id: RecordId;
}

export function useUpdateMyEntry() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateCoaching();
  return useMutation({
    mutationFn: async (input: UpdateEntryInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateMyEntry(
        input.id,
        input.status,
        input.sessionDate,
        input.startTime,
        input.endTime,
        input.reason,
        input.approverEmails,
      );
    },
    onSuccess: () => {
      invalidate();
    },
  });
}

export function useDeleteMyEntry() {
  const { actor } = useActor(createActor);
  const invalidate = useInvalidateCoaching();
  return useMutation({
    mutationFn: async (id: RecordId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteMyEntry(id);
    },
    onSuccess: () => {
      invalidate();
    },
  });
}
