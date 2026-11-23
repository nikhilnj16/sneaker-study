const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, 'CSE594AS3', 'submission', 'Assignment3_Report.pdf');

const doc = new PDFDocument({
  size: 'LETTER',
  margins: { top: 45, bottom: 45, left: 45, right: 45 },
  bufferPages: true,
  autoFirstPage: true
});

const writeStream = fs.createWriteStream(outputPath);
doc.pipe(writeStream);

const PAGE_LEFT = 45;
const PAGE_RIGHT = 567;
const CONTENT_WIDTH = 522;
const PAGE_BOTTOM = 747; // 792 - 45

// Helper to ensure y position and page breaks
function ensureSpace(heightNeeded) {
  if (doc.y + heightNeeded > PAGE_BOTTOM) {
    doc.addPage();
    doc.x = PAGE_LEFT;
    doc.y = 45;
  }
}

function drawDivider() {
  ensureSpace(16);
  doc.y += 4;
  doc.save()
     .strokeColor('#000000')
     .lineWidth(0.75)
     .moveTo(PAGE_LEFT, doc.y)
     .lineTo(PAGE_RIGHT, doc.y)
     .stroke()
     .restore();
  doc.y += 8;
  doc.x = PAGE_LEFT;
}

function drawSectionHeading(text) {
  ensureSpace(40);
  doc.y += 6;
  doc.font('Helvetica-Bold')
     .fontSize(13)
     .fillColor('#000000')
     .text(text, PAGE_LEFT, doc.y, { width: CONTENT_WIDTH });
  doc.y += 4;
  doc.x = PAGE_LEFT;
}

function drawSubSectionHeading(text) {
  ensureSpace(30);
  doc.y += 4;
  doc.font('Helvetica-Bold')
     .fontSize(10.5)
     .fillColor('#000000')
     .text(text, PAGE_LEFT, doc.y, { width: CONTENT_WIDTH });
  doc.y += 3;
  doc.x = PAGE_LEFT;
}

function drawParagraph(text, options = {}) {
  const lineSpacing = options.lineGap || 2;
  const fontSize = options.fontSize || 9.5;
  const isBold = options.bold || false;
  const isItalic = options.italic || false;
  
  let fontName = 'Helvetica';
  if (isBold && isItalic) fontName = 'Helvetica-BoldOblique';
  else if (isBold) fontName = 'Helvetica-Bold';
  else if (isItalic) fontName = 'Helvetica-Oblique';
  
  doc.font(fontName)
     .fontSize(fontSize)
     .fillColor('#000000');
     
  const textHeight = doc.heightOfString(text, { width: CONTENT_WIDTH, lineGap: lineSpacing });
  ensureSpace(Math.min(textHeight, 40));
  
  doc.text(text, PAGE_LEFT, doc.y, {
    width: CONTENT_WIDTH,
    align: options.align || 'left',
    lineGap: lineSpacing
  });
  doc.y += (options.spaceAfter !== undefined ? options.spaceAfter : 5);
  doc.x = PAGE_LEFT;
}

function drawBullet(title, body) {
  const fullText = (title ? `${title}: ` : '') + body;
  doc.font('Helvetica')
     .fontSize(9.5)
     .fillColor('#000000');
     
  const textHeight = doc.heightOfString(fullText, { width: CONTENT_WIDTH - 15, lineGap: 1.5 });
  ensureSpace(Math.min(textHeight + 4, 35));
  
  const curY = doc.y;
  // draw bullet dot
  doc.circle(PAGE_LEFT + 5, curY + 5, 2).fillColor('#000000').fill();
  
  doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#000000');
  let titleWidth = 0;
  if (title) {
    doc.text(title + ': ', PAGE_LEFT + 15, curY, { continued: true });
    doc.font('Helvetica').text(body, { width: CONTENT_WIDTH - 15, lineGap: 1.5 });
  } else {
    doc.font('Helvetica').text(body, PAGE_LEFT + 15, curY, { width: CONTENT_WIDTH - 15, lineGap: 1.5 });
  }
  
  doc.y += 4;
  doc.x = PAGE_LEFT;
}

