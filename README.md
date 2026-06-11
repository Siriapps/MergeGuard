# MergeGuard

**GitHub Copilot writes the code. MergeGuard tears it apart before it ships.**

An adversarial AI code reviewer that stress-tests AI-generated code before merge. Ghost Agent impersonates a hostile senior engineer who finds the failure modes humans miss — silent assumptions, edge case blindness, error swallowing, and confidence without evidence.

## The Self-Improvement Loop

Ghost flags a rejection → human merges anyway → production behavior logged → Phoenix connects the rejection to the outcome → Ghost calibrates: "that pattern I flagged was right, flag it harder next time."

## Tech Stack

- **Agent:** Google ADK + Gemini 2.0 Flash
- **Observability:** Arize Phoenix Cloud
- **Self-improvement:** Phoenix MCP — agent reads its own past traces at runtime
- **Backend:** Python + FastAPI
- **Frontend:** React + Vite

## Quick Start

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your GOOGLE_API_KEY and PHOENIX_API_KEY
python main.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — paste a diff, click RUN MERGEGUARD.

## Architecture

```
User pastes PR diff
  → FastAPI /review endpoint
  → Ghost Agent (ADK + Gemini Flash)
    Tools: analyze_structure, check_past_rejections, score_rejection
  → Phoenix Cloud traces every decision
  → React UI: diff viewer + rejection list + Phoenix trace link
```

## Built for

Google Cloud Rapid Agent Hackathon — Arize Track
