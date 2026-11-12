"use client";

import React, { useState, useEffect } from "react";

interface AiTelemetryCardProps {
  prediction: string;
  confidence: number;
  inspectionNotes: string;
  onConsult: (latencyMs: number) => void;
  alreadyConsulted: boolean;
}

export default function AiTelemetryCard({
  prediction,
  confidence,
  inspectionNotes,
  onConsult,
  alreadyConsulted,
}: AiTelemetryCardProps) {
  const [revealed, setRevealed] = useState<boolean>(alreadyConsulted);
  const [mountTime, setMountTime] = useState<number>(Date.now());

  useEffect(() => {
    setRevealed(alreadyConsulted);
    setMountTime(Date.now());
  }, [alreadyConsulted, prediction, inspectionNotes]);

  const handleReveal = () => {
    const latency = Date.now() - mountTime;
    setRevealed(true);
    onConsult(latency);
  };

  const confidencePct = Math.round(confidence * 1000) / 10;
  const isAuth = prediction === "Authentic";

  if (!revealed) {
    return (
      <div
        style={{
          background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.9))",
          border: "1px dashed var(--border)",
          borderRadius: 12,
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>🤖</span>
            <strong style={{ fontSize: 15 }}>SneakerAuthNet AI Diagnostic Caliper</strong>
            <span className="badge badge-blue">Ready</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
            Examines micro-metrics (stitch density, barcode kerning, font bleed) and flags deviations.
          </p>
        </div>
        <button
          type="button"
          onClick={handleReveal}
          className="btn btn-primary"
          style={{ padding: "10px 18px", fontSize: 14 }}
        >
          🔍 Consult AI Telemetry
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #131d33 0%, #162444 100%)",
        border: `1.5px solid ${isAuth ? "rgba(16, 185, 129, 0.5)" : "rgba(239, 68, 68, 0.5)"}`,
        borderRadius: 12,
        padding: "20px",
        marginBottom: 20,
        boxShadow: `0 8px 24px ${isAuth ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)"}`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🤖</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.01em" }}>
              SneakerAuthNet AI Telemetry
            </div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>PyTorch ResNet-10 Calibrated Inference</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span
            className="badge"
            style={{
              fontSize: 13,
              padding: "6px 14px",
              background: isAuth ? "var(--auth-green)" : "var(--rep-red)",
              color: "white",
            }}
          >
            AI RECOMMENDATION: {prediction.toUpperCase()}
          </span>
          <span className="badge badge-blue" style={{ fontSize: 13, padding: "6px 10px" }}>
            {confidencePct}% CONFIDENCE
          </span>
        </div>
      </div>

      {/* Confidence gauge bar */}
      <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden", marginBottom: 12 }}>
        <div
          style={{
            height: "100%",
            width: `${confidencePct}%`,
            background: isAuth ? "var(--auth-green)" : "var(--rep-red)",
            transition: "width 0.5s ease",
          }}
        />
      </div>

      {/* Extracted physical measurements */}
      <div
        style={{
          background: "rgba(0, 0, 0, 0.35)",
          borderRadius: 8,
          padding: "10px 14px",
          fontFamily: "monospace",
          fontSize: 13,
          color: "#e2e8f0",
          borderLeft: `3px solid ${isAuth ? "var(--auth-green)" : "var(--rep-red)"}`,
          marginBottom: 10,
        }}
      >
        <span style={{ color: "var(--accent-cyan)", fontWeight: "bold" }}>TELEMETRY EXTRACTED: </span>
        {inspectionNotes}
      </div>

      {/* Epistemic disclaimer for human-in-the-loop */}
      <div style={{ fontSize: 12, color: "var(--warning-amber)", display: "flex", alignItems: "center", gap: 6 }}>
        <span>⚠</span>
        <span>
          <strong>Human Oversight Required:</strong> SneakerAuthNet cannot account for authentic factory QC variances or lens glare. Verify against visual evidence before submitting.
        </span>
      </div>
    </div>
  );
}