function drawQuoteBox(speaker, quoteText) {
  doc.font('Helvetica-Oblique')
     .fontSize(9)
     .fillColor('#000000');
     
  const textToMeasure = `"${quoteText}"`;
  const textHeight = doc.heightOfString(textToMeasure, { width: CONTENT_WIDTH - 28, lineGap: 1.5 });
  const totalBoxHeight = textHeight + 20;
  
  ensureSpace(totalBoxHeight + 6);
  const startY = doc.y;
  
  // draw left vertical bar
  doc.save()
     .strokeColor('#000000')
     .lineWidth(2.5)
     .moveTo(PAGE_LEFT + 4, startY)
     .lineTo(PAGE_LEFT + 4, startY + totalBoxHeight)
     .stroke()
     .restore();
     
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#000000')
     .text(speaker, PAGE_LEFT + 14, startY + 2, { width: CONTENT_WIDTH - 20 });
     
  doc.font('Helvetica-Oblique').fontSize(9).fillColor('#000000')
     .text(`"${quoteText}"`, PAGE_LEFT + 14, doc.y + 2, { width: CONTENT_WIDTH - 20, lineGap: 1.5 });
     
  doc.y = startY + totalBoxHeight + 6;
  doc.x = PAGE_LEFT;
}

function drawTable(title, headers, rows, colWidths, colAligns = []) {
  if (title) {
    ensureSpace(30);
    doc.font('Helvetica-Bold')
       .fontSize(9.5)
       .fillColor('#000000')
       .text(title, PAGE_LEFT, doc.y, { width: CONTENT_WIDTH });
    doc.y += 4;
    doc.x = PAGE_LEFT;
  }
  
  const headerHeight = 20;
  ensureSpace(headerHeight + 35);
  
  let curY = doc.y;
  
  function renderHeaderRow(y) {
    // header background
    doc.save()
       .rect(PAGE_LEFT, y, CONTENT_WIDTH, headerHeight)
       .fillColor('#f0f0f0')
       .fill()
       .strokeColor('#000000')
       .lineWidth(0.75)
       .rect(PAGE_LEFT, y, CONTENT_WIDTH, headerHeight)
       .stroke()
       .restore();
       
    let curX = PAGE_LEFT;
    for (let i = 0; i < headers.length; i++) {
      const w = colWidths[i];
      const align = colAligns[i] || 'left';
      doc.font('Helvetica-Bold')
         .fontSize(8.5)
         .fillColor('#000000')
         .text(headers[i], curX + 4, y + 5.5, { width: w - 8, align: align });
      curX += w;
    }
  }
  
  renderHeaderRow(curY);
  curY += headerHeight;
  
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    
    // calculate required height for this row
    let maxCellHeight = 16;
    for (let c = 0; c < row.length; c++) {
      doc.font('Helvetica').fontSize(8.5);
      const h = doc.heightOfString(String(row[c]), { width: colWidths[c] - 8, lineGap: 1 }) + 8;
      if (h > maxCellHeight) maxCellHeight = h;
    }
    
    // check if row fits on current page
    if (curY + maxCellHeight > PAGE_BOTTOM) {
      doc.addPage();
      doc.x = PAGE_LEFT;
      curY = 45;
      renderHeaderRow(curY);
      curY += headerHeight;
    }
    
    // draw row borders and content
    doc.save()
       .strokeColor('#000000')
       .lineWidth(0.5)
       .rect(PAGE_LEFT, curY, CONTENT_WIDTH, maxCellHeight)
       .stroke()
       .restore();
       
    let curX = PAGE_LEFT;
    for (let c = 0; c < row.length; c++) {
      const w = colWidths[c];
      const align = colAligns[c] || 'left';
      
      // vertical grid lines between columns
      if (c > 0) {
        doc.save()
           .strokeColor('#000000')
           .lineWidth(0.5)
           .moveTo(curX, curY)
           .lineTo(curX, curY + maxCellHeight)
           .stroke()
           .restore();
      }
      
      const isBold = (c === 0 && (r === rows.length - 1 || row[c].includes('Accuracy') || row[c].includes('Total')));
      doc.font(isBold ? 'Helvetica-Bold' : 'Helvetica')
         .fontSize(8.5)
         .fillColor('#000000')
         .text(String(row[c]), curX + 4, curY + 4.5, { width: w - 8, align: align, lineGap: 1 });
         
      curX += w;
    }
    
    curY += maxCellHeight;
  }
  
  // CRITICAL: reset doc.x and doc.y so subsequent paragraphs are not trapped in a column!
  doc.x = PAGE_LEFT;
  doc.y = curY + 8;
}

