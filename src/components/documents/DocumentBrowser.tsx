"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api"; // your existing axios instance

// ─── Types ───────────────────────────────────────────────────────────────────

interface Doc {
  id: string;
  name: string;
  size: number;       // bytes
  type: string;       // mime type  e.g. "application/pdf"
  url: string;        // pre-signed or direct download URL
  created_at: string; // ISO string
  updated_at: string;
}

type ViewMode = "grid" | "list";
type SortKey  = "name" | "date" | "size";

interface Props {
  initialDocuments?: Doc[];
  initialError?: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric", month: "short", day: "numeric",
  });
}

function fileIcon(type: string) {
  if (type.startsWith("image/"))        return "🖼️";
  if (type === "application/pdf")       return "📄";
  if (type.includes("spreadsheet") || type.includes("excel") || type.includes("csv")) return "📊";
  if (type.includes("word") || type.includes("document")) return "📝";
  if (type.includes("zip") || type.includes("compressed")) return "🗜️";
  if (type.startsWith("text/"))         return "📃";
  if (type.startsWith("video/"))        return "🎬";
  if (type.startsWith("audio/"))        return "🎵";
  return "📁";
}

// ─── Fetch hooks ─────────────────────────────────────────────────────────────

const MIME_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  txt: "text/plain",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
};

function mapToMimeType(fileType: string): string {
  return MIME_TYPES[fileType.toLowerCase()] || "application/octet-stream";
}

// ─── Fetch hooks ─────────────────────────────────────────────────────────────

