"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

interface Note {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  updated_at: string;
}

type NoteForm = {
  title: string;
  content: string;
};

function formatUpdatedAt(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function NoteFormPanel({ onSave, saving }: { onSave: (data: NoteForm) => void; saving: boolean }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-800">Notes</h1>
        <p className="text-sm text-gray-500">Create, edit, and review your notes</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cixio-blue"
            placeholder="Note title"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cixio-blue resize-none"
            rows={6}
            placeholder="Write your note here..."
          />
        </div>

        <button
          onClick={() => onSave({ title: title.trim(), content: content.trim() })}
          disabled={saving || !title.trim() || !content.trim()}
          className="inline-flex items-center justify-center rounded-lg bg-cixio-blue px-4 py-2 text-sm font-medium text-white hover:bg-cixio-hover disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving…" : "Save note"}
        </button>
      </div>
    </div>
  );
}

export default function NotesPage() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: notes = [], isLoading, isError } = useQuery<Note[]>({
    queryKey: ["notes"],
    queryFn: async () => {
      const res = await api.get<Note[]>("/notes");
      return res.data;
    },
  });

  const sortedNotes = useMemo(
    () => [...notes].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    [notes]
  );

  const createNote = useMutation({
    mutationFn: async (note: NoteForm) => {
      const res = await api.post<Note>("/notes", note);
      return res.data;
    },
    onMutate: () => {
      setSaving(true);
      setErrorMessage(null);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
    onError: (err) => {
      setErrorMessage("Unable to save note. Please try again.");
    },
    onSettled: () => {
      setSaving(false);
    },
  });

  function handleSave(data: NoteForm) {
    if (!data.title || !data.content) return;
    createNote.mutate(data);
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <NoteFormPanel onSave={handleSave} saving={saving} />

        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">All notes</h2>
                <p className="text-sm text-gray-500">Your notes are saved to the server and shown here.</p>
              </div>
              <span className="text-xs text-gray-400">{notes.length} notes</span>
            </div>

            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                {[...Array(4)].map((_, idx) => (
                  <div key={idx} className="h-24 rounded-2xl bg-gray-100" />
                ))}
              </div>
            ) : isError ? (
              <div className="text-sm text-red-500">Unable to load notes.</div>
            ) : sortedNotes.length === 0 ? (
              <div className="text-center py-20 text-sm text-gray-500">
                No notes yet. Create one using the form.
              </div>
            ) : (
              <div className="space-y-4">
                {sortedNotes.map((note) => (
                  <article key={note.id} className="border border-gray-100 rounded-2xl p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">{note.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">Updated {formatUpdatedAt(note.updated_at)}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-3 line-clamp-3">{note.excerpt || note.content.slice(0, 160)}</p>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Note tips</h2>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>Use clear titles so notes are easy to scan.</li>
              <li>Add short summaries in the note body.</li>
              <li>Search notes from the dashboard once saved.</li>
            </ul>
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-red-700">
            {errorMessage}
          </div>
        )}
      </div>
    </main>
  );
}