// ==========================================
// DOCUMENT CONTENT GENERATION
// ==========================================

// Header Banner
doc.font('Helvetica-Bold')
   .fontSize(15)
   .fillColor('#000000')
   .text('Human-Subjects Study Evaluation and Reflection', PAGE_LEFT, doc.y, { width: CONTENT_WIDTH, align: 'center' });

doc.y += 2;
doc.font('Helvetica')
   .fontSize(11)
   .fillColor('#000000')
   .text('Streetwear & Sneaker "Legit Check" Counterfeit Authentication', PAGE_LEFT, doc.y, { width: CONTENT_WIDTH, align: 'center' });

doc.y += 8;

// Metadata Grid
doc.font('Helvetica-Bold').fontSize(9).text('Student Name: ', PAGE_LEFT, doc.y, { continued: true })
   .font('Helvetica').text('Nikhil Janarthan Surendran (uniqname: nikhilnj)', { continued: true })
   .font('Helvetica-Bold').text('   |   Course: ', { continued: true })
   .font('Helvetica').text('CSE 594: Designing AI-Assisted Tasks');

doc.y += 3;
doc.font('Helvetica-Bold').fontSize(9).text('Assignment: ', PAGE_LEFT, doc.y, { continued: true })
   .font('Helvetica').text('Assignment 3 Part A3-2: Analyze Collected Data and Reflect on Results', { continued: true })
   .font('Helvetica-Bold').text('   |   Date: ', { continued: true })
   .font('Helvetica').text('November 22, 2026');

drawDivider();

// ------------------------------------------
// SECTION 1
// ------------------------------------------
drawSectionHeading('1. TASK DESCRIPTION, INTERFACE LINKS, AND DESIGN DECISIONS');

drawSubSectionHeading('1.1 Operational Task Interfaces');
drawParagraph('The two experimental interfaces developed for this study remain continuously hosted, publicly accessible, and fully operational:');
drawBullet('Baseline Interface (Without AI)', 'https://sneaker-study-mu.vercel.app/without-ai');
drawBullet('Assisted Interface (With AI)', 'https://sneaker-study-mu.vercel.app/with-ai');
drawBullet('Administrative Telemetry & CSV Export', 'https://sneaker-study-mu.vercel.app/admin');
drawBullet('Source Code Repository', 'https://github.com/nikhilnj16/sneaker-study');

drawSubSectionHeading('1.2 Task Domain and Performer Expectations');
drawParagraph('In the secondary resale economy for collectible footwear (e.g., StockX, GOAT, eBay), authenticators must evaluate high-demand sneakers within strict time budgets (typically 20 to 35 seconds per shoe) to identify counterfeit replicas ("super-clones"). Untrained performers lack knowledge of micro-tolerances such as thread stitch intervals, font stroke thickness, and circular punch die diameters.');
drawParagraph('In this study, participants acted as Sneaker Authentication Specialists evaluating trials drawn from the 200-trial study dataset constructed in Assignment 2 across six collectible sneaker models: Air Jordan 1 Retro High OG \'Chicago\', Nike Dunk Low \'Panda\', Air Jordan 4 Retro \'Military Black\', Travis Scott x Air Jordan 1 Low \'Reverse Mocha\', Yeezy Boost 350 V2 \'Zebra\', and New Balance 550 \'White Grey\'.');
drawParagraph('For each trial, the interface presented:');
drawBullet('1. Sneaker Profile Overview', 'Full-shoe product photograph, official colorway, factory style code, and target anatomical inspection zone.');
drawBullet('2. Diagnostic Micro-Region Viewfinder', 'A macro crop isolating one of four physical inspection zones: Heel Stitching & Hourglass, Size Tag & Barcode Kerning, Tongue Tag & Trademark Bleed, or Toe Box Perforation & Grain.');
drawBullet('3. Optical Viewfinder Controls', 'Interactive 2X Macro Magnifier and High-Contrast filters to inspect thread and font details.');
drawBullet('4. Decision Inputs', 'Binary verdict buttons (Authentic vs. Replica) paired with a 5-point Likert decision confidence rating (1 = Pure Guess to 5 = Absolute Certainty).');
drawBullet('5. Passive Timing', 'A silent millisecond timer recording reaction latency from image render to submission.');

