// ─── Dashboard.jsx ─────────────────────────────────────────────────────────
import React from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import LeadershipShell from './LeadershipShell';
import { Card, Btn, SectionHeading, ProgressBar } from './_ui';
import { useLeadershipData } from './_store';

function MetricCard({ label, value, icon, trend, trendLabel, onClick }) {
  return (
    <Card hover className="p-5" onClick={onClick}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[12px] text-slate-500 font-medium">{label}</p>
          <h4 className="text-[28px] font-bold mt-1 leading-none">{value}</h4>
        </div>
        <div className="p-2.5 bg-[#137fec]/10 rounded-xl">
          <span className="material-symbols-outlined text-[#137fec] text-[22px]">{icon}</span>
        </div>
      </div>
      {trend && (
        <div className={`mt-4 flex items-center gap-1.5 text-[12px] font-semibold
          ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-slate-400'}`}>
          <span className="material-symbols-outlined text-[14px]">
            {trend === 'up' ? 'trending_up' : trend === 'down' ? 'trending_down' : 'remove'}
          </span>
          {trendLabel}
        </div>
      )}
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { courses, problemAreas, reports, setStudentFilter, setSelectedCourse } = useLeadershipData();

  const goStudents = (filter = 'all') => { setStudentFilter(filter); navigate('/leadership/students'); };
  const goCurriculum = (id = 'PY-101') => { setSelectedCourse(id); navigate('/leadership/curriculum'); };

  return (
    <LeadershipShell title="Leadership Dashboard">
      <div className="space-y-7">

        {/* ── Page header ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[22px] font-bold">Leadership Dashboard</h2>
            <p className="text-slate-500 text-[13px] mt-0.5">Program Overview · Last 30 Days</p>
          </div>
          <div className="flex items-center gap-2">
            <Btn variant="secondary" onClick={() => { toast.success('Exporting report…'); }}>
              <span className="material-symbols-outlined text-[16px]">download</span>
              Export
            </Btn>
            <Btn onClick={() => navigate('/leadership/analytics')}>
              <span className="material-symbols-outlined text-[16px]">add</span>
              New Report
            </Btn>
          </div>
        </div>

        {/* ── Key Metrics ── */}
        <section>
          <SectionHeading>Key Metrics</SectionHeading>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Total Students"   value="450"  icon="groups"        trend="up"      trendLabel="+12% from last month" onClick={() => goStudents('all')} />
            <MetricCard label="Active Courses"   value="12"   icon="menu_book"     trend="neutral" trendLabel="Steady this month"     onClick={() => goCurriculum()} />
            <MetricCard label="Completion Rate"  value="68%"  icon="check_circle"  trend="up"      trendLabel="+5% improvement"      onClick={() => goStudents('completed')} />
            <MetricCard label="Avg Progress"     value="72%"  icon="trending_up"   trend="up"      trendLabel="+3% this week"         onClick={() => goStudents('all')} />
          </div>
        </section>

        {/* ── Student Segments ── */}
        <section>
          <SectionHeading>Student Segments</SectionHeading>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'At Risk Students', value: 45,    icon: 'warning',       bg: 'bg-red-50',     text: 'text-red-500',     filter: 'at-risk'       },
              { label: 'High Performers',  value: 123,   icon: 'emoji_events',  bg: 'bg-amber-50',   text: 'text-amber-600',   filter: 'top-performer' },
              { label: 'Behind Schedule',  value: 67,    icon: 'schedule',      bg: 'bg-orange-50',  text: 'text-orange-500',  filter: 'behind'        },
              { label: 'Job Ready',        value: '89%', icon: 'work',          bg: 'bg-emerald-50', text: 'text-emerald-600', filter: 'top-performer' },
            ].map(({ label, value, icon, bg, text, filter }) => (
              <Card hover key={label} className="p-5" onClick={() => goStudents(filter)}>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${bg}`}>
                    <span className={`material-symbols-outlined ${text} text-[22px]`}>{icon}</span>
                  </div>
                  <div>
                    <p className="text-[24px] font-bold leading-none">{value}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{label}</p>
                  </div>
                </div>
                <p className="mt-3 text-[11px] text-[#137fec] font-semibold flex items-center gap-1">
                  View students <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Course Performance + Readiness ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Course Performance */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[15px] font-bold">Course Performance</h3>
              <button onClick={() => goCurriculum()} className="text-[12px] text-[#137fec] font-semibold flex items-center gap-1 hover:underline">
                View All <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
            <div className="space-y-5">
              {courses.map((c) => (
                <div key={c.id} className="cursor-pointer group" onClick={() => goCurriculum(c.id)}>
                  <div className="flex justify-between text-[13px] font-medium mb-1.5">
                    <span className="text-slate-700 group-hover:text-[#137fec] transition-colors">{c.name}</span>
                    <div className="flex items-center gap-3 text-slate-500">
                      <span className="flex items-center gap-1 text-[11px]">
                        <span className="material-symbols-outlined text-[12px] text-red-400">warning</span>{c.atRisk}
                      </span>
                      <span className="font-bold text-slate-900">{c.avgProgress}%</span>
                    </div>
                  </div>
                  <ProgressBar value={c.avgProgress} color="bg-[#137fec]" />
                </div>
              ))}
            </div>
          </Card>

          {/* Readiness Donut */}
          <Card className="p-6">
            <h3 className="text-[15px] font-bold mb-5">Student Readiness Distribution</h3>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative size-44 shrink-0">
                <div className="size-full rounded-full"
                  style={{ background: 'conic-gradient(#137fec 0% 65%, #93c5fd 65% 85%, #ef4444 85% 100%)' }} />
                <div className="absolute inset-5 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                  <p className="text-[22px] font-bold leading-none">450</p>
                  <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Students</p>
                </div>
              </div>
              <div className="flex-1 space-y-4 w-full">
                {[
                  { label: 'On Track', pct: '65%', color: 'bg-[#137fec]',  filter: 'on-track'      },
                  { label: 'Advanced', pct: '20%', color: 'bg-blue-300',   filter: 'top-performer' },
                  { label: 'At Risk',  pct: '15%', color: 'bg-red-500',    filter: 'at-risk'       },
                ].map(({ label, pct, color, filter }) => (
                  <div key={label} onClick={() => goStudents(filter)}
                    className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <span className={`size-3 rounded-full ${color}`} />
                      <span className="text-[13px] text-slate-600 group-hover:text-[#137fec] transition-colors">{label}</span>
                    </div>
                    <span className="font-bold group-hover:text-[#137fec] transition-colors">{pct}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* ── Problem Areas + Recent Reports ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Problem Areas */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-[20px]">warning</span>
                Areas Requiring Attention
              </h3>
              <button onClick={() => goCurriculum()} className="text-[12px] text-[#137fec] font-semibold hover:underline flex items-center gap-1">
                View All <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
            <div className="space-y-3">
              {problemAreas.map((p) => (
                <div key={p.id} onClick={() => goCurriculum()}
                  className="flex items-start justify-between p-3 rounded-xl border border-slate-100 hover:border-[#137fec]/30 hover:bg-[#137fec]/5 cursor-pointer transition-all group">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`size-2 rounded-full shrink-0 ${p.severity === 'critical' ? 'bg-red-500' : 'bg-amber-400'}`} />
                      <p className="text-[13px] font-semibold group-hover:text-[#137fec] transition-colors">{p.topic}</p>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 ml-4">{p.course} · {p.chapter}</p>
                    <p className="text-[11px] text-red-600 font-semibold mt-1 ml-4">{p.struggleRate}% struggle rate</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); goCurriculum(); }}
                    className="text-[12px] text-[#137fec] font-semibold flex items-center gap-1 shrink-0 ml-2 hover:underline">
                    Investigate <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Reports */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-bold">Recent Reports</h3>
              <button onClick={() => navigate('/leadership/analytics')} className="text-[12px] text-[#137fec] font-semibold hover:underline flex items-center gap-1">
                View All <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
            <div className="space-y-2">
              {reports.slice(0, 4).map((r) => (
                <div key={r.id} onClick={() => navigate('/leadership/analytics')}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-[#137fec]/30 hover:bg-[#137fec]/5 cursor-pointer transition-all group">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0
                    ${r.type === 'PDF' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{r.type}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate group-hover:text-[#137fec] transition-colors">{r.name}</p>
                    <p className="text-[11px] text-slate-400">{r.date} · {r.size}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); toast.success('Download started!'); }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors shrink-0">
                    <span className="material-symbols-outlined text-[16px]">download</span>
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/leadership/analytics')}
              className="mt-4 w-full py-2 border border-[#137fec]/30 text-[#137fec] text-[13px] font-semibold rounded-xl hover:bg-[#137fec]/5 transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[16px]">add</span>
              Generate New Report
            </button>
          </Card>
        </div>

        {/* ── AI Banner ── */}
        <section className="bg-[#137fec] text-white rounded-2xl p-7 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-white/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/4 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              <p className="text-[11px] font-bold uppercase tracking-widest opacity-80">AI Enhancement ROI</p>
            </div>
            <h2 className="text-[26px] font-bold mb-6">Performance Impact Analysis</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
              {[
                { stat: '2,345', label: 'Audio Plays',      icon: 'volume_up'    },
                { stat: '1,876', label: 'Video Views',       icon: 'play_circle'  },
                { stat: '1,234', label: 'Walkthroughs',      icon: 'route'        },
                { stat: '+15%',  label: 'Engagement Lift',   icon: 'trending_up'  },
              ].map(({ stat, label, icon }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">{icon}</span>
                  </div>
                  <div>
                    <p className="text-[22px] font-bold leading-none">{stat}</p>
                    <p className="text-[11px] opacity-75">{label}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => goCurriculum()}
              className="px-5 py-2.5 bg-white text-[#137fec] font-bold text-[13px] rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-2 w-fit">
              View AI Analytics <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </section>

      </div>
    </LeadershipShell>
  );
}
