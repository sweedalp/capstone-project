// ─── Analytics.jsx ─────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import LeadershipShell from './LeadershipShell';
import { Card, Btn, Spinner } from './_ui';
import { useLeadershipData } from './_store';

const REPORT_TYPES = [
  { id: 'student-progress', label: 'Student Progress',      desc: 'Individual performance tracking across all courses.'           },
  { id: 'ai-impact',        label: 'AI Interaction Impact', desc: 'Correlation between AI tutoring and learning outcomes.'         },
  { id: 'completion',       label: 'Completion Rates',      desc: 'Aggregated data on course completion and drop-off points.'     },
  { id: 'engagement',       label: 'Engagement Metrics',    desc: 'User activity levels, time-spent, and platform participation.' },
];

const AI_INSIGHTS = [
  { icon: 'trending_up', bg: 'bg-emerald-100', text: 'text-emerald-700', title: 'Engagement Increase',    desc: 'Total active users up 12% vs last month. Peak times shifted to weekday evenings.' },
  { icon: 'psychology',  bg: 'bg-blue-100',    text: 'text-blue-700',    title: 'AI Tutor Impact',         desc: 'Students using AI 3x/week show 15% higher STEM module retention.' },
  { icon: 'warning',     bg: 'bg-amber-100',   text: 'text-amber-700',   title: 'Action Recommended',      desc: 'Mathematics Module 4 completion lagging. Recommend quiz difficulty review.' },
];

const SCHEDULED = [
  { name: 'Executive Weekly',    schedule: 'Every Monday · 08:00 AM'  },
  { name: 'Monthly AI Efficacy', schedule: '1st of month · 12:00 PM' },
  { name: 'Quarterly Audit',     schedule: 'Every 90 days · 09:00 AM' },
];

