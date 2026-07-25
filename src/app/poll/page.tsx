"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "@/lib/api";

/* ── Types ─────────────────────────────────────────── */
interface PollPayload {
  q1_modules_count: string;
  q2_overall_progress: string;
  q3_ready_independent: string;
  q4_need_1on1: string;
  q5_biggest_challenges: string[];
  q6_daily_hours: string;
  q7_meeting_goals: string;
  q8_internship_rating: string;
  q9_tech_stack_comfort: string;
  q10_docs_rating: string;
  q11_improvements: string[];
  q12_overall_feeling: string;
  q13_open_feedback: string;
}

const TOTAL_REQUIRED = 12;

/* ── Helpers ───────────────────────────────────────── */
function RadioGroup({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; emoji?: string }[];
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border-[1.5px] cursor-pointer transition-all text-sm
            ${value === opt.value
              ? "border-cixio-blue bg-cixio-light font-medium text-cixio-dark"
              : "border-gray-200 hover:border-cixio-blue hover:bg-cixio-light text-gray-600"
            }`}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="accent-cixio-blue w-4 h-4 flex-shrink-0"
          />
          <span className="flex-1">{opt.label}</span>
          {opt.emoji && <span>{opt.emoji}</span>}
        </label>
      ))}
    </div>
  );
}

function CheckboxGroup({
  name,
  values,
  onChange,
  options,
}: {
  name: string;
  values: string[];
  onChange: (v: string[]) => void;
  options: { value: string; label: string }[];
}) {
  const toggle = (v: string) =>
    onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);

  return (
    <div className="flex flex-col gap-2">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border-[1.5px] cursor-pointer transition-all text-sm
            ${values.includes(opt.value)
              ? "border-cixio-blue bg-cixio-light font-medium text-cixio-dark"
              : "border-gray-200 hover:border-cixio-blue hover:bg-cixio-light text-gray-600"
            }`}
        >
          <input
            type="checkbox"
            name={name}
            value={opt.value}
            checked={values.includes(opt.value)}
            onChange={() => toggle(opt.value)}
            className="accent-cixio-blue w-4 h-4 flex-shrink-0"
          />
          <span>{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

function QuestionCard({
  number,
  question,
  hint,
  children,
  hasError,
}: {
  number: number;
  question: string;
  hint?: string;
  children: React.ReactNode;
  hasError?: boolean;
}) {
  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-2xl p-6 mb-4 shadow-sm border-[1.5px] transition-all
        ${hasError ? "border-red-400" : "border-transparent focus-within:border-cixio-blue focus-within:shadow-[0_0_0_3px_rgba(18,89,251,0.1)]"}`}
    >
      <div className="flex items-start gap-3 mb-4">
        <span className="bg-cixio-light text-cixio-blue text-xs font-bold px-2.5 py-1.5 rounded-lg flex-shrink-0 mt-0.5">
          Q{number}
        </span>
        <div>
          <p className="text-sm font-semibold text-gray-900 leading-snug">
            {question} <span className="text-red-500">*</span>
          </p>
          {hint && <p className="text-xs text-cixio-muted mt-0.5">{hint}</p>}
        </div>
      </div>
      {children}
      {hasError && (
        <p className="text-xs text-red-500 font-medium mt-2">Please select an option to continue.</p>
      )}
    </div>
  );
}

/* ── Page ───────────────────────────────────────────── */
export default function PollPage() {
  const [form, setForm] = useState<PollPayload>({
    q1_modules_count: "",
    q2_overall_progress: "",
    q3_ready_independent: "",
    q4_need_1on1: "",
    q5_biggest_challenges: [],
    q6_daily_hours: "",
    q7_meeting_goals: "",
    q8_internship_rating: "",
    q9_tech_stack_comfort: "",
    q10_docs_rating: "",
    q11_improvements: [],
    q12_overall_feeling: "",
    q13_open_feedback: "",
  });
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const setRadio = (field: keyof PollPayload) => (v: string) => {
    setForm((f) => ({ ...f, [field]: v }));
    setErrors((e) => { const n = new Set(e); n.delete(field); return n; });
  };

  const setCheckbox = (field: keyof PollPayload) => (v: string[]) => {
    setForm((f) => ({ ...f, [field]: v }));
    setErrors((e) => { const n = new Set(e); n.delete(field); return n; });
  };

  /* Progress */
  const answeredCount = [
    form.q1_modules_count, form.q2_overall_progress, form.q3_ready_independent,
    form.q4_need_1on1, form.q6_daily_hours, form.q7_meeting_goals,
    form.q8_internship_rating, form.q9_tech_stack_comfort, form.q10_docs_rating,
    form.q12_overall_feeling,
  ].filter(Boolean).length +
    (form.q5_biggest_challenges.length > 0 ? 1 : 0) +
    (form.q11_improvements.length > 0 ? 1 : 0);

  const pct = Math.round((answeredCount / TOTAL_REQUIRED) * 100);

  const mutation = useMutation({
    mutationFn: (data: PollPayload) => api.post("/poll/submit", data),
    onSuccess: () => setSubmitted(true),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = new Set<string>();
    const requiredRadio: (keyof PollPayload)[] = [
      "q1_modules_count","q2_overall_progress","q3_ready_independent","q4_need_1on1",
      "q6_daily_hours","q7_meeting_goals","q8_internship_rating","q9_tech_stack_comfort",
      "q10_docs_rating","q12_overall_feeling",
    ];
    requiredRadio.forEach((k) => { if (!form[k]) newErrors.add(k); });
    if (!form.q5_biggest_challenges.length) newErrors.add("q5_biggest_challenges");
    if (!form.q11_improvements.length) newErrors.add("q11_improvements");

    if (newErrors.size > 0) {
      setErrors(newErrors);
      const firstId = `card-${[...newErrors][0]}`;
      document.getElementById(firstId)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    mutation.mutate(form);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-cixio-bg dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-10 text-center max-w-md shadow-sm">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4">
            ✓
          </div>
          <h2 className="text-xl font-bold text-cixio-dark mb-2">Thank you for your honest feedback!</h2>
          <p className="text-sm text-cixio-muted leading-relaxed">
            Your responses have been recorded. The Cixio team will use this to improve your experience
            and plan the next sprint. Keep building! 🚀
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cixio-bg dark:bg-gray-950 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="relative bg-gradient-to-br from-cixio-dark via-cixio-navy to-cixio-blue rounded-2xl p-8 text-white mb-6 overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/4 rounded-full" />
          <span className="relative inline-block bg-white/15 border border-white/25 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest mb-3">
            Cixio SmartHub Internship · TKM
          </span>
          <h1 className="relative text-2xl md:text-3xl font-extrabold leading-tight mb-2">
            Mid-Sprint Pulse Check 📡
          </h1>
          <p className="relative text-sm opacity-80 leading-relaxed">
            Help us understand where you are, what you need, and how we can make this internship better.
            All responses are anonymous.
          </p>
          <div className="relative flex flex-wrap gap-4 mt-4 text-xs opacity-70">
            <span>📋 12 questions</span>
            <span>⏱ ~3 minutes</span>
            <span>🔒 Anonymous</span>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white dark:bg-gray-900 dark:border dark:border-gray-800 rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex justify-between text-xs font-semibold text-cixio-muted mb-2">
            <span>Your progress</span>
            <span>{answeredCount} / {TOTAL_REQUIRED} answered</span>
          </div>
          <div className="h-2 bg-cixio-light rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cixio-blue to-cixio-navy rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>

          {/* ── Section 1: Progress ── */}
          <p className="text-xs font-bold uppercase tracking-widest text-cixio-blue mb-3 mt-6 px-1">
            Section 1 · Your Progress
          </p>

          <div id="card-q1_modules_count">
            <QuestionCard number={1} question="How many modules have you worked on so far?" hasError={errors.has("q1_modules_count")}>
              <RadioGroup name="q1" value={form.q1_modules_count} onChange={setRadio("q1_modules_count")} options={[
                { value: "1",   label: "Just 1 module — still getting started" },
                { value: "2",   label: "2 modules" },
                { value: "3-4", label: "3 – 4 modules" },
                { value: "5+",  label: "5 or more modules" },
              ]} />
            </QuestionCard>
          </div>

          <div id="card-q2_overall_progress">
            <QuestionCard number={2} question="How would you rate your overall progress so far?" hasError={errors.has("q2_overall_progress")}>
              <RadioGroup name="q2" value={form.q2_overall_progress} onChange={setRadio("q2_overall_progress")} options={[
                { value: "excellent",  label: "Excellent — ahead of schedule",      emoji: "🚀" },
                { value: "good",       label: "Good — on track",                    emoji: "✅" },
                { value: "average",    label: "Average — keeping up, slowly",       emoji: "😐" },
                { value: "slow",       label: "Slow — slightly behind",             emoji: "🐢" },
                { value: "struggling", label: "Struggling — need more help",        emoji: "🆘" },
              ]} />
            </QuestionCard>
          </div>

          {/* ── Section 2: Independence ── */}
          <p className="text-xs font-bold uppercase tracking-widest text-cixio-blue mb-3 mt-8 px-1">
            Section 2 · Independence &amp; Support
          </p>

          <div id="card-q3_ready_independent">
            <QuestionCard number={3} question="Are you ready to handle multiple modules independently?" hasError={errors.has("q3_ready_independent")}>
              <RadioGroup name="q3" value={form.q3_ready_independent} onChange={setRadio("q3_ready_independent")} options={[
                { value: "fully-ready",     label: "Yes — fully ready, no guidance needed",          emoji: "💪" },
                { value: "mostly-ready",    label: "Mostly ready — just occasional check-ins",       emoji: "👍" },
                { value: "partially-ready", label: "Partially ready — need support on complex tasks",emoji: "🤔" },
                { value: "not-yet",         label: "Not yet — still building confidence",            emoji: "🌱" },
              ]} />
            </QuestionCard>
          </div>

          <div id="card-q4_need_1on1">
            <QuestionCard number={4} question="Do you need one-on-one (1:1) support from the mentor?" hasError={errors.has("q4_need_1on1")}>
              <RadioGroup name="q4" value={form.q4_need_1on1} onChange={setRadio("q4_need_1on1")} options={[
                { value: "yes-regularly", label: "Yes — regularly (daily or weekly sessions)" },
                { value: "sometimes",     label: "Sometimes — when stuck on specific issues" },
                { value: "rarely",        label: "Rarely — I prefer solving things myself first" },
                { value: "no",            label: "No — group sessions and docs are enough" },
              ]} />
            </QuestionCard>
          </div>

          <div id="card-q5_biggest_challenges">
            <QuestionCard number={5} question="What is your biggest challenge right now?" hint="Select all that apply." hasError={errors.has("q5_biggest_challenges")}>
              <CheckboxGroup name="q5" values={form.q5_biggest_challenges} onChange={setCheckbox("q5_biggest_challenges")} options={[
                { value: "codebase",      label: "Understanding the codebase / architecture" },
                { value: "env-setup",     label: "Setting up / running the dev environment" },
                { value: "task-clarity",  label: "Understanding what exactly needs to be built" },
                { value: "time",          label: "Not enough time for the internship" },
                { value: "tech-gaps",     label: "Gaps in technical knowledge (language / framework)" },
                { value: "communication", label: "Team communication / async coordination" },
                { value: "multi-tasks",   label: "Managing multiple tasks at once" },
                { value: "no-challenge",  label: "No major challenge — things are going well" },
              ]} />
            </QuestionCard>
          </div>

          {/* ── Section 3: Time ── */}
          <p className="text-xs font-bold uppercase tracking-widest text-cixio-blue mb-3 mt-8 px-1">
            Section 3 · Time &amp; Commitment
          </p>

          <div id="card-q6_daily_hours">
            <QuestionCard number={6} question="On average, how many hours per day do you spend on development & learning?" hasError={errors.has("q6_daily_hours")}>
              <RadioGroup name="q6" value={form.q6_daily_hours} onChange={setRadio("q6_daily_hours")} options={[
                { value: "<1h",  label: "Less than 1 hour" },
                { value: "1-2h", label: "1 – 2 hours" },
                { value: "2-4h", label: "2 – 4 hours" },
                { value: "4-6h", label: "4 – 6 hours" },
                { value: ">6h",  label: "More than 6 hours" },
              ]} />
            </QuestionCard>
          </div>

          <div id="card-q7_meeting_goals">
            <QuestionCard number={7} question="Are you consistently meeting your weekly goals / tasks?" hasError={errors.has("q7_meeting_goals")}>
              <RadioGroup name="q7" value={form.q7_meeting_goals} onChange={setRadio("q7_meeting_goals")} options={[
                { value: "always",    label: "Yes — completing tasks on time every week" },
                { value: "mostly",    label: "Mostly — finishing 3–4 days worth of tasks" },
                { value: "sometimes", label: "Sometimes — 1–2 days per week" },
                { value: "rarely",    label: "Rarely — falling short of weekly goals" },
              ]} />
            </QuestionCard>
          </div>

          {/* ── Section 4: Experience ── */}
          <p className="text-xs font-bold uppercase tracking-widest text-cixio-blue mb-3 mt-8 px-1">
            Section 4 · Internship Experience
          </p>

          <div id="card-q8_internship_rating">
            <QuestionCard number={8} question="Overall, how would you rate the Cixio Internship so far?" hasError={errors.has("q8_internship_rating")}>
              <RadioGroup name="q8" value={form.q8_internship_rating} onChange={setRadio("q8_internship_rating")} options={[
                { value: "excellent",  label: "Excellent — best internship experience",  emoji: "🌟" },
                { value: "very-good",  label: "Very Good — learning a lot",              emoji: "😊" },
                { value: "good",       label: "Good — above average",                    emoji: "👌" },
                { value: "average",    label: "Average — meets basic expectations",      emoji: "😐" },
                { value: "below-avg",  label: "Below Average — could be better",         emoji: "😕" },
                { value: "poor",       label: "Poor — worst experience so far",          emoji: "😞" },
              ]} />
            </QuestionCard>
          </div>

          <div id="card-q9_tech_stack_comfort">
            <QuestionCard number={9} question="How comfortable are you with the tech stack?" hint="Backend: FastAPI/Python · Frontend: Next.js/React · Mobile: Flutter" hasError={errors.has("q9_tech_stack_comfort")}>
              <RadioGroup name="q9" value={form.q9_tech_stack_comfort} onChange={setRadio("q9_tech_stack_comfort")} options={[
                { value: "very-comfortable",   label: "Very comfortable — confident across the full stack" },
                { value: "comfortable-most",   label: "Comfortable with most parts" },
                { value: "learning-as-i-go",   label: "Learning as I go — figuring it out" },
                { value: "struggling-parts",   label: "Struggling with several parts" },
                { value: "just-starting",      label: "Just getting started — everything is new" },
              ]} />
            </QuestionCard>
          </div>

          <div id="card-q10_docs_rating">
            <QuestionCard number={10} question="How would you rate the learning resources & documentation provided?" hasError={errors.has("q10_docs_rating")}>
              <RadioGroup name="q10" value={form.q10_docs_rating} onChange={setRadio("q10_docs_rating")} options={[
                { value: "excellent",  label: "Excellent — very clear and thorough" },
                { value: "good",       label: "Good — mostly helpful" },
                { value: "average",    label: "Average — could be improved" },
                { value: "poor",       label: "Poor — too sparse or confusing" },
                { value: "needs-work", label: "Needs significant improvement" },
              ]} />
            </QuestionCard>
          </div>

          <div id="card-q11_improvements">
            <QuestionCard number={11} question="What would most improve your internship experience?" hint="Select all that apply." hasError={errors.has("q11_improvements")}>
              <CheckboxGroup name="q11" values={form.q11_improvements} onChange={setCheckbox("q11_improvements")} options={[
                { value: "daily-tasks",       label: "More structured daily tasks / clearer sprint goals" },
                { value: "better-docs",       label: "Better documentation and code comments" },
                { value: "more-1on1",         label: "More 1:1 mentoring sessions" },
                { value: "roadmap",           label: "Clearer project roadmap and milestones" },
                { value: "code-reviews",      label: "Regular code reviews and feedback" },
                { value: "team-comms",        label: "Better team communication tools / processes" },
                { value: "learning-resources",label: "More learning resources (tutorials, references)" },
                { value: "peer-collab",       label: "More collaboration with fellow interns" },
              ]} />
            </QuestionCard>
          </div>

          <div id="card-q12_overall_feeling">
            <QuestionCard number={12} question="Overall, how do you feel about the internship right now?" hasError={errors.has("q12_overall_feeling")}>
              <RadioGroup name="q12" value={form.q12_overall_feeling} onChange={setRadio("q12_overall_feeling")} options={[
                { value: "very-motivated", label: "Very motivated and excited about the project",       emoji: "🔥" },
                { value: "positive",       label: "Positive — learning a lot and enjoying it",          emoji: "😄" },
                { value: "okay",           label: "It's okay — getting better each day",               emoji: "🙂" },
                { value: "overwhelmed",    label: "Overwhelmed — but I'm trying my best",              emoji: "😰" },
                { value: "discouraged",    label: "Discouraged — not meeting my own expectations",     emoji: "😔" },
              ]} />
            </QuestionCard>
          </div>

          {/* ── Section 5: Open feedback ── */}
          <p className="text-xs font-bold uppercase tracking-widest text-cixio-blue mb-3 mt-8 px-1">
            Section 5 · Your Voice (Optional)
          </p>

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-6 shadow-sm border-[1.5px] border-transparent focus-within:border-cixio-blue">
            <div className="flex items-start gap-3 mb-4">
              <span className="bg-cixio-light text-cixio-blue text-xs font-bold px-2.5 py-1.5 rounded-lg flex-shrink-0 mt-0.5">
                Q13
              </span>
              <div>
                <p className="text-sm font-semibold text-gray-900">Anything specific you&apos;d like your mentor to know?</p>
                <p className="text-xs text-cixio-muted mt-0.5">Blockers, feedback, suggestions — anything goes. This is anonymous.</p>
              </div>
            </div>
            <textarea
              value={form.q13_open_feedback}
              onChange={(e) => setForm((f) => ({ ...f, q13_open_feedback: e.target.value }))}
              maxLength={800}
              placeholder="Type your message here…"
              className="w-full border-[1.5px] border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 bg-white dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700 placeholder:text-gray-400 resize-y min-h-[90px] outline-none focus:border-cixio-blue focus:shadow-[0_0_0_3px_rgba(18,89,251,0.1)] transition-all font-sans"
            />
          </div>

          {/* Submit */}
          {mutation.isError && (
            <p className="text-center text-sm text-red-500 mb-3">
              Something went wrong. Please try again.
            </p>
          )}
          <div className="text-center pb-8">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="bg-gradient-to-r from-cixio-blue to-cixio-navy text-white font-bold text-base px-10 py-3.5 rounded-xl shadow-[0_4px_16px_rgba(18,89,251,0.3)] hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? "Submitting…" : "Submit My Response →"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
