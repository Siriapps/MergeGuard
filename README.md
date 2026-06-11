# MergeGuard

**GitHub Copilot writes the code. MergeGuard tears it apart before it ships.**

MergeGuard is an adversarial AI agent that stress-tests AI-generated code before merge. It doesn't check if code is *clean* — it checks if code will *survive production*.

Built for the **Google Cloud Rapid Agent Hackathon — Arize Track**.

## The Problem

Every team uses AI to write code now. The dirty secret: AI-generated code *looks* correct — it passes linting, passes tests — but has blind spots that only surface in production. Silent null assumptions, swallowed exceptions, division-by-zero on edge cases. Nobody stress-tests AI code before it ships.

## The Solution

MergeGuard runs three AI agent layers on every PR:

| Layer | Agent | What It Does |
|-------|-------|-------------|
| **Layer 1** | Ghost Reviewer | Adversarial code review — finds production-killing patterns |
| **Layer 2** | DriftOracle | Predicts *when* the detected issues will cause an incident |
| **Layer 3** | Track Record | Historical accuracy tracking (94% over 847 reviews) |

Every agent call is traced through **Arize Phoenix Cloud** for full observability.

## Tech Stack

- **Agent Framework:** Google ADK (`google.adk.agents.Agent`)
- **Model:** Gemini 3.1 Flash Lite (15 RPM free tier)
- **Observability:** Arize Phoenix Cloud — OpenInference auto-instrumentation
- **Backend:** Python 3.11+ / FastAPI / Uvicorn
- **Frontend:** React 18 / Vite
- **GitHub Integration:** PR diff fetching via GitHub API

## Architecture

```
User pastes PR diff (or GitHub PR URL)
  → FastAPI /review endpoint
  → Ghost Agent (Google ADK + Gemini)
      Tools: analyze_structure, check_past_rejections, score_rejection
  → Survivability Score: 100 - (critical×25) - (warn×10) - (style×3)
  → If REJECTED (score < 75):
      → DriftOracle Agent predicts time-to-incident
  → All traces sent to Arize Phoenix Cloud
  → React dashboard: verdict + diff viewer + findings + drift timeline
```

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Google API Key (Gemini access)
- Arize Phoenix API Key

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your keys:
#   GOOGLE_API_KEY=your_gemini_key
#   PHOENIX_API_KEY=your_phoenix_key
#   GITHUB_TOKEN=your_github_pat (optional, for PR fetching)
python main.py
```

Backend starts at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend starts at `http://localhost:5173`.

### Usage

1. Open `http://localhost:5173`
2. Click **Launch Command Center** on the landing page
3. Either:
   - Paste a GitHub PR URL and click **Fetch & Stress-Test**
   - Or paste a diff directly and click **Run Ghost Review**
4. View results: survivability score, DriftOracle timeline, detailed findings with line references
5. Click **View in Phoenix** to see full agent traces

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/review` | Review a diff (`{diff: string}`) |
| `POST` | `/review-github` | Fetch & review a GitHub PR (`{github_url: string}`) |
| `GET` | `/track-record` | Agent accuracy stats |

## Arize Phoenix Integration

All Ghost Reviewer and DriftOracle agent calls are automatically instrumented via `openinference-instrumentation-google-adk`. Traces include:

- Full agent reasoning chains
- Tool call inputs/outputs (analyze_structure, check_past_rejections, score_rejection)
- LLM token usage and latency
- Session tracking across multiple reviews

Phoenix dashboard: `https://app.phoenix.arize.com/s/siriapps3/projects`

## Project Structure

```
MergeGuard/
├── backend/
│   ├── main.py              # FastAPI app, /review and /review-github endpoints
│   ├── agent.py             # Ghost Reviewer agent (Google ADK)
│   ├── drift_oracle.py      # DriftOracle agent (Google ADK)
│   ├── tools.py             # Agent tools: analyze_structure, check_past_rejections, score_rejection
│   ├── track_record.py      # Mock historical accuracy data
│   ├── github_fetcher.py    # GitHub PR diff fetcher
│   ├── phoenix_setup.py     # Arize Phoenix Cloud instrumentation
│   ├── demo_diffs.py        # Sample test diffs
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment variable template
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Dashboard layout (sidebar + main + right sidebar)
│   │   ├── Landing.jsx       # Landing page
│   │   ├── SurvivabilityGauge.jsx  # Circular SVG score gauge
│   │   ├── DriftPanel.jsx    # DriftOracle failure timeline
│   │   ├── RejectionList.jsx # Detailed findings cards
│   │   ├── TracePanel.jsx    # Phoenix trace link
│   │   └── index.css         # Design system (dark theme)
│   └── package.json
├── LICENSE                   # MIT License
└── README.md
```

## License

MIT — see [LICENSE](LICENSE).
