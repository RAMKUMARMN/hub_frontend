import { Priority } from "@/components/todos/types";

// One source of truth for priority colors — used on the calendar AND
// wherever priority badges show up in the Todos page, so they always match.
export const PRIORITY_COLORS: Record<Priority, string> = {
  high:   "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  low:    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
};