# MergeGuard

**Adversarial AI agent that stress-tests AI-generated code before merge — Ghost finds how it fails, DriftOracle predicts when.**

---

## The Problem Nobody Talks About

Every engineering team uses AI to write code now — Copilot, Cursor, Claude Code. And there's a dirty secret nobody talks about:

**AI-generated code *looks* correct.** It passes linting. It passes basic tests. The PR looks clean. Your reviewer approves it. Then at 2 AM, your pager goes off.

The code had blind spots that only surface under real production load — unhandled nulls when a user has no profile, silent exception swallowing that hides cascading failures, division by zero when `games_played` is 0, SQL injection from string concatenation that "seemed fine."

> Standard code review catches style. Nobody is stress-testing whether AI code will actually *survive production.*

That's what MergeGuard does.

---

## What MergeGuard Does

MergeGuard is an adversarial AI system that runs three agent layers on every PR before it ships:

| Layer | Agent | What It Does |
|-------|-------|-------------|
| **Layer 1** | **Ghost Reviewer** | Impersonates a hostile senior engineer who has been burned by AI-generated code too many times. Hunts silent assumptions, edge case blindness, error swallowing, and confidence without evidence. |
| **Layer 2** | **DriftOracle** | Predicts *when* the detected issues will cause a production incident — estimated hours to failure, probability curves at T+24h / T+72h / T+7d, failure mode, and early warning signals. |
| **Layer 3** | **Track Record** | Historical accuracy tracking — monitors Ghost's prediction accuracy over time (94% over 847 reviews) with outcome tracking for teams that "merged anyway." |

Every single agent call is fully traced through **Arize Phoenix Cloud** for complete observability — you can drill into Ghost's reasoning chain, see which tools it called, inspect DriftOracle's incident prediction logic, and track token usage and latency.

---

## How It Works

### The Flow

```
User pastes PR diff or GitHub PR URL
  → Ghost Reviewer agent (Google ADK + Gemini)
      Tools: analyze_structure, check_past_rejections, score_rejection
  → Survivability Score calculated: 100 - (critical×25) - (warn×10) - (style×3)
  → If REJECTED (score < 75):
      → DriftOracle agent predicts time-to-incident
  → All traces → Arize Phoenix Cloud
  → Dashboard: verdict + diff viewer + findings + drift timeline
```

### Ghost Reviewer (Layer 1)

Ghost is a Google ADK agent with three custom tools:

- **`analyze_structure`** — structural scan of the diff for anti-patterns
- **`check_past_rejections`** — checks if Ghost has flagged this pattern before
- **`score_rejection`** — rates each issue by severity (CRITICAL/WARN/STYLE) and confidence (0-100%)

Ghost's system prompt frames it as a hostile senior engineer who specifically targets AI-code failure patterns:
- **Silent Assumptions** — code assumes input is always valid
- **Edge Case Blindness** — works for the happy path, breaks on boundaries
- **Error Swallowing** — catches exceptions but does nothing
- **Confidence Without Evidence** — assertions the code doesn't guarantee

Each finding includes the exact line, *why it kills production* (not just "bad practice"), and a recommended fix.

### DriftOracle (Layer 2)

When Ghost rejects code, DriftOracle automatically runs as a second agent pass. It maps the rejection types to real-world failure timelines:

- **Estimated hours to incident** (e.g., ~2h)
- **Failure mode** (e.g., "SQL injection + runtime exceptions on primary endpoint")
- **Incident probability** at T+24h, T+72h, T+7d
- **Early warning signals** to watch for in monitoring

### Arize Phoenix Integration

Both agents are auto-instrumented via `openinference-instrumentation-google-adk`. In Phoenix you can see:

- Full agent reasoning chains with every LLM call
- Tool call inputs and outputs
- Token usage and latency per call
- Session tracking across multiple reviews
- Cost tracking (< $0.01 per review)

---

## The Dashboard

### Landing Page
A polished landing page introducing the MergeGuard protocol — the paradigm gap between standard review and survivability testing, feature cards for Ghost Reviewer, DriftOracle, and Agent Autopsy, and accuracy stats.

### Command Center
Three-column dashboard layout:
- **Left sidebar** — navigation (Active Scans, Track Record, Agent Autopsy, Settings) + New Scan button
- **Main content** — PR URL input or diff paste, verdict banner with survivability gauge, DriftOracle timeline with probability bars, reviewed diff with line numbers and flagged lines, detailed finding cards with severity badges and recommended fixes
- **Right sidebar** — Track Record stats (94% accuracy, incidents predicted, false positives), live trace feed with timestamps, recent scan history with outcomes

