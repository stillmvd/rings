"use client";

import { useOptimistic, useTransition } from "react";
import { createMarkAction, deleteMarkAction } from "@/actions/marks";
import { useToast } from "@/components/ui/Toast";
import type { Mark } from "@/db/queries/marks";
import type { MarkType } from "@/db/queries/markTypes";

type OptimisticAction = { type: "add"; mark: Mark } | { type: "delete"; id: number };

export function useMarkCrud(marks: Mark[], markTypes: MarkType[]) {
  const { show } = useToast();
  const [, startTransition] = useTransition();

  const [optimisticMarks, applyOptimistic] = useOptimistic(
    marks,
    (state: Mark[], action: OptimisticAction) => {
      switch (action.type) {
        case "add":
          return [...state, action.mark];
        case "delete":
          return state.filter((m) => m.id !== action.id);
      }
    },
  );

  const create = (input: { date: string; markTypeId: number }) => {
    const type = markTypes.find((t) => t.id === input.markTypeId);
    const temp: Mark = {
      id: -Date.now(),
      date: input.date,
      type_id: input.markTypeId,
      type_name: type?.name ?? "",
      type_icon: type?.icon ?? "",
      type_color: type?.color ?? "#64748b",
    };
    startTransition(async () => {
      applyOptimistic({ type: "add", mark: temp });
      const res = await createMarkAction(input);
      show(res.ok ? "Отметка создана" : res.error, res.ok ? "success" : "error");
    });
  };

  const remove = (id: number) => {
    startTransition(async () => {
      applyOptimistic({ type: "delete", id });
      const res = await deleteMarkAction(id);
      show(res.ok ? "Отметка удалена" : res.error, res.ok ? "success" : "error");
    });
  };

  return { marks: optimisticMarks, create, remove };
}
