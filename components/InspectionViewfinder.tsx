"use client";

import React, { useState } from "react";

interface ViewfinderProps {
  sneakerModel: string;
  inspectionZone: string;
  trialId: string;
  visualVariant?: "authentic" | "replica";
  errorCategory?: string;
  isAttentionCheck?: boolean;
}

export default function InspectionViewfinder({
  sneakerModel,
  inspectionZone,
  trialId,
  visualVariant = "authentic",
  isAttentionCheck,
}: ViewfinderProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  const isAuth = visualVariant === "authentic";

  // Helper to render sneaker thumbnail profile
  const renderSneakerProfile = () => {
    let brandColor = "#dc2626";
    let accentColor = "#ffffff";
    let baseColor = "#0f172a";

    if (sneakerModel.includes("Panda")) {
      brandColor = "#000000";
      accentColor = "#ffffff";
    } else if (sneakerModel.includes("Military Black")) {
      brandColor = "#1e293b";
      accentColor = "#94a3b8";
    } else if (sneakerModel.includes("Reverse Mocha")) {
      brandColor = "#78350f";
      accentColor = "#fef3c7";
    } else if (sneakerModel.includes("Zebra")) {
      brandColor = "#ffffff";
      accentColor = "#000000";
    } else if (sneakerModel.includes("550")) {
      brandColor = "#e2e8f0";
      accentColor = "#64748b";
    }

    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <svg width="48" height="28" viewBox="0 0 48 28">
          <path
            d="M 4 20 C 10 20 12 14 18 10 C 24 6 32 6 38 12 L 44 14 C 46 16 46 22 42 22 L 6 22 Z"
            fill={brandColor}
            stroke={accentColor}
            strokeWidth="1.5"
          />
          <path d="M 4 22 L 44 22 L 42 25 L 6 25 Z" fill="#e2e8f0" />
        </svg>
        <div>
          <div style={{ fontSize: 14, fontWeight: "bold", color: "white" }}>{sneakerModel}</div>
          <div style={{ fontSize: 11, color: "var(--accent-cyan)", fontFamily: "monospace" }}>
            Diagnostic Target: {inspectionZone.replace(/_/g, " ")}
          </div>
        </div>
      </div>
    );
  };

  // Render high-fidelity macro graphics showing REAL thread, stitch, font, or hole differences
  const renderMacroGraphics = () => {
    if (isAttentionCheck) {
      return (
        <svg viewBox="0 0 640 320" style={{ width: "100%", height: "100%" }}>
          <rect width="640" height="320" fill="#1e1b4b" />
          <circle cx="320" cy="110" r="45" fill="#4338ca" />
          <text x="320" y="125" fill="#a5b4fc" fontSize="42" textAnchor="middle" fontWeight="bold">⚠</text>
          <text x="320" y="190" fill="#f8fafc" fontSize="20" textAnchor="middle" fontWeight="bold">
            SYSTEM ATTENTION VERIFICATION CHECK
          </text>
          <text x="320" y="225" fill="#cbd5e1" fontSize="15" textAnchor="middle">
            Please select &quot;Replica&quot; with Confidence 5 to verify your attention.
          </text>
        </svg>
      );
    }

    // 1. Heel Stitching & Hourglass
    if (inspectionZone === "Heel_Stitching_and_Hourglass") {
      return (
        <svg viewBox="0 0 640 320" style={{ width: "100%", height: "100%" }}>
          {/* Background studio shadow */}
          <rect width="640" height="320" fill="#0b1120" />

          {/* Heel Leather Silhouette */}
          {isAuth ? (
            /* Authentic: Curving Hourglass anatomical taper */
            <path
              d="M 190 20 Q 255 140 210 295 L 430 295 Q 385 140 450 20 Z"
              fill="#1e293b"
              stroke="#334155"
              strokeWidth="2.5"
            />
          ) : (
            /* Replica: Flat boxy cylindrical heel without hourglass curve */
            <path
              d="M 210 20 L 210 295 L 430 295 L 430 20 Z"
              fill="#1e293b"
              stroke="#334155"
              strokeWidth="2.5"
            />
          )}

          {/* Medial spine seam tape */}
          <rect x="306" y="20" width="28" height="275" fill="#0f172a" stroke="#334155" strokeWidth="1" />

          {/* Stitching lines */}
          {isAuth ? (
            /* Authentic: Perfectly uniform, tight double lockstitches (9.8 stitches/inch) */
            <g stroke="#f8fafc" strokeWidth="2.2" strokeLinecap="round">
              {[30, 48, 66, 84, 102, 120, 138, 156, 174, 192, 210, 228, 246, 264, 282].map((y, i) => (
                <React.Fragment key={i}>
                  <line x1="298" y1={y} x2="298" y2={y + 12} />
                  <line x1="342" y1={y} x2="342" y2={y + 12} />
                </React.Fragment>
              ))}
            </g>
          ) : (
            /* Replica: Loose, crooked stitches with irregular spacing and fraying (7.2 stitches/inch) */
            <g stroke="#f8fafc" strokeWidth="2.6" strokeLinecap="round">
              {[30, 54, 74, 102, 122, 150, 178, 202, 234, 258, 280].map((y, i) => {
                const xOffsetLeft = (i % 2 === 0 ? 1 : -2);
                const xOffsetRight = (i % 3 === 0 ? -2 : 1);
                return (
                  <React.Fragment key={i}>
                    <line x1={298 + xOffsetLeft} y1={y} x2={298 + xOffsetLeft + (i % 2 === 0 ? 1 : -1)} y2={y + 16} />
                    <line x1={342 + xOffsetRight} y1={y} x2={342 + xOffsetRight + (i % 2 === 0 ? -1 : 1)} y2={y + 16} />
                  </React.Fragment>
                );
              })}
              {/* Stray loose thread fiber */}
              <path d="M 299 150 Q 290 155 284 152" fill="none" stroke="#f8fafc" strokeWidth="1.2" />
              <path d="M 343 234 Q 352 238 358 235" fill="none" stroke="#f8fafc" strokeWidth="1.2" />
            </g>
          )}

          {/* Subdued optical grid lines */}
          <line x1="160" y1="160" x2="480" y2="160" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
          <line x1="320" y1="20" x2="320" y2="300" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
        </svg>
      );
    }

    // 2. Size Tag & Barcode Kerning
    if (inspectionZone === "Size_Tag_and_Barcode_Kerning") {
      const fontThickness = isAuth ? "normal" : "bold";
      const strokeSpacing = isAuth ? 1.5 : 0.8;

      return (
        <svg viewBox="0 0 640 320" style={{ width: "100%", height: "100%" }}>
          <rect width="640" height="320" fill="#090d16" />
          {/* Inner Fabric Size Label */}
          <rect x="140" y="25" width="360" height="270" rx="8" fill="#f8fafc" stroke="#64748b" strokeWidth="2" />

          {/* Tag Header */}
          <text x="320" y="55" fill="#0f172a" fontSize="14" textAnchor="middle" fontWeight="900">
            MADE IN VIETNAM
          </text>
          <text x="320" y="75" fill="#334155" fontSize="12" textAnchor="middle" fontWeight={fontThickness}>
            FABRIQUE AU VIETNAM
          </text>

          {/* Size Grid */}
          <line x1="160" y1="88" x2="480" y2="88" stroke="#cbd5e1" strokeWidth="1.5" />
          <text x="195" y="112" fill="#0f172a" fontSize="16" fontWeight={fontThickness}>US 10.5</text>
          <text x="280" y="112" fill="#0f172a" fontSize="16" fontWeight={fontThickness}>UK 9.5</text>
          <text x="360" y="112" fill="#0f172a" fontSize="16" fontWeight={fontThickness}>EUR 44.5</text>
          <text x="445" y="112" fill="#0f172a" fontSize="16" fontWeight={fontThickness}>CM 28.5</text>
          <line x1="160" y1="125" x2="480" y2="125" stroke="#cbd5e1" strokeWidth="1.5" />

          {/* Style Code / Production Dates */}
          <text x="320" y="148" fill="#0f172a" fontSize="14" textAnchor="middle" fontFamily="monospace" fontWeight={fontThickness}>
            DZ5485-612 &bull; 10/18/22 &bull; 01/14/23
          </text>

          {/* Barcode Graphic */}
          <g fill="#0f172a">
            {[
              175, 180, 186, 190, 196, 204, 210, 216, 222, 230, 236, 244, 250, 258,
              266, 274, 282, 290, 298, 306, 314, 322, 330, 338, 346, 354, 362, 370,
              378, 386, 394, 402, 410, 418, 426, 434, 442, 450, 458, 465
            ].map((x, idx) => (
              <rect
                key={idx}
                x={x}
                y="160"
                width={isAuth ? (idx % 3 === 0 ? 3 : 1.8) : (idx % 3 === 0 ? 3.8 : 2.5)}
                height="65"
              />
            ))}
          </g>

          {/* UPC Digits */}
          {/* Authentic: Clean spacing below barcode. Replica: Numbers swell and touch bars */}
          <text
            x="320"
            y={isAuth ? 245 : 236}
            fill="#0f172a"
            fontSize={isAuth ? "14" : "15"}
            textAnchor="middle"
            fontFamily="monospace"
            letterSpacing={isAuth ? "3" : "1.5"}
            fontWeight={fontThickness}
          >
            00196154128504
          </text>
        </svg>
      );
    }

    // 3. Tongue Tag & Trademark Bleed
    if (inspectionZone === "Tongue_Tag_and_Trademark_Bleed") {
      return (
        <svg viewBox="0 0 640 320" style={{ width: "100%", height: "100%" }}>
          <rect width="640" height="320" fill="#090d16" />
          {/* Red Woven Nylon Tongue Patch */}
          <rect x="150" y="30" width="340" height="260" rx="8" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />

          {/* Crosshatch woven texture lines */}
          <g stroke="#b91c1c" strokeWidth="0.8" strokeDasharray="3 3">
            {[50, 80, 110, 140, 170, 200, 230, 260].map((y, i) => (
              <line key={i} x1="150" y1={y} x2="490" y2={y} />
            ))}
          </g>

          {/* Embroidered NIKE Logo */}
          <text x="270" y="125" fill="#ffffff" fontSize="52" fontWeight="900" fontStyle="italic" letterSpacing="-2">
            NIKE
          </text>

          {/* Embroidered Swoosh */}
          {isAuth ? (
            /* Authentic: Crisp swoosh tail clears the seam fold */
            <path d="M 200 155 Q 315 142 390 95 Q 325 172 200 155 Z" fill="#ffffff" />
          ) : (
            /* Replica: Smudged, bloated swoosh tail touches folded nylon border */
            <path d="M 195 158 Q 320 144 402 90 Q 330 178 195 158 Z" fill="#ffffff" />
          )}

          {/* Registered Trademark ® Symbol */}
          {isAuth ? (
            /* Authentic: Clean circular embroidery with a clear open central aperture hole */
            <g transform="translate(405, 88)">
              <circle cx="14" cy="14" r="12" fill="none" stroke="#ffffff" strokeWidth="2.8" />
              <text x="14" y="19" fill="#ffffff" fontSize="14" textAnchor="middle" fontWeight="bold">R</text>
            </g>
          ) : (
            /* Replica: Embroidery thread bleed - thick blob where threads melt together with NO center hole */
            <g transform="translate(405, 88)">
              <circle cx="14" cy="14" r="14" fill="#ffffff" />
              <text x="14" y="19" fill="#dc2626" fontSize="12" textAnchor="middle" fontWeight="900">R</text>
              {/* Thread bleed fuzz */}
              <circle cx="27" cy="14" r="3" fill="#ffffff" />
              <circle cx="14" cy="27" r="2.5" fill="#ffffff" />
            </g>
          )}

          {/* Circular reticle */}
          <circle cx="419" cy="102" r="36" fill="none" stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
        </svg>
      );
    }

    // 4. Toe Box Perforation & Grain
    return (
      <svg viewBox="0 0 640 320" style={{ width: "100%", height: "100%" }}>
        <rect width="640" height="320" fill="#090d16" />

        {/* Leather Vamp Panel */}
        <path
          d="M 120 300 C 150 50 490 50 520 300 Z"
          fill={isAuth ? "#1e293b" : "#243147"}
          stroke="#475569"
          strokeWidth="2.5"
        />

        {/* Synthetic Sheen Highlight for Replica */}
        {!isAuth && (
          <ellipse cx="320" cy="140" rx="140" ry="70" fill="rgba(255,255,255,0.12)" />
        )}

        {/* Authentic Pebble Grain Leather Texture */}
        {isAuth && (
          <g fill="#334155">
            {[
              [200, 160], [240, 130], [280, 110], [320, 110], [360, 130], [400, 160],
              [180, 210], [230, 185], [290, 170], [310, 170], [370, 185], [420, 210],
              [220, 250], [270, 235], [330, 235], [380, 250]
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="2" />
            ))}
          </g>
        )}

        {/* Perforation Punch Holes */}
        <g>
          {[
            // Center Arc
            { cx: 320, cy: 90 },
            { cx: 280, cy: 120 }, { cx: 360, cy: 120 },
            { cx: 250, cy: 155 }, { cx: 320, cy: 155 }, { cx: 390, cy: 155 },
            { cx: 220, cy: 195 }, { cx: 285, cy: 195 }, { cx: 355, cy: 195 }, { cx: 420, cy: 195 },
            { cx: 195, cy: 240 }, { cx: 260, cy: 240 }, { cx: 320, cy: 240 }, { cx: 380, cy: 240 }, { cx: 445, cy: 240 }
          ].map((hole, i) => (
            <React.Fragment key={i}>
              {isAuth ? (
                /* Authentic: Precise clean circular hole punches, uniform 1.15mm with crisp edges */
                <circle cx={hole.cx} cy={hole.cy} r="7.5" fill="#090d16" stroke="#475569" strokeWidth="1" />
              ) : (
                /* Replica: Oversized, jagged/oblong punch holes with ragged synthetic backing burrs */
                <g>
                  <ellipse cx={hole.cx} cy={hole.cy} rx="9.5" ry="8" fill="#090d16" stroke="#64748b" strokeWidth="1.5" />
                  {/* Burrs & white fibers */}
                  <line x1={hole.cx - 8} y1={hole.cy} x2={hole.cx - 5} y2={hole.cy + 2} stroke="#e2e8f0" strokeWidth="1.2" />
                  <line x1={hole.cx + 5} y1={hole.cy - 6} x2={hole.cx + 8} y2={hole.cy - 4} stroke="#e2e8f0" strokeWidth="1.2" />
                </g>
              )}
            </React.Fragment>
          ))}
        </g>
      </svg>
    );
  };

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Top Sneaker & Diagnostic Zone Header */}
      <div
        style={{
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          borderBottom: "none",
          borderRadius: "12px 12px 0 0",
          padding: "12px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {renderSneakerProfile()}

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            style={{
              background: showGuide ? "var(--accent-blue)" : "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "white",
              padding: "6px 12px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            📖 {showGuide ? "Hide Reference Guide" : "Retail Reference Guide"}
          </button>
          <button
            type="button"
            onClick={() => setHighContrast(!highContrast)}
            style={{
              background: highContrast ? "var(--accent-blue)" : "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "white",
              padding: "6px 12px",
              borderRadius: 6,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            {highContrast ? "Normal Contrast" : "High Contrast"}
          </button>
          <button
            type="button"
            onClick={() => setZoom(zoom === 1 ? 1.35 : 1)}
            style={{
              background: zoom > 1 ? "var(--accent-blue)" : "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "white",
              padding: "6px 12px",
              borderRadius: 6,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            {zoom > 1 ? "Reset Zoom" : "🔍 2X Macro Magnifier"}
          </button>
        </div>
      </div>

      {/* Main Photographic Viewfinder */}
      <div
        className="viewfinder"
        style={{
          borderRadius: "0 0 12px 12px",
          marginBottom: 0,
          filter: highContrast ? "contrast(150%) brightness(110%)" : "none",
        }}
      >
        {/* Reticles */}
        <div className="reticle-corner reticle-tl" />
        <div className="reticle-tr reticle-corner" />
        <div className="reticle-corner reticle-bl" />
        <div className="reticle-br reticle-corner" />

        {/* Viewfinder Canvas with zoom */}
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
          {renderMacroGraphics()}
        </div>

        {/* Bottom optical indicator bar */}
        <div
          style={{
            position: "absolute",
            bottom: 8,
            left: 16,
            right: 16,
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11,
            color: "var(--text-muted)",
            pointerEvents: "none",
          }}
        >
          <span>TRIAL REF: <strong style={{ color: "white" }}>{trialId}</strong></span>
          <span>OPTICAL MAGNIFICATION: <strong style={{ color: "var(--accent-cyan)" }}>{zoom}X</strong></span>
        </div>
      </div>

      {/* Retail Reference Guide Modal / Drawer */}
      {showGuide && (
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderTop: "none",
            borderRadius: "0 0 12px 12px",
            padding: "16px 20px",
            marginTop: 0,
            animation: "fadeIn 0.2s ease-in-out",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <strong style={{ fontSize: 14, color: "var(--accent-cyan)" }}>
              🔍 Authenticator Field Guide: What to Look For
            </strong>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Inspection Zone Standards</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 13 }}>
            <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: 8, padding: 12 }}>
              <div style={{ color: "var(--auth-green)", fontWeight: "bold", marginBottom: 6 }}>
                ✓ Authentic Retail Standard:
              </div>
              <ul style={{ paddingLeft: 18, color: "#cbd5e1", lineHeight: 1.5 }}>
                <li><strong>Heel:</strong> Anatomical hourglass curve inward at waist; uniform double-lockstitches.</li>
                <li><strong>Size Tag:</strong> Crisp factory die-stamp typography; clear spacing under UPC bars.</li>
                <li><strong>Tongue Tag:</strong> Hollow circular open aperture inside the ® symbol; clean swoosh tail.</li>
                <li><strong>Toe Box:</strong> Perfectly circular laser punch holes; natural matte pebble leather grain.</li>
              </ul>
            </div>

            <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 8, padding: 12 }}>
              <div style={{ color: "var(--rep-red)", fontWeight: "bold", marginBottom: 6 }}>
                ✗ Common Replica Red Flags:
              </div>
              <ul style={{ paddingLeft: 18, color: "#cbd5e1", lineHeight: 1.5 }}>
                <li><strong>Heel:</strong> Flat, blocky rectangular counter; uneven crooked stitch gaps or loose thread.</li>
                <li><strong>Size Tag:</strong> Thick swollen font bleed; numbers touching adjacent barcode lines.</li>
                <li><strong>Tongue Tag:</strong> Thread bleed fills the ® symbol into a solid blob with no center hole.</li>
                <li><strong>Toe Box:</strong> Distorted oblong holes; ragged fuzzy synthetic backing fibers; plastic sheen.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
