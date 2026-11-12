# CSE 594 Assignment 3: Human-AI Study Web Application
**Task Domain:** Streetwear & Sneaker "Legit Check" Counterfeit Authentication  
**Author:** Nikhil Janarthan Surendran  

---

## 🚀 2-Minute Vercel Deployment Guide

### Option 1: Deploy via GitHub (Recommended)
1. In your terminal, navigate into this directory:
   ```bash
   cd C:\Users\nikil\CSE594AS2222\CSE594AS3
   git init
   git add .
   git commit -m "Assignment 3: Human-AI Legit Check Study"
   ```
2. Create a GitHub repository and push:
   ```bash
   git branch -M main
   # Push to your GitHub account (or use GitHub Desktop)
   git remote add origin https://github.com/<YOUR_USERNAME>/sneaker-study.git
   git push -u origin main
   ```
3. Go to [https://vercel.com/new](https://vercel.com/new):
   - Select your `sneaker-study` repository.
   - Framework Preset: **Next.js** (auto-detected).
   - Click **Deploy**.
4. In under 60 seconds, Vercel will give you a live production URL:
   `https://sneaker-study.vercel.app`

---

## 📋 The Two URLs to Submit on the Class Google Sheet

Before 10:00 AM class today, copy and paste these exact links into the shared class spreadsheet:

1. **Without AI (Baseline Condition):**
   `https://<YOUR-VERCEL-DOMAIN>.vercel.app/without-ai`
2. **With AI (Assisted Condition - On-Demand AI Consultation):**
   `https://<YOUR-VERCEL-DOMAIN>.vercel.app/with-ai`
3. **Admin Telemetry Dashboard & CSV Export:**
   `https://<YOUR-VERCEL-DOMAIN>.vercel.app/admin` (or `/api/export`)

---

## 🔬 Study Design Features & Assignment 3 Alignment

| Feature | Implementation | Rubric Alignment |
| :--- | :--- | :--- |
| **Randomized Balanced Trials** | Randomly samples 5 Authentic and 5 Replica trials from `study_dataset_200.csv` per participant | Satisfies $N \approx 10$ trials (< 10 min duration requirement) |
| **Attention Check** | Injected at trial #5 with obvious instruction: *"Select 'Replica' and Confidence 5"* | Prevents inattentive responses; records `attention_check_passed` |
| **Additional Measurement 1** | **Millisecond Reaction Time** tracked from image load to verdict submission | Measures cognitive efficiency between human-alone vs human+AI |
| **Additional Measurement 2** | **5-Point Likert Confidence Scale** (1 = Pure Guess, 5 = Absolute Certainty) | Measures subjective performer certainty |
| **AI Assistance Presentation** | **On-Demand Progressive Disclosure:** `[ 🔍 Consult AI Telemetry ]` button | Prevents automation bias; logs consultation latency |
| **Extracted Micro-Metrics** | Displays calibrated stitch density, font thickness, barcode sharpness, and perforation diameter | Provides structured diagnostic evidence from Assignment 2 model |
| **Post-Task Survey** | Mental demand (1–5), perceived difficulty (1–5), and open feedback | Supplies rich qualitative quotes for Assignment 3 Part 2 report |

---

## 💾 Data Logging & Export

All participant responses are automatically stored with full telemetry.
* **1-Click CSV Download:** Visit `https://<YOUR-VERCEL-DOMAIN>.vercel.app/admin` and click **"Export Collected CSV"**, or download directly from `/api/export`.
* **Optional Supabase Cloud Storage:**
  If you want submissions automatically synced to a free Supabase PostgreSQL database, add these two environment variables in your Vercel Project Settings:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`

