"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

interface Note {
  id: string;
  title: string;
  excerpt: string;
  updated_at: string;
}

function formatUpdatedAt(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function NotesWidget() {
  const { data: notes = [], isLoading, isError } = useQuery<Note[]>({
    queryKey: ["dashboard-notes"],
    queryFn: async () => {
      const res = await api.get<Note[]>("/notes", { params: { limit: 4 } });
      return res.data;
    },
    staleTime: 1000 * 60 * 2,
  });

  const recentNotes = useMemo(() => notes.slice(0, 4), [notes]);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm min-h-[280px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700">Recent Notes</h2>
        <a href="/notes" className="text-xs text-cixio-blue hover:underline">
          New note +
        </a>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-16 rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-sm text-red-500">Unable to load your notes.</div>
      ) : recentNotes.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-500">
          No notes yet.
          <div className="text-xs text-gray-400 mt-2">Write a note to see it here.</div>
        </div>
      ) : (
        <ul className="space-y-3">
          {recentNotes.map((note) => (
            <li
              key={note.id}
              className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between mb-2 gap-3">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {note.title}
                </p>
                <span className="text-xs text-gray-400 shrink-0">
                  {formatUpdatedAt(note.updated_at)}
                </span>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2">{note.excerpt}</p>
            </li>
          ))}
        </ul>
      )}

      <a
        href="/notes"
        className="block mt-4 text-xs text-cixio-blue hover:underline text-center"
      >
        View all notes →
      </a>
    </div>
  );
}
