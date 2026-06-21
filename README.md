# HireSense AI

> **AI-Powered Resume Ranking & Candidate Screening Platform**

---

## 🚀 Quick Start

### 1. Start the Backend (Flask + NLP)

```bash
# Option A – double-click:
start_backend.bat

# Option B – terminal:
cd backend
python app.py
```

Backend runs on **http://localhost:5000**

### 2. Start the Frontend (React + Vite)

```bash
# Option A – double-click:
start_frontend.bat

# Option B – terminal:
cd frontend
npm run dev
```

Frontend runs on **http://localhost:3000**

---

## 📁 Project Structure

```
hiresense-ai/
├── backend/
│   ├── app.py           # Flask REST API (all endpoints)
│   ├── models.py        # SQLAlchemy DB models (SQLite)
│   ├── nlp_engine.py    # TF-IDF, Cosine Similarity, scoring
│   ├── parser.py        # PDF/DOCX text extraction
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/hiresense.js         # Axios API layer
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── HeroSection.jsx
│   │   │   ├── JDPanel.jsx          # JD input + keyword extraction
│   │   │   ├── UploadSection.jsx    # Drag-and-drop resume upload
│   │   │   ├── RankingDashboard.jsx # Sortable candidate leaderboard
│   │   │   ├── AnalyticsSection.jsx # Charts + KPI cards
│   │   │   └── ReportModal.jsx      # Per-candidate detailed report
│   │   ├── App.jsx
│   │   └── index.css   # Full design system (glassmorphism)
│   └── vite.config.js  # Proxy to Flask backend
├── start_backend.bat
├── start_frontend.bat
└── README.md
```

---

## ✨ Features

| Feature | Description |
|---|---|
| JD Analyzer | Paste JD → AI extracts keywords and saves to DB |
| Resume Upload | Drag-and-drop PDF/DOCX, multi-file supported |
| NLP Scoring | TF-IDF + Cosine Similarity + heuristic matching |
| Score Breakdown | Skills 40% · Experience 30% · Education 20% · Certs 10% |
| Candidate Ranking | Sortable leaderboard with progress bar scores |
| Shortlisting | Auto-shortlists candidates scoring ≥ 70% |
| Report Modal | Radial charts, matched/missing skills, AI recommendation |
| Analytics | KPI cards, bar + pie charts via Recharts |
| CSV Export | Download full rankings as CSV |

---

## 🧠 AI Scoring Weights

| Dimension | Weight |
|---|---|
| Skills Match (TF-IDF + keyword overlap) | 40% |
| Experience (years regex + proxy) | 30% |
| Education (degree hierarchy) | 20% |
| Certifications | 10% |

**Shortlist threshold: ≥ 70% overall score**

---

## 🛠 Tech Stack

- **Backend**: Python, Flask, SQLAlchemy, SQLite
- **NLP**: scikit-learn (TF-IDF, Cosine Similarity), custom keyword dictionaries
- **Parsing**: PyPDF2 (PDF), python-docx (DOCX)
- **Frontend**: React 18, Vite, Recharts, Axios, Lucide Icons
- **Design**: Glassmorphism, dark theme, Inter + Space Grotesk fonts

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/job` | Create job + extract keywords |
| GET | `/api/job/:id` | Get job details |
| POST | `/api/upload` | Upload + score resumes |
| GET | `/api/candidates/:jobId` | Ranked candidate list |
| GET | `/api/analytics/:jobId` | Analytics summary |
| GET | `/api/report/:candidateId` | Detailed candidate report |
| DELETE | `/api/reset/:jobId` | Clear candidates for a job |
