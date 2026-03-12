// ─── Analytics.jsx ─────────────────────────────────────────────────────────
// File:  frontend/src/pages/leadership/Analytics.jsx
// Wires to:  backend/app/api/v1/endpoints/leadership.py
//
// Install if missing:  npm install axios
// ────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import LeadershipShell from "./LeadershipShell";
import { Card, Btn, Spinner } from "./_ui";

// ── API client (uses the same apiClient already in your project) ──────────────
// If you already have adminApi / leadershipApi, replace the axios calls below
// with the equivalent leadershipApi.xxx() helpers shown in the integration guide.
import apiClient from "../../services/api";
const leadershipApi = {
  getReports:      ()        => apiClient.get("/api/v1/leadership/reports").then(r => r.data),
  generateReport:  (payload) => apiClient.post("/api/v1/leadership/reports/generate", payload, { responseType: "blob" }),
  downloadReport:  (id)      => apiClient.get(`/api/v1/leadership/reports/${id}/download`, { responseType: "blob" }),
  deleteReport:    (id)      => apiClient.delete(`/api/v1/leadership/reports/${id}`),
  emailReport:     (payload) => apiClient.post("/api/v1/leadership/reports/email", payload),
  getAiInsights:   ()        => apiClient.get("/api/v1/leadership/ai-insights").then(r => r.data),
  getScheduled:    ()        => apiClient.get("/api/v1/leadership/scheduled-reports").then(r => r.data),
  createScheduled: (payload) => apiClient.post("/api/v1/leadership/scheduled-reports", payload),
  deleteScheduled: (id)      => apiClient.delete(`/api/v1/leadership/scheduled-reports/${id}`),
};

// ── Constants ────────────────────────────────────────────────────────────────

const REPORT_TYPES = [
  { id: "student-progress", label: "Student Progress",      desc: "Individual performance tracking across all courses."             },
  { id: "ai-impact",        label: "AI Interaction Impact", desc: "Correlation between AI tutoring and learning outcomes."           },
  { id: "completion",       label: "Completion Rates",      desc: "Aggregated data on course completion and drop-off points."       },
  { id: "engagement",       label: "Engagement Metrics",    desc: "User activity levels, time-spent, and platform participation."   },
];

const FORMATS = [
  { id: "CSV",  icon: "table_chart",    label: "CSV"  },
  { id: "WORD", icon: "description",    label: "Word" },
];

const FORMAT_BADGE = {
  CSV:  "bg-emerald-100 text-emerald-700",
  PDF:  "bg-red-100 text-red-700",
  PPT:  "bg-orange-100 text-orange-700",
  PPTX: "bg-orange-100 text-orange-700",
  WORD: "bg-blue-100 text-blue-700",
  DOCX: "bg-blue-100 text-blue-700",
  XLSX: "bg-teal-100 text-teal-700",
};

const FREQ_LABEL = {
  weekly:    "Every Monday",
  monthly:   "1st of Month",
  quarterly: "Every 90 Days",
};

// DEMO FALLBACK — remove after DB has real data
const DEMO_REPORTS = [
  { id: 901, name: "Q1 Course Completion Analysis", date: "Mar 10, 2026", type: "PDF", size: "1.2 MB", category: "completion" },
  { id: 902, name: "Student Progress Summary", date: "Mar 09, 2026", type: "CSV", size: "845 KB", category: "student-progress" },
  { id: 903, name: "Learner Engagement Metrics", date: "Mar 05, 2026", type: "CSV", size: "2.1 MB", category: "engagement" }
];

const DEMO_SCHEDULED = [
  { id: 801, name: "Weekly Executive Summary", report_type: "student-progress", frequency: "weekly", next_run: "2026-03-16T08:00:00" },
  { id: 802, name: "Monthly AI Impact Report", report_type: "ai-impact", frequency: "monthly", next_run: "2026-04-01T09:00:00" }
];

