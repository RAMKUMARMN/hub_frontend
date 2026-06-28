"use client";

import { useState, useRef } from "react";
import api, { buildApiUrl } from "@/lib/api";

type Props = {
  currentPhotoUrl?: string | null;   // existing photo from the database, if any
  userInitials: string;             // fallback like "AX"
};

export default function AvatarUpload({ currentPhotoUrl, userInitials }: Props) {
  // previewUrl = what we show on screen RIGHT NOW (instant feedback)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 1: user picks a file → show instant preview using FileReader
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation before we even try uploading
    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File too large — max 5MB");
      return;
    }

    // FileReader reads the file directly in the browser — no server needed yet
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target?.result as string); // base64 data URL → instant preview
    };
    reader.readAsDataURL(file);

    // Step 2: actually upload it
    uploadFile(file);
  }

  async function uploadFile(file: File) {
    setUploading(true);

    // FormData is how browsers send files over HTTP
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post(buildApiUrl("/auth/avatar"), formData);
      setPreviewUrl(res.data.avatar_url ?? null); // replace local preview with the real saved URL
    } catch (err) {
      alert("Upload failed, please try again");
      setPreviewUrl(currentPhotoUrl ?? null); // revert on failure
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    // Optimistic UI — hide immediately
    const prev = previewUrl;
    setPreviewUrl(null);

    try {
      await api.delete(buildApiUrl("/auth/avatar"));
    } catch (err) {
      alert("Could not remove avatar on server");
      setPreviewUrl(prev);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-20 h-20">
        {previewUrl ? (
          <img src={previewUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center text-xl font-medium text-purple-700">
            {userInitials}
          </div>
        )}

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center"
        >
          📷
        </button>

        {/* Hidden actual file input — the camera button just triggers this */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      <div>
        <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="text-sm px-3 py-1.5 border rounded-lg mr-2">
          {uploading ? "Uploading…" : "Upload new"}
        </button>
        <button onClick={handleRemove} disabled={!previewUrl} className="text-sm px-3 py-1.5 text-red-700">
          Remove
        </button>
      </div>
    </div>
  );
}
