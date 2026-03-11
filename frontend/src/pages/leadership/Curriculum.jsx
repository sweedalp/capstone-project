// ─── Curriculum.jsx ────────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import LeadershipShell from './LeadershipShell';
import { Card, Btn, Tabs, ProgressBar } from './_ui';
import { leadershipApi } from '../../services/adminApi';

function HealthBar({ label, value }) {
  const color = value >= 80 ? 'bg-emerald-500' : value >= 60 ? 'bg-amber-400' : 'bg-red-400';
  const textColor = value >= 80 ? 'text-emerald-600' : value >= 60 ? 'text-amber-600' : 'text-red-500';
  return (
    <div>
      <div className="flex justify-between text-[11px] font-bold mb-1.5 uppercase tracking-wider">
        <span className="text-slate-500">{label}</span>
        <span className={textColor}>{value}%</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

const TABS = [
  { id: 'overview',              label: 'Overview'              },
  { id: 'content-effectiveness', label: 'Content Effectiveness' },
  { id: 'optimization',          label: 'Optimization'          },
  { id: 'student-retention',     label: 'Student Retention'     },
];

export default function Curriculum() {
  const navigate = useNavigate();

  const [courses, setCourses]                     = useState([]);
  const [selectedCourseId, setSelectedCourseId]   = useState(null);
  const [health, setHealth]                       = useState(null);
  const [problemAreas, setProblemAreas]           = useState([]);
  const [retention, setRetention]                 = useState(null);
  const [contentEffectiveness, setContentEffectiveness] = useState([]);
  const [optimizationPlan, setOptimizationPlan]   = useState([]);
  const [activeTab, setActiveTab]                 = useState('overview');

  // Load courses list once on mount
  useEffect(() => {
    leadershipApi.getCourses()
      .then(data => {
        setCourses(data);
        if (data.length > 0) setSelectedCourseId(data[0].id);
      })
      .catch(() => {});
  }, []);

  // Reload all course-specific data whenever the selected course changes
  useEffect(() => {
    if (!selectedCourseId) return;
    Promise.all([
      leadershipApi.getCourseHealth(selectedCourseId),
      leadershipApi.getProblemAreas(selectedCourseId),
      leadershipApi.getCourseRetention(selectedCourseId),
      leadershipApi.getContentEffectiveness(selectedCourseId),
      leadershipApi.getOptimizationPlan(selectedCourseId),
    ]).then(([h, pa, ret, ce, op]) => {
      setHealth(h);
      setProblemAreas(pa);
      setRetention(ret);
      setContentEffectiveness(ce);
      setOptimizationPlan(op);
    }).catch(() => {});
  }, [selectedCourseId]);

  const courseName = courses.find(c => c.id === selectedCourseId)?.name || '—';
  const h = health?.health || { clarity: 0, alignment: 0, engagement: 0, roi: 0 };
  const overallScore = health?.overall_score ?? 0;

  const handleExport = async () => {
    if (!selectedCourseId) return;
    try {
      const res = await leadershipApi.exportCourseReport(selectedCourseId);
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${courseName.replace(/ /g, '_')}_report.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Report exported!');
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <LeadershipShell title="Curriculum Insights">
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[12px] text-slate-400 mb-1">
              <span className="hover:text-[#137fec] cursor-pointer" onClick={() => navigate('/leadership/dashboard')}>Dashboard</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-slate-700 font-medium">{courseName}</span>
            </div>
            <h2 className="text-[22px] font-bold">Curriculum Insights & Analysis</h2>
            <p className="text-slate-500 text-[13px] mt-0.5">Real-time instructional ROI and curriculum health monitoring.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCourseId ?? ''}
              onChange={(e) => setSelectedCourseId(Number(e.target.value))}
              className="px-3 py-2 border border-slate-300 rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-[#137fec]/20 bg-white">
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <Btn variant="secondary" onClick={handleExport}>
              <span className="material-symbols-outlined text-[16px]">download</span>
              Export Report
            </Btn>
            <Btn onClick={() => toast.success('AI suggestions applied!')}>
              <span className="material-symbols-outlined text-[16px]">auto_fix_high</span>
              Apply Suggestions
            </Btn>
          </div>
        </div>

        {/* ── Tabs ── */}
        <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

        {/* ── Overview tab ── */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Misunderstood Areas */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[15px] font-bold">Misunderstood Areas</h3>
                  <p className="text-[11px] text-slate-400">Priority focus targets</p>
                </div>
                <span className="px-2.5 py-1 bg-red-100 text-red-700 text-[11px] font-bold rounded-full">CRITICAL</span>
              </div>
              <div className="space-y-4">
                {problemAreas.length === 0 ? (
                  <p className="text-[13px] text-slate-400 py-4 text-center">No critical problem areas detected for this course.</p>
                ) : problemAreas.map((p, i) => (
                  <div key={i} className="p-4 border border-slate-100 rounded-xl hover:border-[#137fec]/30 transition-all cursor-pointer group"
                    onClick={() => toast.success('Deep-dive analysis opened!')}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-[13px] group-hover:text-[#137fec] transition-colors">{p.topic}</h4>
                      <button className="text-slate-300 hover:text-slate-500">
                        <span className="material-symbols-outlined text-[16px]">more_horiz</span>
                      </button>
                    </div>
                    <div className="flex gap-6 mb-3">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Struggle Rate</p>
                        <p className="text-[20px] font-bold text-red-500">{p.struggle_rate}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Avg Quiz Score</p>
                        <p className="text-[20px] font-bold">{p.avg_score}%</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3 text-[12px]">
                      <p className="font-bold text-blue-700 flex items-center gap-1 mb-1">
                        <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
                        AI ANALYSIS
                      </p>
                      <p className="text-slate-600">{p.analysis}</p>
                      <p className="mt-2 text-slate-700">
                        <span className="text-blue-600 font-semibold">Recommendation:</span> {p.recommendation}
                      </p>
                    </div>
                  </div>
                ))}
                <button className="text-[13px] text-[#137fec] font-semibold flex items-center gap-1 hover:underline">
                  View all struggle points <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </Card>

            {/* Content Effectiveness ROI */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[15px] font-bold">Content Effectiveness ROI</h3>
                  <p className="text-[11px] text-slate-400">Engagement vs. Retention Performance</p>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
                  <span className="flex items-center gap-1"><span className="size-2.5 bg-slate-300 rounded-full inline-block" />Traditional</span>
                  <span className="flex items-center gap-1"><span className="size-2.5 bg-[#137fec] rounded-full inline-block" />AI Avatar</span>
                </div>
              </div>
              <div className="space-y-6 mb-5">
                {[
                  { label: 'Engagement Rate',    key: 'engagement' },
                  { label: 'Knowledge Retention',key: 'retention'  },
                ].map(({ label, key }) => (
                  <div key={label}>
                    <p className="text-[12px] text-slate-500 mb-2 font-medium">{label}</p>
                    <div className="space-y-1.5">
                      {[
                        { name: 'Traditional', value: key === 'engagement' ? 42 : 58, color: 'bg-slate-300' },
                        { name: 'AI Avatar',   value: key === 'engagement' ? 88 : 75, color: 'bg-[#137fec]' },
                      ].map(({ name, value, color }) => (
                        <div key={name} className="flex items-center gap-3">
                          <span className="text-[11px] text-slate-400 w-20 shrink-0">{name}</span>
                          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }} />
                          </div>
                          <span className={`text-[11px] font-bold w-10 ${color === 'bg-[#137fec]' ? 'text-[#137fec]' : 'text-slate-500'}`}>{value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl text-[12px] flex items-start gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[16px] shrink-0 mt-0.5">trending_up</span>
                <p className="text-emerald-800">
                  <strong>Insight:</strong> AI-generated avatar videos improved ROI by 300% compared to traditional faculty recording due to lower production overhead and higher student re-watch rates.
                </p>
              </div>
            </Card>

            {/* Optimization Flags */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[15px] font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#137fec] text-[20px]">flag</span>
                  Optimization Flags
                </h3>
                <button className="text-[12px] text-[#137fec] font-semibold hover:underline" onClick={() => toast.success('Resolved flags cleared!')}>Clear Resolved</button>
              </div>
              <div className="space-y-3">
                {optimizationPlan.length === 0 ? (
                  <p className="text-[13px] text-slate-400 py-4 text-center">No optimization flags for this course.</p>
                ) : optimizationPlan.slice(0, 3).map((item, i) => {
                  const cfg = {
                    High:   { bg: 'bg-red-100',   text: 'text-red-600',   icon: 'error'   },
                    Medium: { bg: 'bg-amber-100',  text: 'text-amber-600', icon: 'warning' },
                    Low:    { bg: 'bg-blue-100',   text: 'text-blue-500',  icon: 'info'    },
                  }[item.priority] || { bg: 'bg-slate-100', text: 'text-slate-500', icon: 'info' };
                  return (
                    <div key={i} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:border-amber-200 transition-all">
                      <div className="flex items-start gap-3">
                        <div className={`p-1.5 rounded-lg ${cfg.bg}`}>
                          <span className={`material-symbols-outlined text-[16px] ${cfg.text}`}>{cfg.icon}</span>
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold">{item.title}</p>
                          <p className="text-[11px] text-slate-400">Impact: {item.impact} · Effort: {item.effort}</p>
                        </div>
                      </div>
                      <button onClick={() => setActiveTab('optimization')}
                        className="px-3 py-1.5 text-[12px] font-bold rounded-xl shrink-0 ml-2 border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors">
                        Review
                      </button>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Curriculum Health Index */}
            <Card className="p-6">
              <h3 className="text-[15px] font-bold mb-5">Curriculum Health Index</h3>
              <div className="grid grid-cols-2 gap-4 mb-5">
                <HealthBar label="Clarity"    value={h.clarity}    />
                <HealthBar label="Alignment"  value={h.alignment}  />
                <HealthBar label="Engagement" value={h.engagement} />
                <HealthBar label="ROI Score"  value={h.roi}        />
              </div>
              <div className="border border-slate-100 rounded-xl p-4 flex items-center gap-4">
                <div className="relative size-20 shrink-0">
                  <svg viewBox="0 0 36 36" className="size-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#137fec" strokeWidth="2.5"
                      strokeDasharray={`${overallScore} 100`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[16px] font-bold">{overallScore}%</span>
                  </div>
                </div>
                <div>
                  <p className="font-bold text-[14px]">Overall Strategy Score</p>
                  <p className="text-[12px] text-slate-500 mt-0.5">
                    Based on clarity, alignment, engagement and ROI metrics.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Btn variant="secondary" className="text-[12px] py-1.5" onClick={() => navigate('/leadership/students')}>
                  <span className="material-symbols-outlined text-[14px]">group</span> View Students
                </Btn>
                <Btn className="text-[12px] py-1.5" onClick={() => navigate('/leadership/analytics')}>
                  <span className="material-symbols-outlined text-[14px]">description</span> Generate Report
                </Btn>
              </div>
            </Card>
          </div>
        )}

        {/* ── Content Effectiveness tab ── */}
        {activeTab === 'content-effectiveness' && (
          <Card className="p-6">
            <h3 className="text-[15px] font-bold mb-5">AI Content Type Performance</h3>
            {contentEffectiveness.length === 0 ? (
              <p className="text-[13px] text-slate-400 py-6 text-center">No content data available for this course yet.</p>
            ) : (
              <div className="space-y-4">
                {contentEffectiveness.map(({ type, satisfaction, icon, status }) => (
                  <div key={type} className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl">
                    <div className="p-2.5 bg-[#137fec]/10 rounded-xl">
                      <span className="material-symbols-outlined text-[#137fec] text-[22px]">{icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1.5">
                        <span className="font-semibold text-[13px]">{type}</span>
                        <span className={`text-[13px] font-bold ${satisfaction >= 80 ? 'text-emerald-600' : satisfaction >= 70 ? 'text-[#137fec]' : 'text-amber-600'}`}>
                          {satisfaction}%
                        </span>
                      </div>
                      <ProgressBar value={satisfaction}
                        color={satisfaction >= 80 ? 'bg-emerald-500' : satisfaction >= 70 ? 'bg-[#137fec]' : 'bg-amber-400'} />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0
                      ${status === 'Excellent' ? 'bg-emerald-100 text-emerald-700' : status === 'Good' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* ── Optimization tab ── */}
        {activeTab === 'optimization' && (
          <Card className="p-6">
            <h3 className="text-[15px] font-bold mb-5">Curriculum Optimization Plan</h3>
            {optimizationPlan.length === 0 ? (
              <p className="text-[13px] text-slate-400 py-6 text-center">No optimization recommendations for this course yet.</p>
            ) : (
              <div className="space-y-4">
                {optimizationPlan.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl hover:border-[#137fec]/20 transition-all">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0
                      ${item.priority === 'High' ? 'bg-red-100 text-red-700' : item.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                      {item.priority}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-[13px]">{item.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Impact: <span className="text-emerald-600 font-semibold">{item.impact}</span> · Effort: {item.effort}</p>
                    </div>
                    <span className={`text-[11px] font-bold shrink-0
                      ${item.status === 'In Progress' ? 'text-[#137fec]' : item.status === 'Pending' ? 'text-amber-600' : 'text-slate-400'}`}>
                      {item.status}
                    </span>
                    <button onClick={() => toast.success('Task started!')}
                      className="px-3 py-1.5 text-[12px] font-bold border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shrink-0">
                      Start
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* ── Student Retention tab ── */}
        {activeTab === 'student-retention' && (
          <Card className="p-6">
            <h3 className="text-[15px] font-bold mb-5">Student Retention Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                {
                  label: 'Completion Rate',
                  value: `${retention?.completion_rate ?? 0}%`,
                  sub:   `${retention?.completed ?? 0} of ${retention?.total_enrolled ?? 0} students`,
                  icon: 'group_add',    color: 'text-emerald-600 bg-emerald-50',
                },
                {
                  label: 'Dropout Rate',
                  value: `${retention?.dropout_rate ?? 0}%`,
                  sub:   `${retention?.dropped ?? 0} students dropped`,
                  icon: 'group_remove', color: 'text-red-500 bg-red-50',
                },
                {
                  label: 'In Progress',
                  value: retention?.in_progress ?? 0,
                  sub:   'actively learning',
                  icon: 'replay',       color: 'text-[#137fec] bg-blue-50',
                },
              ].map(({ label, value, sub, icon, color }) => (
                <div key={label} className="border border-slate-100 rounded-xl p-4 flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${color.split(' ')[1]}`}>
                    <span className={`material-symbols-outlined ${color.split(' ')[0]} text-[22px]`}>{icon}</span>
                  </div>
                  <div>
                    <p className="text-[22px] font-bold leading-none">{value}</p>
                    <p className="text-[11px] text-slate-500">{label}</p>
                    <p className="text-[10px] text-slate-400">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-blue-50 rounded-xl text-[13px] text-blue-800">
              <p className="font-bold mb-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">info</span>
                Enrollment Summary
              </p>
              <p>
                <strong>{retention?.total_enrolled ?? 0}</strong> total enrolled ·{' '}
                <strong>{retention?.completed ?? 0}</strong> completed ·{' '}
                <strong>{retention?.in_progress ?? 0}</strong> in progress ·{' '}
                <strong>{retention?.dropped ?? 0}</strong> dropped
              </p>
            </div>
          </Card>
        )}

        {/* Status bar */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-500 inline-block" />Live Sync: Enabled</span>
          <span>Course ID: {selectedCourseId}</span>
          <span>Last Analyzed: just now</span>
        </div>
      </div>
    </LeadershipShell>
  );
}
