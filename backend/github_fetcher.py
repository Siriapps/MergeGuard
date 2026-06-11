import httpx


def fetch_pr_diff(pr_url: str, github_token: str = "") -> dict:
    parts = pr_url.rstrip("/").split("/")
    owner, repo, pr_num = parts[-4], parts[-3], parts[-1]

    headers = {"Accept": "application/vnd.github.v3+json"}
    if github_token:
        headers["Authorization"] = f"token {github_token}"

    with httpx.Client(timeout=15.0) as client:
        pr_res = client.get(
            f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_num}",
            headers=headers,
        )
        pr_res.raise_for_status()
        pr_data = pr_res.json()
        pr_title = pr_data.get("title", "GitHub PR")

        files_res = client.get(
            f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_num}/files",
            headers=headers,
        )
        files_res.raise_for_status()
        files = files_res.json()

    combined_diff = "\n".join(
        f"diff --git a/{f['filename']} b/{f['filename']}\n{f.get('patch', '')}"
        for f in files
        if f.get("patch")
    )

    return {"diff": combined_diff, "title": pr_title}
