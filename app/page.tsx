import React from "react";

export default function HomePage() {
  return (
    <div className="container" style={{ maxWidth: 860 }}>
      {/* Hero */}
      <div style={{ textAlign: "center", padding: "40px 0 30px" }}>
        <span className="badge badge-blue" style={{ marginBottom: 12 }}>
          CSE 594: DESIGNING AI-ASSISTED TASKS • ASSIGNMENT 3
        </span>
        <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.02em", margin: "12px 0 16px" }}>
          Sneaker & Streetwear &quot;Legit Check&quot; Study
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 16, maxWidth: 640, margin: "0 auto", lineHeight: 1.6 }}>
          Investigating Human-AI Complementarity in rapid counterfeit authentication across
          high-demand collectible sneakers. Compare your inspection accuracy with and without AI telemetry.
        </p>
      </div>

      {/* Two Study Condition Cards for Classmates */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 36 }}>
        {/* Condition 1: Without AI */}
        <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span className="badge" style={{ background: "rgba(148, 163, 184, 0.2)", color: "#cbd5e1" }}>
                CONDITION 1
              </span>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>~5–7 mins</span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Without AI (Baseline)</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
              Evaluate 10 sneaker trials relying purely on your visual inspection skills and domain knowledge.
              Tests human baseline accuracy against counterfeit super-clones.
            </p>
          </div>
          <a
            href="/without-ai"
            className="btn"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border)",
              color: "white",
              width: "100%",
              padding: "12px",
            }}
          >
            Launch Baseline Condition →
          </a>
        </div>

        {/* Condition 2: With AI */}
        <div
          className="card"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            borderColor: "rgba(59, 130, 246, 0.4)",
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span className="badge badge-blue">CONDITION 2</span>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>~5–7 mins</span>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>With AI (Assisted)</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
              Evaluate 10 sneaker trials augmented by <strong>SneakerAuthNet</strong>.
              Consult real-time micro-metrics (stitch density, barcode kerning, trademark bleed) on-demand.
            </p>
          </div>
          <a
            href="/with-ai"
            className="btn btn-primary"
            style={{
              width: "100%",
              padding: "12px",
            }}
          >
            Launch AI-Assisted Condition →
          </a>
        </div>
      </div>

      {/* Inspection Zone Guide */}
      <div className="card" style={{ marginBottom: 36 }}>
        <h3 style={{ fontSize: 17, fontWeight: "bold", marginBottom: 14, color: "var(--accent-cyan)" }}>
          🔍 Reference Guide: The 4 Diagnostic Inspection Zones
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 13 }}>
          <div style={{ background: "var(--bg-secondary)", padding: 12, borderRadius: 8 }}>
            <strong style={{ color: "white" }}>1. Heel Stitching & Hourglass:</strong>
            <p style={{ color: "var(--text-muted)", marginTop: 4 }}>
              Authentic pairs exhibit 9.4–10.4 stitches/in and a distinct anatomical taper. Replicas show loose stitching and flat counters.
            </p>
          </div>
          <div style={{ background: "var(--bg-secondary)", padding: 12, borderRadius: 8 }}>
            <strong style={{ color: "white" }}>2. Size Tag & Barcode Kerning:</strong>
            <p style={{ color: "var(--text-muted)", marginTop: 4 }}>
              Authentic tags use sharp factory font die-stamps with clean UPC spacing. Replicas frequently feature bolded, bleeding digits.
            </p>
          </div>
          <div style={{ background: "var(--bg-secondary)", padding: 12, borderRadius: 8 }}>
            <strong style={{ color: "white" }}>3. Tongue Tag & Trademark Bleed:</strong>
            <p style={{ color: "var(--text-muted)", marginTop: 4 }}>
              Authentic woven labels have a clear central aperture inside the (R) circle. Replicas show thread bleed and smudged letters.
            </p>
          </div>
          <div style={{ background: "var(--bg-secondary)", padding: 12, borderRadius: 8 }}>
            <strong style={{ color: "white" }}>4. Toe Box Perforation & Grain:</strong>
            <p style={{ color: "var(--text-muted)", marginTop: 4 }}>
              Authentic pairs feature precision circular punch dies (1.1–1.25mm) with clean margins. Replicas show burrs and synthetic plastic sheen.
            </p>
          </div>
        </div>
      </div>

      {/* Admin / Results Bar */}
      <div style={{ textAlign: "center", fontSize: 14, color: "var(--text-muted)" }}>
        Are you the study administrator?{" "}
        <a href="/admin" style={{ color: "var(--accent-cyan)", textDecoration: "underline" }}>
          Access Admin Dashboard & Export Collected Study Data (.CSV)
        </a>
      </div>
    </div>
  );
}