const DEMO_INSIGHTS = [
  {
    icon: "trending_up", bg: "bg-emerald-100", text: "text-emerald-700",
    title: "Engagement Trend",
    desc: "Active users up 12% vs last month (452 active this month)."
  },
  {
    icon: "warning", bg: "bg-amber-100", text: "text-amber-700",
    title: "At-Risk Alert",
    desc: "3 student(s) below 30% progress. Consider intervention."
  },
  {
    icon: "psychology", bg: "bg-blue-100", text: "text-blue-700",
    title: "Action Recommended",
    desc: "'Advanced Backend Concepts' has the lowest avg score (62%). Review content."
  }
];
// END DEMO FALLBACK

// ── Tiny toast hook ───────────────────────────────────────────────────────────

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  }, []);
  return { toasts, toast: add };
}

function ToastStack({ toasts }) {
  return (
    <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl
          text-[13px] font-medium text-white pointer-events-auto
          animate-[slideUp_0.3s_ease]
          ${t.type === "error" ? "bg-red-600" : "bg-slate-900"}`}>
          <span className="material-symbols-outlined text-[15px]">
            {t.type === "error" ? "error" : "check_circle"}
          </span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

const Sk = ({ className = "" }) => (
  <div className={`animate-pulse bg-slate-100 rounded-lg ${className}`} />
);

// ── Download helper ───────────────────────────────────────────────────────────

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function extFor(fmt) {
  const m = { CSV: "csv", PDF: "pdf", PPT: "pptx", PPTX: "pptx", WORD: "docx", DOCX: "docx" };
  return m[fmt?.toUpperCase()] || "csv";
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export default function Analytics() {
  const navigate        = useNavigate();
  const { toasts, toast } = useToast();

  // ── Remote data
  const [reports,       setReports]       = useState([]);
  const [insights,      setInsights]      = useState([]);
  const [scheduled,     setScheduled]     = useState([]);

  // ── Loading flags
  const [loadReports,   setLoadReports]   = useState(true);
  const [loadInsights,  setLoadInsights]  = useState(true);
  const [loadScheduled, setLoadScheduled] = useState(true);

  // ── Generate form
  const [selType,    setSelType]    = useState("student-progress");
  const [selFormat,  setSelFormat]  = useState("CSV");
  const [dateFrom,   setDateFrom]   = useState("2026-01-01");
  const [dateTo,     setDateTo]     = useState("2026-03-11");
  const [generating, setGenerating] = useState(false);

  // ── Email modal
  const [emailOpen,    setEmailOpen]    = useState(false);
  const [emailTo,      setEmailTo]      = useState("");
  const [emailSubject, setEmailSubject] = useState("Leadership Report – Mar 2026");
  const [emailMsg,     setEmailMsg]     = useState("");
  const [sending,      setSending]      = useState(false);

  // ── Schedule modal
  const [schedOpen,  setSchedOpen]  = useState(false);
  const [schedName,  setSchedName]  = useState("");
  const [schedType,  setSchedType]  = useState("student-progress");
  const [schedFreq,  setSchedFreq]  = useState("weekly");
  const [schedNext,  setSchedNext]  = useState("2026-03-17T08:00");
  const [savingSch,  setSavingSch]  = useState(false);

  // ── Download in-progress set (per report id)
  const [dlSet, setDlSet] = useState(new Set());
  
  // ── Delete in-progress set (per report id)
  const [delSet, setDelSet] = useState(new Set());

  // ─── Fetch on mount ───────────────────────────────────────────────────────

  useEffect(() => {
    leadershipApi.getReports()
      .then(r => setReports(r.length > 0 ? r : DEMO_REPORTS))
      .catch(() => {
        toast("Using demo reports", "success");
        setReports(DEMO_REPORTS);
      })
      .finally(() => setLoadReports(false));

    leadershipApi.getAiInsights()
      .then(r => {
        // The endpoint returns exactly 3 insight cards, but they might indicate "zero" data.
        // Let's identify if it's returning empty real values so we can force the demo fallback.
        const hasRealData = r && r.length === 3 && r[0].desc.includes("0 active") === false;
        setInsights(hasRealData ? r : DEMO_INSIGHTS);
      })
      .catch(() => {
        toast("Using demo insights", "success");
        setInsights(DEMO_INSIGHTS);
      })
      .finally(() => setLoadInsights(false));

    leadershipApi.getScheduled()
      .then(r => setScheduled(r.length > 0 ? r : DEMO_SCHEDULED))
      .catch(() => {
        toast("Using demo schedules", "success");
        setScheduled(DEMO_SCHEDULED);
      })
      .finally(() => setLoadScheduled(false));
  }, [toast]);

  // ─── Generate report ──────────────────────────────────────────────────────

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await leadershipApi.generateReport({
        report_type: selType,
        format:      selFormat,
        date_from:   dateFrom,
        date_to:     dateTo,
      });
      triggerDownload(res.data, `${selType}_report.${extFor(selFormat)}`);
      toast(`✅ ${selFormat} report downloaded!`);
      // Refresh the Recent Reports table
      leadershipApi.getReports().then(setReports).catch(() => {});
    } catch (err) {
      let msg = "Report generation failed";
      // If the backend returned a 400/500 as a Blob, we must parse it to read the JSON .detail
      if (err?.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          msg = JSON.parse(text).detail || msg;
        } catch (_) {}
      } else if (err?.response?.data?.detail) {
        msg = err.response.data.detail;
      }
      toast(msg, "error");
    } finally {
      setGenerating(false);
    }
  };

  // ─── Download existing report ─────────────────────────────────────────────

  const handleDownload = async (r) => {
    setDlSet(p => new Set(p).add(r.id));
    try {
      const res = await leadershipApi.downloadReport(r.id);
      triggerDownload(res.data, `${r.name.replace(/\s+/g, "_")}.${extFor(r.type)}`);
      toast("Download started!");
    } catch (err) {
      let msg = "Download failed";
      if (err?.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          msg = JSON.parse(text).detail || msg;
        } catch (_) {}
      } else if (err?.response?.data?.detail) {
        msg = err.response.data.detail;
      }
      toast(msg, "error");
    } finally {
      setDlSet(p => { const s = new Set(p); s.delete(r.id); return s; });
    }
  };

  // ─── Delete existing report ─────────────────────────────────────────────

  const handleDeleteReport = async (r) => {
    setDelSet(p => new Set(p).add(r.id));
    try {
      // If it exists in demo data but not real DB, we can just remove it from state
      // but let's always attempt DB delete first.
      try {
         await leadershipApi.deleteReport(r.id);
      } catch (err) {
         // Silently allow front-end delete if demo response fails DB check
         if (err?.response?.status !== 404) throw err;
      }
      setReports(p => p.filter(rpt => rpt.id !== r.id));
      toast("Report deleted");
    } catch {
      toast("Delete failed", "error");
    } finally {
      setDelSet(p => { const s = new Set(p); s.delete(r.id); return s; });
    }
  };

  // ─── Send email ───────────────────────────────────────────────────────────

  const handleSendEmail = async () => {
    if (!emailTo.trim()) { toast("Enter at least one recipient", "error"); return; }
    setSending(true);
    try {
      await leadershipApi.emailReport({
        recipients: emailTo,
        subject:    emailSubject,
        message:    emailMsg,
      });
      toast("Report emailed successfully!");
      setEmailOpen(false);
    } catch (err) {
      toast(err?.response?.data?.detail || "Email failed", "error");
    } finally {
      setSending(false);
    }
  };

  // ─── Create schedule ──────────────────────────────────────────────────────

  const handleCreateSchedule = async () => {
    if (!schedName.trim()) { toast("Enter a schedule name", "error"); return; }
    setSavingSch(true);
    try {
      await leadershipApi.createScheduled({
        name:        schedName,
        report_type: schedType,
        frequency:   schedFreq,
        next_run:    schedNext,
      });
      const fresh = await leadershipApi.getScheduled();
      setScheduled(fresh);
      toast("Schedule created!");
      setSchedOpen(false);
      setSchedName("");
    } catch {
      toast("Failed to create schedule", "error");
    } finally {
      setSavingSch(false);
    }
  };

  // ─── Delete schedule ──────────────────────────────────────────────────────

  const handleDeleteSchedule = async (id) => {
    try {
      await leadershipApi.deleteScheduled(id);
      setScheduled(p => p.filter(s => s.id !== id));
      toast("Schedule removed");
    } catch {
      toast("Delete failed", "error");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <LeadershipShell title="Reports & Analytics">
      <style>{`
        @keyframes slideUp { from { opacity:0;transform:translateY(10px); } to { opacity:1;transform:translateY(0); } }
      `}</style>

      <ToastStack toasts={toasts} />

      <div className="space-y-5">

        {/* ── Page header ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[22px] font-bold text-slate-900">Reports & Analytics</h2>
            <p className="text-slate-500 text-[13px] mt-0.5">
              Generate AI-powered insights and track organisational performance.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ════════════════════════════════════════
              LEFT — Builder + Recent Reports
          ════════════════════════════════════════ */}
          <div className="lg:col-span-2 space-y-5">

            {/* ── Generate New Report ── */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-[#137fec] text-[20px]">bar_chart</span>
                <h3 className="text-[15px] font-bold">Generate New Report</h3>
              </div>

              {/* Step 1 — Report Type */}
              <div className="mb-5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                  1. Select Report Type
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {REPORT_TYPES.map(({ id, label, desc }) => (
                    <label
                      key={id}
                      onClick={() => setSelType(id)}
                      className={`border rounded-xl p-4 cursor-pointer transition-all
                        ${selType === id
                          ? "border-[#137fec] bg-[#137fec]/5 shadow-sm"
                          : "border-slate-200 hover:border-slate-300"}`}
                    >
                      <div className="flex items-start gap-2">
                        <span className={`size-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center
                          ${selType === id ? "border-[#137fec]" : "border-slate-300"}`}>
                          {selType === id && <span className="size-2 rounded-full bg-[#137fec] block" />}
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

              {/* Step 2 — Date range */}
              <div className="mb-5">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                  2. Date Range
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["From", dateFrom, setDateFrom],
                    ["To",   dateTo,   setDateTo  ],
                  ].map(([lbl, val, setVal]) => (
                    <div key={lbl}>
                      <label className="text-[12px] font-medium text-slate-600 mb-1.5 block">
                        {lbl}
                      </label>
                      <input
                        type="date"
                        value={val}
                        onChange={e => setVal(e.target.value)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[13px]
                          outline-none focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]
                          transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 3 — Format */}
              <div className="mb-6">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                  3. Format & Delivery
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {FORMATS.map(({ id, icon, label }) => (
                    <button
                      key={id}
                      onClick={() => setSelFormat(id)}
                      className={`flex flex-col items-center gap-1.5 p-3 border rounded-xl transition-all
                        ${selFormat === id
                          ? "border-[#137fec] bg-[#137fec]/5 text-[#137fec] shadow-sm"
                          : "border-slate-200 text-slate-400 hover:border-slate-300"}`}
                    >
                      <span className="material-symbols-outlined text-[22px]">{icon}</span>
                      <span className="text-[11px] font-bold">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#137fec] text-white
                    py-3 rounded-xl font-bold text-[14px] hover:bg-[#0d6bbf] active:scale-[.98]
                    transition-all disabled:opacity-60 disabled:cursor-not-allowed
                    shadow-sm shadow-[#137fec]/30"
                >
                  {generating ? (
                    <><Spinner /> Generating…</>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">description</span>
                      Compile &amp; Generate Report
                    </>
                  )}
                </button>
                <button
                  onClick={() => setEmailOpen(true)}
                  className="flex items-center gap-2 border border-slate-300 text-slate-700 px-4 py-3
                    rounded-xl font-semibold text-[13px] hover:bg-slate-50 active:scale-[.98]
                    transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">mail</span>
                  Email
                </button>
              </div>
            </Card>

            {/* ── Recent Reports Table ── */}
            <Card className="overflow-hidden p-0">
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <h3 className="text-[15px] font-bold">Recent Reports</h3>
                <span className="text-[11px] text-slate-400 font-medium">
                  {reports.length} report{reports.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {["Report Name", "Generated", "Format", "Size", "Action"].map(h => (
                        <th
                          key={h}
                          className={`text-[11px] font-bold uppercase tracking-wider text-slate-400
                            px-4 py-3 ${h === "Action" ? "text-right" : "text-left"}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loadReports ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                          {Array.from({ length: 5 }).map((_, j) => (
                            <td key={j} className="px-4 py-3.5">
                              <Sk className="h-4 w-full" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : reports.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center">
                          <span className="material-symbols-outlined text-[40px] text-slate-200 block mb-2">
                            folder_open
                          </span>
                          <p className="text-slate-400 text-[13px]">
                            No reports yet. Generate one above.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      reports.map(r => (
                        <tr key={r.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-4 py-3.5 font-medium text-slate-800">{r.name}</td>
                          <td className="px-4 py-3.5 text-slate-500">{r.date}</td>
                          <td className="px-4 py-3.5">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded
                              ${FORMAT_BADGE[r.type?.toUpperCase()] || "bg-slate-100 text-slate-600"}`}>
                              {r.type}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-slate-400 text-[12px]">{r.size}</td>
                          <td className="px-4 py-3.5 text-right flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleDownload(r)}
                              disabled={dlSet.has(r.id)}
                              className="inline-flex items-center gap-1.5 text-[12px] font-semibold
                                text-[#137fec] hover:text-[#0d6bbf] px-2.5 py-1.5 rounded-lg
                                hover:bg-[#137fec]/8 transition-all disabled:opacity-50"
                            >
                              {dlSet.has(r.id)
                                ? <Spinner />
                                : <span className="material-symbols-outlined text-[15px]">download</span>
                              }
                              {dlSet.has(r.id) ? "…" : "Download"}
                            </button>
                            <button
                              onClick={() => handleDeleteReport(r)}
                              disabled={delSet.has(r.id)}
                              className="inline-flex items-center text-[12px] font-semibold
                                text-red-500 hover:text-red-600 px-2 py-1.5 rounded-lg
                                hover:bg-red-50 transition-all disabled:opacity-50"
                              title="Delete Report"
                            >
                              {delSet.has(r.id)
                                ? <Spinner />
                                : <span className="material-symbols-outlined text-[15px]">delete</span>
                              }
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* ════════════════════════════════════════
              RIGHT SIDEBAR
          ════════════════════════════════════════ */}
          <div className="space-y-5">

            {/* ── AI Key Insights ── */}
            <Card className="p-5">
              <h3 className="text-[14px] font-bold flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[#137fec] text-[18px]">auto_awesome</span>
                AI Key Insights
              </h3>
              <div className="space-y-3">
                {loadInsights ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-3 p-3">
                      <Sk className="size-8 shrink-0 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Sk className="h-3 w-1/2" />
                        <Sk className="h-3 w-full" />
                      </div>
                    </div>
                  ))
                ) : insights.length === 0 ? (
                  <p className="text-[12px] text-slate-400 text-center py-4">No insights available.</p>
                ) : (
                  insights.map(({ icon, bg, text, title, desc }) => (
                    <div
                      key={title}
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50
                        transition-colors cursor-pointer group"
                    >
                      <div className={`p-1.5 rounded-lg ${bg} shrink-0 group-hover:scale-110 transition-transform`}>
                        <span className={`material-symbols-outlined text-[16px] ${text}`}>{icon}</span>
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold">{title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <button
                className="mt-3 w-full py-2 border border-[#137fec]/30 text-[#137fec] text-[13px]
                  font-semibold rounded-xl hover:bg-[#137fec]/5 transition-colors"
              >
                Full Monthly Analysis
              </button>
            </Card>

            {/* ── Scheduled Reports ── */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[14px] font-bold">Scheduled Reports</h3>
                <button
                  onClick={() => setSchedOpen(true)}
                  className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-400
                    hover:text-[#137fec]"
                  title="Add schedule"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
              </div>
              <div className="space-y-3">
                {loadScheduled ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex justify-between items-center gap-3">
                      <div className="space-y-1.5 flex-1">
                        <Sk className="h-3 w-2/3" />
                        <Sk className="h-2.5 w-1/2" />
                      </div>
                      <Sk className="h-6 w-12" />
                    </div>
                  ))
                ) : scheduled.length === 0 ? (
                  <p className="text-[12px] text-slate-400 text-center py-3">
                    No schedules. Click + to add one.
                  </p>
                ) : (
                  scheduled.map(s => (
                    <div key={s.id} className="flex items-center justify-between group">
                      <div>
                        <p className="text-[13px] font-semibold">{s.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
                          {FREQ_LABEL[s.frequency] || s.frequency}
                          {s.next_run && (
                            <> · {new Date(s.next_run).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleDeleteSchedule(s.id)}
                          className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500
                            transition-colors"
                          title="Remove"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
          EMAIL MODAL
      ════════════════════════════════════════════════════════════ */}
      {emailOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && setEmailOpen(false)}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-[slideUp_0.25s_ease]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-[15px] font-bold">Email Report</h3>
              <button
                onClick={() => setEmailOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {[
                { label: "Recipients", val: emailTo,      set: setEmailTo,      ph: "email@example.com, email2@…" },
                { label: "Subject",    val: emailSubject, set: setEmailSubject, ph: "Report subject…"             },
              ].map(({ label, val, set, ph }) => (
                <div key={label}>
                  <label className="text-[12px] font-medium text-slate-600 mb-1.5 block">{label}</label>
                  <input
                    value={val}
                    onChange={e => set(e.target.value)}
                    placeholder={ph}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[13px]
                      outline-none focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]
                      transition-all"
                  />
                </div>
              ))}
              <div>
                <label className="text-[12px] font-medium text-slate-600 mb-1.5 block">Message</label>
                <textarea
                  rows={3}
                  value={emailMsg}
                  onChange={e => setEmailMsg(e.target.value)}
                  placeholder="Optional message…"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[13px]
                    outline-none focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]
                    transition-all resize-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100">
              <Btn variant="secondary" onClick={() => setEmailOpen(false)}>Cancel</Btn>
              <Btn onClick={handleSendEmail} disabled={sending}>
                {sending ? <Spinner /> : <span className="material-symbols-outlined text-[16px]">send</span>}
                Send
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════
          SCHEDULE MODAL
      ════════════════════════════════════════════════════════════ */}
      {schedOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && setSchedOpen(false)}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-[slideUp_0.25s_ease]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-[15px] font-bold">New Scheduled Report</h3>
              <button
                onClick={() => setSchedOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="text-[12px] font-medium text-slate-600 mb-1.5 block">Schedule Name</label>
                <input
                  value={schedName}
                  onChange={e => setSchedName(e.target.value)}
                  placeholder="e.g. Executive Weekly"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[13px]
                    outline-none focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]
                    transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[12px] font-medium text-slate-600 mb-1.5 block">Report Type</label>
                  <select
                    value={schedType}
                    onChange={e => setSchedType(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[13px]
                      outline-none focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]
                      transition-all bg-white"
                  >
                    {REPORT_TYPES.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[12px] font-medium text-slate-600 mb-1.5 block">Frequency</label>
                  <select
                    value={schedFreq}
                    onChange={e => setSchedFreq(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[13px]
                      outline-none focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]
                      transition-all bg-white"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[12px] font-medium text-slate-600 mb-1.5 block">First Run</label>
                <input
                  type="datetime-local"
                  value={schedNext}
                  onChange={e => setSchedNext(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-[13px]
                    outline-none focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]
                    transition-all"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100">
              <Btn variant="secondary" onClick={() => setSchedOpen(false)}>Cancel</Btn>
              <Btn onClick={handleCreateSchedule} disabled={savingSch}>
                {savingSch
                  ? <Spinner />
                  : <span className="material-symbols-outlined text-[16px]">schedule</span>
                }
                Create Schedule
              </Btn>
            </div>
          </div>
        </div>
      )}
    </LeadershipShell>
  );
}
