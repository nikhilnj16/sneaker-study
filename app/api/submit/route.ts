import { NextResponse } from "next/server";
import { STUDY_TRIALS } from "@/data/studyTrials";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// Global in-memory storage array for serverless runtime
declare global {
  var globalSubmissions: any[];
}

if (!global.globalSubmissions) {
  global.globalSubmissions = [];
}

const trialsMap: Record<string, any> = {};
STUDY_TRIALS.forEach((t) => {
  trialsMap[t.trial_id] = t;
});
trialsMap["ATTN_CHECK_01"] = {
  trial_id: "ATTN_CHECK_01",
  ground_truth: "Replica",
  is_attention_check: true,
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      session_id,
      participant_name,
      condition,
      trials,
      survey,
    } = body;

    if (!participant_name || !trials || !Array.isArray(trials)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const timestamp = new Date().toISOString();

    const loggedRows = trials.map((t: any) => {
      const groundTrial = trialsMap[t.trial_id] || {};
      const groundTruth = groundTrial.ground_truth || (t.is_attention_check ? "Replica" : "Unknown");
      const isCorrect = t.human_prediction === groundTruth;
      const passedAttentionCheck = t.is_attention_check
        ? (t.human_prediction === "Replica" && Number(t.confidence_rating) >= 4)
        : null;

      return {
        session_id: session_id || "ANON",
        participant_name: participant_name.trim(),
        condition: condition || "unknown",
        trial_id: t.trial_id,
        trial_index: t.trial_index,
        sneaker_model: t.sneaker_model,
        inspection_zone: t.inspection_zone,
        ground_truth: groundTruth,
        ai_prediction: t.ai_prediction || null,
        human_prediction: t.human_prediction,
        is_human_correct: isCorrect,
        confidence_rating: Number(t.confidence_rating),
        reaction_time_ms: Number(t.reaction_time_ms),
        ai_consulted: !!t.ai_consulted,
        ai_consult_latency_ms: t.ai_consult_latency_ms ? Number(t.ai_consult_latency_ms) : null,
        attention_check_passed: passedAttentionCheck,
        mental_demand: survey?.mental_demand ? Number(survey.mental_demand) : null,
        perceived_difficulty: survey?.perceived_difficulty ? Number(survey.perceived_difficulty) : null,
        participant_feedback: survey?.feedback ? survey.feedback.replace(/\n/g, " ") : "",
        submitted_at: timestamp,
      };
    });

    // Save to global in-memory store
    global.globalSubmissions.push(...loggedRows);

    // Save to local CSV/JSON if filesystem writable (works in local dev & Node server)
    try {
      const dataDir = path.join(process.cwd(), "data");
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const jsonPath = path.join(dataDir, "collected_submissions.json");
      fs.writeFileSync(jsonPath, JSON.stringify(global.globalSubmissions, null, 2), "utf-8");

      const csvPath = path.join(dataDir, "collected_submissions.csv");
      const headers = Object.keys(loggedRows[0]).join(",");
      const csvRows = loggedRows.map((r: any) =>
        Object.values(r)
          .map((v) => (typeof v === "string" ? `"${v.replace(/"/g, '""')}"` : v))
          .join(",")
      );

      if (!fs.existsSync(csvPath)) {
        fs.writeFileSync(csvPath, headers + "\n" + csvRows.join("\n") + "\n", "utf-8");
      } else {
        fs.appendFileSync(csvPath, csvRows.join("\n") + "\n", "utf-8");
      }
    } catch (fsErr) {
      // In serverless read-only filesystem, fs write may fail silently - in-memory retains it
    }

    // Optional Supabase integration if environment variables are configured
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/study_submissions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify(loggedRows),
        });
      } catch (err) {
        console.error("Supabase write error:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Study trial session recorded successfully",
      logged_count: loggedRows.length,
      session_id,
    });
  } catch (error: any) {
    console.error("Submit handler error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
