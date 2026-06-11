import json
import httpx


def analyze_structure(diff: str) -> str:
    """Analyze a code diff for structural issues common in AI-generated code.

    Scans for: missing error handling, silent assumptions about input validity,
    bare except clauses, unchecked nullable access, boundary value blindness,
    and patterns that look correct but break under real-world conditions.

    Args:
        diff: The full PR diff text to analyze.

    Returns:
        A structured analysis of patterns found, with line references.
    """
    patterns = []

    lines = diff.split("\n")
    in_added = False
    current_file = ""
    line_num = 0

    for raw_line in lines:
        if raw_line.startswith("diff --git") or raw_line.startswith("+++"):
            if raw_line.startswith("+++ b/"):
                current_file = raw_line[6:]
            continue
        if raw_line.startswith("@@"):
            parts = raw_line.split("+")
            if len(parts) > 1:
                try:
                    line_num = int(parts[1].split(",")[0]) - 1
                except (ValueError, IndexError):
                    line_num = 0
            continue
        if raw_line.startswith("+") and not raw_line.startswith("+++"):
            line_num += 1
            code = raw_line[1:]

            if "except:" in code or "except Exception:" in code:
                if "pass" in code or (line_num + 1 < len(lines) and "pass" in lines[lines.index(raw_line) + 1] if raw_line in lines else False):
                    patterns.append({
                        "file": current_file,
                        "line": line_num,
                        "pattern": "ERROR_SWALLOWING",
                        "code": code.strip(),
                        "note": "Bare except with no meaningful handling — errors will vanish silently"
                    })

            if any(chain in code for chain in [".get(", "['", '["']) and "if " not in code and "or " not in code:
                patterns.append({
                    "file": current_file,
                    "line": line_num,
                    "pattern": "SILENT_ASSUMPTION",
                    "code": code.strip(),
                    "note": "Dictionary/attribute access without null check — will KeyError on unexpected input"
                })

            dot_chains = code.count(".")
            if dot_chains >= 3 and "import" not in code:
                patterns.append({
                    "file": current_file,
                    "line": line_num,
                    "pattern": "SILENT_ASSUMPTION",
                    "code": code.strip(),
                    "note": "Deep property chain — any intermediate null crashes the whole expression"
                })

            if ("== 0" in code or "== 1" in code or "len(" in code) and "if" not in code:
                patterns.append({
                    "file": current_file,
                    "line": line_num,
                    "pattern": "EDGE_CASE_BLINDNESS",
                    "code": code.strip(),
                    "note": "Boundary value used without guard — check behavior at 0, 1, and max"
                })

            if "# " in code and any(word in code.lower() for word in ["always", "never", "guaranteed", "safe", "will"]):
                patterns.append({
                    "file": current_file,
                    "line": line_num,
                    "pattern": "CONFIDENCE_WITHOUT_EVIDENCE",
                    "code": code.strip(),
                    "note": "Comment makes a guarantee the code doesn't enforce"
                })
        elif raw_line.startswith("-"):
            continue
        else:
            line_num += 1

    summary = f"Found {len(patterns)} suspicious patterns in diff.\n\n"
    for p in patterns:
        summary += f"[{p['pattern']}] {p['file']}:{p['line']}\n"
        summary += f"  Code: {p['code']}\n"
        summary += f"  Issue: {p['note']}\n\n"

    if not patterns:
        summary += "No obvious structural issues detected by static scan. Recommend deeper semantic review."

    return summary


def check_past_rejections(pattern_description: str) -> str:
    """Query Phoenix MCP for similar past rejections and whether they were validated.

    Connects to the local Phoenix MCP server to find historical traces where
    Ghost flagged a similar pattern, and whether the flagged issue turned out
    to be a real production problem.

    Args:
        pattern_description: A description of the failure pattern to search for,
            e.g. "unchecked null access on user profile fields".

    Returns:
        A summary of past instances of this pattern and their validation rate.
    """
    try:
        with httpx.Client(timeout=5.0) as client:
            response = client.post(
                "http://localhost:3100/query",
                json={"query": f"Find traces where Ghost flagged: {pattern_description}"}
            )
            if response.status_code == 200:
                data = response.json()
                return f"Phoenix MCP found {len(data.get('results', []))} past instances of this pattern.\n" + json.dumps(data, indent=2)
    except Exception:
        pass

    return (
        f"No past rejection data found for pattern: '{pattern_description}'. "
        "This is either a new pattern or the Phoenix MCP server is not running. "
        "Ghost will flag this as a first-occurrence pattern — extra scrutiny recommended."
    )


def score_rejection(reason: str, evidence: str, severity: str = "WARN", confidence: int = 50) -> str:
    """Score and format a rejection finding with severity and confidence.

    Takes a rejection reason and supporting evidence, validates the severity
    and confidence levels, and returns a structured rejection record.

    Args:
        reason: Why this code will fail in production.
        evidence: The specific code pattern or line that proves it.
        severity: One of CRITICAL, WARN, or STYLE.
        confidence: 0-100 percent likelihood this causes a real problem.

    Returns:
        A formatted JSON rejection record ready for the review response.
    """
    severity = severity.upper()
    if severity not in ("CRITICAL", "WARN", "STYLE"):
        severity = "WARN"
    confidence = max(0, min(100, confidence))

    rejection = {
        "severity": severity,
        "confidence": confidence,
        "reason": reason,
        "evidence": evidence,
        "actionable": confidence >= 70,
    }

    return json.dumps(rejection, indent=2)