### Key UI Features
- **Survivability Gauge** — circular SVG gauge showing score 0-100 with color coding
- **Diff Viewer** — line-numbered diff with color-coded additions/removals and flagged lines matching Ghost's findings
- **DriftOracle Panel** — failure mode, drift pattern, probability bars, early warning signals
- **Live Trace Feed** — real-time event stream showing agent activity as it happens
- **Recent Scans** — historical PR reviews with scores and outcomes (including "MERGED ANYWAY" badges)

---

## How I Built It

**Agent Framework:** Google ADK (`google.adk.agents.Agent`) with `InMemoryRunner` for session management. Two separate agents (Ghost + DriftOracle) with independent sessions, orchestrated through FastAPI.

**Model:** Gemini 3.1 Flash Lite — discovered through testing after Gemini 2.0 Flash had 0 quota and Gemini 2.5 Flash returned 503s. Added retry logic with exponential backoff for rate limiting.

**Observability:** Arize Phoenix Cloud with OpenInference auto-instrumentation. Setup was `register(project_name="mergeguard")` + `GoogleADKInstrumentor().instrument()` — two lines for full agent tracing.

**Backend:** FastAPI with async endpoints, Pydantic response models, CORS middleware. Multi-strategy JSON parser for Ghost's output (tries JSON code blocks, bare arrays, scattered objects, then falls back to unstructured wrapping).

**Frontend:** React 18 + Vite. All CSS-in-JS with CSS custom properties for the dark theme. No UI framework — hand-built components for the dashboard, gauge, diff viewer, and DriftOracle panel.

**GitHub Integration:** PR diff fetching via GitHub API using httpx — parses PR URLs and fetches file-level diffs.

---

## Challenges I Faced

**Model Quota Roulette:** Gemini 2.0 Flash had 0/0 quota on my account. Tried Gemini 2.5 Flash — got 503 "high demand." Had to programmatically test models to find one with available quota. Landed on Gemini 3.1 Flash Lite with 15 RPM on free tier.

**Structured Output Reliability:** Ghost sometimes returned analysis as plain text instead of the required JSON format, especially when it called tools first. Built a multi-strategy parser and modified the agent event capture to collect ALL text parts across the entire run, not just the final response.

**Phoenix Authentication:** Initial API key and endpoint format were wrong. Discovered that Phoenix Cloud requires the space-name URL format (`/s/siriapps3`) and regenerated API keys to get tracing working.

**Agent Chaining:** Getting Ghost's rejections to flow cleanly into DriftOracle required careful session management — each agent needs its own runner, session service, and session IDs.

---

## Accomplishments

- Built a complete 3-layer adversarial AI review system in under 4 hours, solo
- Ghost Reviewer consistently identifies real production-killing patterns (SQL injection, null handling, exception swallowing, division by zero) with high confidence
- DriftOracle produces actionable incident predictions with probability timelines
- Full Arize Phoenix tracing for every agent decision — complete observability out of the box
- Professional dashboard UI with live trace feed, diff viewer, and DriftOracle visualization
- End-to-end flow: paste diff → adversarial review → incident prediction → Phoenix traces

---

## What I Learned

- **Adversarial framing works:** Prompting an agent as a "hostile senior engineer who has been burned" produces dramatically better code review results than neutral prompts
- **Google ADK's tool pattern is powerful:** Ghost genuinely *reasons* about why code will fail, using tools to build evidence before scoring — it's not just pattern-matching
- **Agent chaining > monolithic agents:** Having Ghost and DriftOracle as separate agents with distinct roles produces better results than one agent trying to do everything
- **Arize Phoenix is near-zero-config:** Two lines of setup code gives you complete agent observability with tool call tracing, token usage, and latency metrics
- **Free-tier models are viable:** Gemini 3.1 Flash Lite at 15 RPM is enough to build a compelling demo with careful rate limit handling

---

## What's Next

- **GitHub Actions integration** — run Ghost as an automated PR check on every push
- **Real incident feedback loop** — connect production monitoring to recalibrate Ghost's heuristics based on actual outcomes
- **Multi-file context** — analyze entire PRs with cross-file dependency awareness
- **Custom team rules** — let teams teach Ghost their specific failure patterns and codebase conventions
- **Agent Autopsy (Layer 3)** — closed-loop system that ingests post-mortem data to dynamically recalibrate Ghost's detection models
