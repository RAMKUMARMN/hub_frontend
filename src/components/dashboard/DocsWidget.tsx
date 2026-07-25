"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

interface DashboardDocument {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  updated_at: string;
  session_id?: string | null;
}

const fileIcons: Record<string, string> = {
  pdf:  "📄",
  docx: "📝",
  xlsx: "📊",
  pptx: "📑",
  txt:  "🗒️",
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocsWidget() {
  const { data: docs = [], isLoading, isError } = useQuery<DashboardDocument[]>({
    queryKey: ["dashboard-docs"],
    queryFn: async () => {
      const res = await api.get<DashboardDocument[]>("/documents", { params: { limit: 4 } });
      return res.data;
    },
    staleTime: 1000 * 60 * 2,
  });

  const recentDocs = useMemo(() => docs.slice(0, 4), [docs]);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm min-h-[280px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700">Documents</h2>
        <a href="/documents" className="text-xs text-cixio-blue hover:underline">
          Upload +
        </a>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-14 rounded-2xl bg-gray-100" />
          ))}
        </div>
      ) : isError ? (
        <div className="text-sm text-red-500">Unable to load documents.</div>
      ) : recentDocs.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-500">
          No documents uploaded yet.
          <div className="text-xs text-gray-400 mt-2">Upload a file to see it here.</div>
        </div>
      ) : (
        <ul className="space-y-2">
          {recentDocs.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <span className="text-xl">{fileIcons[doc.file_type.split("/")[1]] ?? "📁"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 truncate flex items-center gap-1.5">
                  {doc.filename}
                  <span className="text-[10px] opacity-75 shrink-0" title={doc.session_id ? "Session-based" : "Global"}>
                    {doc.session_id ? "💬" : "🌐"}
                  </span>
                </p>
                <p className="text-xs text-gray-400">{formatSize(doc.file_size)}</p>
              </div>
              <span className="text-xs text-gray-400 shrink-0">
                {new Date(doc.updated_at).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}

      <a
        href="/documents"
        className="block mt-4 text-xs text-cixio-blue hover:underline text-center"
      >
        View all documents →
      </a>
    </div>
  );
}
