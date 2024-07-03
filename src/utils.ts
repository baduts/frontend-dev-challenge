import { type ClassValue, clsx } from "clsx";
import { addDays } from "date-fns";
import { type DateRange } from "react-day-picker";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
/**
 * Relative path /api/${path}
 * @param path
 * @returns
 */
export async function fetchData(path: string) {
  const response = await fetch(`/api/${path}`);

  if (!response.ok) {
    throw new Error("Network response was not ok");
  }

  return response.json();
}

export const defaultDateRange: DateRange = {
  from: new Date(Date.now()),
  to: addDays(Date.now(), 20),
};
