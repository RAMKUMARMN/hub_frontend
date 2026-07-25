export type RagStatus = "queued" | "processing" | "embedded" | "failed";

export type DocumentFile = {
  id: string;
  name: string;
  sizeBytes: number;
  uploadedAt: string;
  type: "pdf" | "image" | "docx" | "csv";
  ragStatus: RagStatus;
  progressPct?: number;
};