drawSubSectionHeading('1.3 AI Assistance Workflow and Design Decisions');
drawParagraph('In Assignment 3, students were asked to consider interface presentation and workflow (specifically, whether performers should see AI output directly or upon request). I implemented an On-Demand Progressive Disclosure ("Upon Request") workflow in the AI-assisted interface:');
drawBullet('Mitigating Automation Bias', 'Directly displaying an AI prediction badge (e.g., "Authentic, 99.4% confidence") upon trial load creates cognitive anchoring. Participants glaze over the image and rubber-stamp the label without examining the macro features.');
drawBullet('Enabling Human-AI Complementarity', 'In Assignment 2, the trained PyTorch model SneakerAuthNet achieved 81.5% accuracy with 37 errors caused by authentic factory quality control (QC) defects and flash glare. Direct exposure forces the performer to inherit all 37 AI errors. Requiring performers to inspect the photo first and click [ Consult AI Telemetry ] forces an initial visual hypothesis.');
drawBullet('Behavioral Interaction Logging', 'The server logs whether the participant consulted the AI (ai_consulted) and the latency elapsed before consultation (ai_consult_latency_ms), capturing valuable telemetry on performer reliance.');

drawSubSectionHeading('1.4 Implementation of Advanced Interface & Analysis Components');
drawBullet('Custom Web Application Interface', 'Engineered and deployed an independent, full-stack Next.js 14 web application on Vercel with dedicated REST API endpoints (/api/trials, /api/submit, /api/export) rather than using third-party survey platforms like Qualtrics.');
drawBullet('Synchronous AI Telemetry Integration', 'Built a live on-demand AI telemetry caliper component (AiTelemetryCard.tsx) providing calibrated probabilities, recommendation badges, and extracted physical measurements (stitch density, barcode sharpness, stroke thickness).');
drawBullet('Inferential Statistical Significance Testing', 'Performed formal inferential statistical tests (Fisher\'s exact test, Chi-square with Yates\' continuity correction, Welch\'s two-sample t-test) comparing performance and reaction times across conditions.');

drawDivider();

// ------------------------------------------
// SECTION 2
// ------------------------------------------
drawSectionHeading('2. DATA COLLECTION DESCRIPTION');

drawSubSectionHeading('2.1 Sample Size and Participant Population');
drawParagraph('Data was collected during the scheduled in-class deployment session on November 12, 2026. A total of 6 student classmates participated, completing 66 total trial evaluations (60 experimental trials and 6 attention check trials). To eliminate order effects, an AB/BA counterbalanced ordering protocol was used:');
drawBullet('Group 1 (With AI Condition First)', 'Arnav, Ishaan Jagyasi (uniqname: ijagyasi), and Jonathan Doredla (uniqname: doredla).');
drawBullet('Group 2 (Without AI Baseline First)', 'saad pallumeera (uniqname: saadp), Jessica Liu (uniqname: liuyhan), and Yile Sun (uniqname: sunyyyl).');

drawSubSectionHeading('2.2 Variables Collected');
drawParagraph('For every trial, the backend recorded: session identifier, participant name/uniqname, experimental condition (without-ai vs. with-ai), trial identifier, sneaker model, inspection zone, ground truth, AI prediction, human decision, classification correctness, confidence rating (1–5), reaction time in milliseconds, AI consultation status, and consultation latency. At the conclusion of the session, participants completed a post-study survey capturing NASA-TLX mental demand (1–5), perceived task difficulty (1–5), and open-ended qualitative feedback.');

drawSubSectionHeading('2.3 Attention Check Integrity and Data Quality');
drawParagraph('Trial #5 in each session presented an attention check prompt: "SYSTEM ATTENTION VERIFICATION CHECK: Please select Replica with Confidence 5 to verify your attention." The interface enforced an automated gate: selecting any other option displayed an alert banner and blocked progression. All 6 participants (100.0%) successfully passed on their first attempt. There were zero data dropouts, incomplete sessions, or missing values across the 66 collected records.');