export default function Analytics() {
  const navigate = useNavigate();
  const { reports } = useLeadershipData();

  const [selectedType, setSelectedType] = useState('student-progress');
  const [selectedFormat, setSelectedFormat] = useState('PDF');
  const [generating, setGenerating] = useState(false);
  const [emailModal, setEmailModal] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => { setGenerating(false); toast.success('Report generated & downloaded!'); }, 1600);
  };

  return (
    <LeadershipShell title="Reports & Analytics">
      <div className="space-y-5">

        {/* ── Header ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[22px] font-bold">Reports & Analytics</h2>
            <p className="text-slate-500 text-[13px] mt-0.5">Generate AI-powered insights and track organisational performance.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Left: Builder + Recent ── */}
          <div className="lg:col-span-2 space-y-5">

            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-[#137fec] text-[20px]">bar_chart</span>
                <h3 className="text-[15px] font-bold">Generate New Report</h3>
              </div>

              {/* Step 1 */}
              <div className="mb-5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">1. Select Report Type</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {REPORT_TYPES.map(({ id, label, desc }) => (
                    <label key={id} onClick={() => setSelectedType(id)}
                      className={`border rounded-xl p-4 cursor-pointer transition-all
                        ${selectedType === id ? 'border-[#137fec] bg-[#137fec]/5' : 'border-slate-200 hover:border-slate-300'}`}>
                      <div className="flex items-start gap-2">
                        <span className={`size-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center
                          ${selectedType === id ? 'border-[#137fec]' : 'border-slate-300'}`}>
                          {selectedType === id && <span className="size-2 rounded-full bg-[#137fec] block" />}
                        </span>
                        <div>
                          <p className="font-semibold text-[13px]">{label}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Step 2 */}
              <div className="mb-5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">2. Date Range</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[12px] font-medium text-slate-600 mb-1.5 block">From</label>
                    <input type="date" defaultValue="2026-01-01"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-[#137fec]/20" />
                  </div>
                  <div>
                    <label className="text-[12px] font-medium text-slate-600 mb-1.5 block">To</label>
                    <input type="date" defaultValue="2026-02-19"
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-[#137fec]/20" />
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="mb-6">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">3. Format & Delivery</p>
                <div className="flex items-center gap-3">
                  {['PDF', 'EXCEL', 'PPT'].map((f) => (
                    <button key={f} onClick={() => setSelectedFormat(f)}
                      className={`flex-1 flex flex-col items-center gap-1.5 p-4 border rounded-xl transition-all
                        ${selectedFormat === f ? 'border-[#137fec] bg-[#137fec]/5 text-[#137fec]' : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}>
                      <span className="material-symbols-outlined text-[22px]">
                        {f === 'PDF' ? 'picture_as_pdf' : f === 'EXCEL' ? 'table_chart' : 'slideshow'}
                      </span>
                      <span className="text-[12px] font-bold">{f}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={handleGenerate} disabled={generating}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#137fec] text-white py-3 rounded-xl font-bold text-[14px] hover:bg-[#0d6bbf] transition-colors disabled:opacity-60">
                  {generating ? <><Spinner /> Generating…</> : <><span className="material-symbols-outlined text-[18px]">description</span> Compile & Generate Report</>}
                </button>
                <button onClick={() => setEmailModal(true)}
                  className="flex items-center gap-2 border border-slate-300 text-slate-700 px-4 py-3 rounded-xl font-semibold text-[13px] hover:bg-slate-50 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">mail</span> Email
                </button>
              </div>
            </Card>

            {/* Recent Reports table */}
            <Card className="overflow-hidden p-0">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h3 className="text-[15px] font-bold">Recent Reports</h3>
                <button className="text-[12px] text-[#137fec] font-semibold hover:underline">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {['Report Name','Generated','Format','Size','Action'].map(h => (
                        <th key={h} className={`text-[11px] font-bold uppercase tracking-wider text-slate-400 px-4 py-3 ${h === 'Action' ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {reports.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3.5 font-medium text-slate-800">{r.name}</td>
                        <td className="px-4 py-3.5 text-slate-500">{r.date}</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded
                            ${r.type === 'PDF' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{r.type}</span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-400 text-[12px]">{r.size}</td>
                        <td className="px-4 py-3.5 text-right">
                          <button onClick={() => toast.success('Download started!')}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-[#137fec] transition-colors">
                            <span className="material-symbols-outlined text-[16px]">download</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* ── Right sidebar ── */}
          <div className="space-y-5">

            {/* AI Insights */}
            <Card className="p-5">
              <h3 className="text-[14px] font-bold flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[#137fec] text-[18px]">auto_awesome</span>
                AI Key Insights
              </h3>
              <div className="space-y-3">
                {AI_INSIGHTS.map(({ icon, bg, text, title, desc }) => (
                  <div key={title} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className={`p-1.5 rounded-lg ${bg} shrink-0`}>
                      <span className={`material-symbols-outlined text-[16px] ${text}`}>{icon}</span>
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold">{title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => toast.success('Full analysis loading…')}
                className="mt-3 w-full py-2 border border-[#137fec]/30 text-[#137fec] text-[13px] font-semibold rounded-xl hover:bg-[#137fec]/5 transition-colors">
                Full Monthly Analysis
              </button>
            </Card>

            {/* Scheduled Reports */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[14px] font-bold">Scheduled Reports</h3>
                <button onClick={() => toast.success('New schedule added!')}
                  className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
              </div>
              <div className="space-y-3">
                {SCHEDULED.map((r) => (
                  <div key={r.name} className="flex items-center justify-between">
                    <div>
                      <p className="text-[13px] font-semibold">{r.name}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider">{r.schedule}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => toast.success('Edit opened!')} className="p-1 hover:bg-slate-100 rounded text-slate-400 transition-colors">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button onClick={() => toast.success('Schedule removed!')} className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Data Accuracy */}
            <Card className="p-5 bg-[#137fec] text-white">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[11px] font-bold uppercase tracking-widest opacity-80">Data Accuracy</p>
                <span className="material-symbols-outlined text-[18px]">verified</span>
              </div>
              <p className="text-[30px] font-bold">99.8%</p>
              <p className="text-[11px] opacity-80 mt-1">Synced across all departments. Last sync: 4 minutes ago.</p>
            </Card>

            {/* Quick nav */}
            <Card className="p-5">
              <h3 className="text-[13px] font-bold mb-3">Quick Navigation</h3>
              <div className="space-y-1">
                {[
                  { label: 'View Student Progress',    to: '/leadership/students',  icon: 'group'         },
                  { label: 'View Curriculum Insights', to: '/leadership/curriculum',icon: 'auto_stories'  },
                  { label: 'Back to Dashboard',        to: '/leadership/dashboard', icon: 'dashboard'     },
                ].map(({ label, to, icon }) => (
                  <button key={to} onClick={() => navigate(to)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                    <span className="material-symbols-outlined text-[16px] text-[#137fec]">{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {emailModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-[15px] font-bold">Email Report</h3>
              <button onClick={() => setEmailModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-[12px] font-medium text-slate-600 mb-1.5 block">Recipients</label>
                <input className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-[#137fec]/20"
                  placeholder="email@example.com, email2@example.com…" />
              </div>
              <div>
                <label className="text-[12px] font-medium text-slate-600 mb-1.5 block">Subject</label>
                <input className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-[#137fec]/20"
                  defaultValue="Leadership Report – Feb 2026" />
              </div>
              <div>
                <label className="text-[12px] font-medium text-slate-600 mb-1.5 block">Message</label>
                <textarea rows={3} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[13px] outline-none focus:ring-2 focus:ring-[#137fec]/20 resize-none"
                  placeholder="Optional message…" />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100">
              <Btn variant="secondary" onClick={() => setEmailModal(false)}>Cancel</Btn>
              <Btn onClick={() => { toast.success('Report emailed successfully!'); setEmailModal(false); }}>
                <span className="material-symbols-outlined text-[16px]">send</span> Send
              </Btn>
            </div>
          </div>
        </div>
      )}
    </LeadershipShell>
  );
}
