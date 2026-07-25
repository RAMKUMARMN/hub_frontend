"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const NOTIFY_URL = process.env.NEXT_PUBLIC_NOTIFY_URL ?? "http://localhost:8001";

// ── types ──────────────────────────────────────────────────────────────────

type JobStatus = "queued" | "processing" | "done" | "failed";

interface Job {
  job_id: string;
  job_type: string;
  queue: string;
  label: string;
  status: JobStatus;
  progress: number;
  message: string;
  total: number;
  done_count: number;
  created_at: string;
  updated_at: string;
}

interface QueueStat {
  queue: string;
  queued: number;
  processing: number;
  done: number;
  failed: number;
  total: number;
}

// ── constants ─────────────────────────────────────────────────────────────

const QUEUE_META: Record<
  string,
  { icon: string; color: string; desc: string }
> = {
  "file.uploads": {
    icon: "📁",
    color: "blue",
    desc: "Any file, any size — receive, validate, store",
  },
  "rag.bulk_ingest": {
    icon: "🧠",
    color: "blue",
    desc: "PDF/DOCX → extract → chunk → embed → ChromaDB",
  },
  "notify.bulk_email": {
    icon: "📧",
    color: "green",
    desc: "Template rendering + SMTP delivery at scale",
  },
  "notify.bulk_sms": {
    icon: "💬",
    color: "yellow",
    desc: "SMS gateway dispatch to thousands of recipients",
  },
  "notify.bulk_whatsapp": {
    icon: "🟢",
    color: "green",
    desc: "WhatsApp templates + Twilio dispatch at scale",
  },
  "analytics.events": {
    icon: "📊",
    color: "orange",
    desc: "User logs, engagement analysis, metric aggregation",
  },
  "email.process": {
    icon: "✉️",
    color: "teal",
    desc: "Single email delivery with retry logic",
  },
  "sms.process": {
    icon: "📱",
    color: "pink",
    desc: "Single SMS with Twilio retry",
  },
  "push.process": {
    icon: "🔔",
    color: "indigo",
    desc: "Push notification via Firebase / APNs",
  },
  "whatsapp.process": {
    icon: "🟢",
    color: "green",
    desc: "Single WhatsApp template with Twilio retry",
  },
};

const COLOR_MAP: Record<string, string> = {
  blue:   "bg-blue-50 border-blue-200 text-blue-800",
  green:  "bg-green-50 border-green-200 text-green-800",
  yellow: "bg-yellow-50 border-yellow-200 text-yellow-800",
  orange: "bg-orange-50 border-orange-200 text-orange-800",
  teal:   "bg-teal-50 border-teal-200 text-teal-800",
  pink:   "bg-pink-50 border-pink-200 text-pink-800",
  indigo: "bg-indigo-50 border-indigo-200 text-indigo-800",
};

const PROGRESS_COLOR: Record<string, string> = {
  blue:   "bg-blue-500",
  green:  "bg-green-500",
  yellow: "bg-yellow-500",
  orange: "bg-orange-500",
  teal:   "bg-teal-500",
  pink:   "bg-pink-500",
  indigo: "bg-indigo-500",
};

const STATUS_BADGE: Record<JobStatus, string> = {
  queued:     "bg-gray-100 text-gray-700 border border-gray-300",
  processing: "bg-blue-100 text-blue-700 border border-blue-300 animate-pulse",
  done:       "bg-green-100 text-green-700 border border-green-300",
  failed:     "bg-red-100 text-red-700 border border-red-300",
};