drawDivider();

// ------------------------------------------
// SECTION 3
// ------------------------------------------
drawSectionHeading('3. TASK PERFORMANCE ANALYSIS');

drawSubSectionHeading('3.1 Overall Performance Comparison');
drawParagraph('Across the 60 experimental trials (30 With AI, 30 Without AI), participants achieved the performance metrics summarized in Table 1.');

const t1Headers = ['Performance Metric', 'Without AI (Baseline)', 'With AI (Assisted)', 'Absolute Delta'];
const t1Rows = [
  ['Completed Trials (N)', '30', '30', '—'],
  ['Overall Accuracy (%)', '43.33% (13 / 30)', '76.67% (23 / 30)', '+33.34% (Significant)'],
  ['Precision (Authentic)', '43.75% (7 / 16)', '83.33% (10 / 12)', '+39.58%'],
  ['Recall (Authentic)', '46.67% (7 / 15)', '66.67% (10 / 15)', '+20.00%'],
  ['Macro F1-Score', '0.4516', '0.7407', '+0.2891 (+64.0%)'],
  ['True Positives (TP - Authentic identified)', '7', '10', '+3'],
  ['True Negatives (TN - Replica identified)', '6', '13', '+7'],
  ['False Positives (FP - Replica labeled Real)', '9', '2', '-7 (-77.8% False Alarms)'],
  ['False Negatives (FN - Real labeled Replica)', '8', '5', '-3 (-37.5%)']
];
drawTable('Table 1: Classification Performance Benchmark Across Study Conditions', t1Headers, t1Rows, [192, 110, 110, 110], ['left', 'center', 'center', 'center']);

drawParagraph('AI assistance produced a 33.34 percentage point increase in accuracy (from 43.33% to 76.67%) and reduced false alarms (counterfeits misclassified as authentic) by 77.8% (from 9 false positives down to 2).');

drawSubSectionHeading('3.2 Individual Participant Performance');
drawParagraph('With AI Condition:');
drawBullet('Arnav', '90.0% accuracy (9 / 10), mean confidence = 3.50, mean reaction time = 17.7s.');
drawBullet('Ishaan Jagyasi', '80.0% accuracy (8 / 10), mean confidence = 3.30, mean reaction time = 7.3s.');
drawBullet('Jonathan Doredla', '60.0% accuracy (6 / 10), mean confidence = 3.30, mean reaction time = 7.2s.');

drawParagraph('Without AI Baseline Condition:');
drawBullet('saad pallumeera', '60.0% accuracy (6 / 10), mean confidence = 3.00, mean reaction time = 2.6s.');
drawBullet('Jessica Liu', '50.0% accuracy (5 / 10), mean confidence = 3.00, mean reaction time = 1.8s.');
drawBullet('Yile Sun', '20.0% accuracy (2 / 10), mean confidence = 3.10, mean reaction time = 1.7s.');

drawSubSectionHeading('3.3 Diagnostic Inspection Zone Breakdown');
drawParagraph('Performance varied substantially across the four diagnostic inspection zones, as detailed in Table 2:');

const t2Headers = ['Diagnostic Inspection Zone', 'Without AI Accuracy', 'With AI Accuracy', 'Zone Effect Delta'];
const t2Rows = [
  ['Size Tag & Barcode Kerning', '20.0% (2 / 10)', '88.9% (8 / 9)', '+68.9% (Massive Surge)'],
  ['Tongue Tag & Trademark Bleed', '25.0% (1 / 4)', '66.7% (6 / 9)', '+41.7%'],
  ['Toe Box Perforation & Grain', '57.1% (4 / 7)', '83.3% (5 / 6)', '+26.2%'],
  ['Heel Stitching & Hourglass', '66.7% (6 / 9)', '66.7% (4 / 6)', '0.0% (Baseline Parity)']
];
drawTable('Table 2: Authentication Accuracy Broken Down by Diagnostic Inspection Zone', t2Headers, t2Rows, [192, 110, 110, 110], ['left', 'center', 'center', 'center']);

