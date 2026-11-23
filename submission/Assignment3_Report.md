# Human-Subjects Study Evaluation and Reflection: Streetwear & Sneaker "Legit Check" Authentication

**Student Name:** Nikhil Janarthan Surendran  
**Course:** CSE 594: Designing AI-Assisted Tasks  
**Assignment:** Assignment 3 Part A3-2: Analyze Collected Data and Reflect on Results  
**Submission Date:** November 22, 2026  

---

## 1. Task Description, Interface Links, and Design Decisions

### 1.1 Live Task Interfaces
The two experimental interfaces developed for this study remain continuously hosted and operational:
- **Baseline Interface (Without AI):** https://sneaker-study-mu.vercel.app/without-ai
- **Assisted Interface (With AI):** https://sneaker-study-mu.vercel.app/with-ai
- **Administrative Telemetry Dashboard & CSV Export:** https://sneaker-study-mu.vercel.app/admin
- **Source Code Repository:** https://github.com/nikhilnj16/sneaker-study

### 1.2 Task Domain and Performer Expectations
In the secondary resale economy for collectible footwear (e.g., StockX, GOAT, eBay), authenticators must evaluate high-demand sneakers within strict time budgets (typically 20 to 35 seconds per shoe) to identify counterfeit replicas ("super-clones"). Untrained performers lack knowledge of micro-tolerances such as thread stitch intervals, font stroke thickness, and circular punch die diameters.

In this study, participants acted as Sneaker Authentication Specialists evaluating trials drawn from the 200-trial study dataset constructed in Assignment 2 across six collectible sneaker models: *Air Jordan 1 Retro High OG 'Chicago'*, *Nike Dunk Low 'Panda'*, *Air Jordan 4 Retro 'Military Black'*, *Travis Scott x Air Jordan 1 Low 'Reverse Mocha'*, *Yeezy Boost 350 V2 'Zebra'*, and *New Balance 550 'White Grey'*.

For each trial, the interface presented:
1. **Sneaker Profile Overview:** Full-shoe product photograph, official colorway, factory style code, and target anatomical inspection zone.
2. **Diagnostic Micro-Region Viewfinder:** A macro crop isolating one of four physical inspection zones: Heel Stitching & Hourglass, Size Tag & Barcode Kerning, Tongue Tag & Trademark Bleed, or Toe Box Perforation & Grain.
3. **Optical Viewfinder Controls:** Interactive 2X Macro Magnifier and High-Contrast filters to inspect thread and font details.
4. **Decision Inputs:** Binary verdict buttons (`Authentic` vs. `Replica`) paired with a 5-point Likert decision confidence rating (1 = Pure Guess to 5 = Absolute Certainty).
5. **Passive Timing:** A silent millisecond timer recording reaction latency from image render to submission.

### 1.3 AI Assistance Workflow and Design Decisions
In Assignment 3, students were asked to consider interface presentation and workflow (specifically, whether performers should see AI output directly or upon request). 

I implemented an **On-Demand Progressive Disclosure ("Upon Request")** workflow in the AI-assisted interface:
- **Mitigating Automation Bias:** Directly displaying an AI prediction badge (e.g., *"Authentic, 99.4% confidence"*) upon trial load creates cognitive anchoring. Participants glaze over the image and rubber-stamp the label without examining the macro features.
- **Enabling Human-AI Complementarity:** In Assignment 2, the trained PyTorch model *SneakerAuthNet* achieved 81.5% accuracy with 37 errors caused by authentic factory quality control (QC) defects and flash glare. Direct exposure forces the performer to inherit all 37 AI errors. Requiring performers to inspect the photo first and click **`[ Consult AI Telemetry ]`** forces an initial visual hypothesis.
- **Behavioral Interaction Logging:** The server logs whether the participant consulted the AI (`ai_consulted`) and the latency elapsed before consultation (`ai_consult_latency_ms`), capturing valuable telemetry on performer reliance.

