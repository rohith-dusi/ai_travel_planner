# AI Travel Planner — Personalized Trip Planning Using Large Language Models

An end-to-end, full-stack application that generates personalized, geographically coherent travel itineraries using Google's Gemini LLM, structured schema validation, and persistent SQLite storage.

---

## 🧭 Project Overview

AI Travel Planner takes traveler constraints (destination, route, dates, budget, group size, travel style, interests, accommodation, transportation preferences, dietary restrictions, and accessibility needs) and leverages **Gemini 3.8 Flash** via a server-side proxy to produce a structured, practical, day-by-day travel plan.

### Core Highlights:
- **Server-Side LLM Execution:** Gemini API key is never exposed to the client browser.
- **Geographical Clustering:** System instructions direct the model to cluster daily morning, afternoon, and evening activities in proximate neighborhoods to minimize transit overhead.
- **Cost Estimation Transparency:** Every activity and budget line item is labeled explicitly as an estimate, distinguishing per-person from group expenses.
- **Fact vs. Assumption Separation:** Clearly delineates verified geographic advice from seasonal assumptions and highlights real-world limitations (e.g. ticket pre-booking, seasonal closures).
- **SQLite Persistence:** Full persistence layer for saving, listing, viewing, and deleting generated itineraries.
- **Dual Backend Implementations:**
  - **Node.js / Express / Vite full-stack server** with `node:sqlite` for seamless web app deployment.
  - **Python / Flask backend** (`backend-flask/`) with SQLAlchemy and automated `pytest` test suite for academic portfolios and local Python development.

---

## 🏗️ System Architecture & Data Flow

```text
┌─────────────────┐       POST /api/generate-itinerary       ┌────────────────────────┐
│  React 19 App   │ ───────────────────────────────────────> │ Express / Flask Server │
│ (Tailwind CSS)  │                                          │  - Input Validation    │
└─────────────────┘                                          │  - Normalization       │
         ▲                                                   └───────────┬────────────┘
         │                                                               │
         │  Validated JSON Response                                      │ System Instructions &
         │                                                               │ Structured JSON Schema
         │                                                               ▼
         │                                                   ┌────────────────────────┐
         │                                                   │ Google Gemini 3.8      │
         │                                                   │ (@google/genai SDK)    │
         │                                                   └───────────┬────────────┘
         │                                                               │
         │ ┌────────────────────────┐                                    │ Raw JSON Output
         └─┤ Server Output Validate ├<───────────────────────────────────┘
           └────────────────────────┘
                       │
                       │ Optional Save: POST /api/trips
                       ▼
           ┌────────────────────────┐
           │ SQLite (trips.db)      │
           └────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4 | Responsive UI, accessible inputs, instant presets, segmented tabs |
| **Icons & Motion** | `lucide-react`, `motion` | Crisp typographic UI, responsive feedback |
| **Backend (Web)** | Express, Vite Plugin, `node:sqlite` | Server-side LLM proxy, input sanitization, SQLite persistence |
| **Backend (Python)** | Python 3.10+, Flask, SQLAlchemy, pytest | Standalone portfolio backend with automated unit & API tests |
| **LLM Provider** | Google Gemini (`gemini-3.8-flash`) | Structured JSON itinerary generation with geographical pacing |
| **Database** | SQLite (`trips.db`) | Local ACID-compliant database for saved trips |

---

## 📦 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Returns server health and LLM API key status |
| `POST` | `/api/generate-itinerary` | Validates preferences and returns structured AI itinerary |
| `GET` | `/api/trips` | Retrieves all saved trips from SQLite |
| `GET` | `/api/trips/:id` | Retrieves a single saved trip by ID |
| `POST` | `/api/trips` | Persists an itinerary to SQLite |
| `DELETE` | `/api/trips/:id` | Deletes a trip from SQLite |

---

## 🧪 Testing & Verification

### 1. Web App Compilation & Linting
```bash
npm run lint    # Type checks TypeScript
npm run build   # Validates full production build
```

### 2. Python Backend & Pytest Suite
```bash
cd backend-flask
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pytest tests/ -v
```

The test suite covers:
- `/api/health` connectivity
- Input validation rejection of missing origins/destinations
- Bounds checking on trip duration (1–14 days) and positive budgets
- Travel style enum enforcement
- LLM output schema validation and handling of incomplete payloads

---

## 🔒 Security & Reliability Measures

1. **Environment Variable Hygiene:** All API keys are loaded via server-side environment variables (`GEMINI_API_KEY`).
2. **Strict Request Boundaries:** Request payloads are checked for length limits, numeric boundaries, and enumerated travel styles.
3. **No Code Execution:** Model outputs are parsed solely as declarative JSON data; no arbitrary code or HTML is executed.
4. **Parameterized Database Statements:** All SQLite queries utilize prepared statements to prevent SQL injection.
5. **CORS Restrictions:** Flask backend restricts CORS origins to the authorized client development domain.

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd ai-travel-planner
npm install
```

### 2. Configure Environment
Create `.env` based on `.env.example`:
```env
GEMINI_API_KEY="your_gemini_api_key_here"
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
