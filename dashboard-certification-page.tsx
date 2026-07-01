// app/dashboard/certification/page.tsx
"use client";
import { useAuth } from "../../providers";
import { useCertifications } from "@/lib/api";

const TRACKS = [
  { id:"student_tutor", abbr:"MCST", name:"Student Tutor Certification",     total:12, color:"#8b5cf6", desc:"Peer tutor + 90% faster study methods" },
  { id:"parent_tutor",  abbr:"MCPT", name:"Parent Tutor Certification",      total:10, color:"#3b82f6", desc:"Homework coach + GED→PhD pathway"      },
  { id:"para",          abbr:"MCLSS",name:"Learning Science Specialist",     total:12, color:"#10b981", desc:"80-hr paraeducator cert · CEU eligible"  },
  { id:"teacher",       abbr:"MMEC", name:"Master Educator Certification",   total:16, color:"#f59e0b", desc:"120-hr teacher PD · grad credit track"   },
];

const GED_LEVELS = [
  { l:"Level 1", name:"Certified Parent Tutor (MCPT)",         active:true  },
  { l:"Level 2", name:"Family Learning Science Certificate",   active:false },
  { l:"Level 3", name:"Community Education Advocate",          active:false },
  { l:"Level 4", name:"GED Preparation (CC Partner)",         active:false },
  { l:"Level 5+",name:"Associates → Bachelor's → Graduate → PhD", active:false },
];

export default function CertificationPage() {
  const { user } = useAuth();
  const { data, isLoading } = useCertifications(user?.id ?? "");
  const issued: any[] = data?.certifications ?? [];

  function getIssued(trackId: string) {
    return issued.find(c => c.track === trackId);
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="text-white font-bold text-lg">Certification Tracker</h2>
        {isLoading && <span className="text-slate-500 text-xs">Loading…</span>}
      </div>

      {/* Track cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {TRACKS.map(tr => {
          const cert = getIssued(tr.id);
          const pct  = cert ? 100 : 0; // In production: fetch module_completions count
          return (
            <div key={tr.id} className="bg-slate-800 rounded-xl border border-slate-700 p-5">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{tr.abbr}</p>
                  <h3 className="text-white font-bold">{tr.name}</h3>
                  <p className="text-slate-500 text-xs mt-0.5">{tr.desc}</p>
                </div>
                <span className="text-3xl font-black flex-shrink-0 ml-2" style={{ color: tr.color }}>{pct}%</span>
              </div>

              <div className="h-2 bg-slate-700 rounded-full overflow-hidden my-3">
                <div className="h-full rounded-full transition-all" style={{ width:`${pct}%`, backgroundColor: tr.color }} />
              </div>

              <div className="flex justify-between text-xs text-slate-500 mb-3">
                <span>0 of {tr.total} modules complete</span>
                <span>{tr.total} remaining</span>
              </div>

              {cert ? (
                <div className="flex items-center gap-2 p-2 bg-emerald-900/30 border border-emerald-700 rounded-lg">
                  <span className="text-emerald-400">🏆</span>
                  <div>
                    <p className="text-emerald-300 text-xs font-semibold">Certified! Score: {cert.score}%</p>
                    <p className="text-emerald-600 text-xs">{new Date(cert.issued_at).toLocaleDateString()}</p>
                  </div>
                  {cert.cert_url && (
                    <a href={cert.cert_url} target="_blank" rel="noreferrer"
                      className="ml-auto text-xs text-emerald-400 hover:text-emerald-300">Download →</a>
                  )}
                </div>
              ) : (
                <div className="pt-3 border-t border-slate-700">
                  <button className="text-xs font-medium hover:opacity-80 transition-opacity" style={{ color: tr.color }}>
                    Start Track → Module 1
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* GED → PhD pathway */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
        <h3 className="text-white font-bold text-sm mb-4">Parent GED → PhD Stackable Pathway</h3>
        <div className="space-y-2">
          {GED_LEVELS.map(s => (
            <div key={s.l} className={`flex items-center gap-3 p-3 rounded-lg border ${
              s.active ? "bg-purple-900/30 border-purple-700" : "bg-slate-700/20 border-slate-700"
            }`}>
              <span className={`text-xs font-bold px-2 py-0.5 rounded flex-shrink-0 ${
                s.active ? "bg-purple-700 text-white" : "bg-slate-700 text-slate-500"
              }`}>{s.l}</span>
              <p className={`text-sm flex-1 ${s.active ? "text-white" : "text-slate-500"}`}>{s.name}</p>
              <span className={`text-xs flex-shrink-0 ${s.active ? "text-purple-400" : "text-slate-600"}`}>
                {s.active ? "In Progress" : "Locked 🔒"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
