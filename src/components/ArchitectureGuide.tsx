import React, { useState } from 'react';
import {
  Code,
  ShieldCheck,
  Cpu,
  Database,
  Terminal,
  CheckCircle2,
  FileCode,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const ArchitectureGuide: React.FC = () => {
  const [section, setSection] = useState<'flow' | 'prompt' | 'python' | 'security'>('flow');

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="mb-8 pb-6 border-b border-stone-200">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Full-Stack LLM Engineering Mentor Guide</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight">
          Phase 1: Architecture, Data Flow & Prompt Specifications
        </h1>
        <p className="text-sm text-stone-600 mt-2 max-w-3xl leading-relaxed">
          Welcome to the engineering blueprint for the AI Travel Planner. This guide teaches how
          the React client, backend server, LLM structured generation, and SQLite database interact
          safely and deterministically.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg max-w-fit mb-8 border border-stone-200 overflow-x-auto">
        <button
          type="button"
          onClick={() => setSection('flow')}
          className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
            section === 'flow'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          1. System Flow & Architecture
        </button>
        <button
          type="button"
          onClick={() => setSection('prompt')}
          className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
            section === 'prompt'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          2. LLM Prompt & Schema
        </button>
        <button
          type="button"
          onClick={() => setSection('python')}
          className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
            section === 'python'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          3. Python Flask & Pytest
        </button>
        <button
          type="button"
          onClick={() => setSection('security')}
          className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
            section === 'security'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          4. Security & Acceptance Criteria
        </button>
      </div>

      {/* Content 1: System Flow & Architecture */}
      {section === 'flow' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs">
            <h2 className="text-base font-semibold text-stone-900 mb-3 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-stone-700" />
              <span>End-to-End Request Pipeline</span>
            </h2>
            <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
              <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 font-mono text-xs">
                <div>[User in React] ➔ Validates required fields locally (Origin, Destination, Budget &gt; 0)</div>
                <div className="text-stone-400">      ↓ POST /api/generate-itinerary</div>
                <div>[Backend Server] ➔ Strict input sanitization &amp; parameter normalization</div>
                <div className="text-stone-400">      ↓ Injects system instruction &amp; structured JSON schema</div>
                <div>[LLM: Gemini 3.8 Flash] ➔ Reasoning with geographical clustering &amp; cost estimation</div>
                <div className="text-stone-400">      ↓ Raw JSON output response</div>
                <div>[Backend Server] ➔ Validates response against strict TypeScript/Python schema</div>
                <div className="text-stone-400">      ↓ Returns clean JSON payload to Client</div>
                <div>[React UI] ➔ Renders Day-by-Day schedule, Budget assessment &amp; local tips</div>
                <div className="text-stone-400">      ↓ Optional: POST /api/trips</div>
                <div>[SQLite Database: trips.db] ➔ Persists trip record with UUID for cross-session recall</div>
              </div>

              <p>
                <strong>Why keep LLM calls server-side?</strong> In production, API keys (e.g. Gemini
                or OpenAI) must never be bundled into browser JavaScript. By dispatching LLM calls
                through the server API, we prevent key leakage, enforce rate limiting, sanitize
                inputs, and inspect model outputs before the client ever sees them.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
              <h3 className="font-semibold text-stone-900 text-sm mb-2 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-stone-700" />
                <span>REST API Contracts</span>
              </h3>
              <ul className="space-y-2 text-xs text-stone-600 font-mono">
                <li>
                  <span className="text-emerald-700 font-bold">POST</span> /api/generate-itinerary
                  <div className="text-stone-500 font-sans">Generates itinerary via Gemini 3.8 Flash.</div>
                </li>
                <li>
                  <span className="text-blue-700 font-bold">GET</span> /api/trips
                  <div className="text-stone-500 font-sans">Lists all saved trips from SQLite.</div>
                </li>
                <li>
                  <span className="text-emerald-700 font-bold">POST</span> /api/trips
                  <div className="text-stone-500 font-sans">Saves complete itinerary to SQLite.</div>
                </li>
                <li>
                  <span className="text-red-700 font-bold">DELETE</span> /api/trips/:id
                  <div className="text-stone-500 font-sans">Deletes trip from SQLite by ID.</div>
                </li>
                <li>
                  <span className="text-blue-700 font-bold">GET</span> /api/health
                  <div className="text-stone-500 font-sans">Health status &amp; key configuration check.</div>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
              <h3 className="font-semibold text-stone-900 text-sm mb-2 flex items-center gap-2">
                <Database className="w-4 h-4 text-stone-700" />
                <span>SQLite Database Schema</span>
              </h3>
              <div className="p-3 bg-stone-50 rounded text-[11px] font-mono text-stone-700 leading-tight">
                CREATE TABLE trips (<br />
                &nbsp;&nbsp;id TEXT PRIMARY KEY,<br />
                &nbsp;&nbsp;title TEXT NOT NULL,<br />
                &nbsp;&nbsp;destination TEXT NOT NULL,<br />
                &nbsp;&nbsp;origin TEXT NOT NULL,<br />
                &nbsp;&nbsp;start_date TEXT NOT NULL,<br />
                &nbsp;&nbsp;duration_days INTEGER NOT NULL,<br />
                &nbsp;&nbsp;budget REAL NOT NULL,<br />
                &nbsp;&nbsp;currency TEXT NOT NULL,<br />
                &nbsp;&nbsp;travelers INTEGER NOT NULL,<br />
                &nbsp;&nbsp;travel_style TEXT NOT NULL,<br />
                &nbsp;&nbsp;itinerary_json TEXT NOT NULL,<br />
                &nbsp;&nbsp;created_at TEXT NOT NULL<br />
                );
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content 2: LLM Prompt & Schema */}
      {section === 'prompt' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs">
            <h2 className="text-base font-semibold text-stone-900 mb-3 flex items-center gap-2">
              <Code className="w-5 h-5 text-stone-700" />
              <span>Prompt Engineering Strategy</span>
            </h2>
            <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
              <p>
                To generate reliable, realistic travel itineraries without hallucinations, the system
                instruction adheres to five core guardrails:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-stone-50 border border-stone-200">
                  <div className="font-semibold text-stone-900 mb-1">1. Geographical Clustering</div>
                  <div className="text-xs text-stone-600">
                    Forces the model to group morning, afternoon, and evening activities in the same
                    neighborhood/zone, avoiding unrealistic cross-city sprints.
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-stone-50 border border-stone-200">
                  <div className="font-semibold text-stone-900 mb-1">2. Labeled Cost Estimates</div>
                  <div className="text-xs text-stone-600">
                    Mandates that every cost is tagged as an estimate, specifies per-person vs
                    group-total, and breaks down totals across 5 standard categories.
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-stone-50 border border-stone-200">
                  <div className="font-semibold text-stone-900 mb-1">3. Anti-Hallucination Policy</div>
                  <div className="text-xs text-stone-600">
                    Forbids fabricating live ticket availability, opening hours, or dynamic hotel
                    rates. Clearly marks assumptions versus recommendations.
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-stone-50 border border-stone-200">
                  <div className="font-semibold text-stone-900 mb-1">4. Guaranteed JSON Schema</div>
                  <div className="text-xs text-stone-600">
                    Uses Gemini&apos;s native <code className="bg-stone-200 px-1 rounded">responseSchema</code> to
                    guarantee typed JSON output matching our exact TypeScript and Python data models.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content 3: Python Flask & Pytest */}
      {section === 'python' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs">
            <h2 className="text-base font-semibold text-stone-900 mb-3 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-stone-700" />
              <span>Running the Python Flask Backend Locally</span>
            </h2>
            <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
              <p>
                We have generated a standalone Python / Flask backend inside the{' '}
                <code className="bg-stone-100 px-1.5 py-0.5 rounded font-mono text-stone-800">
                  backend-flask/
                </code>{' '}
                folder. You can run it on your local computer or push it to your GitHub portfolio:
              </p>

              <div className="p-4 bg-stone-900 text-stone-100 rounded-lg font-mono text-xs space-y-2">
                <div className="text-stone-400"># 1. Navigate to the backend directory</div>
                <div>cd backend-flask</div>
                <div className="text-stone-400 mt-2"># 2. Create and activate a virtual environment</div>
                <div>python3 -m venv venv</div>
                <div>source venv/bin/activate  <span className="text-stone-400"># On Windows: venv\Scripts\activate</span></div>
                <div className="text-stone-400 mt-2"># 3. Install dependencies</div>
                <div>pip install -r requirements.txt</div>
                <div className="text-stone-400 mt-2"># 4. Run automated pytest test suite</div>
                <div>pytest tests/ -v</div>
                <div className="text-stone-400 mt-2"># 5. Run the development server on port 5000</div>
                <div>python app.py</div>
              </div>

              <div className="p-3 bg-amber-50 rounded border border-amber-200 text-xs text-amber-900">
                <strong>Student Portfolio Tip:</strong> The included test suite in{' '}
                <code className="font-mono">tests/test_api.py</code> covers health endpoints, input
                validation edge cases, invalid travel styles, and schema verification.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content 4: Security & Acceptance Criteria */}
      {section === 'security' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs">
            <h2 className="text-base font-semibold text-stone-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-stone-700" />
              <span>Security & Reliability Best Practices</span>
            </h2>
            <ul className="space-y-3 text-xs sm:text-sm text-stone-700">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>No API Keys in Client Code:</strong> The Gemini API key is accessed
                  strictly via <code className="bg-stone-100 px-1 rounded">process.env.GEMINI_API_KEY</code> on
                  the server.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Input Boundary Sanitization:</strong> Request bodies are checked for maximum
                  string lengths, valid integer durations (1–14 days), positive budgets, and valid
                  travel styles before querying the LLM.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Structured Schema Enforcement:</strong> Responses are validated against our
                  strict schema before rendering or saving to SQLite.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Parameterized Database Queries:</strong> All SQLite operations use prepared
                  statements (<code className="bg-stone-100 px-1 rounded">db.prepare()</code>) to
                  prevent SQL injection vulnerabilities.
                </div>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
