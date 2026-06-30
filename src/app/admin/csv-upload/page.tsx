"use client";
// app/admin/csv-upload/page.tsx
// CSV Upload Page at /admin/csv-upload
// Admins upload a CSV file to bulk approve users

import { useState, useRef } from "react";
import api, { buildApiUrl } from "@/lib/api";

type ParsedUser = {
  full_name: string;
  email: string;
  phone: string;
  role: string;
  valid: boolean;
  error?: string;
};

// Simple email validator
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Parse CSV text into rows
// Expected columns: name, email, role (header row required)
function parseCSV(text: string): ParsedUser[] {
  const lines = text.trim().split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((c) => c.trim().toLowerCase());
  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const values = Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
    const full_name = values.full_name || values.name || "";
    const email = values.email || "";
    const phone = values.phone || "";
    const role = values.role || "Member";

    if (!full_name) return { full_name, email, phone, role, valid: false, error: "Name is missing" };
    if (!isValidEmail(email)) return { full_name, email, phone, role, valid: false, error: "Invalid email" };

    return { full_name, email, phone, role, valid: true };
  });
}

type UploadStatus = "idle" | "parsing" | "ready" | "uploading" | "done" | "error";

export default function CSVUploadPage() {
  const [status,   setStatus]   = useState<UploadStatus>("idle");
  const [users,    setUsers]    = useState<ParsedUser[]>([]);
  const [fileName, setFileName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Process a File object
  function processFile(file: File) {
    if (!file.name.endsWith(".csv")) {
      alert("Please upload a .csv file");
      return;
    }
    setFileName(file.name);
    setSelectedFile(file);
    setStatus("parsing");

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      setUsers(parsed);
      setStatus("ready");
    };
    reader.readAsText(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }

  async function handleUpload() {
    const validUsers = users.filter((u) => u.valid);
    if (validUsers.length === 0) return;

    setStatus("uploading");

    try {
      const file = selectedFile;
      if (!file) throw new Error("No file selected");

      const formData = new FormData();
      formData.append("file", file);
      await api.post(buildApiUrl("/admin/users/bulk"), formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setStatus("done");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }

  function reset() {
    setStatus("idle");
    setUsers([]);
    setFileName("");
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  const validCount   = users.filter((u) => u.valid).length;
  const invalidCount = users.filter((u) => !u.valid).length;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">CSV Bulk Upload</h1>
          <p className="text-sm text-gray-400 mt-0.5">Upload a CSV file to approve multiple users at once</p>
        </div>

        {/* Template download hint */}
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 rounded-xl p-4 mb-5 flex items-start gap-3">
          <span className="text-blue-500 text-lg mt-0.5">ℹ️</span>
          <div>
            <p className="text-sm font-medium text-blue-700">CSV format required</p>
            <p className="text-xs text-blue-500 mt-0.5">
              Your CSV must have a header row with columns: <code className="bg-blue-100 px-1 rounded">full_name, email, role</code>
            </p>
            <button
              onClick={() => {
                // Create and download a template CSV
                const template = "full_name,email,role\nJohn Doe,john@company.io,Engineer\nJane Smith,jane@company.io,Designer";
                const blob = new Blob([template], { type: "text/csv" });
                const url  = URL.createObjectURL(blob);
                const a    = document.createElement("a");
                a.href     = url;
                a.download = "smarthub-users-template.csv";
                a.click();
              }}
              className="text-xs text-blue-600 underline mt-1 inline-block"
            >
              Download template CSV
            </button>
          </div>
        </div>

        {/* Drop zone */}
        {status === "idle" || status === "parsing" ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
              dragOver
                ? "border-blue-400 bg-blue-50 dark:bg-blue-950"
                : "border-gray-200 hover:border-blue-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-4xl mb-3">📂</p>
            <p className="text-sm font-medium text-gray-700">
              {status === "parsing" ? "Parsing file…" : "Drop your CSV here, or click to browse"}
            </p>
            <p className="text-xs text-gray-400 mt-1">.csv files only</p>
          </div>
        ) : null}

        {/* Preview table */}
        {(status === "ready" || status === "uploading" || status === "done") && (
          <div>
            {/* Summary bar */}
            <div className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl px-5 py-3 shadow-sm mb-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  📄 <strong>{fileName}</strong>
                </span>
                <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                  {validCount} valid
                </span>
                {invalidCount > 0 && (
                  <span className="text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded-full">
                    {invalidCount} invalid
                  </span>
                )}
              </div>
              <button onClick={reset} className="text-xs text-gray-400 hover:text-gray-600">
                ✕ Clear
              </button>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">#</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Name</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Email</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Role</th>
                    <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={i} className={`border-b border-gray-50 last:border-0 ${!u.valid ? "bg-red-50" : ""}`}>
                      <td className="px-5 py-3 text-gray-400 text-xs">{i + 1}</td>
                      <td className="px-5 py-3 text-gray-700">{u.full_name || <span className="text-gray-300">—</span>}</td>
                      <td className="px-5 py-3 text-gray-600">{u.email}</td>
                      <td className="px-5 py-3 text-gray-500">{u.role}</td>
                      <td className="px-5 py-3">
                        {u.valid ? (
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">✓ Valid</span>
                        ) : (
                          <span className="text-xs bg-red-100 text-red-500 px-2 py-0.5 rounded-full" title={u.error}>
                            ✕ {u.error}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Upload button */}
            {status !== "done" ? (
              <button
                onClick={handleUpload}
                disabled={validCount === 0 || status === "uploading"}
                className="bg-blue-600 text-white text-sm px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40 flex items-center gap-2"
              >
                {status === "uploading" ? (
                  <>
                    <span className="animate-spin">⏳</span> Uploading…
                  </>
                ) : (
                  <>✓ Approve {validCount} user{validCount !== 1 ? "s" : ""}</>
                )}
              </button>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <span className="text-green-600 text-xl">✅</span>
                <div>
                  <p className="text-sm font-medium text-green-700">
                    {validCount} user{validCount !== 1 ? "s" : ""} approved successfully
                  </p>
                  <button onClick={reset} className="text-xs text-green-600 underline mt-0.5">
                    Upload another file
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}