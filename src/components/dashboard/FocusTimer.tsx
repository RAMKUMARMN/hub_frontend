"use client";
// FocusTimer.tsx
// Pomodoro-style countdown timer. 25 min work → 5 min break.
// "use client" required — uses useState and setInterval.

import { useState, useEffect, useRef } from "react";

// The three modes and their durations in seconds
const MODES = {
  work:       { label: "Work session",  seconds: 25 * 60 },
  shortBreak: { label: "Short break",   seconds: 5  * 60 },
  longBreak:  { label: "Long break",    seconds: 15 * 60 },
} as const;

type Mode = keyof typeof MODES;

export default function FocusTimer() {
  const [mode, setMode]       = useState<Mode>("work");
  const [seconds, setSeconds] = useState(MODES.work.seconds);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0); // completed work sessions

  // useRef holds the interval ID so we can clear it
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start or stop the countdown when `running` changes
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            // Timer finished
            clearInterval(intervalRef.current!);
            setRunning(false);
            if (mode === "work") setSessions((s) => s + 1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    // Cleanup: clear interval when component unmounts or running changes
    return () => clearInterval(intervalRef.current!);
  }, [running, mode]);

  // Switch mode and reset the timer
  function switchMode(newMode: Mode) {
    clearInterval(intervalRef.current!);
    setRunning(false);
    setMode(newMode);
    setSeconds(MODES[newMode].seconds);
  }

  // Format seconds as "MM:SS"
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  // Progress percentage for the ring (0–100)
  const total    = MODES[mode].seconds;
  const progress = ((total - seconds) / total) * 100;

  // Circle ring maths
  const radius = 40;
  const circumference = 2 * Math.PI * radius; // ≈ 251
  const strokeDash = circumference - (progress / 100) * circumference;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700">Focus Timer</h2>
        <span className="text-xs text-gray-400">{sessions} sessions today</span>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 mb-5">
        {(Object.keys(MODES) as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`flex-1 text-xs py-1.5 rounded-lg transition-colors ${
              mode === m
            ? "bg-cixio-blue text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {m === "work" ? "Work" : m === "shortBreak" ? "Short" : "Long"}
          </button>
        ))}
      </div>

      {/* SVG countdown ring + time display */}
      <div className="flex flex-col items-center mb-5">
        <svg width="110" height="110" viewBox="0 0 110 110">
          {/* Background circle */}
          <circle cx="55" cy="55" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="8" />
          {/* Progress circle */}
          <circle
            cx="55"
            cy="55"
            r={radius}
            fill="none"
            stroke="#2563eb"
            strokeWidth="8"
            strokeLinecap="round"
            // Rotate so progress starts from the top
            transform="rotate(-90 55 55)"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDash}
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
          {/* Time text in centre */}
          <text x="55" y="55" textAnchor="middle" dominantBaseline="central"
            fontSize="16" fontWeight="600" fill="#374151">
            {mm}:{ss}
          </text>
        </svg>
        <p className="text-xs text-gray-400 mt-1">{MODES[mode].label}</p>
      </div>

      {/* Start / Pause and Reset buttons */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setRunning((r) => !r)}
          className="px-5 py-2 bg-cixio-blue text-white text-sm rounded-lg hover:bg-cixio-hover transition-colors"
        >
          {running ? "Pause" : "Start"}
        </button>
        <button
          onClick={() => {
            clearInterval(intervalRef.current!);
            setRunning(false);
            setSeconds(MODES[mode].seconds);
          }}
          className="px-4 py-2 border border-gray-200 text-sm rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