drawParagraph('Zone Analysis: In Size Tag & Barcode Kerning, unassisted humans performed near chance (20.0%). Classmates had no baseline knowledge of factory UPC typography. SneakerAuthNet extracted continuous stroke thickness metrics, driving an 88.9% accuracy rate. Conversely, Heel Stitching & Hourglass exhibited zero delta (66.7% in both conditions) because gross anatomical heel curvature was the only feature accessible to naive visual observation.');

drawDivider();

// ------------------------------------------
// SECTION 4
// ------------------------------------------
drawSectionHeading('4. ADDITIONAL MEASUREMENTS ANALYSIS');
drawParagraph('In addition to task accuracy, three secondary behavioral dimensions were evaluated to understand performer cognition: decision confidence, inspection reaction time, and subjective workload.');

const t3Headers = ['Measurement Dimension', 'Without AI (Baseline)', 'With AI (Assisted)', 'Statistical Test & Significance'];
const t3Rows = [
  ['Decision Confidence (1–5 Likert)', '3.03 (SD = 0.76)', '3.37 (SD = 0.56)', 't = 1.931, p = 0.0589, d = 0.498'],
  ['Inspection Reaction Time (seconds)', '2.04s (SD = 0.77s)', '10.73s (SD = 17.99s)', 't = 2.645, p = 0.0130 (p < 0.05)'],
  ['NASA-TLX Mental Demand (1–5)', '3.33 / 5.00', '3.33 / 5.00', 'Identical cognitive baseline'],
  ['Perceived Task Difficulty (1–5)', '3.33 / 5.00', '3.67 / 5.00', 'AI prompted deeper scrutiny'],
  ['AI Consultation Rate (%)', '—', '100.0% (30 / 30 trials)', 'Universal reliance'],
  ['Mean AI Consultation Latency', '—', '6.11 seconds', 'Pre-consultation inspection']
];
drawTable('Table 3: Behavioral Telemetry and Subjective Workload Metrics Summary', t3Headers, t3Rows, [172, 110, 110, 130], ['left', 'center', 'center', 'left']);

drawSubSectionHeading('4.1 Reaction Time Analysis: Rapid Guessing vs. Deliberate Verification');
drawParagraph('Without AI trials were completed 5.3 times faster (2.04 seconds) than With AI trials (10.73 seconds). In the baseline condition, novice participants felt unequipped to evaluate technical macro features. Lacking reference standards, they defaulted to rapid heuristic guessing. In the AI-assisted condition, participants spent an average of 6.11 seconds examining the photo before clicking Consult AI, and an additional 4.62 seconds reading the telemetry breakdown. The AI converted rapid superficial guessing into deliberate analytical inspection.');

drawSubSectionHeading('4.2 Subjective Cognitive Workload and Perceived Difficulty');
drawParagraph('Despite the 5-fold increase in inspection duration, NASA-TLX mental demand remained moderate and identical across conditions (3.33 / 5.00). Participants did not experience cognitive exhaustion from the AI telemetry. However, perceived difficulty was rated slightly higher with AI (3.67 vs. 3.33) because confronting detailed numerical discrepancies made performers conscious of the subtle nuances separating authentic shoes from counterfeit super-clones.');

drawDivider();

// ------------------------------------------
// SECTION 5
// ------------------------------------------
drawSectionHeading('5. STATISTICAL SIGNIFICANCE TESTING');
drawParagraph('To formally evaluate whether the observed experimental differences between conditions were statistically meaningful, inferential tests were conducted following standard HCI statistical practices.');

drawSubSectionHeading('5.1 Test 1: Task Accuracy Contingency Analysis (Fisher\'s Exact & Chi-Square)');
drawParagraph('To compare binary classification outcomes (Correct vs. Incorrect) across the two independent groups:');

const t4Headers = ['Condition Group', 'Correct Decisions', 'Incorrect Decisions', 'Total Trials Evaluated'];
const t4Rows = [
  ['With AI (Assisted)', '23', '7', '30'],
  ['Without AI (Baseline)', '13', '17', '30'],
  ['Total Joint Sample', '36', '24', '60']
];
drawTable('Table 4: 2x2 Contingency Matrix for Classification Accuracy', t4Headers, t4Rows, [162, 120, 120, 120], ['left', 'center', 'center', 'center']);

