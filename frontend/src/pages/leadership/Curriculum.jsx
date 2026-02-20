// ─── Curriculum.jsx ────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import LeadershipShell from './LeadershipShell';
import { Card, Btn, Tabs, ProgressBar } from './_ui';
import { useLeadershipData } from './_store';

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
  const { selectedCourse, setSelectedCourse, courses, curriculum } = useLeadershipData();
  const [activeTab, setActiveTab] = useState('overview');

  const data = curriculum[selectedCourse] || curriculum['PY-101'];

  return (
    <LeadershipShell title="Curriculum Insights">
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[12px] text-slate-400 mb-1">
              <span className="hover:text-[#137fec] cursor-pointer" onClick={() => navigate('/leadership/dashboard')}>Dashboard</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="text-slate-700 font-medium">{data.name}</span>
            </div>
            <h2 className="text-[22px] font-bold">Curriculum Insights & Analysis</h2>
            <p className="text-slate-500 text-[13px] mt-0.5">Real-time instructional ROI and curriculum health monitoring.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-[#137fec]/20 bg-white">
              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <Btn variant="secondary" onClick={() => toast.success('Report exported!')}>
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
                {data.problemAreas.map((p, i) => (
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
                        <p className="text-[20px] font-bold text-red-500">{p.struggleRate}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider">Avg Quiz Score</p>
                        <p className="text-[20px] font-bold">{p.avgScore}%</p>
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
                        { name: 'Traditional', value: data.aiContent[key].traditional, color: 'bg-slate-300' },
                        { name: 'AI Avatar',   value: data.aiContent[key].ai,          color: 'bg-[#137fec]' },
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
                {data.optimizationFlags.map((flag, i) => {
                  const cfg = {
                    bottleneck: { bg: 'bg-amber-100', text: 'text-amber-600', icon: 'timer' },
                    gap:        { bg: 'bg-red-100',   text: 'text-red-500',   icon: 'link_off' },
                    validity:   { bg: 'bg-blue-100',  text: 'text-blue-500',  icon: 'quiz' },
                  }[flag.type] || { bg: 'bg-slate-100', text: 'text-slate-500', icon: 'info' };
                  return (
                    <div key={i} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:border-amber-200 transition-all">
                      <div className="flex items-start gap-3">
                        <div className={`p-1.5 rounded-lg ${cfg.bg}`}>
                          <span className={`material-symbols-outlined text-[16px] ${cfg.text}`}>{cfg.icon}</span>
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold">{flag.title}</p>
                          <p className="text-[11px] text-slate-400">{flag.desc}</p>
                        </div>
                      </div>
                      <button onClick={() => toast.success(`${flag.action} initiated!`)}
                        className={`px-3 py-1.5 text-[12px] font-bold rounded-xl shrink-0 ml-2 transition-colors
                          ${flag.action === 'Auto-Bridge' ? 'bg-[#137fec] text-white hover:bg-[#0d6bbf]' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
                        {flag.action}
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
                <HealthBar label="Clarity"    value={data.health.clarity}    />
                <HealthBar label="Alignment"  value={data.health.alignment}  />
                <HealthBar label="Engagement" value={data.health.engagement} />
                <HealthBar label="ROI Score"  value={data.health.roi}        />
              </div>
              <div className="border border-slate-100 rounded-xl p-4 flex items-center gap-4">
                <div className="relative size-20 shrink-0">
                  <svg viewBox="0 0 36 36" className="size-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#137fec" strokeWidth="2.5"
                      strokeDasharray={`${data.overallScore} 100`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[16px] font-bold">{data.overallScore}%</span>
                  </div>
                </div>
                <div>
                  <p className="font-bold text-[14px]">Overall Strategy Score</p>
                  <p className="text-[12px] text-slate-500 mt-0.5">
                    Performing <span className="text-emerald-600 font-semibold">12% better</span> than department average this quarter.
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
            <div className="space-y-4">
              {[
                { type: 'Interactive Walkthroughs', satisfaction: 82, icon: 'route',        status: 'Excellent' },
                { type: 'AI Avatar Videos',         satisfaction: 78, icon: 'play_circle',  status: 'Good'      },
                { type: 'Audio Lessons',            satisfaction: 65, icon: 'volume_up',    status: 'Review'    },
                { type: 'Interactive Quizzes',      satisfaction: 88, icon: 'quiz',         status: 'Excellent' },
              ].map(({ type, satisfaction, icon, status }) => (
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
          </Card>
        )}

        {/* ── Optimization tab ── */}
        {activeTab === 'optimization' && (
          <Card className="p-6">
            <h3 className="text-[15px] font-bold mb-5">Curriculum Optimization Plan</h3>
            <div className="space-y-4">
              {[
                { priority: 'High',   title: 'Restructure Module 4 pacing',          impact: '+12% completion',  effort: 'Medium', status: 'Pending'     },
                { priority: 'High',   title: 'Add prerequisite bridge for Module 7',  impact: '-8% at-risk rate', effort: 'Low',    status: 'Pending'     },
                { priority: 'Medium', title: 'Replace Q12 with validated alternative',impact: '+5% score accuracy',effort: 'Low',   status: 'In Progress' },
                { priority: 'Low',    title: 'Add more visual aids to Chapter 3',      impact: '+7% engagement',   effort: 'High',   status: 'Backlog'     },
              ].map((item, i) => (
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
          </Card>
        )}

        {/* ── Student Retention tab ── */}
        {activeTab === 'student-retention' && (
          <Card className="p-6">
            <h3 className="text-[15px] font-bold mb-5">Student Retention Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Retention Rate',   value: '84%', delta: '+3%',  icon: 'group_add',    color: 'text-emerald-600 bg-emerald-50' },
                { label: 'Drop-off Rate',    value: '16%', delta: '-3%',  icon: 'group_remove', color: 'text-red-500 bg-red-50'         },
                { label: 'Re-enrollment',    value: '28',  delta: '+12',  icon: 'replay',       color: 'text-[#137fec] bg-blue-50'      },
              ].map(({ label, value, delta, icon, color }) => (
                <div key={label} className="border border-slate-100 rounded-xl p-4 flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${color.split(' ')[1]}`}>
                    <span className={`material-symbols-outlined ${color.split(' ')[0]} text-[22px]`}>{icon}</span>
                  </div>
                  <div>
                    <p className="text-[22px] font-bold leading-none">{value}</p>
                    <p className="text-[11px] text-slate-500">{label} <span className="text-emerald-600 font-semibold">{delta}</span></p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <h4 className="text-[13px] font-bold text-slate-700">Top Drop-off Points</h4>
              {[
                { module: 'Module 4 – Functions', dropRate: 34, reason: 'Complexity spike without adequate prerequisites' },
                { module: 'Module 7 – OOP',       dropRate: 22, reason: 'Students lack foundational concepts'             },
                { module: 'Module 11 – Projects',  dropRate: 18, reason: 'Insufficient scaffolding for final projects'    },
              ].map((d, i) => (
                <div key={i} className="flex items-center gap-4 p-3 border border-slate-100 rounded-xl">
                  <div className="flex-1">
                    <p className="font-semibold text-[13px]">{d.module}</p>
                    <p className="text-[11px] text-slate-400">{d.reason}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[16px] font-bold text-red-500">{d.dropRate}%</p>
                    <p className="text-[10px] text-slate-400">drop-off</p>
                  </div>
                  <button onClick={() => navigate('/leadership/curriculum')}
                    className="text-[12px] text-[#137fec] font-semibold hover:underline shrink-0">Fix</button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Status bar */}
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
          <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-500 inline-block" />Live Sync: Enabled</span>
          <span>Course ID: {selectedCourse}</span>
          <span>Last Analyzed: 2 mins ago</span>
        </div>
      </div>
    </LeadershipShell>
  );
}
