import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

declare global {
  var globalSubmissions: any[];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "csv";

  let submissions: any[] = global.globalSubmissions || [];

  // Try to read from local file if available
  try {
    const jsonPath = path.join(process.cwd(), "data", "collected_submissions.json");
    if (fs.existsSync(jsonPath)) {
      const fileData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
      if (Array.isArray(fileData) && fileData.length > 0) {
        submissions = fileData;
      }
    }
  } catch (e) {
    // serverless fallback
  }

  if (format === "json") {
    return NextResponse.json(submissions);
  }

  if (submissions.length === 0) {
    return new Response(
      "session_id,participant_name,condition,trial_id,trial_index,sneaker_model,inspection_zone,ground_truth,ai_prediction,human_prediction,is_human_correct,confidence_rating,reaction_time_ms,ai_consulted,ai_consult_latency_ms,attention_check_passed,mental_demand,perceived_difficulty,participant_feedback,submitted_at\n",
      {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="study_results_empty.csv"',
        },
      }
    );
  }

  const headers = Object.keys(submissions[0]);
  const csvLines = [headers.join(",")];

  for (const row of submissions) {
    const line = headers
      .map((h) => {
        const val = row[h];
        if (val === null || val === undefined) return "";
        if (typeof val === "string") return `"${val.replace(/"/g, '""')}"`;
        return val;
      })
      .join(",");
    csvLines.push(line);
  }

  return new Response(csvLines.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="assignment3_collected_data_${Date.now()}.csv"`,
    },
  });
}