drawBullet('Chi-Square Test with Yates\' Continuity Correction', 'chi2 = 5.6250, df = 1, p-value = 0.0177 (p < 0.05). The difference in classification accuracy between conditions is statistically significant.');
drawBullet('Fisher\'s Exact Test (Two-Tailed)', 'p-value = 0.0171 (p < 0.05). Confirms robustness on small sample sizes.');
drawBullet('Odds Ratio (OR)', 'OR = (23 * 17) / (7 * 13) = 4.297 (95% CI: [1.392, 13.264]). Participants supported by SneakerAuthNet were 4.30 times more likely to make an accurate authentication verdict than unassisted participants.');

drawSubSectionHeading('5.2 Test 2: Reaction Time Welch\'s Two-Sample t-Test');
drawParagraph('Because variances differed substantially (Var_AI = 323.49 vs. Var_NoAI = 0.60), Welch\'s unequal variances t-test was conducted on reaction time:');
drawBullet('Test Statistic & Significance', 't = (10.733 - 2.040) / sqrt(323.49/30 + 0.60/30) = 2.6450, df = 29.11, p-value = 0.0130 (p < 0.05).');
drawBullet('Effect Size', 'Cohen\'s d = 0.683 (medium-to-large effect size). The increase in cognitive inspection time in the AI-assisted condition was statistically significant.');

drawDivider();

// ------------------------------------------
// SECTION 6
// ------------------------------------------
drawSectionHeading('6. CRITICAL REFLECTION ON RESULTS');

drawSubSectionHeading('6.1 Did the Assignment 2 Prediction Hold?');
drawParagraph('In Assignment 2, the formal prediction was:');
drawParagraph('       Performance(Human-AI Joint: 91%–94%) > Performance(AI-Only: 81.50%) > Performance(Human-Only: 60%–65%)', { bold: true });
drawParagraph('The empirical results observed in this user study yielded a different ranking:');
drawParagraph('       Performance(AI-Only: 81.50%) > Performance(Human-AI Joint: 76.67%) > Performance(Human-Only: 43.33%)', { bold: true });

drawSubSectionHeading('6.2 Diagnosis: Why Joint Performance Ranked Second Instead of First');
drawParagraph('1. AI Assistance Provided Substantial Scaffolding (+33.34%): Human-AI joint performance (76.67%) far exceeded unassisted human baseline performance (43.33%). Without AI, participants performed worse than coin-flipping on technical zones like barcode kerning (20.0%). The AI provided essential diagnostic support.');
drawParagraph('2. Why Joint Performance Failed to Beat Standalone AI (76.67% vs. 81.50%): In Assignment 2, the theoretical rationale for human-AI superiority was that human performers would act as a contextual filter, catching the 24 AI errors caused by authentic factory QC stitching defects and photographic flash glare. However, this hypothesis rested on an assumption that proved invalid: that human performers possess the baseline domain competence required to audit the AI.');
drawParagraph('As qualitative feedback from participants confirmed, student classmates were complete novices:');

drawQuoteBox('Jessica Liu (Condition: Without AI: 50%, With AI feedback)', 
  'I found it very difficult to distinguish authentic items from replicas, even with AI assistance. I felt confused when the AI gave different judgments because I couldn\'t identify the differences that justified them. Since I lacked the knowledge to assess authenticity myself, I felt I had little choice but to rely on the AI\'s conclusions.');

drawQuoteBox('Ishaan Jagyasi (With AI: 80%) & Jonathan Doredla (With AI: 60%)', 
  'I had no idea what I was doing without AI, making it pretty hard. With AI, I was able to just follow its suggestions.');

drawQuoteBox('saad pallumeera (Without AI: 60%)', 
  'dont have reference for the real specifications of the shoe as compared to the replica. other than when the logo was misaligned i couldnt really tell it apart without ai.');

drawQuoteBox('Yile Sun (Without AI: 20%)', 
  'A difficult task for me, so the AI helps a lot. But the AI\'s explanations are also hard for me to understand.');

