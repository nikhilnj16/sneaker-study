"use client";

import React, { useState, useEffect } from "react";
import InspectionViewfinder from "./InspectionViewfinder";
import AiTelemetryCard from "./AiTelemetryCard";
import DecisionPanel from "./DecisionPanel";

interface StudyRunnerProps {
  condition: "without-ai" | "with-ai";
  title: string;
}

export default function StudyRunner({ condition, title }: StudyRunnerProps) {
  const [stage, setStage] = useState<"welcome" | "trials" | "survey" | "completed">("welcome");
  const [participantName, setParticipantName] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [trials, setTrials] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recordedTrials, setRecordedTrials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentAiConsulted, setCurrentAiConsulted] = useState(false);
  const [currentAiLatency, setCurrentAiLatency] = useState<number | null>(null);
  const [attentionError, setAttentionError] = useState<string | null>(null);

  // Survey responses
  const [mentalDemand, setMentalDemand] = useState<number>(3);
  const [perceivedDifficulty, setPerceivedDifficulty] = useState<number>(3);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setSessionId("SESS_" + Math.random().toString(36).substring(2, 9).toUpperCase());
  }, []);

  const handleStartStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantName.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/trials?condition=${condition}`);
      const data = await res.json();
      if (data.trials && data.trials.length > 0) {
        setTrials(data.trials);
        setStage("trials");
        setCurrentIndex(0);
      } else {
        alert("Failed to load study trials. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error contacting study server.");
    } finally {
      setLoading(false);
    }
  };

  const handleTrialSubmit = (decision: string, confidence: number, reactionTimeMs: number) => {
    const currentTrial = trials[currentIndex];

    // Enforce attention check validation
    if (currentTrial.is_attention_check) {
      if (decision !== "Replica" || confidence !== 5) {
        setAttentionError(
          "⚠ Attention Check: You must select 'Replica' and Confidence Level '5' as instructed to demonstrate attentive review before moving forward."
        );
        return;
      }
    }

    setAttentionError(null);

    const record = {
      ...currentTrial,
      human_prediction: decision,
      confidence_rating: confidence,
      reaction_time_ms: reactionTimeMs,
      ai_consulted: currentAiConsulted,
      ai_consult_latency_ms: currentAiLatency,
    };

    const updated = [...recordedTrials, record];
    setRecordedTrials(updated);

    // Reset trial-level AI telemetry state
    setCurrentAiConsulted(false);
    setCurrentAiLatency(null);

    if (currentIndex + 1 < trials.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setStage("survey");
    }
  };

  const handleSurveySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        session_id: sessionId,
        participant_name: participantName.trim(),
        condition,
        trials: recordedTrials,
        survey: {
          mental_demand: mentalDemand,
          perceived_difficulty: perceivedDifficulty,
          feedback: feedback.trim(),
        },
      };

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStage("completed");
      } else {
        alert("Submission failed to save. Please notify the study administrator.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error during submission.");
    } finally {
      setSubmitting(false);
    }
  };

  const currentTrial = trials[currentIndex];

  // 1. Welcome & Onboarding Screen
  if (stage === "welcome") {
    return (
      <div className="container" style={{ maxWidth: 760 }}>
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span className="badge badge-blue">EXPERIMENT CONDITION</span>
            <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Session: {sessionId}</span>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>{title}</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>
            Welcome! In this study, you act as a <strong>Sneaker Authentication Specialist</strong> evaluating
            macro photographs of high-demand collectible sneakers (Nike, Jordan, Travis Scott, Yeezy).
            Your goal is to distinguish genuine retail pairs from high-grade counterfeit replicas.
          </p>

          <div style={{ background: "var(--bg-secondary)", borderRadius: 8, padding: 16, marginBottom: 24, border: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: 15, fontWeight: "bold", marginBottom: 8, color: "var(--accent-cyan)" }}>
              📋 Study Protocol & Instructions:
            </h3>
            <ul style={{ paddingLeft: 20, fontSize: 14, color: "#cbd5e1", lineHeight: 1.7 }}>
              <li>You will evaluate <strong>10 quick inspection trials</strong> (~20–30 seconds each).</li>
              <li>Examine the diagnostic zone (Heel Stitching, Size Tag, Trademark Bleed, or Toe Box).</li>
              {condition === "with-ai" ? (
                <li>
                  <strong style={{ color: "var(--accent-cyan)" }}>AI Assistance Available:</strong> You can click the &quot;Consult AI&quot; button at any time to inspect model measurements.
                </li>
              ) : (
                <li>
                  <strong style={{ color: "var(--text-main)" }}>Baseline Condition:</strong> Rely purely on your visual inspection skills without automated tools.
                </li>
              )}
              <li>Submit your verdict (Authentic vs Replica) and your confidence on a 1–5 scale.</li>
              <li>Total study duration: <strong>Less than 7 minutes</strong>.</li>
            </ul>
          </div>

          <form onSubmit={handleStartStudy}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: "bold", marginBottom: 8 }}>
                Please enter your Name or Student ID (for class participation credit):
              </label>
              <input
                type="text"
                required
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="e.g. Jane Doe"
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: 8,
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border)",
                  color: "white",
                  fontSize: 16,
                  outline: "none",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !participantName.trim()}
              className="btn btn-primary"
              style={{ width: "100%", padding: 14, fontSize: 16 }}
            >
              {loading ? "Loading Calibration Trials..." : "Start Authentication Study →"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Active Trial View
  if (stage === "trials" && currentTrial) {
    const progress = Math.round(((currentIndex + 1) / trials.length) * 100);

    return (
      <div className="container">
        {/* Progress & Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div>
            <span className="badge badge-blue">{condition === "with-ai" ? "AI-ASSISTED" : "BASELINE (NO AI)"}</span>
            <span style={{ marginLeft: 10, fontSize: 14, fontWeight: "bold" }}>
              Trial {currentIndex + 1} of {trials.length}
            </span>
          </div>
          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Participant: <strong style={{ color: "white" }}>{participantName}</strong>
          </div>
        </div>

        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Viewfinder macro crop */}
        <InspectionViewfinder
          sneakerModel={currentTrial.sneaker_model}
          inspectionZone={currentTrial.inspection_zone}
          trialId={currentTrial.trial_id}
          isAttentionCheck={currentTrial.is_attention_check}
        />

        {/* On-demand AI Telemetry Card (Only in With AI condition) */}
        {condition === "with-ai" && !currentTrial.is_attention_check && (
          <AiTelemetryCard
            prediction={currentTrial.ai_prediction}
            confidence={currentTrial.ai_confidence}
            inspectionNotes={currentTrial.ai_inspection_notes}
            alreadyConsulted={currentAiConsulted}
            onConsult={(latencyMs) => {
              setCurrentAiConsulted(true);
              setCurrentAiLatency(latencyMs);
            }}
          />
        )}

        {/* Attention check validation alert */}
        {attentionError && (
          <div
            style={{
              background: "rgba(239, 68, 68, 0.18)",
              border: "2px solid var(--rep-red)",
              color: "#fecaca",
              borderRadius: 8,
              padding: "16px 20px",
              marginTop: 16,
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontWeight: "bold",
              fontSize: 15,
              boxShadow: "0 0 20px rgba(239, 68, 68, 0.35)",
            }}
          >
            <span style={{ fontSize: 26 }}>🛑</span>
            <span>{attentionError}</span>
          </div>
        )}

        {/* Decision & 5-point Likert Panel */}
        <DecisionPanel
          onSubmit={handleTrialSubmit}
          trialIndex={currentIndex + 1}
          totalTrials={trials.length}
        />
      </div>
    );
  }

  // 3. Post-Study Survey
  if (stage === "survey") {
    return (
      <div className="container" style={{ maxWidth: 760 }}>
        <div className="card">
          <span className="badge badge-green" style={{ marginBottom: 12 }}>TRIALS COMPLETED!</span>
          <h2 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 8 }}>Post-Task Experience Survey</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 24 }}>
            Please complete these 3 quick reflection questions to conclude your study session.
          </p>

          <form onSubmit={handleSurveySubmit}>
            {/* Mental Demand */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: "bold", marginBottom: 8 }}>
                1. Mental Demand: How mentally demanding was this authentication task?
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    className={`likert-btn ${mentalDemand === val ? "selected" : ""}`}
                    onClick={() => setMentalDemand(val)}
                  >
                    <div style={{ fontSize: 16, fontWeight: "bold" }}>{val}</div>
                    <div style={{ fontSize: 10, marginTop: 4 }}>
                      {val === 1 ? "Very Low" : val === 3 ? "Moderate" : val === 5 ? "Very High" : ""}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Perceived Difficulty */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: "bold", marginBottom: 8 }}>
                2. Perceived Difficulty: How difficult was it to detect replica sneaker defects?
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    className={`likert-btn ${perceivedDifficulty === val ? "selected" : ""}`}
                    onClick={() => setPerceivedDifficulty(val)}
                  >
                    <div style={{ fontSize: 16, fontWeight: "bold" }}>{val}</div>
                    <div style={{ fontSize: 10, marginTop: 4 }}>
                      {val === 1 ? "Very Easy" : val === 3 ? "Moderate" : val === 5 ? "Very Difficult" : ""}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Qualitative Feedback */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: "bold", marginBottom: 8 }}>
                3. Comments on Experience & AI Assistance (Optional, for spreadsheet comment):
              </label>
              <textarea
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your thoughts on the task, image details, or how AI assistance impacted your decisions..."
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 8,
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border)",
                  color: "white",
                  fontSize: 14,
                  outline: "none",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ width: "100%", padding: 14, fontSize: 16 }}
            >
              {submitting ? "Saving Responses..." : "Complete & Finalize Submission ✓"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 4. Final Completion Screen
  return (
    <div className="container" style={{ maxWidth: 640, textAlign: "center", marginTop: 40 }}>
      <div className="card" style={{ padding: "40px 24px" }}>
        <div style={{ fontSize: 54, marginBottom: 16 }}>🎉</div>
        <h1 style={{ fontSize: 26, fontWeight: 900, marginBottom: 12, color: "var(--auth-green)" }}>
          Study Completed Successfully!
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
          Thank you, <strong>{participantName}</strong>. All {recordedTrials.length} trial evaluations,
          confidence ratings, and reaction times have been permanently recorded to the research database.
        </p>

        <div style={{ background: "var(--bg-secondary)", borderRadius: 8, padding: 16, marginBottom: 24, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase" }}>Verification Code</div>
          <div style={{ fontSize: 22, fontWeight: "bold", fontFamily: "monospace", color: "var(--accent-cyan)", marginTop: 4 }}>
            {sessionId}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
            Please write this code or your name on the class Google Sheet.
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <a href="/" className="btn btn-primary" style={{ padding: "10px 20px" }}>
            Return to Study Hub
          </a>
          <a href="/admin" style={{ padding: "10px 20px", color: "var(--text-muted)", fontSize: 14, display: "flex", alignItems: "center" }}>
            View Collected Data →
          </a>
        </div>
      </div>
    </div>
  );
}