### 1.4 Implementation of Advanced Interface & Analysis Components
- **Custom Web Application Interface:** Engineered and deployed an independent, full-stack Next.js 14 web application on Vercel with dedicated REST API endpoints (`/api/trials`, `/api/submit`, `/api/export`) rather than using third-party survey platforms like Qualtrics.
- **Synchronous AI Telemetry Integration:** Built a live on-demand AI telemetry caliper component (`AiTelemetryCard.tsx`) providing calibrated probabilities, recommendation badges, and extracted physical measurements (stitch density, barcode sharpness, stroke thickness).
- **Inferential Statistical Significance Testing:** Performed formal inferential statistical tests (Fisher's exact test, Chi-square with Yates' continuity correction, Welch's two-sample t-test) comparing performance and reaction times across conditions.

---

## 2. Data Collection Description

### 2.1 Sample Size and Participant Population
Data was collected during the scheduled in-class deployment session on November 12, 2026. A total of 6 student classmates participated, completing 66 total trial evaluations (60 experimental trials and 6 attention check trials).

To eliminate order effects, an AB/BA counterbalanced ordering protocol was used:
- **Group 1 (With AI Condition First):** Arnav, Ishaan Jagyasi (uniqname: `ijagyasi`), and Jonathan Doredla (uniqname: `doredla`).
- **Group 2 (Without AI Baseline First):** saad pallumeera (uniqname: `saadp`), Jessica Liu (uniqname: `liuyhan`), and Yile Sun (uniqname: `sunyyyl`).

### 2.2 Variables Collected
For every trial, the backend recorded: session identifier, participant name/uniqname, experimental condition (`without-ai` vs. `with-ai`), trial identifier, sneaker model, inspection zone, ground truth, AI prediction, human decision, classification correctness, confidence rating (1–5), reaction time in milliseconds, AI consultation status, and consultation latency. At the conclusion of the session, participants completed a post-study survey capturing NASA-TLX mental demand (1–5), perceived task difficulty (1–5), and open-ended qualitative feedback.

### 2.3 Attention Check Integrity and Data Quality
Trial #5 in each session presented an attention check prompt: *"SYSTEM ATTENTION VERIFICATION CHECK: Please select Replica with Confidence 5 to verify your attention."* The interface enforced an automated gate: selecting any other option displayed an alert banner and blocked progression. All 6 participants (100.0%) successfully passed on their first attempt. There were zero data dropouts, incomplete sessions, or missing values across the 66 collected records.

---

## 3. Task Performance Analysis

### 3.1 Overall Performance Comparison
Across the 60 experimental trials (30 With AI, 30 Without AI), participants achieved the performance metrics summarized in Table 1.

#### Table 1: Classification Performance Benchmark
| Metric | Without AI (Baseline) | With AI (Assisted) | Absolute Delta |
| :--- | :--- | :--- | :--- |
| Completed Trials (N) | 30 | 30 | — |
| Overall Accuracy (%) | 43.33% (13 / 30) | 76.67% (23 / 30) | +33.34% |
| Precision (Authentic) | 43.75% (7 / 16) | 83.33% (10 / 12) | +39.58% |
| Recall (Authentic) | 46.67% (7 / 15) | 66.67% (10 / 15) | +20.00% |
| Macro F1-Score | 0.4516 | 0.7407 | +0.2891 (+64.0%) |
| True Positives (TP) | 7 | 10 | +3 |
| True Negatives (TN) | 6 | 13 | +7 |
| False Positives (FP) | 9 | 2 | -7 (-77.8%) |
| False Negatives (FN) | 8 | 5 | -3 (-37.5%) |

AI assistance produced a 33.34 percentage point increase in accuracy (from 43.33% to 76.67%) and reduced false alarms (counterfeits misclassified as authentic) by 77.8% (from 9 false positives down to 2).

### 3.2 Individual Participant Performance
- **With AI Condition:**
  - Arnav: 90.0% accuracy (9 / 10), mean confidence = 3.50, mean reaction time = 17.7s.
  - Ishaan Jagyasi: 80.0% accuracy (8 / 10), mean confidence = 3.30, mean reaction time = 7.3s.
  - Jonathan Doredla: 60.0% accuracy (6 / 10), mean confidence = 3.30, mean reaction time = 7.2s.
- **Without AI Baseline Condition:**
  - saad pallumeera: 60.0% accuracy (6 / 10), mean confidence = 3.00, mean reaction time = 2.6s.
  - Jessica Liu: 50.0% accuracy (5 / 10), mean confidence = 3.00, mean reaction time = 1.8s.
  - Yile Sun: 20.0% accuracy (2 / 10), mean confidence = 3.10, mean reaction time = 1.7s.

### 3.3 Diagnostic Inspection Zone Breakdown
Performance varied substantially across the four diagnostic inspection zones, as detailed in Table 2.

#### Table 2: Accuracy by Diagnostic Inspection Zone
| Diagnostic Inspection Zone | Without AI Accuracy | With AI Accuracy | Absolute Delta |
| :--- | :--- | :--- | :--- |
| Size Tag & Barcode Kerning | 20.0% (2 / 10) | 88.9% (8 / 9) | +68.9% |
| Tongue Tag & Trademark Bleed | 25.0% (1 / 4) | 66.7% (6 / 9) | +41.7% |
| Toe Box Perforation & Grain | 57.1% (4 / 7) | 83.3% (5 / 6) | +26.2% |
| Heel Stitching & Hourglass | 66.7% (6 / 9) | 66.7% (4 / 6) | 0.0% |

In Size Tag & Barcode Kerning, unassisted humans performed near chance (20.0%). Classmates had no baseline knowledge of factory UPC typography. SneakerAuthNet extracted continuous stroke thickness metrics, driving an 88.9% accuracy rate. Conversely, Heel Stitching & Hourglass exhibited zero delta (66.7% in both conditions) because gross anatomical heel curvature was the only feature accessible to naive visual observation.

---

## 4. Additional Measurements Analysis

In addition to task accuracy, three secondary behavioral dimensions were evaluated to understand performer cognition: decision confidence, inspection reaction time, and subjective workload.

#### Table 3: Summary of Additional Measurements
| Measurement Dimension | Without AI (Baseline) | With AI (Assisted) | Statistical Test & Significance |
| :--- | :--- | :--- | :--- |
| Decision Confidence (1–5 Likert) | 3.03 (SD = 0.76) | 3.37 (SD = 0.56) | t = 1.931, p = 0.0589, d = 0.498 |
| Inspection Reaction Time (seconds) | 2.04s (SD = 0.77s) | 10.73s (SD = 17.99s) | t = 2.645, p = 0.0130 (p < 0.05) |
| NASA-TLX Mental Demand (1–5) | 3.33 / 5.00 | 3.33 / 5.00 | Identical cognitive baseline |
| Perceived Task Difficulty (1–5) | 3.33 / 5.00 | 3.67 / 5.00 | AI prompted deeper scrutiny |
| AI Consultation Rate (%) | — | 100.0% (30 / 30 trials) | Universal reliance |
| Mean AI Consultation Latency | — | 6.11 seconds | Pre-consultation inspection |

### 4.1 Reaction Time Analysis: Rapid Guessing vs. Deliberate Verification
Without AI trials were completed 5.3 times faster (2.04 seconds) than With AI trials (10.73 seconds). In the baseline condition, novice participants felt unequipped to evaluate technical macro features. Lacking reference standards, they defaulted to rapid heuristic guessing. In the AI-assisted condition, participants spent an average of 6.11 seconds examining the shoe before clicking Consult AI, and an additional 4.62 seconds reading the telemetry breakdown. The AI converted rapid superficial guessing into deliberate analytical inspection.

---

## 5. Statistical Significance Testing

To evaluate whether the observed experimental differences were statistically significant, inferential tests were conducted following standard HCI statistical practices.

### 5.1 Test 1: Task Accuracy Contingency Analysis
To compare binary classification outcomes (Correct vs. Incorrect) across the two independent groups:

#### Table 4: Accuracy Contingency Matrix (2x2)
| Condition | Correct Decisions | Incorrect Decisions | Total Trials |
| :--- | :--- | :--- | :--- |
| With AI | 23 | 7 | 30 |
| Without AI | 13 | 17 | 30 |
| Total | 36 | 24 | 60 |

- **Chi-Square Test with Yates' Continuity Correction:**
  $$\chi^2 = \frac{N (|ad - bc| - N/2)^2}{(a+b)(c+d)(a+c)(b+d)} = \frac{60 (|23 \times 17 - 7 \times 13| - 30)^2}{(30)(30)(36)(24)} = 5.6250$$
  Degrees of freedom ($df$) = 1, **$p$-value = 0.0177** ($p < 0.05$). The difference in classification accuracy is statistically significant.
- **Fisher's Exact Test:** Two-tailed **$p$-value = 0.0171** ($p < 0.05$).
- **Odds Ratio (OR):**
  $$\text{OR} = \frac{23 \times 17}{7 \times 13} = 4.297 \quad (95\% \text{ Confidence Interval: } [1.392, 13.264])$$
  Participants supported by SneakerAuthNet were 4.30 times more likely to submit a correct classification.

### 5.2 Test 2: Reaction Time Welch's Two-Sample t-Test
Because variances differed substantially ($\text{Var}_{\text{AI}} = 323.49$ vs. $\text{Var}_{\text{NoAI}} = 0.60$), Welch's unequal variances $t$-test was conducted on reaction time:
$$t = \frac{\bar{X}_{\text{AI}} - \bar{X}_{\text{NoAI}}}{\sqrt{\frac{s_{\text{AI}}^2}{n_{\text{AI}}} + \frac{s_{\text{NoAI}}^2}{n_{\text{NoAI}}}}} = \frac{10.733 - 2.040}{\sqrt{\frac{323.49}{30} + \frac{0.60}{30}}} = 2.6450$$
Degrees of freedom ($df$) = 29.11, **$p$-value = 0.0130** ($p < 0.05$), Cohen's $d = 0.683$ (medium-to-large effect size). The increase in cognitive inspection time was statistically significant.

---

## 6. Critical Reflection on Results

### 6.1 Did the Assignment 2 Prediction Hold?
In Assignment 2, the formal prediction was:
$$\text{Performance(Human-AI Joint: 91%–94%)} > \text{Performance(AI-Only: 81.50%)} > \text{Performance(Human-Only: 60%–65%)}$$

The empirical results observed in this user study yielded a different ranking:
$$\text{Performance(AI-Only: 81.50%)} > \text{Performance(Human-AI Joint: 76.67%)} > \text{Performance(Human-Only: 43.33%)}$$

### 6.2 Diagnosis: Why Joint Performance Ranked Second Instead of First
1. **AI Assistance Provided Substantial Scaffolding (+33.34%):** Human-AI joint performance (76.67%) far exceeded unassisted human baseline performance (43.33%). Without AI, participants performed worse than coin-flipping on technical zones like barcode kerning (20.0%). The AI provided essential diagnostic support.
2. **Why Joint Performance Failed to Beat Standalone AI (76.67% vs. 81.50%):** In Assignment 2, the theoretical rationale for human-AI superiority was that human performers would act as a contextual filter, catching the 24 AI errors caused by authentic factory QC stitching defects and photographic flash glare. However, this hypothesis rested on an assumption that proved invalid: that human performers possess the baseline domain competence required to audit the AI.

As qualitative feedback from participants confirmed, student classmates were complete novices:
- **Jessica Liu (Without AI: 50%, With AI: Post-Study Feedback):** *"I found it very difficult to distinguish authentic items from replicas, even with AI assistance. I felt confused when the AI gave different judgments because I couldn't identify the differences that justified them. Since I lacked the knowledge to assess authenticity myself, I felt I had little choice but to rely on the AI's conclusions."*
- **Ishaan Jagyasi (With AI: 80%) & Jonathan Doredla (With AI: 60%):** *"I had no idea what I was doing without AI, making it pretty hard. With AI, I was able to just follow its suggestions."*
- **saad pallumeera (Without AI: 60%):** *"dont have reference for the real specifications of the shoe as compared to the replica. other than when the logo was misaligned i couldnt really tell it apart without ai."*
- **Yile Sun (Without AI: 20%):** *"A difficult task for me, so the AI helps a lot. But the AI's explanations are also hard for me to understand."*

3. **Automation Bias and Error Propagation:** Of the 7 errors made in the With AI condition, 5 errors (71.4%) occurred on trials where the AI model was itself incorrect in Assignment 2 (e.g., authentic factory QC stitching anomalies). Because students lacked the domain knowledge to dispute the AI, they exhibited 100% agreement bias, rubber-stamping the AI's incorrect prediction. Furthermore, on 2 trials, students second-guessed correct AI recommendations due to confusion, dropping joint performance from 81.50% down to 76.67%.

### 6.3 Implications for Human-AI Interaction Design
- **Complementarity Demands Human Competence:** Human-AI complementarity cannot be realized if the human is a novice in the task domain. An AI measurement tool cannot be audited by a performer who does not understand the baseline tolerances.
- **The Explainability Gap:** Presenting raw dimensional metrics (e.g., *"Stroke thickness: 2.99pt | Barcode sharpness: 0.56"*) overwhelmed participants who did not know retail baselines. Future designs should translate continuous numbers into qualitative natural language heuristics (e.g., *"Barcode font is 28% thicker than factory specification"*).

---

## 7. Data Files and Replication Instructions for Teaching Staff

### 7.1 Collected Dataset File
The raw dataset file is included in the project directory:
`CSE594AS3/assignment3_collected_data_1795394000581.csv`

Columns: `session_id`, `participant_name`, `condition`, `trial_id`, `trial_index`, `sneaker_model`, `inspection_zone`, `ground_truth`, `ai_prediction`, `human_prediction`, `is_human_correct`, `confidence_rating`, `reaction_time_ms`, `ai_consulted`, `ai_consult_latency_ms`, `attention_check_passed`, `mental_demand`, `perceived_difficulty`, `participant_feedback`, `submitted_at`.

### 7.2 Automated Replication Commands
To replicate all performance metrics, confusion matrices, and statistical tests reported in this document:

```bash
cd CSE594AS3

# Option A: Run via Node.js
node scripts/analyze_study_results.js

# Option B: Run via Python
python scripts/analyze_study_results.py
```

Expected terminal output verifies:
- Total records: 66 | Attention check pass rate: 100.0% (6 / 6)
- With AI accuracy: 76.67% (23 / 30) | Without AI accuracy: 43.33% (13 / 30)
- Chi-Square test: $\chi^2 = 5.6250, p = 0.0177$ | Odds Ratio: $4.297$
- Reaction time: With AI = 10.73s vs. Without AI = 2.04s ($t = 2.645, p = 0.0130$)
