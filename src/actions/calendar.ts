"use server";

import { getNonWorkingISO } from "@/lib/workcalendar";

export async function getNonWorkingDaysAction(year: number): Promise<string[] | null> {
  return getNonWorkingISO(year);
}
