import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PersonSheet, type PersonSheetState } from "@/components/birthdays/PersonSheet";
import type { PersonFormPayload, PersonPhotoChange } from "@/components/birthdays/PersonForm";
import { bumpDataVersion } from "@/lib/dataVersion";
import { TIMELINE_MIN_DATE, TIMELINE_MAX_DATE, isValidISODate } from "@/lib/constants";
import {
  createPerson,
  updatePerson,
  deletePerson,
  getPerson,
  setPersonPhoto,
} from "@/db/queries/people";
import { writeMediaFile, deleteMediaFile } from "@/lib/media";
import type { Person } from "@/db/queries/people";

type PeopleCtx = {
  openCreatePerson: () => void;
  openViewPerson: (person: Person) => void;
};

const Context = createContext<PeopleCtx | null>(null);

export function usePeople() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("usePeople must be used within PeopleProvider");
  return ctx;
}

function validate(p: PersonFormPayload): string | null {
  if (!p.name.trim()) return "Имя не может быть пустым";
  if (!isValidISODate(p.birthDate) || p.birthDate < TIMELINE_MIN_DATE || p.birthDate > TIMELINE_MAX_DATE)
    return "Некорректная дата рождения";
  return null;
}

async function applyPhoto(id: number, change: PersonPhotoChange, prevPhoto: string | null) {
  if (change.kind === "set") {
    const rel = await writeMediaFile(change.file);
    await setPersonPhoto(id, rel);
    if (prevPhoto) await deleteMediaFile(prevPhoto);
  } else if (change.kind === "remove") {
    await setPersonPhoto(id, null);
    if (prevPhoto) await deleteMediaFile(prevPhoto);
  }
}

export function PeopleProvider({ children }: { children: ReactNode }) {
  const { show } = useToast();
  const [sheet, setSheet] = useState<PersonSheetState | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const openCreatePerson = useCallback(() => setSheet({ mode: "create" }), []);
  const openViewPerson = useCallback((person: Person) => setSheet({ mode: "view", person }), []);

  const startEdit = () => {
    if (sheet?.mode === "view") setSheet({ mode: "edit", person: sheet.person });
  };

  const doCreate = async (p: PersonFormPayload) => {
    const err = validate(p);
    if (err) return show(err, "error");
    setSheet(null);
    const id = await createPerson({ name: p.name.trim(), birthDate: p.birthDate, hasYear: p.hasYear ? 1 : 0 });
    await applyPhoto(id, p.photo, null);
    bumpDataVersion();
    show("Человек добавлен", "success");
  };

  const doUpdate = async (id: number, p: PersonFormPayload) => {
    const err = validate(p);
    if (err) return show(err, "error");
    setSheet(null);
    const prev = await getPerson(id);
    await updatePerson(id, { name: p.name.trim(), birthDate: p.birthDate, hasYear: p.hasYear ? 1 : 0 });
    await applyPhoto(id, p.photo, prev?.photo ?? null);
    bumpDataVersion();
    show("Изменения сохранены", "success");
  };

  const doDelete = async (id: number) => {
    setSheet(null);
    const person = await getPerson(id);
    if (person?.photo) await deleteMediaFile(person.photo);
    await deletePerson(id);
    bumpDataVersion();
    show("Человек удалён", "success");
  };

  return (
    <Context.Provider value={{ openCreatePerson, openViewPerson }}>
      {children}

      <PersonSheet
        state={sheet}
        onStartEdit={startEdit}
        onCreate={doCreate}
        onUpdate={doUpdate}
        onDelete={(id) => setConfirmId(id)}
        onClose={() => setSheet(null)}
      />

      <ConfirmDialog
        open={confirmId !== null}
        message="Удалить этого человека? Действие необратимо."
        onConfirm={() => confirmId !== null && doDelete(confirmId)}
        onClose={() => setConfirmId(null)}
      />
    </Context.Provider>
  );
}
