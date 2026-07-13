type DueDateItem = {
  dueDate?: string | null;
  due_date?: string | null;
};

function getDueDate(item: DueDateItem): string | null {
  return item.dueDate ?? item.due_date ?? null;
}

// Groups todos by their due date (YYYY-MM-DD), ignoring time-of-day,
// so the calendar can look up "what's due on June 14th?" in O(1).
export function groupTodosByDate<T extends DueDateItem>(todos: T[]): Record<string, T[]> {
  const grouped: Record<string, T[]> = {};

  for (const todo of todos) {
    const dueDate = getDueDate(todo);
    if (!dueDate) continue; // skip todos with no due date — nothing to show

    const dateKey = dueDate.includes("T") ? dueDate.split("T")[0] : dueDate;

    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(todo);
  }

  return grouped;
}

export function formatDateKey(year: number, month: number, day: number): string {
  // month is 0-indexed (JS Date convention) — convert to 1-indexed for the string
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}