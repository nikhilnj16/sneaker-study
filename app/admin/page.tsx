"use client";

import React, { useEffect, useState } from "react";

export default function AdminPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/export?format=json");
      const json = await res.json();
      setData(json || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalTrials = data.length;
  const uniqueParticipants = Array.from(new Set(data.map((r) => r.participant_name))).filter(Boolean);

  const withoutAiRows = data.filter((r) => r.condition === "without-ai");
  const withAiRows = data.filter((r) => r.condition === "with-ai");

  const calcAcc = (rows: any[]) => {
    if (!rows.length) return "N/A";
    const nonAttn = rows.filter((r) => !r.trial_id?.startsWith("ATTN_CHECK"));
    if (!nonAttn.length) return "N/A";
    const correct = nonAttn.filter((r) => r.is_human_correct).length;
    return `${Math.round((correct / nonAttn.length) * 100)}% (${correct}/${nonAttn.length})`;
  };

  const calcMeanConf = (rows: any[]) => {
    if (!rows.length) return "N/A";
    const sum = rows.reduce((acc, r) => acc + (Number(r.confidence_rating) || 0), 0);
    return (sum / rows.length).toFixed(2);
  };

  const calcMeanTime = (rows: any[]) => {
    if (!rows.length) return "N/A";
    const sum = rows.reduce((acc, r) => acc + (Number(r.reaction_time_ms) || 0), 0);
    return `${((sum / rows.length) / 1000).toFixed(1)}s`;
  };

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <span className="badge badge-blue">STUDY TELEMETRY CONSOLE</span>
          <h1 style={{ fontSize: 26, fontWeight: 900, marginTop: 4 }}>Assignment 3 Research Dashboard</h1>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="button"
            onClick={fetchData}
            className="btn"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)", color: "white", padding: "10px 16px" }}
          >
            ↻ Refresh Data
          </button>
          <a
            href="/api/export"
            download
            className="btn btn-primary"
            style={{ padding: "10px 18px", fontSize: 14 }}
          >
            ⬇ Export Collected CSV
          </a>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase" }}>Total Participants</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "var(--accent-cyan)", marginTop: 4 }}>
            {uniqueParticipants.length}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Target: ≥ 5 per condition</div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase" }}>Total Trials Logged</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "white", marginTop: 4 }}>
            {totalTrials}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>~11 trials/participant</div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase" }}>Baseline Accuracy</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "var(--warning-amber)", marginTop: 4 }}>
            {calcAcc(withoutAiRows)}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Human-only condition</div>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase" }}>AI-Assisted Accuracy</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: "var(--auth-green)", marginTop: 4 }}>
            {calcAcc(withAiRows)}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Human-AI joint condition</div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="card" style={{ marginBottom: 28 }}>
        <h3 style={{ fontSize: 16, fontWeight: "bold", marginBottom: 12 }}>
          Condition Metrics Summary (For Assignment 3 Part 2 Report)
        </h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left", color: "var(--text-muted)" }}>
              <th style={{ padding: "10px 12px" }}>Condition</th>
              <th style={{ padding: "10px 12px" }}>Sample Rows</th>
              <th style={{ padding: "10px 12px" }}>Accuracy</th>
              <th style={{ padding: "10px 12px" }}>Mean Confidence (1–5)</th>
              <th style={{ padding: "10px 12px" }}>Mean Reaction Time</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <td style={{ padding: "12px", fontWeight: "bold" }}>Without AI (Baseline)</td>
              <td style={{ padding: "12px" }}>{withoutAiRows.length}</td>
              <td style={{ padding: "12px", color: "var(--warning-amber)" }}>{calcAcc(withoutAiRows)}</td>
              <td style={{ padding: "12px" }}>{calcMeanConf(withoutAiRows)}</td>
              <td style={{ padding: "12px" }}>{calcMeanTime(withoutAiRows)}</td>
            </tr>
            <tr>
              <td style={{ padding: "12px", fontWeight: "bold" }}>With AI (Assisted)</td>
              <td style={{ padding: "12px" }}>{withAiRows.length}</td>
              <td style={{ padding: "12px", color: "var(--auth-green)" }}>{calcAcc(withAiRows)}</td>
              <td style={{ padding: "12px" }}>{calcMeanConf(withAiRows)}</td>
              <td style={{ padding: "12px" }}>{calcMeanTime(withAiRows)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Submissions Log Table */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: "bold" }}>Recent Trial Submissions Log</h3>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Showing latest {Math.min(data.length, 50)} records</span>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 24, color: "var(--text-muted)" }}>Loading records...</div>
        ) : data.length === 0 ? (
          <div style={{ textAlign: "center", padding: 36, color: "var(--text-muted)" }}>
            No participant submissions recorded yet. Share your study links with classmates to collect responses!
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left", color: "var(--text-muted)" }}>
                  <th style={{ padding: 8 }}>Participant</th>
                  <th style={{ padding: 8 }}>Condition</th>
                  <th style={{ padding: 8 }}>Trial ID</th>
                  <th style={{ padding: 8 }}>Model</th>
                  <th style={{ padding: 8 }}>Verdict</th>
                  <th style={{ padding: 8 }}>Ground Truth</th>
                  <th style={{ padding: 8 }}>Correct?</th>
                  <th style={{ padding: 8 }}>Conf</th>
                  <th style={{ padding: 8 }}>Reaction Time</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(-50).reverse().map((r, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: 8, fontWeight: "bold" }}>{r.participant_name}</td>
                    <td style={{ padding: 8 }}>
                      <span className={`badge ${r.condition === "with-ai" ? "badge-blue" : "badge-amber"}`}>
                        {r.condition}
                      </span>
                    </td>
                    <td style={{ padding: 8, fontFamily: "monospace" }}>{r.trial_id}</td>
                    <td style={{ padding: 8 }}>{r.sneaker_model}</td>
                    <td style={{ padding: 8, color: r.human_prediction === "Authentic" ? "var(--auth-green)" : "var(--rep-red)" }}>
                      {r.human_prediction}
                    </td>
                    <td style={{ padding: 8 }}>{r.ground_truth}</td>
                    <td style={{ padding: 8 }}>
                      {r.is_human_correct ? (
                        <span style={{ color: "var(--auth-green)", fontWeight: "bold" }}>✓ YES</span>
                      ) : (
                        <span style={{ color: "var(--rep-red)", fontWeight: "bold" }}>✗ NO</span>
                      )}
                    </td>
                    <td style={{ padding: 8 }}>{r.confidence_rating}/5</td>
                    <td style={{ padding: 8 }}>{(Number(r.reaction_time_ms) / 1000).toFixed(1)}s</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

