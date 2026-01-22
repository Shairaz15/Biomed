# Product Requirements Document (PRD): CogniTrack
**Version:** 1.0 (Final)
**Date:** January 22, 2026
**Project Name:** CogniTrack - AI-Powered Cognitive Assessment Platform

---

## 1. Executive Summary
CogniTrack is a web-based digital health platform designed to detect early signs of cognitive decline through gamified, multi-modal assessments. Unlike traditional "pen-and-paper" tests (like MMSE), CogniTrack leverages high-frequency data collection (reaction time variance, speech patterns, visual memory decay) to provide actionable insights into cognitive health trends.

The platform is privacy-first, analyzing data locally in the browser, and provides immediate visual feedback to users via a comprehensive dashboard.

---

## 2. Problem Statement
*   **Late Diagnosis:** Cognitive decline (e.g., Alzheimer's, MCI) is often diagnosed too late for effective intervention.
*   **Subjectivity:** Traditional assessments vary by clinician and are infrequent (once a year).
*   **Accessibility:** Neuropsychological testing is expensive and requires clinic visits.

## 3. Solution Overview
A self-administered React Application offering four distinct cognitive domains of assessment, backed by a local AI risk engine that tracks longitudinal trends.

---

## 4. Key Features & Specifications

### 4.1. Core Assessments
The platform consists of four standardized digital biomarkers:

#### A. Reaction Time Assessment
*   **Objective:** Measure psychomotor speed and attention.
*   **Mechanic:** "Traffic Light" test (Wait for Green -> Click).
*   **Metrics:** 
    *   Simple Reaction Time (ms)
    *   Intra-individual Variance (consistency)
    *   False Starts (impulsivity)

#### B. Verbal Memory Test
*   **Objective:** Assess short-term memory and recall.
*   **Mechanic:** Word list presentation (encoding) followed by free recall (retrieval).
*   **Metrics:** 
    *   Accuracy (%)
    *   Primacy/Recency Effects (forgetting patterns)

#### C. Visual Pattern Recognition (Sequence Memory)
*   **Objective:** Evaluate working memory and spatial sequencing.
*   **Mechanic:** "Simon Says" style grid (3x3 to 5x5) that lights up in a sequence the user must replicate.
*   **Metrics:** 
    *   Max Level Reached (Span capacity)
    *   Input Latency (Processing speed)

#### D. Language Fluency (Spontaneous Speech)
*   **Objective:** Detect linguistic markers of decline (aphasia, hesitation).
*   **Mechanic:** Open-ended voice prompt (e.g., "Describe your day") recorded via microphone.
*   **Tech:** Web Speech API (Local processing).
*   **Ai Analysis:** 
    *   Words Per Minute (WPM)
    *   Fluency Index (Composite score of speed vs. pauses)
    *   Hesitation Rate (Filler words/repetitions)

---

### 4.2. Analytical Dashboard
A central hub for data visualization and health insights.
*   **Trend Analysis:** Line graphs showing performance over time (Weeks/Months).
*   **AI Risk Engine:**
    *   **Baseline Creation:** establishes "normal" performance from first 2 sessions.
    *   **Anomaly Detection:** Flags sudden drops (>2 Standard Deviations) in performance.
    *   **Multi-Factor Risk Score:** Low/Medium/High risk classification based on aggregated metrics.
*   **Privacy Mode:** Option to run in "Demo Mode" or "Real Data Mode" (Local Storage).

---

## 5. Technical Architecture

### 5.1. Tech Stack
*   **Frontend:** React 19, TypeScript, Vite (Fast, modern SPA).
*   **Styling:** CSS Modules, Glassmorphism UI (Tailored for elderly usability - high contrast, clear fonts).
*   **Visualization:** Recharts (Responsive data visualization).
*   **State Management:** React Hooks + Context.

### 5.2. Data & Privacy (Single-Tier Architecture)
*   **Client-Side Only:** No backend server required for core functionality.
*   **Storage:** `localStorage` API for persisting data across sessions on the same device.
*   **Microphone:** Audio is processed in RAM and discarded; no recordings are uploaded to any server (HIPAA compliant by design principle).

---

## 6. User Flow
1.  **Landing:** Educational intro, "Start Assessment" CTA.
2.  **Selection:** Choose a specific test or specific battery.
3.  **Calibration:** Brief instructions/warmup (microphone/audio check).
4.  **Testing:** Interactive gamified task.
5.  **Results:** Immediate session summary (Score + Comparison to baseline).
6.  **Dashboard:** Holistic view of all historic data.

---

## 7. Future Roadmap (Post-v1)
*   [ ] **Firebase Integration:** For cloud sync across devices.
*   [ ] **Clinician Portal:** Allow doctors to view patient dashboards remotely.
*   [ ] **Eye Tracking:** WebGazer integration for attention heatmaps.
*   [ ] **Mobile App:** React Native port for better touch interaction.

---

## 8. Success Metrics
*   **Usability:** Completion rate of tests > 90% for users aged 65+.
*   **Reliability:** Test-retest correlation > 0.8.
*   **Performance:** App load time < 2s; Analysis time < 500ms.