const JOB_TYPES = [
  {
    type: "file_upload",
    label: "File Upload",
    icon: "📁",
    desc: "Simulate large file (50–200 MB) upload & indexing",
    payload: { size_mb: 120 },
  },
  {
    type: "rag_bulk_ingest",
    label: "Bulk RAG Ingest",
    icon: "🧠",
    desc: "Process 10 PDF docs → extract text → embed → ChromaDB",
    payload: { num_files: 10 },
  },
  {
    type: "bulk_email",
    label: "Bulk Email",
    icon: "📧",
    desc: "Send notification email to 50 students",
    payload: { count: 50, subject: "CixioHub Weekly Digest" },
  },
  {
    type: "bulk_sms",
    label: "Bulk SMS",
    icon: "💬",
    desc: "Dispatch SMS alert to 100 recipients",
    payload: { count: 100, body: "CixioHub: Important update." },
  },
  {
    type: "bulk_whatsapp",
    label: "Bulk WhatsApp",
    icon: "🟢",
    desc: "Dispatch WhatsApp templates to 80 recipients",
    payload: { count: 80, body: "CixioHub: Your verification session is active." },
  },
  {
    type: "analytics",
    label: "Analytics",
    icon: "📊",
    desc: "Analyse 2000 user engagement events",
    payload: { task_type: "engagement_analysis", event_count: 2000 },
  },
];

// ── helper components ─────────────────────────────────────────────────────

