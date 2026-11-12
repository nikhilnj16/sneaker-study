const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const TRIALS_FILE = path.join(DATA_DIR, "study_trials_200.json");
const SUBMISSIONS_JSON = path.join(DATA_DIR, "collected_submissions.json");
const SUBMISSIONS_CSV = path.join(DATA_DIR, "collected_submissions.csv");

let cachedTrials = null;
function loadTrials() {
  if (cachedTrials) return cachedTrials;
  if (fs.existsSync(TRIALS_FILE)) {
    try {
      cachedTrials = JSON.parse(fs.readFileSync(TRIALS_FILE, "utf-8"));
      return cachedTrials;
    } catch (e) {
      console.error("Failed to parse trials JSON", e);
    }
  }
  return [];
}

let submissions = [];
if (fs.existsSync(SUBMISSIONS_JSON)) {
  try {
    submissions = JSON.parse(fs.readFileSync(SUBMISSIONS_JSON, "utf-8"));
  } catch (e) {}
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // API 1: /api/trials
  if (pathname === "/api/trials" && req.method === "GET") {
    const condition = parsedUrl.query.condition || "without-ai";
    const all = loadTrials();
    const authTrials = all.filter((t) => t.ground_truth === "Authentic");
    const repTrials = all.filter((t) => t.ground_truth === "Replica");

    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
    const selectedAuth = shuffle(authTrials).slice(0, 5);
    const selectedRep = shuffle(repTrials).slice(0, 5);
    const selected = shuffle([...selectedAuth, ...selectedRep]);

    // Attention check
    selected.splice(4, 0, {
      trial_id: "ATTN_CHECK_01",
      sneaker_model: "System Attention Verification Check",
      inspection_zone: "Quality_Assurance_Verification",
      image_filename: "attn_check.png",
      ground_truth: "Replica",
      model_prediction: "Replica",
      model_confidence: 0.999,
      model_inspection_notes: "ATTENTION CHECK: Please select 'Replica' and Confidence Rating '5' to confirm you are reviewing the guidelines attentively.",
      is_attention_check: true,
    });

    const sanitized = selected.map((trial, index) => ({
      trial_index: index + 1,
      total_trials: selected.length,
      trial_id: trial.trial_id,
      sneaker_model: trial.sneaker_model,
      inspection_zone: trial.inspection_zone,
      image_filename: trial.image_filename,
      visual_variant: trial.ground_truth === "Authentic" ? "authentic" : "replica",
      is_attention_check: !!trial.is_attention_check,
      ...(condition === "with-ai"
        ? {
            ai_prediction: trial.model_prediction,
            ai_confidence: trial.model_confidence,
            ai_inspection_notes: trial.model_inspection_notes,
          }
        : {}),
    }));

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ condition, total_trials: sanitized.length, trials: sanitized }));
    return;
  }

  // API 2: /api/submit
  if (pathname === "/api/submit" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const payload = JSON.parse(body);
        const { session_id, participant_name, condition, trials, survey } = payload;
        const all = loadTrials();
        const trialsMap = {};
        all.forEach((t) => (trialsMap[t.trial_id] = t));
        trialsMap["ATTN_CHECK_01"] = { trial_id: "ATTN_CHECK_01", ground_truth: "Replica", is_attention_check: true };

        const timestamp = new Date().toISOString();
        const rows = trials.map((t) => {
          const groundTrial = trialsMap[t.trial_id] || {};
          const groundTruth = groundTrial.ground_truth || (t.is_attention_check ? "Replica" : "Unknown");
          const isCorrect = t.human_prediction === groundTruth;
          const passedAttn = t.is_attention_check
            ? t.human_prediction === "Replica" && Number(t.confidence_rating) >= 4
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
            attention_check_passed: passedAttn,
            mental_demand: survey?.mental_demand ? Number(survey.mental_demand) : null,
            perceived_difficulty: survey?.perceived_difficulty ? Number(survey.perceived_difficulty) : null,
            participant_feedback: survey?.feedback ? survey.feedback.replace(/\n/g, " ") : "",
            submitted_at: timestamp,
          };
        });

        submissions.push(...rows);
        fs.writeFileSync(SUBMISSIONS_JSON, JSON.stringify(submissions, null, 2), "utf-8");

        const headers = Object.keys(rows[0]).join(",");
        const csvRows = rows.map((r) =>
          Object.values(r)
            .map((v) => (typeof v === "string" ? `"${v.replace(/"/g, '""')}"` : v))
            .join(",")
        );

        if (!fs.existsSync(SUBMISSIONS_CSV)) {
          fs.writeFileSync(SUBMISSIONS_CSV, headers + "\n" + csvRows.join("\n") + "\n", "utf-8");
        } else {
          fs.appendFileSync(SUBMISSIONS_CSV, csvRows.join("\n") + "\n", "utf-8");
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, count: rows.length }));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // API 3: /api/export
  if (pathname === "/api/export" && req.method === "GET") {
    if (parsedUrl.query.format === "json") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(submissions));
      return;
    }

    if (submissions.length === 0) {
      res.writeHead(200, {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="study_results_empty.csv"',
      });
      res.end("session_id,participant_name,condition,trial_id,trial_index,sneaker_model,inspection_zone,ground_truth,ai_prediction,human_prediction,is_human_correct,confidence_rating,reaction_time_ms,ai_consulted,ai_consult_latency_ms,attention_check_passed,mental_demand,perceived_difficulty,participant_feedback,submitted_at\n");
      return;
    }

    const headers = Object.keys(submissions[0]);
    const lines = [headers.join(",")];
    for (const row of submissions) {
      lines.push(
        headers
          .map((h) => {
            const v = row[h];
            if (v === null || v === undefined) return "";
            if (typeof v === "string") return `"${v.replace(/"/g, '""')}"`;
            return v;
          })
          .join(",")
      );
    }

    res.writeHead(200, {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="assignment3_collected_data_${Date.now()}.csv"`,
    });
    res.end(lines.join("\n"));
    return;
  }

  // Serve static HTML app for standalone preview
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(getStaticHtmlApp());
});

function getStaticHtmlApp() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sneaker Legit Check Study - CSE 594</title>
  <style>
    :root {
      --bg-primary: #0a0e17; --bg-secondary: #131b2e; --bg-card: #182238;
      --border: #2a3756; --text-main: #f1f5f9; --text-muted: #94a3b8;
      --accent-blue: #3b82f6; --accent-cyan: #06b6d4; --auth-green: #10b981;
      --rep-red: #ef4444; --warning-amber: #f59e0b;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: var(--bg-primary); color: var(--text-main); min-height: 100vh; display: flex; flex-direction: column; }
    header { background: var(--bg-secondary); border-bottom: 1px solid var(--border); padding: 14px 24px; }
    .header-content { max-width: 960px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; }
    .container { max-width: 900px; margin: 24px auto; padding: 0 16px; width: 100%; flex: 1; }
    .card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 24px; box-shadow: 0 8px 24px rgba(0,0,0,0.35); margin-bottom: 20px; }
    .btn { display: inline-flex; align-items: center; justify-content: center; font-weight: 600; font-size: 15px; padding: 12px 24px; border-radius: 8px; border: none; cursor: pointer; transition: all 0.2s; color: white; text-decoration: none; }
    .btn-primary { background: linear-gradient(135deg, #2563eb, #1d4ed8); }
    .btn-auth { background: #065f46; border: 2px solid var(--auth-green); flex: 1; padding: 16px; font-size: 16px; }
    .btn-auth.selected { background: var(--auth-green); color: #064e3b; box-shadow: 0 0 16px rgba(16,185,129,0.4); }
    .btn-rep { background: #7f1d1d; border: 2px solid var(--rep-red); flex: 1; padding: 16px; font-size: 16px; }
    .btn-rep.selected { background: var(--rep-red); color: #450a0a; box-shadow: 0 0 16px rgba(239,68,68,0.4); }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
    .badge-blue { background: rgba(59,130,246,0.2); color: #60a5fa; border: 1px solid rgba(59,130,246,0.3); }
    .badge-green { background: rgba(16,185,129,0.2); color: #34d399; }
    .likert-btn { flex: 1; background: var(--bg-secondary); border: 1px solid var(--border); color: white; padding: 12px 6px; border-radius: 8px; cursor: pointer; text-align: center; }
    .likert-btn.selected { background: var(--accent-blue); border-color: #60a5fa; font-weight: bold; }
    .progress-track { width: 100%; height: 8px; background: var(--bg-secondary); border-radius: 4px; overflow: hidden; margin: 16px 0; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #06b6d4); }
    .viewfinder { position: relative; width: 100%; height: 320px; background: radial-gradient(circle, #1e293b 0%, #0f172a 100%); border-radius: 12px; border: 2px solid var(--border); display: flex; align-items: center; justify-content: center; overflow: hidden; margin-bottom: 20px; }
  </style>
</head>
<body>
  <header>
    <div class="header-content">
      <div style="display:flex; align-items:center; gap:10px;">
        <span style="font-size:22px;">👟</span>
        <strong style="font-size:18px;">SNEAKER<span style="color:var(--accent-cyan);">AUTH</span> LAB</strong>
        <span class="badge badge-blue">CSE 594 STUDY</span>
      </div>
      <div style="display:flex; gap:16px; font-size:14px;">
        <a href="#hub" onclick="setRoute('hub')" style="color:var(--text-main); text-decoration:none;">Hub</a>
        <a href="#without-ai" onclick="setRoute('without-ai')" style="color:var(--text-muted); text-decoration:none;">Without AI</a>
        <a href="#with-ai" onclick="setRoute('with-ai')" style="color:var(--text-muted); text-decoration:none;">With AI</a>
        <a href="/api/export" style="color:var(--accent-cyan); text-decoration:none;">Export CSV</a>
      </div>
    </div>
  </header>

  <div class="container" id="appRoot"></div>

  <script>
    let currentRoute = "hub";
    let participantName = "";
    let sessionId = "SESS_" + Math.random().toString(36).substring(2, 9).toUpperCase();
    let trials = [];
    let currentIndex = 0;
    let recordedTrials = [];
    let aiConsulted = false;
    let aiLatency = null;
    let trialStartTime = Date.now();
    let currentDecision = null;
    let currentConfidence = null;

    function setRoute(r) {
      currentRoute = r;
      if (r === "hub") renderHub();
      else startStudy(r);
    }

    function renderHub() {
      document.getElementById("appRoot").innerHTML = \`
        <div style="text-align:center; padding:30px 0;">
          <span class="badge badge-blue">ASSIGNMENT 3 USER STUDY</span>
          <h1 style="font-size:32px; font-weight:900; margin:12px 0;">Sneaker & Streetwear "Legit Check" Study</h1>
          <p style="color:var(--text-muted); max-width:600px; margin:0 auto;">Distinguish authentic retail collectible sneakers from 1:1 replicas. Compare performance with and without AI telemetry.</p>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:30px;">
          <div class="card">
            <span class="badge" style="background:#334155;">CONDITION 1</span>
            <h2 style="font-size:20px; margin:10px 0;">Without AI (Baseline)</h2>
            <p style="color:var(--text-muted); font-size:14px; margin-bottom:16px;">10 trials evaluated purely by human visual inspection.</p>
            <button class="btn btn-primary" style="width:100%;" onclick="startStudy('without-ai')">Start Without AI →</button>
          </div>
          <div class="card" style="border-color:rgba(59,130,246,0.5);">
            <span class="badge badge-blue">CONDITION 2</span>
            <h2 style="font-size:20px; margin:10px 0;">With AI (Assisted)</h2>
            <p style="color:var(--text-muted); font-size:14px; margin-bottom:16px;">10 trials with on-demand SneakerAuthNet telemetry.</p>
            <button class="btn btn-primary" style="width:100%;" onclick="startStudy('with-ai')">Start With AI →</button>
          </div>
        </div>
        <div class="card" style="text-align:center;">
          <span style="color:var(--text-muted); font-size:14px;">Administrator tools: </span>
          <a href="/api/export" class="btn" style="background:var(--bg-secondary); border:1px solid var(--border); padding:8px 16px; margin-left:10px;">⬇ Download Collected Results (.CSV)</a>
        </div>
      \`;
    }

    async function startStudy(cond) {
      currentRoute = cond;
      document.getElementById("appRoot").innerHTML = \`
        <div class="card" style="max-width:640px; margin:40px auto;">
          <span class="badge badge-blue">\${cond === "with-ai" ? "AI-ASSISTED" : "BASELINE"} STUDY</span>
          <h2 style="font-size:24px; margin:12px 0;">Participant Registration</h2>
          <p style="color:var(--text-muted); font-size:14px; margin-bottom:20px;">Please enter your name or student ID for participation credit:</p>
          <input id="nameInput" type="text" placeholder="e.g. Alex Smith" style="width:100%; padding:14px; border-radius:8px; background:var(--bg-primary); border:1px solid var(--border); color:white; font-size:16px; margin-bottom:20px;" />
          <button class="btn btn-primary" style="width:100%;" onclick="loadAndRunTrials('\${cond}')">Begin 10 Study Trials →</button>
        </div>
      \`;
    }

    async function loadAndRunTrials(cond) {
      const name = document.getElementById("nameInput") ? document.getElementById("nameInput").value.trim() : "";
      if (!name) return alert("Please enter your name to proceed.");
      participantName = name;

      const res = await fetch("/api/trials?condition=" + cond);
      const data = await res.json();
      trials = data.trials;
      currentIndex = 0;
      recordedTrials = [];
      renderTrial();
    }

    function renderTrial() {
      const t = trials[currentIndex];
      aiConsulted = false;
      aiLatency = null;
      currentDecision = null;
      currentConfidence = null;
      trialStartTime = Date.now();
      const progress = Math.round(((currentIndex + 1) / trials.length) * 100);

      document.getElementById("appRoot").innerHTML = \`
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <div>
            <span class="badge badge-blue">\${currentRoute === "with-ai" ? "AI-ASSISTED" : "BASELINE"}</span>
            <strong style="margin-left:8px;">Trial \${currentIndex + 1} of \${trials.length}</strong>
          </div>
          <span style="color:var(--text-muted); font-size:13px;">Participant: \${participantName}</span>
        </div>
        <div class="progress-track"><div class="progress-fill" style="width:\${progress}%;"></div></div>

        <div class="viewfinder">
          <div style="text-align:center;">
            <div style="font-size:42px; margin-bottom:8px;">🔍</div>
            <h3 style="font-size:18px; color:white;">\${t.sneaker_model}</h3>
            <p style="color:var(--accent-cyan); font-family:monospace; margin-top:4px;">Diagnostic Zone: \${t.inspection_zone.replace(/_/g, " ")}</p>
            \${t.is_attention_check ? '<p style="color:var(--rep-red); font-weight:bold; margin-top:10px;">⚠ ATTENTION CHECK: Select REPLICA and Confidence 5 to confirm attention.</p>' : ''}
          </div>
        </div>

        \${currentRoute === "with-ai" && !t.is_attention_check ? \`
          <div id="aiTelemetryBox" class="card" style="border:1px dashed var(--border); display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong>🤖 SneakerAuthNet AI Diagnostic Caliper</strong>
              <p style="color:var(--text-muted); font-size:13px; margin-top:4px;">Analyzes stitch density, barcode kerning, and micro-apertures.</p>
            </div>
            <button class="btn btn-primary" onclick="consultAi()">🔍 Consult AI Telemetry</button>
          </div>
        \` : ''}

        <div class="card">
          <h4 style="margin-bottom:10px; font-size:15px;">1. Authentication Verdict:</h4>
          <div style="display:flex; gap:16px; margin-bottom:20px;">
            <button id="btnAuth" class="btn btn-auth" onclick="selectVerdict('Authentic')">✓ Authentic (Retail)</button>
            <button id="btnRep" class="btn btn-rep" onclick="selectVerdict('Replica')">✗ Replica (Counterfeit)</button>
          </div>
          <h4 style="margin-bottom:10px; font-size:15px;">2. Confidence Level (1 = Guess, 5 = Certain):</h4>
          <div style="display:flex; gap:8px; margin-bottom:24px;">
            \${[1,2,3,4,5].map(v => \`<button id="conf\${v}" class="likert-btn" onclick="selectConfidence(\${v})">\${v}</button>\`).join('')}
          </div>
          <button id="btnSubmitTrial" class="btn btn-primary" style="width:100%; opacity:0.4; cursor:not-allowed;" onclick="submitTrial()">Submit Verdict & Next Trial →</button>
        </div>
      \`;
    }

    function consultAi() {
      aiConsulted = true;
      aiLatency = Date.now() - trialStartTime;
      const t = trials[currentIndex];
      document.getElementById("aiTelemetryBox").innerHTML = \`
        <div style="width:100%;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <strong>🤖 SneakerAuthNet Telemetry</strong>
            <span class="badge" style="background:\${t.ai_prediction === 'Authentic' ? 'var(--auth-green)' : 'var(--rep-red)'}; color:white;">
              AI FLAG: \${t.ai_prediction.toUpperCase()} (\${Math.round(t.ai_confidence * 100)}% CONFIDENCE)
            </span>
          </div>
          <div style="background:rgba(0,0,0,0.3); padding:10px; border-radius:6px; font-family:monospace; font-size:13px; color:#cbd5e1;">
            \${t.ai_inspection_notes}
          </div>
          <div style="font-size:11px; color:var(--warning-amber); margin-top:6px;">
            ⚠ Warning: Model cannot reliably distinguish factory QC variance or lens glare from genuine counterfeit flaws.
          </div>
        </div>
      \`;
    }

    function selectVerdict(v) {
      currentDecision = v;
      document.getElementById("btnAuth").classList.toggle("selected", v === "Authentic");
      document.getElementById("btnRep").classList.toggle("selected", v === "Replica");
      checkReady();
    }

    function selectConfidence(c) {
      currentConfidence = c;
      [1,2,3,4,5].forEach(v => document.getElementById("conf" + v).classList.toggle("selected", v === c));
      checkReady();
    }

    function checkReady() {
      const btn = document.getElementById("btnSubmitTrial");
      if (currentDecision && currentConfidence) {
        btn.style.opacity = "1";
        btn.style.cursor = "pointer";
      }
    }

    function submitTrial() {
      if (!currentDecision || !currentConfidence) return;
      const reactionTime = Date.now() - trialStartTime;
      recordedTrials.push({
        ...trials[currentIndex],
        human_prediction: currentDecision,
        confidence_rating: currentConfidence,
        reaction_time_ms: reactionTime,
        ai_consulted: aiConsulted,
        ai_consult_latency_ms: aiLatency
      });

      if (currentIndex + 1 < trials.length) {
        currentIndex++;
        renderTrial();
      } else {
        renderSurvey();
      }
    }

    function renderSurvey() {
      document.getElementById("appRoot").innerHTML = \`
        <div class="card" style="max-width:640px; margin:30px auto;">
          <span class="badge badge-green">TRIALS COMPLETE!</span>
          <h2 style="font-size:24px; margin:12px 0;">Post-Task Experience Survey</h2>
          <div style="margin-bottom:16px;">
            <label style="display:block; font-size:14px; font-weight:bold; margin-bottom:8px;">Mental Demand (1 = Low, 5 = High):</label>
            <div style="display:flex; gap:8px;">
              \${[1,2,3,4,5].map(v => \`<button id="mental\${v}" class="likert-btn \${v===3?'selected':''}" onclick="setSurveyVal('mental',\${v})">\${v}</button>\`).join('')}
            </div>
          </div>
          <div style="margin-bottom:20px;">
            <label style="display:block; font-size:14px; font-weight:bold; margin-bottom:8px;">Comments on Task / AI Assistance:</label>
            <textarea id="feedbackText" rows="3" style="width:100%; padding:10px; border-radius:6px; background:var(--bg-primary); border:1px solid var(--border); color:white; font-size:14px;"></textarea>
          </div>
          <button class="btn btn-primary" style="width:100%;" onclick="finishSubmission()">Complete & Save Study Submission ✓</button>
        </div>
      \`;
      window.surveyMental = 3;
    }

    function setSurveyVal(key, v) {
      window.surveyMental = v;
      [1,2,3,4,5].forEach(i => document.getElementById("mental" + i).classList.toggle("selected", i === v));
    }

    async function finishSubmission() {
      const feedback = document.getElementById("feedbackText") ? document.getElementById("feedbackText").value : "";
      const payload = {
        session_id: sessionId,
        participant_name: participantName,
        condition: currentRoute,
        trials: recordedTrials,
        survey: {
          mental_demand: window.surveyMental || 3,
          feedback: feedback
        }
      };

      await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      document.getElementById("appRoot").innerHTML = \`
        <div class="card" style="max-width:600px; margin:40px auto; text-align:center; padding:36px 20px;">
          <div style="font-size:48px; margin-bottom:12px;">🎉</div>
          <h2 style="color:var(--auth-green); font-size:24px; margin-bottom:8px;">Study Completed!</h2>
          <p style="color:var(--text-muted); font-size:14px; margin-bottom:20px;">Thank you, \${participantName}. Your \${recordedTrials.length} evaluations have been logged.</p>
          <div style="background:var(--bg-secondary); padding:14px; border-radius:8px; margin-bottom:20px;">
            <div style="font-size:11px; color:var(--text-muted);">VERIFICATION CODE</div>
            <div style="font-size:20px; font-weight:bold; color:var(--accent-cyan); font-family:monospace;">\${sessionId}</div>
          </div>
          <a href="/" class="btn btn-primary" onclick="setRoute('hub')">Back to Hub</a>
        </div>
      \`;
    }

    renderHub();
  </script>
</body>
</html>`;
}

server.listen(PORT, () => {
  console.log(`Sneaker Legit Check Study running on http://localhost:${PORT}`);
});

