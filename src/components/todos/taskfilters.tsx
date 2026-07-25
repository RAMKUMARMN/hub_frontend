"use client";

import React from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Task } from "./types";

export interface Filters {
  search: string;
  status: "all" | "todo" | "in_progress" | "done";
  priority: "all" | "low" | "medium" | "high";
}

interface TaskFiltersProps {
  filters: Filters;
  onChange: (updatedFilters: Filters) => void;
  taskCount: number;
}

export function applyFilters(tasks: Task[], filters: Filters): Task[] {
  return tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      (task.description || "")
        .toLowerCase()
        .includes(filters.search.toLowerCase());

    const matchesStatus =
      filters.status === "all" || task.status === filters.status;

    const matchesPriority =
      filters.priority === "all" ||
      task.priority === filters.priority;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority
    );
  });
}

export default function TaskFilters({
  filters,
  onChange,
  taskCount,
}: TaskFiltersProps) {
  return (
    <div className="rounded-xl border border-cixio-light bg-white dark:bg-gray-900 dark:border-gray-700 p-4 shadow-sm space-y-3">

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-cixio-muted" />

        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) =>
            onChange({
              ...filters,
              search: e.target.value,
            })
          }
          className="w-full rounded-lg border border-cixio-light bg-cixio-bg/30 py-2 pl-9 pr-4 text-sm outline-none focus:border-cixio-blue focus:ring-1 focus:ring-cixio-blue text-cixio-dark transition-all"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1 text-sm">

        <div className="flex items-center gap-1.5 text-cixio-dark font-medium text-xs uppercase tracking-wider">
          <SlidersHorizontal
            size={14}
            className="text-cixio-blue"
          />
          <span>Filters</span>
        </div>

        <div className="ml-auto text-xs text-gray-500">
          {taskCount} tasks
        </div>

        {/* Status Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
          <select
            value={filters.status}
            onChange={(e) =>
              onChange({
                ...filters,
                status:
                  e.target.value as Filters["status"],
              })
            }
            className="rounded-lg border border-cixio-light bg-transparent px-3 py-1.5 text-xs text-cixio-dark outline-none focus:border-cixio-blue cursor-pointer transition-colors"
          >
            <option value="all">
              All Status
            </option>

            <option value="todo">
              To do
            </option>

            <option value="in_progress">
              In progress
            </option>

            <option value="done">
              Done
            </option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1.5">
          <select
            value={filters.priority}
            onChange={(e) =>
              onChange({
                ...filters,
                priority:
                  e.target.value as Filters["priority"],
              })
            }
            className="rounded-lg border border-cixio-light bg-transparent px-3 py-1.5 text-xs text-cixio-dark outline-none focus:border-cixio-blue cursor-pointer transition-colors"
          >
            <option value="all">
              All Priority
            </option>

            <option value="low">
              Low
            </option>

            <option value="medium">
              Medium
            </option>

            <option value="high">
              High
            </option>
          </select>
        </div>
      </div>
    </div>
  );
}