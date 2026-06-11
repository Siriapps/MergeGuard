import os
import json
import asyncio
import time
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

app = FastAPI(title="MergeGuard", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

runner = InMemoryRunner(agent=ghost_agent, app_name="mergeguard")
session_service = runner.session_service
run_counter = 0


class ReviewRequest(BaseModel):
    diff: str
    session_id: str | None = None


class Rejection(BaseModel):
    line: str | None = None
    severity: str
    confidence: int
    reason: str
    evidence: str


class ReviewResponse(BaseModel):
    rejections: list[Rejection]
    raw_response: str
    trace_url: str | None = None
    session_id: str
    run_number: int


@app.get("/health")
async def health():
    return {"status": "ok", "agent": "ghost", "model": "gemini-3.1-flash-lite"}


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
    max_retries = 3
    for attempt in range(max_retries):
        try:
            async for event in runner.run_async(
                user_id=user_id,
                session_id=session_id,
                new_message=types.Content(
                    role="user", parts=[types.Part(text=prompt)]
                ),
            ):
                if event.is_final_response() and event.content and event.content.parts:
                    full_text = event.content.parts[0].text
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

    phoenix_key = os.environ.get("PHOENIX_API_KEY")
    trace_url = "https://app.phoenix.arize.com/projects/mergeguard" if phoenix_key else None

    return ReviewResponse(
        rejections=rejections,
        raw_response=full_text,
        trace_url=trace_url,
        session_id=session_id,
        run_number=run_counter,
    )


def parse_rejections(text: str) -> list[Rejection]:
    rejections = []
    severity_map = {"CRITICAL": "CRITICAL", "WARN": "WARN", "STYLE": "STYLE"}

    lines = text.split("\n")
    i = 0
    current = None

    for line in lines:
        line_stripped = line.strip()

        for sev_key in severity_map:
            if sev_key in line_stripped.upper() and ("confidence" in line_stripped.lower() or "%" in line_stripped):
                if current:
                    rejections.append(current)

                confidence = 50
                for word in line_stripped.split():
                    cleaned = word.strip("()%,")
                    try:
                        val = int(cleaned)
                        if 0 <= val <= 100:
                            confidence = val
                            break
                    except ValueError:
                        continue

                current = Rejection(
                    severity=sev_key,
                    confidence=confidence,
                    reason="",
                    evidence=line_stripped,
                    line=None,
                )
                break

        if current and "line" in line_stripped.lower() and any(c.isdigit() for c in line_stripped):
            for word in line_stripped.split():
                cleaned = word.strip(":,.")
                try:
                    val = int(cleaned)
                    if 1 <= val <= 9999:
                        current.line = str(val)
                        break
                except ValueError:
                    continue

        if current and line_stripped and not any(s in line_stripped.upper() for s in severity_map):
            if current.reason:
                current.reason += " " + line_stripped
            else:
                current.reason = line_stripped

    if current:
        rejections.append(current)

    if not rejections and text.strip():
        rejections.append(Rejection(
            severity="STYLE",
            confidence=50,
            reason=text[:500],
            evidence="Full response (no structured rejections parsed)",
        ))

    return rejections


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
