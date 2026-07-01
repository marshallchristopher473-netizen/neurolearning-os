// app/dashboard/diagnostic/page.tsx
"use client";
import { useState } from "react";
import { useAuth } from "../../providers";
import { useDiagnostic, useSubmitDiagnostic } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const DOMAIN_QUESTIONS: Record<string, string[]> = {
  ta:   ["I worry a lot before tests","My heart races during exams","I go blank when I see a question I don't know","I compare myself to how fast others finish","I feel sick the morning of a test"],
  exec: ["I have trouble starting my homework","I lose track of time while studying","I forget assignments often","It is hard for me to switch between subjects","I need many reminders to begin tasks"],
  lit:  ["I read slowly compared to my classmates","I have trouble understanding what I read","I struggle to find the right words when writing","Academic vocabulary in textbooks is hard","I lose my place when reading long passages"],
  cult: ["I know about famous scholars from my cultural heritage","My culture makes me proud to learn","I feel my background is reflected in what I study","I have role models who look like me","My family talks about education as important"],
  nd:   ["I learn best when I can see or draw things","Noise or bright lights distract me while studying","I prefer to move around when learning","I do my best thinking in the morning","I work better alone than in groups"],
  hab:  ["I have a set homework routine every day","I study in a quiet, organized space","I get enough sleep on school nights","I review my notes before a test","I use flashcards or study tools regularly"],
};

const DOMAIN_LABELS: Record<string, string> = {
  ta:"Test Anxiety", exec:"Exec Function", lit:"Literacy (CALP)", cult:"Cultural Identity", nd:"Learning Profile", hab:"Study Habits",
};

export default function DiagnosticPage() {
  const { user }    = useAuth();
  const { data }    = useDiagnostic(user?.id ?? "");
  const { mutate, isPending } = useSubmitDiagnostic();
  const [mode, setMode]       = useState<"view"|"assess">("view");
  const [step, setStep]       = useState(0);
  const [answers, setAnswers] = useState<Record<string,number>>({});
  const [selected, setSelected] = useState<any>(null);

  const domains   = Object.keys(DOMAIN_QUESTIONS);
  const curDomain = domains[step];
  const questions = DOMAIN_QUESTIONS[curDomain] ?? [];

  const scores = data?.domain_scores
    ? Object.entries(data.domain_scores).map(([key, val]) => ({
        domain: DOMAIN_LABELS[key] ?? key,
        score:  Math.round((val as number) * 100),
        flag:   (val as number) > 0.65,
        key,
      }))
    : [];

  function handleAnswer(qid: string, val: number) {
    setAnswers(prev => ({ ...prev, [qid]: val }));
  }

  function handleSubmit() {
    mutate({ user_id: user?.id ?? "", answers, assessment_type: "student_initial" });
    setMode("view");
  }

  if (mode === "assess") {
    return (
      <div className="space-y-5 max-w-2xl mx-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">52-Domain Diagnostic Assessment</h2>
          <button onClick={() => setMode("view")} className="text-slate-400 text-xs hover:text-white">← Back</button>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
          <div className="flex justify-between items-center mb-4">
            <p className="text-purple-300 font-bold text-sm">{DOMAIN_LABELS[curDomain]}</p>
            <p className="text-slate-400 text-xs">Domain {step + 1} of {domains.length}</p>
          </div>
          <div className="h-1 bg-slate-700 rounded-full mb-5 overflow-hidden">
            <div className="h-full bg-purple-600 rounded-full transition-all" style={{ width:`${((step + 1) / domains.length) * 100}%` }} />
          </div>
          <div className="space-y-5">
            {questions.map((q, i) => {
              const qid = `${curDomain}_${i}`;
              return (
                <div key={qid}>
                  <p className="text-slate-200 text-sm mb-2">{q}</p>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(v => (
                      <button key={v} onClick={() => handleAnswer(qid, v)}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                          answers[qid] === v
                            ? "bg-purple-700 border-purple-500 text-white"
                            : "bg-slate-700 border-slate-600 text-slate-400 hover:border-purple-600"
                        }`}>{v}</button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 mt-1 px-1">
                    <span>Never</span><span>Always</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-6">
            <button disabled={step === 0} onClick={() => setStep(s => s - 1)}
              className="px-4 py-2 rounded-lg text-xs bg-slate-700 text-slate-300 disabled:opacity-40 hover:bg-slate-600 transition-colors">← Back</button>
            {step < domains.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)}
                className="px-4 py-2 rounded-lg text-xs bg-purple-700 text-white hover:bg-purple-600 transition-colors">Next Domain →</button>
            ) : (
              <button onClick={handleSubmit} disabled={isPending}
                className="px-4 py-2 rounded-lg text-xs bg-emerald-700 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors">
                {isPending ? "Submitting…" : "Submit Assessment ✓"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-white font-bold text-lg">Diagnostic Profile</h2>
          {data && <p className="text-slate-400 text-xs">Last assessed: {new Date(data.taken_at).toLocaleDateString()}</p>}
        </div>
        <button onClick={() => { setMode("assess"); setStep(0); setAnswers({}); }}
          className="bg-purple-700 hover:bg-purple-600 text-white text-xs px-4 py-2 rounded-lg transition-colors">
          {data ? "Re-Assess" : "Start Assessment"} →
        </button>
      </div>

      {!data ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-10 text-center">
          <p className="text-4xl mb-3">🧠</p>
          <p className="text-white font-bold mb-1">No diagnostic on file yet</p>
          <p className="text-slate-400 text-sm">Complete the 52-domain assessment to generate your personalized learning plan.</p>
          <button onClick={() => setMode("assess")} className="mt-4 bg-purple-700 hover:bg-purple-600 text-white text-sm px-5 py-2.5 rounded-lg transition-colors">
            Begin Assessment →
          </button>
        </div>
      ) : (
        <>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-white font-bold text-sm">52-Domain Score Overview</h3>
              <span className="text-xs bg-red-900/50 border border-red-700 text-red-300 px-3 py-1 rounded-full">
                {scores.filter(s => s.flag).length} domains flagged
              </span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={scores} margin={{ top:5, right:10, bottom:5, left:-20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="domain" tick={{ fill:"#94a3b8", fontSize:9 }} />
                <YAxis domain={[0,100]} tick={{ fill:"#94a3b8", fontSize:10 }} />
                <Tooltip contentStyle={{ backgroundColor:"#1e293b", border:"1px solid #334155", borderRadius:"8px", fontSize:"11px" }}
                  formatter={(v: any) => [`${v}%`]} />
                <Bar dataKey="score" radius={[4,4,0,0]}>
                  {scores.map((s, i) => <Cell key={i} fill={s.flag ? "#ef4444" : "#8b5cf6"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {scores.map(s => (
              <button key={s.key} onClick={() => setSelected(selected?.key === s.key ? null : s)} className="text-left">
                <div className={`p-4 rounded-xl border transition-all ${s.flag ? "bg-red-900/20 border-red-800 hover:border-red-500" : "bg-purple-900/20 border-purple-800 hover:border-purple-500"}`}>
                  <div className="flex justify-between items-center">
                    <p className="text-white font-semibold text-sm">{s.domain}</p>
                    <p className={`text-2xl font-black ${s.flag ? "text-red-400" : "text-purple-400"}`}>{s.score}%</p>
                  </div>
                  {selected?.key === s.key && (
                    <p className="text-slate-300 text-xs mt-2 pt-2 border-t border-slate-700">
                      {s.flag
                        ? "⚠️ Priority focus area — the Learning Path agent has scheduled targeted modules."
                        : "✅ Developing well. Continue current activities to maintain momentum."}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