function useDocs(initialData?: Doc[]) {
  return useQuery<Doc[]>({
    queryKey: ["documents"],
    queryFn: async () => {
      const res = await api.get<any[]>("/documents");
      return res.data.map((d) => ({
        id: d.id,
        name: d.filename || "Unknown",
        size: d.file_size || 0,
        type: mapToMimeType(d.file_type),
        url: `/documents/${d.id}/download`,
        created_at: d.created_at,
        updated_at: d.created_at,
      }));
    },
    initialData,
  });
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DocumentBrowser({ initialDocuments, initialError }: Props) {
  const qc = useQueryClient();
  const { data: docs = [], isLoading, isError } = useDocs(initialDocuments);

  // If server indicated an error connecting, reflect that in the UI
  const serverError = initialError;

  // ── UI state
  const [view, setView]           = useState<ViewMode>("grid");
  const [search, setSearch]       = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sort, setSort]           = useState<SortKey>("date");
  const [sortAsc, setSortAsc]     = useState(false);
  const [preview, setPreview]     = useState<Doc | null>(null);
  const [renaming, setRenaming]   = useState<string | null>(null); // doc id
  const [renameVal, setRenameVal] = useState("");
  const [deleteId, setDeleteId]   = useState<string | null>(null);

  // ── Upload state
  const [dragging, setDragging]   = useState(false);
  const [uploads, setUploads]     = useState<{ name: string; progress: number }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Type filter options derived from data
  const typeOptions = Array.from(
    new Set(docs.map((d) => d.type.split("/")[0]))
  ).filter(Boolean);

  // ── Filtered + sorted list
  const visible = docs
    .filter((d) => {
      const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
      const matchType   = typeFilter === "all" || d.type.startsWith(typeFilter);
      return matchSearch && matchType;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sort === "name") cmp = a.name.localeCompare(b.name);
      if (sort === "date") cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sort === "size") cmp = a.size - b.size;
      return sortAsc ? cmp : -cmp;
    });

  // ── Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append("file", file);

      const res = await api.post("/documents/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          if (!event.total) return;
          const pct = Math.round((event.loaded / event.total) * 100);
          setUploads((prev) =>
            prev.map((u) => (u.name === file.name ? { ...u, progress: pct } : u))
          );
        },
      });

      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  async function downloadFile(doc: Doc) {
    try {
      const res = await api.get(`/documents/${doc.id}/download`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", doc.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download file:", err);
      alert("Failed to download file");
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const arr = Array.from(files);
    setUploads(arr.map((f) => ({ name: f.name, progress: 0 })));
    for (const file of arr) {
      await uploadMutation.mutateAsync(file);
    }
    // Clear upload trackers after a short delay
    setTimeout(() => setUploads([]), 1500);
  }

  // Drag handlers
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);
  const onDragLeave = useCallback(() => setDragging(false), []);
  const onDrop = useCallback((e: React.DragEvent) => {
  e.preventDefault();
  setDragging(false);
  handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  // ── Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/documents/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents"] });
      if (preview?.id === deleteId) setPreview(null);
      setDeleteId(null);
    },
  });

  // ── Rename mutation
  const renameMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      api.patch(`/documents/${id}`, { name }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents"] });
      setRenaming(null);
    },
  });

  function startRename(doc: Doc) {
    setRenaming(doc.id);
    setRenameVal(doc.name);
  }

  function commitRename() {
    if (renaming && renameVal.trim()) {
      renameMutation.mutate({ id: renaming, name: renameVal.trim() });
    } else {
      setRenaming(null);
    }
  }

  // Close preview on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setPreview(null); setDeleteId(null); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* ── Page header ── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Documents</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {docs.length} file{docs.length !== 1 ? "s" : ""} stored
          </p>
        </div>
        <div className="flex items-center gap-3">
          {serverError && (
            <div className="text-sm text-red-500 mr-4">{serverError}</div>
          )}
          <button
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-2 bg-cixio-blue text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-cixio-hover transition-colors shadow-sm"
          >
            <span className="text-base leading-none">+</span> Upload file
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 flex gap-6">

        {/* ── Main column ── */}
        <div className="flex-1 min-w-0">

          {/* Drag & drop zone */}
          <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`mb-5 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragging
                ? "border-cixio-blue bg-blue-50"
                : "border-gray-200 bg-white hover:border-cixio-blue hover:bg-blue-50/40"
            }`}
          >
            <div className="text-3xl mb-2">📂</div>
            <p className="text-sm font-medium text-gray-700">
              Drag files here, or <span className="text-cixio-blue">click to browse</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">PDF, images, spreadsheets, Word docs — any file type</p>
          </div>

          {/* Upload progress */}
          {uploads.length > 0 && (
            <div className="mb-4 space-y-2">
              {uploads.map((u) => (
                <div key={u.name} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-lg px-4 py-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span className="truncate max-w-[70%]">{u.name}</span>
                    <span>{u.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cixio-blue rounded-full transition-all duration-200"
                      style={{ width: `${u.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Toolbar ── */}
          <div className="flex items-center gap-3 mb-4">
            {/* Search */}
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search files…"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-cixio-blue bg-white"
              />
            </div>

            {/* Type filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-cixio-blue"
            >
              <option value="all">All types</option>
              {typeOptions.map((t) => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-cixio-blue"
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="size">Size</option>
            </select>

            {/* Sort direction */}
            <button
              onClick={() => setSortAsc((v) => !v)}
              title={sortAsc ? "Ascending" : "Descending"}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white hover:bg-gray-50 transition"
            >
              {sortAsc ? "↑" : "↓"}
            </button>

            {/* View toggle */}
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setView("grid")}
                className={`px-3 py-2 text-sm transition ${view === "grid" ? "bg-cixio-blue text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
              >
                ⊞
              </button>
              <button
                onClick={() => setView("list")}
                className={`px-3 py-2 text-sm transition ${view === "list" ? "bg-cixio-blue text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
              >
                ☰
              </button>
            </div>
          </div>

          {/* ── Document list ── */}
          {isLoading && (
            <div className="text-center py-20 text-gray-400 text-sm">Loading documents…</div>
          )}

          {(isError || serverError) && (
            <div className="text-center py-20 text-red-400 text-sm">
              Couldn&apos;t load documents. {serverError ? serverError : 'Check your connection and try again.'}
            </div>
          )}

          {!isLoading && !isError && visible.length === 0 && (
            <div className="text-center py-20">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-gray-500 text-sm font-medium">
{search || typeFilter !== "all" ? "No files match your search." : "No documents uploaded yet."}
              </p>
              {(!search && typeFilter === "all") && (
                <p className="text-gray-400 text-xs mt-1">Upload a file above to get started.</p>
              )}
            </div>
          )}

          {/* Grid view */}
          {!isLoading && view === "grid" && visible.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {visible.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setPreview(doc)}
                  className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl p-4 cursor-pointer hover:border-cixio-blue hover:shadow-sm transition-all group"
                >
                  <div className="text-4xl mb-3 text-center">{fileIcon(doc.type)}</div>
                  {renaming === doc.id ? (
                    <input
                      autoFocus
                      value={renameVal}
                      onChange={(e) => setRenameVal(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={(e) => e.key === "Enter" && commitRename()}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full text-xs border border-cixio-blue rounded px-1 py-0.5 focus:outline-none"
                    />
                  ) : (
                    <p className="text-xs font-medium text-gray-700 truncate text-center">{doc.name}</p>
                  )}
                  <p className="text-xs text-gray-400 text-center mt-1">{formatBytes(doc.size)}</p>

                  {/* Actions — visible on hover */}
                  <div className="flex justify-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); startRename(doc); }}
                      className="text-xs text-gray-500 hover:text-cixio-blue"
                      title="Rename"
                    >✏️</button>
                    <button
                      onClick={(e) => { e.stopPropagation(); downloadFile(doc); }}
                      className="text-xs text-gray-500 hover:text-cixio-blue cursor-pointer select-none"
                      title="Download"
                    >⬇️</button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteId(doc.id); }}
                      className="text-xs text-gray-500 hover:text-red-500"
                      title="Delete"
                    >🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List view */}
          {!isLoading && view === "list" && visible.length > 0 && (
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                    <th className="text-left px-4 py-3 font-medium">Name</th>
                    <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Type</th>
                    <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Size</th>
                    <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Uploaded</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {visible.map((doc, i) => (
                    <tr
                      key={doc.id}
                      onClick={() => setPreview(doc)}
                      className={`cursor-pointer hover:bg-blue-50/40 transition-colors ${
                        i !== visible.length - 1 ? "border-b border-gray-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3 flex items-center gap-2">
                        <span>{fileIcon(doc.type)}</span>
                        {renaming === doc.id ? (
                          <input
                            autoFocus
                            value={renameVal}
                            onChange={(e) => setRenameVal(e.target.value)}
                            onBlur={commitRename}
                            onKeyDown={(e) => e.key === "Enter" && commitRename()}
                            onClick={(e) => e.stopPropagation()}
                            className="text-sm border border-cixio-blue rounded px-1 py-0.5 focus:outline-none"
                          />
                        ) : (
                          <span className="font-medium text-gray-800 truncate max-w-[200px]">{doc.name}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs hidden sm:table-cell">
                        {doc.type.split("/")[1] || doc.type}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">
                        {formatBytes(doc.size)}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">
                        {formatDate(doc.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={(e) => { e.stopPropagation(); startRename(doc); }}
                            className="text-gray-400 hover:text-cixio-blue transition"
                            title="Rename"
                          >✏️</button>
                           <button
                             onClick={(e) => { e.stopPropagation(); downloadFile(doc); }}
                             className="text-gray-400 hover:text-cixio-blue transition cursor-pointer select-none"
                             title="Download"
                           >⬇️</button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteId(doc.id); }}
                            className="text-gray-400 hover:text-red-500 transition"
                            title="Delete"
                          >🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Preview panel ── */}
        {preview && (
          <aside className="w-72 flex-shrink-0">
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden sticky top-20">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-gray-800 truncate">{preview.name}</span>
                <button
                  onClick={() => setPreview(null)}
                  className="text-gray-400 hover:text-gray-700 text-lg leading-none"
                >×</button>
              </div>

              {/* Preview content */}
              <div className="p-4">
                {preview.type.startsWith("image/") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={preview.url}
                    alt={preview.name}
                    className="w-full rounded-lg object-contain max-h-52"
                  />
                ) : preview.type === "application/pdf" ? (
                  <iframe
                    src={preview.url}
                    className="w-full h-52 rounded-lg border border-gray-100"
                    title={preview.name}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-36 bg-gray-50 rounded-lg">
                    <span className="text-5xl">{fileIcon(preview.type)}</span>
                    <p className="text-xs text-gray-400 mt-2">No preview available</p>
                  </div>
                )}

                {/* Metadata */}
                <dl className="mt-4 space-y-2 text-xs">
                  {[
                    ["Type",     preview.type],
                    ["Size",     formatBytes(preview.size)],
                    ["Uploaded", formatDate(preview.created_at)],
                    ["Modified", formatDate(preview.updated_at)],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <dt className="text-gray-400">{label}</dt>
                      <dd className="text-gray-700 font-medium truncate max-w-[60%] text-right">{value}</dd>
                    </div>
                  ))}
                </dl>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                   <button
                     onClick={() => downloadFile(preview)}
                     className="flex-1 text-center text-xs font-medium bg-cixio-blue hover:bg-cixio-hover text-white rounded-lg py-2 transition cursor-pointer select-none"
                   >
                     Download
                   </button>
                  <button
                    onClick={() => { setDeleteId(preview.id); setPreview(null); }}
                    className="text-xs text-red-500 border border-red-100 rounded-lg px-3 py-2 hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* ── Delete confirm modal ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-80 mx-4">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Delete document?</h2>
            <p className="text-sm text-gray-500 mb-5">
              This can&apos;t be undone. The file will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 text-sm border border-gray-200 rounded-lg py-2 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
                className="flex-1 text-sm bg-red-500 text-white rounded-lg py-2 hover:bg-red-600 transition disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
