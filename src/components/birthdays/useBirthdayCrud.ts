"use client";

import { useOptimistic, useTransition } from "react";
import {
  createPersonAction,
  updatePersonAction,
  deletePersonAction,
  setPersonPhotoAction,
  removePersonPhotoAction,
} from "@/actions/people";
import { useToast } from "@/components/ui/Toast";
import type { Person } from "@/db/queries/people";

export type PersonPhotoChange =
  | { kind: "keep" }
  | { kind: "set"; file: File }
  | { kind: "remove" };

export type PersonFormPayload = {
  name: string;
  birthDate: string;
  hasYear: boolean;
  photo: PersonPhotoChange;
};

type OptimisticAction =
  | { type: "add"; person: Person }
  | { type: "update"; person: Person }
  | { type: "delete"; id: number };

export function useBirthdayCrud(people: Person[]) {
  const { show } = useToast();
  const [, startTransition] = useTransition();

  const [optimisticPeople, applyOptimistic] = useOptimistic(
    people,
    (state: Person[], action: OptimisticAction) => {
      switch (action.type) {
        case "add":
          return [...state, action.person];
        case "update":
          return state.map((p) => (p.id === action.person.id ? action.person : p));
        case "delete":
          return state.filter((p) => p.id !== action.id);
      }
    },
  );

  const buildPerson = (id: number, payload: PersonFormPayload, photo: string | null): Person => ({
    id,
    name: payload.name,
    birth_date: payload.birthDate,
    has_year: payload.hasYear ? 1 : 0,
    photo,
    sort_order: 0,
  });

  const actionInput = (payload: PersonFormPayload) => ({
    name: payload.name,
    birthDate: payload.birthDate,
    hasYear: payload.hasYear,
  });

  const applyPhoto = async (id: number, change: PersonPhotoChange) => {
    if (change.kind === "set") {
      const fd = new FormData();
      fd.append("file", change.file);
      const res = await setPersonPhotoAction(id, fd);
      if (!res.ok) show(res.error, "error");
    } else if (change.kind === "remove") {
      await removePersonPhotoAction(id);
    }
  };

  const create = (payload: PersonFormPayload) => {
    const temp = buildPerson(-Date.now(), payload, null);
    startTransition(async () => {
      applyOptimistic({ type: "add", person: temp });
      const res = await createPersonAction(actionInput(payload));
      if (res.ok && res.id != null) await applyPhoto(res.id, payload.photo);
      show(res.ok ? "Человек добавлен" : res.error, res.ok ? "success" : "error");
    });
  };

  const update = (id: number, payload: PersonFormPayload) => {
    const prevPhoto = optimisticPeople.find((p) => p.id === id)?.photo ?? null;
    const photo = payload.photo.kind === "remove" ? null : prevPhoto;
    const updated = buildPerson(id, payload, photo);
    startTransition(async () => {
      applyOptimistic({ type: "update", person: updated });
      const res = await updatePersonAction(id, actionInput(payload));
      if (res.ok) await applyPhoto(id, payload.photo);
      show(res.ok ? "Изменения сохранены" : res.error, res.ok ? "success" : "error");
    });
  };

  const remove = (id: number) => {
    startTransition(async () => {
      applyOptimistic({ type: "delete", id });
      const res = await deletePersonAction(id);
      show(res.ok ? "Человек удалён" : res.error, res.ok ? "success" : "error");
    });
  };

  return { people: optimisticPeople, create, update, remove };
}
