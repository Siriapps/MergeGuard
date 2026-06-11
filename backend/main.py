import os
import json
import asyncio
import re
from dotenv import load_dotenv

load_dotenv()

from phoenix_setup import init_phoenix
init_phoenix()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google.adk.runners import InMemoryRunner
from google.genai import types

from agent import ghost_agent
from drift_oracle import drift_oracle_agent
from track_record import get_track_record
from github_fetcher import fetch_pr_diff

app = FastAPI(title="MergeGuard", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ghost_runner = InMemoryRunner(agent=ghost_agent, app_name="mergeguard")
drift_runner = InMemoryRunner(agent=drift_oracle_agent, app_name="mergeguard_drift")
session_service = ghost_runner.session_service
drift_session_service = drift_runner.session_service
run_counter = 0


class ReviewRequest(BaseModel):
    diff: str
    session_id: str | None = None


class GitHubReviewRequest(BaseModel):
    github_url: str
    github_token: str | None = None


class Rejection(BaseModel):
    severity: str
    confidence: int
    line: str | None = None
    issue: str
    why_prod_fails: str
    fix: str


class DriftPrediction(BaseModel):
    estimated_hours_to_incident: int
    failure_mode: str
    drift_pattern: str
    early_signals: list[str]
    incident_probability: dict


class ReviewResponse(BaseModel):
    rejections: list[Rejection]
    survivability_score: int
    verdict: str
    drift_prediction: DriftPrediction | None = None
    raw_response: str
    trace_url: str | None = None
    session_id: str
    run_number: int


@app.get("/health")
async def health():
    return {"status": "ok", "agent": "ghost", "model": "gemini-3.1-flash-lite"}


@app.get("/track-record")
async def track_record():
    return get_track_record()


@app.post("/review-github")
async def review_github(req: GitHubReviewRequest):
    token = req.github_token or os.environ.get("GITHUB_TOKEN", "")
    fetched = fetch_pr_diff(req.github_url, token)
    review_req = ReviewRequest(diff=fetched["diff"])
    result = await review(review_req)
    return result


@app.post("/review", response_model=ReviewResponse)
async def review(req: ReviewRequest):
    global run_counter
    run_counter += 1

    session_id = req.session_id or f"session_{run_counter}"
    user_id = "mergeguard_user"

    existing = await session_service.get_session(
        app_name="mergeguard", user_id=user_id, session_id=session_id
    )
    if not existing:
        await session_service.create_session(
            app_name="mergeguard", user_id=user_id, session_id=session_id
        )

    prompt = f"Review this PR diff. Find every way it will fail in production.\n\n```diff\n{req.diff}\n```"

    full_text = ""
    all_text_parts = []
    max_retries = 3
    for attempt in range(max_retries):
        try:
            async for event in ghost_runner.run_async(
                user_id=user_id,
                session_id=session_id,
                new_message=types.Content(
                    role="user", parts=[types.Part(text=prompt)]
                ),
            ):
                if event.content and event.content.parts:
                    for part in event.content.parts:
                        if hasattr(part, 'text') and part.text:
                            all_text_parts.append(part.text)
                if event.is_final_response() and event.content and event.content.parts:
                    full_text = event.content.parts[0].text
            # Use the longest text that contains JSON, or fall back to final
            combined = "\n".join(all_text_parts)
            if "severity" in combined and ("```json" in combined or '"issue"' in combined):
                full_text = combined
            break
        except Exception as e:
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                wait = (attempt + 1) * 15
                print(f"Rate limited, waiting {wait}s (attempt {attempt + 1}/{max_retries})")
                await asyncio.sleep(wait)
                if attempt == max_retries - 1:
                    full_text = f"Rate limited by Google API after {max_retries} retries. Please wait a minute and try again."
            else:
                raise

    rejections = parse_rejections(full_text)
    score = calc_survivability(rejections)
    verdict = "APPROVED" if score >= 75 else "REJECTED"

    drift_prediction = None
    if verdict == "REJECTED":
        drift_prediction = await run_drift_oracle(req.diff, rejections)

    phoenix_key = os.environ.get("PHOENIX_API_KEY")
    trace_url = "https://app.phoenix.arize.com/s/siriapps3/projects" if phoenix_key else None

    return ReviewResponse(
        rejections=rejections,
        survivability_score=score,
        verdict=verdict,
        drift_prediction=drift_prediction,
        raw_response=full_text,
        trace_url=trace_url,
        session_id=session_id,
        run_number=run_counter,
    )


async def run_drift_oracle(diff: str, rejections: list[Rejection]) -> DriftPrediction | None:
    drift_session_id = f"drift_{run_counter}"
    user_id = "mergeguard_user"

    existing = await drift_session_service.get_session(
        app_name="mergeguard_drift", user_id=user_id, session_id=drift_session_id
    )
    if not existing:
        await drift_session_service.create_session(
            app_name="mergeguard_drift", user_id=user_id, session_id=drift_session_id
        )

    rejection_summary = "\n".join(
        f"- [{r.severity}] {r.issue}: {r.why_prod_fails}" for r in rejections
    )
    prompt = f"Predict when this code will fail.\n\nDiff:\n```\n{diff[:2000]}\n```\n\nGhost Rejections:\n{rejection_summary}"

    try:
        drift_text = ""
        async for event in drift_runner.run_async(
            user_id=user_id,
            session_id=drift_session_id,
            new_message=types.Content(
                role="user", parts=[types.Part(text=prompt)]
            ),
        ):
            if event.is_final_response() and event.content and event.content.parts:
                drift_text = event.content.parts[0].text

        json_match = re.search(r'```json\s*(\{[\s\S]*?\})\s*```', drift_text)
        if not json_match:
            json_match = re.search(r'(\{[\s\S]*?"incident_probability"[\s\S]*?\})', drift_text)
        if json_match:
            data = json.loads(json_match.group(1))
            return DriftPrediction(
                estimated_hours_to_incident=int(data.get("estimated_hours_to_incident", 24)),
                failure_mode=data.get("failure_mode", "Unknown"),
                drift_pattern=data.get("drift_pattern", "Unknown"),
                early_signals=data.get("early_signals", [])[:3],
                incident_probability=data.get("incident_probability", {"24h": 50, "72h": 70, "7d": 85}),
            )
    except Exception as e:
        print(f"DriftOracle error: {e}")

    return None


def calc_survivability(rejections: list[Rejection]) -> int:
    score = 100
    for r in rejections:
        if r.severity == "CRITICAL":
            score -= 25
        elif r.severity == "WARN":
            score -= 10
        else:
            score -= 3
    return max(0, score)


def parse_rejections(text: str) -> list[Rejection]:
    # Try to find JSON array in ```json blocks first
    json_match = re.search(r'```json\s*(\[[\s\S]*?\])\s*```', text)
    if not json_match:
        # Try bare JSON array
        json_match = re.search(r'(\[\s*\{[\s\S]*?\}\s*\])', text)
    if not json_match:
        # Try finding individual JSON objects and wrap them
        obj_matches = re.findall(r'\{[^{}]*"severity"[^{}]*\}', text)
        if obj_matches:
            try:
                items = [json.loads(m) for m in obj_matches]
                return _items_to_rejections(items)
            except (json.JSONDecodeError, KeyError, TypeError):
                pass

    if json_match:
        try:
            items = json.loads(json_match.group(1))
            return _items_to_rejections(items)
        except (json.JSONDecodeError, KeyError, TypeError):
            pass

    if text.strip():
        return [Rejection(
            severity="STYLE",
            confidence=50,
            issue="Ghost returned unstructured response",
            why_prod_fails=text[:500],
            fix="Review Ghost's full response in raw output",
        )]
    return []


def _items_to_rejections(items: list) -> list[Rejection]:
    rejections = []
    for item in items:
        sev = str(item.get("severity", "STYLE")).upper()
        if sev not in ("CRITICAL", "WARN", "STYLE"):
            sev = "WARN"
        rejections.append(Rejection(
            severity=sev,
            confidence=min(100, max(0, int(item.get("confidence", 50)))),
            line=str(item["line"]) if item.get("line") else None,
            issue=item.get("issue", "Unknown issue"),
            why_prod_fails=item.get("why_prod_fails", "No explanation provided"),
            fix=item.get("fix", "No fix suggested"),
        ))
    return rejections


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