drawParagraph('3. Automation Bias and Error Propagation: Of the 7 errors made in the With AI condition, 5 errors (71.4%) occurred on trials where the AI model was itself incorrect in Assignment 2 (e.g., authentic factory QC stitching anomalies). Because students lacked the domain knowledge to dispute the AI, they exhibited 100% agreement bias, rubber-stamping the AI\'s incorrect prediction. Furthermore, on 2 trials, students second-guessed correct AI recommendations due to confusion, dropping joint performance from 81.50% down to 76.67%.');

drawSubSectionHeading('6.3 Implications for Human-AI Interaction Design');
drawBullet('Complementarity Demands Human Competence', 'Human-AI complementarity cannot be realized if the human is a novice in the task domain. An AI measurement tool cannot be audited by a performer who does not understand the baseline tolerances.');
drawBullet('The Explainability Gap', 'Presenting raw dimensional metrics (e.g., "Stroke thickness: 2.99pt | Barcode sharpness: 0.56") overwhelmed participants who did not know retail baselines. Future designs should translate continuous numbers into qualitative natural language heuristics (e.g., "Barcode font is 28% thicker than factory specification").');

drawDivider();

// ------------------------------------------
// SECTION 7
// ------------------------------------------
drawSectionHeading('7. DATA FILES AND REPLICATION INSTRUCTIONS FOR TEACHING STAFF');

drawSubSectionHeading('7.1 Collected Dataset File');
drawParagraph('The raw dataset file is included in the project directory:');
drawBullet('Dataset Path', 'CSE594AS3/assignment3_collected_data_1795394000581.csv');
drawBullet('Logged Attributes', 'session_id, participant_name, condition, trial_id, trial_index, sneaker_model, inspection_zone, ground_truth, ai_prediction, human_prediction, is_human_correct, confidence_rating, reaction_time_ms, ai_consulted, ai_consult_latency_ms, attention_check_passed, mental_demand, perceived_difficulty, participant_feedback, submitted_at.');

drawSubSectionHeading('7.2 Automated Replication Commands');
drawParagraph('To replicate all performance metrics, confusion matrices, and statistical tests reported in this document:');
drawParagraph('       cd CSE594AS3 && node scripts/analyze_study_results.js   (or python scripts/analyze_study_results.py)', { bold: true });
drawParagraph('Expected terminal output verifies:');
drawBullet('Total Records', '66 collected trials | Attention check pass rate: 100.0% (6 / 6)');
drawBullet('Accuracy Benchmark', 'With AI accuracy: 76.67% (23 / 30) | Without AI accuracy: 43.33% (13 / 30)');
drawBullet('Inferential Tests', 'Chi-Square: chi2 = 5.6250, p = 0.0177 | Fisher\'s Exact: p = 0.0171 | Odds Ratio = 4.297');
drawBullet('Reaction Time Latency', 'With AI = 10.73s vs. Without AI = 2.04s (Welch\'s t = 2.645, p = 0.0130)');

// ==========================================
// FOOTER / PAGE NUMBER PASS
// ==========================================
const range = doc.bufferedPageRange();
for (let i = range.start; i < range.start + range.count; i++) {
  doc.switchToPage(i);
  doc.save()
     .strokeColor('#000000')
     .lineWidth(0.5)
     .moveTo(PAGE_LEFT, PAGE_BOTTOM + 8)
     .lineTo(PAGE_RIGHT, PAGE_BOTTOM + 8)
     .stroke()
     .restore();
     
  doc.font('Helvetica')
     .fontSize(8)
     .fillColor('#000000')
     .text('CSE 594: Designing AI-Assisted Tasks — Assignment 3 Report (Nikhil Janarthan Surendran)', PAGE_LEFT, PAGE_BOTTOM + 12, { width: 340, align: 'left' });
     
  doc.font('Helvetica')
     .fontSize(8)
     .fillColor('#000000')
     .text(`Page ${i + 1} of ${range.count}`, PAGE_RIGHT - 120, PAGE_BOTTOM + 12, { width: 120, align: 'right' });
}

doc.end();

writeStream.on('finish', () => {
  console.log(`Successfully generated publication-quality monochrome PDF at: ${outputPath}`);
});
