"use client";

import React, { useState } from "react";

interface ViewfinderProps {
  sneakerModel: string;
  inspectionZone: string;
  trialId: string;
  isAttentionCheck?: boolean;
}

export default function InspectionViewfinder({
  sneakerModel,
  inspectionZone,
  trialId,
  isAttentionCheck,
}: ViewfinderProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [highContrast, setHighContrast] = useState<boolean>(false);

  // SVG graphic rendering tailored per inspection zone
  const renderZoneGraphics = () => {
    if (isAttentionCheck) {
      return (
        <svg viewBox="0 0 600 300" style={{ width: "100%", height: "100%" }}>
          <rect width="600" height="300" fill="#1e1b4b" />
          <circle cx="300" cy="110" r="45" fill="#4338ca" />
          <text x="300" y="125" fill="#a5b4fc" fontSize="42" textAnchor="middle" fontWeight="bold">⚠</text>
          <text x="300" y="190" fill="#f8fafc" fontSize="20" textAnchor="middle" fontWeight="bold">
            SYSTEM ATTENTION VERIFICATION CHECK
          </text>
          <text x="300" y="225" fill="#cbd5e1" fontSize="15" textAnchor="middle">
            Please select &quot;Replica&quot; with Confidence 5 to verify your attention.
          </text>
        </svg>
      );
    }

    if (inspectionZone === "Heel_Stitching_and_Hourglass") {
      return (
        <svg viewBox="0 0 600 300" style={{ width: "100%", height: "100%" }}>
          {/* Leather texture background */}
          <rect width="600" height="300" fill="#0f172a" />
          {/* Heel counter curve outline */}
          <path d="M 180 30 Q 240 150 190 280 L 410 280 Q 360 150 420 30 Z" fill="#1e293b" stroke="#334155" strokeWidth="3" />
          {/* Medial hourglass taper */}
          <path d="M 270 40 Q 285 150 260 270" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M 330 40 Q 315 150 340 270" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="4 4" />
          {/* Double lockstitch line */}
          <g stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round">
            {[50, 75, 100, 125, 150, 175, 200, 225, 250].map((y, i) => (
              <React.Fragment key={i}>
                <line x1="292" y1={y} x2="292" y2={y + 14} />
                <line x1="308" y1={y} x2="308" y2={y + 14} />
              </React.Fragment>
            ))}
          </g>
          {/* Optical caliper dimension overlay */}
          <line x1="250" y1="150" x2="350" y2="150" stroke="#06b6d4" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="250" cy="150" r="3" fill="#06b6d4" />
          <circle cx="350" cy="150" r="3" fill="#06b6d4" />
          <text x="300" y="142" fill="#22d3ee" fontSize="12" textAnchor="middle" fontWeight="bold">HEEL APEX TAPER: 1.28mm</text>
        </svg>
      );
    }

    if (inspectionZone === "Size_Tag_and_Barcode_Kerning") {
      return (
        <svg viewBox="0 0 600 300" style={{ width: "100%", height: "100%" }}>
          <rect width="600" height="300" fill="#090d16" />
          {/* Inner size tag fabric canvas */}
          <rect x="130" y="30" width="340" height="240" rx="8" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
          {/* Nike / Jordan Header */}
          <rect x="150" y="50" width="80" height="12" fill="#0f172a" rx="2" />
          <text x="300" y="65" fill="#0f172a" fontSize="14" textAnchor="middle" fontWeight="900">MADE IN VIETNAM</text>
          <text x="300" y="85" fill="#334155" fontSize="12" textAnchor="middle" fontWeight="bold">FABRIQUE AU VIETNAM</text>
          {/* Size grid */}
          <line x1="150" y1="95" x2="450" y2="95" stroke="#cbd5e1" strokeWidth="1.5" />
          <text x="180" y="120" fill="#0f172a" fontSize="18" fontWeight="bold">US 10.5</text>
          <text x="260" y="120" fill="#0f172a" fontSize="18" fontWeight="bold">UK 9.5</text>
          <text x="340" y="120" fill="#0f172a" fontSize="18" fontWeight="bold">EUR 44.5</text>
          <text x="420" y="120" fill="#0f172a" fontSize="18" fontWeight="bold">CM 28.5</text>
          {/* Style Code */}
          <text x="300" y="150" fill="#0f172a" fontSize="15" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
            DZ5485-612 • 10/18/22
          </text>
          {/* UPC Barcode Graphic */}
          <g fill="#0f172a">
            {[
              170, 174, 180, 182, 186, 194, 198, 202, 208, 214, 218, 226, 230, 236, 240, 244,
              252, 258, 264, 270, 274, 282, 290, 296, 302, 310, 318, 324, 332, 340, 346, 354,
              362, 370, 376, 384, 390, 398, 404, 412, 420
            ].map((x, idx) => (
              <rect key={idx} x={x} y="165" width={idx % 3 === 0 ? "3" : "1.8"} height="60" />
            ))}
          </g>
          {/* Barcode digits */}
          <text x="300" y="245" fill="#0f172a" fontSize="13" textAnchor="middle" fontFamily="monospace" letterSpacing="3">
            00196154128504
          </text>
          {/* Red Kerning Caliper */}
          <line x1="285" y1="230" x2="315" y2="230" stroke="#ef4444" strokeWidth="1.5" />
          <circle cx="285" cy="230" r="2.5" fill="#ef4444" />
          <circle cx="315" cy="230" r="2.5" fill="#ef4444" />
        </svg>
      );
    }

    if (inspectionZone === "Tongue_Tag_and_Trademark_Bleed") {
      return (
        <svg viewBox="0 0 600 300" style={{ width: "100%", height: "100%" }}>
          <rect width="600" height="300" fill="#0b1120" />
          {/* Woven nylon tongue patch */}
          <rect x="150" y="40" width="300" height="220" rx="6" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
          {/* Nylon mesh crosshatch texture */}
          <line x1="150" y1="40" x2="450" y2="260" stroke="#b91c1c" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="450" y1="40" x2="150" y2="260" stroke="#b91c1c" strokeWidth="1" strokeDasharray="3 3" />
          {/* Embroidered NIKE Logo */}
          <text x="270" y="125" fill="#ffffff" fontSize="48" fontWeight="900" fontStyle="italic" letterSpacing="-2">
            NIKE
          </text>
          {/* Swoosh shape */}
          <path d="M 210 145 Q 310 135 380 90 Q 320 160 210 145 Z" fill="#ffffff" />
          {/* Trademark (R) Symbol */}
          <g transform="translate(390, 85)">
            <circle cx="12" cy="12" r="10" fill="none" stroke="#ffffff" strokeWidth="2.5" />
            <text x="12" y="16" fill="#ffffff" fontSize="13" textAnchor="middle" fontWeight="bold">R</text>
          </g>
          {/* Magnified Aperture Inspection Circle */}
          <circle cx="402" cy="97" r="38" fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="4 2" />
          <text x="402" y="152" fill="#22d3ee" fontSize="11" textAnchor="middle" fontWeight="bold">® APERTURE: 0.88mm</text>
        </svg>
      );
    }

    // Default: Toe Box Perforation and Grain
    return (
      <svg viewBox="0 0 600 300" style={{ width: "100%", height: "100%" }}>
        <rect width="600" height="300" fill="#0f172a" />
        {/* Curved Toe Box Panel */}
        <path d="M 120 280 C 150 70 450 70 480 280 Z" fill="#1e293b" stroke="#475569" strokeWidth="2.5" />
        {/* Leather pebble texture dots */}
        <g fill="#334155">
          {[
            [200, 160], [240, 130], [280, 110], [320, 110], [360, 130], [400, 160],
            [180, 210], [230, 185], [290, 170], [310, 170], [370, 185], [420, 210],
            [220, 240], [270, 225], [330, 225], [380, 240]
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="2" />
          ))}
        </g>
        {/* Perforation holes arranged in symmetrical radial arcs */}
        <g fill="#090d16" stroke="#64748b" strokeWidth="1.2">
          {/* Arc 1 */}
          <circle cx="300" cy="95" r="7.5" />
          {/* Arc 2 */}
          <circle cx="270" cy="120" r="7.5" />
          <circle cx="330" cy="120" r="7.5" />
          {/* Arc 3 */}
          <circle cx="240" cy="150" r="7.5" />
          <circle cx="300" cy="150" r="7.5" />
          <circle cx="360" cy="150" r="7.5" />
          {/* Arc 4 */}
          <circle cx="210" cy="185" r="7.5" />
          <circle cx="270" cy="185" r="7.5" />
          <circle cx="330" cy="185" r="7.5" />
          <circle cx="390" cy="185" r="7.5" />
          {/* Arc 5 */}
          <circle cx="190" cy="225" r="7.5" />
          <circle cx="250" cy="225" r="7.5" />
          <circle cx="300" cy="225" r="7.5" />
          <circle cx="350" cy="225" r="7.5" />
          <circle cx="410" cy="225" r="7.5" />
        </g>
        {/* Perimeter Punch Caliper Ring */}
        <circle cx="300" cy="150" r="14" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 2" />
        <text x="300" y="174" fill="#34d399" fontSize="11" textAnchor="middle" fontWeight="bold">DIA: 1.18mm (CLEAN CUT)</text>
      </svg>
    );
  };

  return (
    <div className="viewfinder" style={{ filter: highContrast ? "contrast(140%) brightness(110%)" : "none" }}>
      {/* Corner reticles */}
      <div className="reticle-corner reticle-tl" />
      <div className="reticle-tr reticle-corner" />
      <div className="reticle-corner reticle-bl" />
      <div className="reticle-br reticle-corner" />

      {/* Top HUD overlay */}
      <div style={{ position: "absolute", top: 12, left: 20, right: 20, display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="badge badge-blue">MACRO OPTICS 4X</span>
          <span style={{ fontSize: 12, color: "var(--accent-cyan)", fontFamily: "monospace" }}>{trialId}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => setHighContrast(!highContrast)}
            style={{
              background: highContrast ? "var(--accent-blue)" : "rgba(15, 23, 42, 0.7)",
              border: "1px solid var(--border)",
              color: "white",
              padding: "4px 8px",
              borderRadius: 6,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            {highContrast ? "Normal Contrast" : "High Contrast"}
          </button>
          <button
            type="button"
            onClick={() => setZoom(zoom === 1 ? 1.3 : 1)}
            style={{
              background: zoom > 1 ? "var(--accent-blue)" : "rgba(15, 23, 42, 0.7)",
              border: "1px solid var(--border)",
              color: "white",
              padding: "4px 8px",
              borderRadius: 6,
              fontSize: 11,
              cursor: "pointer",
            }}
          >
            {zoom > 1 ? "Reset Zoom" : "2X Magnifier"}
          </button>
        </div>
      </div>

      {/* SVG Canvas with dynamic zoom transform */}
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${zoom})`,
          transition: "transform 0.25s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {renderZoneGraphics()}
      </div>

      {/* Bottom HUD metadata */}
      <div style={{ position: "absolute", bottom: 10, left: 20, right: 20, display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)" }}>
        <span>MODEL: <strong style={{ color: "white" }}>{sneakerModel}</strong></span>
        <span>ZONE: <strong style={{ color: "var(--accent-cyan)" }}>{inspectionZone.replace(/_/g, " ")}</strong></span>
      </div>
    </div>
  );
}

