TRACK_RECORD = {
    "accuracy": 94,
    "total_reviews": 847,
    "incidents_predicted_this_week": 3,
    "merged_anyway_count": 2,
    "failed_within_48h": 2,
    "avg_time_to_incident_hours": 6.2,
    "recent_prs": [
        {
            "pr_title": "Add user session caching layer",
            "ghost_score": 32,
            "verdict": "REJECTED",
            "prediction": "Race condition under concurrent logins — ~8h to incident",
            "outcome": "INCIDENT: Session corruption at 3am, 2,400 users affected",
            "date": "2026-06-09",
            "merged_anyway": True,
        },
        {
            "pr_title": "Refactor payment webhook handler",
            "ghost_score": 18,
            "verdict": "REJECTED",
            "prediction": "Missing idempotency key — duplicate charges within 24h",
            "outcome": "INCIDENT: $12K in duplicate charges, rollback required",
            "date": "2026-06-08",
            "merged_anyway": True,
        },
        {
            "pr_title": "Update search indexing pipeline",
            "ghost_score": 85,
            "verdict": "APPROVED",
            "prediction": "Minor style issues, no production risk",
            "outcome": "CLEAN: Running 72h with no issues",
            "date": "2026-06-07",
            "merged_anyway": False,
        },
        {
            "pr_title": "Add rate limiting to public API",
            "ghost_score": 41,
            "verdict": "REJECTED",
            "prediction": "Off-by-one in sliding window — allows burst bypass",
            "outcome": "FIXED: Team addressed Ghost's findings before merge",
            "date": "2026-06-06",
            "merged_anyway": False,
        },
        {
            "pr_title": "Migrate auth tokens to JWT",
            "ghost_score": 55,
            "verdict": "REJECTED",
            "prediction": "Token expiry not checked on refresh path — ~48h",
            "outcome": "FIXED: Added expiry check after Ghost review",
            "date": "2026-06-05",
            "merged_anyway": False,
        },
    ],
}


def get_track_record() -> dict:
    return TRACK_RECORD