function ProgressBar({
  value,
  color,
}: {
  value: number;
  color: string;
}) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-1.5 rounded-full transition-all duration-500 ${PROGRESS_COLOR[color] ?? "bg-blue-500"}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function QueueCard({
  stat,
  jobs,
}: {
  stat: QueueStat;
  jobs: Job[];
}) {
  const meta = QUEUE_META[stat.queue] ?? { icon: "⚙️", color: "blue", desc: "" };
  const cardClass = COLOR_MAP[meta.color] ?? COLOR_MAP.blue;
  const activeJob = jobs.find(
    (j) => j.queue === stat.queue && j.status === "processing"
  );

  return (
    <div className={`rounded-xl border p-4 ${cardClass} transition-all`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-2xl mr-2">{meta.icon}</span>
          <span className="font-semibold text-sm">{stat.queue}</span>
        </div>
        <div className="text-right text-xs space-y-0.5">
          <div>
            <span className="font-bold text-lg">{stat.total}</span>{" "}
            <span className="opacity-60">total</span>
          </div>
        </div>
      </div>

      <p className="text-xs opacity-70 mb-3">{meta.desc}</p>

      {/* count badges */}
      <div className="flex gap-2 flex-wrap mb-3">
        {stat.queued > 0 && (
          <span className="px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-800">
            {stat.queued} queued
          </span>
        )}
        {stat.processing > 0 && (
          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-200 text-blue-800 animate-pulse">
            {stat.processing} processing
          </span>
        )}
        {stat.done > 0 && (
          <span className="px-2 py-0.5 rounded-full text-xs bg-green-200 text-green-800">
            {stat.done} done
          </span>
        )}
        {stat.failed > 0 && (
          <span className="px-2 py-0.5 rounded-full text-xs bg-red-200 text-red-800">
            {stat.failed} failed
          </span>
        )}
      </div>

      {/* active job progress */}
      {activeJob && (
        <div className="mt-2">
          <ProgressBar value={activeJob.progress} color={meta.color} />
          <p className="text-xs mt-1 opacity-80 truncate">{activeJob.message}</p>
        </div>
      )}
    </div>
  );
}

function FlowDiagram() {
  return (
    <div className="bg-gray-900 rounded-xl p-5 text-white overflow-x-auto">
      <h3 className="text-sm font-semibold text-gray-400 mb-4">
        HOW REQUESTS FLOW THROUGH THE SYSTEM
      </h3>
      <div className="flex items-center gap-2 min-w-max text-sm">
        {/* sources */}
        <div className="flex flex-col gap-2">
          {["Frontend Upload", "Bulk Email API", "Bulk SMS API", "Analytics API", "RAG Ingest API"].map((s) => (
            <div
              key={s}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-xs text-gray-200 whitespace-nowrap"
            >
              {s}
            </div>
          ))}
        </div>

        {/* arrow */}
        <Arrow />

        {/* notify service */}
        <div className="bg-indigo-700 border border-indigo-500 rounded-xl px-4 py-6 text-center min-w-[120px]">
          <div className="text-lg mb-1">⚡</div>
          <div className="font-bold text-xs">Notify Service</div>
          <div className="text-indigo-300 text-xs">:8001</div>
          <div className="text-indigo-200 text-xs mt-1">FastAPI + Workers</div>
        </div>

        {/* arrow */}
        <Arrow />

        {/* queues */}
        <div className="flex flex-col gap-1.5">
          {[
            { q: "file.uploads", c: "blue" },
            { q: "rag.bulk_ingest", c: "blue" },
            { q: "notify.bulk_email", c: "green" },
            { q: "notify.bulk_sms", c: "yellow" },
            { q: "analytics.events", c: "orange" },
          ].map(({ q, c }) => (
            <div
              key={q}
              className={`rounded px-2.5 py-1 text-xs border whitespace-nowrap ${
                c === "yellow"
                  ? "bg-yellow-900 border-yellow-700 text-yellow-200"
                  : c === "orange"
                  ? "bg-orange-900 border-orange-700 text-orange-200"
                  : `bg-${c}-900 border-${c}-700 text-${c}-200`
              }`}
            >
              📨 {q}
            </div>
          ))}
        </div>

        {/* arrow */}
        <Arrow />

        {/* workers */}
        <div className="flex flex-col gap-1.5">
          {[
            { w: "file_worker", i: "📁" },
            { w: "rag_worker", i: "🧠" },
            { w: "email_worker", i: "📧" },
            { w: "sms_worker", i: "💬" },
            { w: "analytics_worker", i: "📊" },
          ].map(({ w, i }) => (
            <div
              key={w}
              className="bg-gray-700 border border-gray-600 rounded px-2.5 py-1 text-xs whitespace-nowrap"
            >
              {i} {w}
            </div>
          ))}
        </div>

        {/* arrow */}
        <Arrow />

        {/* outputs */}
        <div className="flex flex-col gap-2">
          {[
            { label: "MinIO / S3", icon: "🗄️" },
            { label: "ChromaDB", icon: "🔮" },
            { label: "Mailpit / SMTP", icon: "✉️" },
            { label: "SMS Gateway", icon: "📱" },
            { label: "Analytics DB", icon: "📈" },
          ].map(({ label, icon }) => (
            <div
              key={label}
              className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-1.5 text-xs text-gray-300 whitespace-nowrap"
            >
              {icon} {label}
            </div>
          ))}
        </div>

        {/* arrow */}
        <Arrow />

        {/* SSE stream */}
        <div className="bg-pink-800 border border-pink-600 rounded-xl px-4 py-4 text-center min-w-[110px]">
          <div className="text-lg mb-1">📡</div>
          <div className="font-bold text-xs">SSE Stream</div>
          <div className="text-pink-300 text-xs mt-1">/jobs/stream</div>
          <div className="text-pink-200 text-xs">→ Dashboard</div>
        </div>
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <div className="text-gray-500 text-xl font-bold select-none">→</div>
  );
}

// ── main page ────────────────────────────────────────────────────────────

export default function QueuesPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<Record<string, QueueStat>>({});
  const [connected, setConnected] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const appendLog = useCallback((msg: string) => {
    const ts = new Date().toLocaleTimeString();
    setLog((prev) => [`[${ts}] ${msg}`, ...prev].slice(0, 120));
  }, []);

  // ── SSE connection ──────────────────────────────────────────────────────
  useEffect(() => {
    const connect = () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      const url = token
        ? `${NOTIFY_URL}/api/v1/jobs/stream?token=${encodeURIComponent(token)}`
        : `${NOTIFY_URL}/api/v1/jobs/stream`;
      const es = new EventSource(url);
      esRef.current = es;

      es.onopen = () => {
        setConnected(true);
        appendLog("✅ Connected to queue event stream");
      };

      es.onmessage = (e) => {
        try {
          const { event, data } = JSON.parse(e.data) as {
            event: string;
            data: Job;
          };
          if (event === "ping") return;

          // update jobs state
          setJobs((prev) => {
            const idx = prev.findIndex((j) => j.job_id === data.job_id);
            if (idx === -1) return [data, ...prev].slice(0, 80);
            const next = [...prev];
            next[idx] = data;
            return next;
          });

          // update stats
          setStats((prev) => {
            const next = { ...prev };
            const q = data.queue;
            if (!next[q]) {
              next[q] = {
                queue: q,
                queued: 0,
                processing: 0,
                done: 0,
                failed: 0,
                total: 0,
              };
            }
            // recompute from all jobs (simple approach)
            return next;
          });

          const icons: Record<string, string> = {
            "job.queued": "🟡",
            "job.processing": "🔵",
            "job.done": "🟢",
            "job.failed": "🔴",
          };
          appendLog(
            `${icons[event] ?? "⚪"} [${event}] ${data.label} (${data.queue}) — ${data.message || data.status}`
          );
        } catch {
          /* ignore parse errors */
        }
      };

      es.onerror = () => {
        setConnected(false);
        appendLog("⚠️ Stream disconnected — retrying…");
        es.close();
        setTimeout(connect, 3000);
      };
    };
    connect();
    return () => esRef.current?.close();
  }, [appendLog]);

  // ── derive stats from jobs ─────────────────────────────────────────────
  useEffect(() => {
    const computed: Record<string, QueueStat> = {};
    for (const job of jobs) {
      if (!computed[job.queue]) {
        computed[job.queue] = {
          queue: job.queue,
          queued: 0,
          processing: 0,
          done: 0,
          failed: 0,
          total: 0,
        };
      }
      computed[job.queue][job.status]++;
      computed[job.queue].total++;
    }
    setStats(computed);
  }, [jobs]);

  // ── submit job ─────────────────────────────────────────────────────────
  const submitJob = async (jt: (typeof JOB_TYPES)[0]) => {
    setSubmitting(jt.type);
    appendLog(`📤 Submitting ${jt.label}…`);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${NOTIFY_URL}/api/v1/jobs/submit`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          job_type: jt.type,
          label: jt.label,
          payload: jt.payload,
        }),
      });
      const data = await res.json();
      appendLog(`✓ Job submitted: ${data.job_id} → ${data.queue}`);
    } catch (err) {
      appendLog(`❌ Submit failed: ${err}`);
    } finally {
      setSubmitting(null);
    }
  };

  const allQueues = Object.keys(QUEUE_META);
  const activeQueues = allQueues.filter((q) => stats[q]);
  const emptyQueues = allQueues.filter((q) => !stats[q]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-6">
      {/* header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            ⚡ Queue Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time view of all message queues and background processing jobs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border font-medium ${
              connected
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                connected ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            />
            {connected ? "Live SSE Connected" : "Disconnected"}
          </span>
          <span className="text-xs text-gray-500">
            Notify Service :8001
          </span>
        </div>
      </div>

      {/* flow diagram */}
      <div className="mb-6">
        <FlowDiagram />
      </div>

      {/* submit buttons */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          🚀 Submit a Demo Job
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {JOB_TYPES.map((jt) => (
            <button
              key={jt.type}
              onClick={() => submitJob(jt)}
              disabled={submitting === jt.type}
              className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 hover:shadow-md transition-all text-left disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">
                {jt.icon}
              </span>
              <span className="font-semibold text-xs text-gray-800">
                {jt.label}
              </span>
              <span className="text-xs text-gray-400 text-center leading-tight">
                {jt.desc}
              </span>
              {submitting === jt.type && (
                <span className="text-xs text-indigo-600 animate-pulse">
                  Submitting…
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* queue cards */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          📨 Queues
        </h2>
        {activeQueues.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {activeQueues.map((q) => (
              <QueueCard key={q} stat={stats[q]} jobs={jobs} />
            ))}
          </div>
        )}
        {emptyQueues.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {emptyQueues.map((q) => {
              const meta = QUEUE_META[q] ?? { icon: "⚙️", color: "blue", desc: "" };
              return (
                <div
                  key={q}
                  className="rounded-lg border border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-center opacity-50"
                >
                  <div className="text-lg">{meta.icon}</div>
                  <div className="text-xs text-gray-500 truncate">{q}</div>
                  <div className="text-xs text-gray-400">empty</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* two-column: live jobs + event log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* live jobs table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="font-semibold text-sm text-gray-800 dark:text-gray-100">
              🔄 Live Jobs
            </h2>
            <span className="text-xs text-gray-400">{jobs.length} total</span>
          </div>
          <div className="overflow-auto max-h-96">
            {jobs.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">
                No jobs yet — submit one above ↑
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  <tr>
                    <th className="px-3 py-2 text-left">Job</th>
                    <th className="px-3 py-2 text-left">Queue</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {jobs.map((j) => {
                    const meta = QUEUE_META[j.queue] ?? {
                      icon: "⚙️",
                      color: "blue",
                      desc: "",
                    };
                    return (
                      <tr key={j.job_id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-3 py-2">
                          <div className="font-medium text-gray-700 dark:text-gray-100">
                            {meta.icon} {j.label}
                          </div>
                          <div className="text-gray-400 dark:text-gray-400 truncate max-w-[160px]">
                            {j.message}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-gray-500 whitespace-nowrap">
                          {j.queue}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs ${STATUS_BADGE[j.status]}`}
                          >
                            {j.status}
                          </span>
                        </td>
                        <td className="px-3 py-2 w-24">
                          <div className="flex items-center gap-1.5">
                            <ProgressBar
                              value={j.progress}
                              color={meta.color}
                            />
                            <span className="text-gray-500 w-7 text-right">
                              {j.progress}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* event log */}
        <div className="bg-gray-900 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
            <h2 className="font-semibold text-sm text-gray-200">
              📡 Live Event Log
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500">{log.length} events</span>
              <button
                onClick={() => setLog([])}
                className="text-xs text-gray-500 hover:text-gray-300"
              >
                clear
              </button>
            </div>
          </div>
          <div
            ref={logRef}
            className="font-mono text-xs p-3 overflow-auto max-h-96 space-y-0.5"
          >
            {log.length === 0 ? (
              <p className="text-gray-600">Waiting for events…</p>
            ) : (
              log.map((line, i) => (
                <div
                  key={i}
                  className={`${
                    line.includes("🟢") || line.includes("✅") || line.includes("✓")
                      ? "text-green-400"
                      : line.includes("🔵") || line.includes("processing")
                      ? "text-blue-400"
                      : line.includes("🔴") || line.includes("❌")
                      ? "text-red-400"
                      : line.includes("🟡") || line.includes("queued")
                      ? "text-yellow-400"
                      : line.includes("⚠️")
                      ? "text-orange-400"
                      : "text-gray-400"
                  }`}
                >
                  {line}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* explainer */}
      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
        <h3 className="font-semibold mb-1">How this works</h3>
        <p className="text-xs leading-relaxed text-blue-700">
          Each "Submit" button publishes a job to the <strong>Notify Service (port 8001)</strong> via{" "}
          <code className="bg-blue-100 px-1 rounded">POST /api/v1/jobs/submit</code>. The service routes it
          to the correct <strong>in-memory asyncio queue</strong> (backed by RabbitMQ for persistence), where
          a dedicated <strong>background worker</strong> picks it up and processes it step-by-step.
          As each step completes, the worker emits an event to all connected SSE clients via{" "}
          <code className="bg-blue-100 px-1 rounded">GET /api/v1/jobs/stream</code>.
          This dashboard listens to that stream and updates in real-time — no polling required.
        </p>
      </div>
    </div>
  );
}
