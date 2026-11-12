import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// In-memory cache for trials
let cachedTrials: any[] | null = null;

function loadTrials() {
  if (cachedTrials) return cachedTrials;
  try {
    const filePath = path.join(process.cwd(), "data", "study_trials_200.json");
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      cachedTrials = JSON.parse(data);
      return cachedTrials;
    }
  } catch (err) {
    console.error("Error reading study_trials_200.json:", err);
  }
  return [];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const condition = searchParams.get("condition") || "without-ai";
  const allTrials = loadTrials();

  if (!allTrials || allTrials.length === 0) {
    return NextResponse.json({ error: "Study dataset not found" }, { status: 500 });
  }

  // Sample 5 authentic and 5 replica trials randomly
  const authTrials = allTrials.filter((t: any) => t.ground_truth === "Authentic");
  const repTrials = allTrials.filter((t: any) => t.ground_truth === "Replica");

  const shuffle = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5);

  const selectedAuth = shuffle(authTrials).slice(0, 5);
  const selectedRep = shuffle(repTrials).slice(0, 5);

  let selected = shuffle([...selectedAuth, ...selectedRep]);

  // Insert an Attention Check trial at trial #5 (index 4)
  const attentionCheck = {
    trial_id: "ATTN_CHECK_01",
    sneaker_model: "System Attention Verification Check",
    inspection_zone: "Quality_Assurance_Verification",
    image_filename: "attention_check_prompt.png",
    ground_truth: "Replica",
    model_prediction: "Replica",
    model_confidence: 0.999,
    model_inspection_notes: "ATTENTION CHECK: Please select 'Replica' and Confidence Rating '5' to confirm you are reviewing the guidelines attentively.",
    is_attention_check: true,
  };

  selected.splice(4, 0, attentionCheck);

  // Sanitize for client response
  const sanitizedTrials = selected.map((trial: any, index: number) => {
    return {
      trial_index: index + 1,
      total_trials: selected.length,
      trial_id: trial.trial_id,
      sneaker_model: trial.sneaker_model,
      inspection_zone: trial.inspection_zone,
      image_filename: trial.image_filename,
      is_attention_check: !!trial.is_attention_check,
      // Pass ground truth encrypted or hidden; keep trial_id so submission verification can grade
      // For AI-assisted, include AI assistance telemetry
      ...(condition === "with-ai"
        ? {
            ai_prediction: trial.model_prediction,
            ai_confidence: trial.model_confidence,
            ai_inspection_notes: trial.model_inspection_notes,
          }
        : {}),
    };
  });

  return NextResponse.json({
    condition,
    total_trials: sanitizedTrials.length,
    trials: sanitizedTrials,
  });
}

