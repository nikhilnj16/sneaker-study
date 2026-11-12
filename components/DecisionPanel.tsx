"use client";

import React, { useState, useEffect } from "react";

interface DecisionPanelProps {
  onSubmit: (decision: string, confidence: number, reactionTimeMs: number) => void;
  trialIndex: number;
  totalTrials: number;
}

export default function DecisionPanel({
  onSubmit,
  trialIndex,
  totalTrials,
}: DecisionPanelProps) {
  const [decision, setDecision] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());

  useEffect(() => {
    // Reset state and restart reaction timer on new trial
    setDecision(null);
    setConfidence(null);
    setStartTime(Date.now());
  }, [trialIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!decision || !confidence) return;
    const reactionTime = Date.now() - startTime;
    onSubmit(decision, confidence, reactionTime);
  };

  const confidenceLevels = [
    { value: 1, label: "1 - Pure Guess" },
    { value: 2, label: "2 - Low" },
    { value: 3, label: "3 - Moderate" },
    { value: 4, label: "4 - High" },
    { value: 5, label: "5 - Absolute Certainty" },
  ];

  return (
    <form onSubmit={handleSubmit} className="card" style={{ marginTop: 20 }}>
      {/* Step 1: Binary Authentication Decision */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <strong style={{ fontSize: 15 }}>1. Final Authentication Verdict</strong>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Select one</span>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <button
            type="button"
            className={`btn btn-auth ${decision === "Authentic" ? "selected" : ""}`}
            onClick={() => setDecision("Authentic")}
          >
            ✓ Authentic (Retail Pair)
          </button>
          <button
            type="button"
            className={`btn btn-rep ${decision === "Replica" ? "selected" : ""}`}
            onClick={() => setDecision("Replica")}
          >
            ✗ Replica (Counterfeit)
          </button>
        </div>
      </div>

      {/* Step 2: 5-Point Likert Confidence Rating */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <strong style={{ fontSize: 15 }}>2. Self-Reported Decision Confidence</strong>
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>5-point Likert scale</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {confidenceLevels.map((lvl) => (
            <button
              key={lvl.value}
              type="button"
              className={`likert-btn ${confidence === lvl.value ? "selected" : ""}`}
              onClick={() => setConfidence(lvl.value)}
            >
              <div style={{ fontSize: 18, fontWeight: "bold" }}>{lvl.value}</div>
              <div style={{ fontSize: 11, marginTop: 4 }}>{lvl.label.split(" - ")[1]}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Submit Trial Button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
          Trial {trialIndex} of {totalTrials}
        </div>
        <button
          type="submit"
          disabled={!decision || !confidence}
          className="btn btn-primary"
          style={{
            padding: "12px 28px",
            fontSize: 16,
            opacity: !decision || !confidence ? 0.4 : 1,
            cursor: !decision || !confidence ? "not-allowed" : "pointer",
          }}
        >
          Submit Verdict & Next Trial →
        </button>
      </div>
    </form>
  );
}

