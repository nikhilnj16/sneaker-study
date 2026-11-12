import { NextResponse } from "next/server";
import { STUDY_TRIALS } from "@/data/studyTrials";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const condition = searchParams.get("condition") || "without-ai";

    if (!STUDY_TRIALS || STUDY_TRIALS.length === 0) {
      return NextResponse.json({ error: "Study dataset not found" }, { status: 500 });
    }

    // Sample 5 authentic and 5 replica trials randomly
    const authTrials = STUDY_TRIALS.filter((t) => t.ground_truth === "Authentic");
    const repTrials = STUDY_TRIALS.filter((t) => t.ground_truth === "Replica");

    const shuffle = <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

    const selectedAuth = shuffle(authTrials).slice(0, 5);
    const selectedRep = shuffle(repTrials).slice(0, 5);

    const selected = shuffle([...selectedAuth, ...selectedRep]);

    // Insert an Attention Check trial at trial #5 (index 4)
    const attentionCheck = {
      trial_id: "ATTN_CHECK_01",
      sneaker_model: "System Attention Verification Check",
      inspection_zone: "Quality_Assurance_Verification",
      image_filename: "attention_check_prompt.png",
      ground_truth: "Replica",
      model_prediction: "Replica",
      model_confidence: 0.999,
      model_inspection_notes:
        "ATTENTION CHECK: Please select 'Replica' and Confidence Rating '5' to confirm you are reviewing the guidelines attentively.",
      is_attention_check: true,
      is_model_correct: true,
      error_category: "Attention_Check",
    };

    selected.splice(4, 0, attentionCheck as any);

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
        // For AI-assisted condition, include AI assistance telemetry
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
  } catch (error: any) {
    console.error("Error generating study trials:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
