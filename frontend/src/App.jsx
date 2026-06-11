import React, { useState } from 'react'
import DiffViewer from './DiffViewer'
import RejectionList from './RejectionList'
import TracePanel from './TracePanel'

const SAMPLE_DIFF = `diff --git a/api/users.py b/api/users.py
--- a/api/users.py
+++ b/api/users.py
@@ -12,6 +12,24 @@ from db import get_connection
+def get_user_profile(user_id):
+    """Fetch user profile from database."""
+    conn = get_connection()
+    result = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,))
+    user = result.fetchone()
+    profile = user['profile']  # always exists
+    name = profile['display_name']
+    avatar = profile['avatar_url'].strip()
+
+    try:
+        preferences = json.loads(user['preferences'])
+    except:
+        pass
+
+    age = int(user['age'])
+    score = user['points'] / user['games_played']
+
+    return {"name": name, "avatar": avatar, "age": age, "score": score, "prefs": preferences}
`

const API_URL = 'http://localhost:8000'

export default function App() {
  const [diff, setDiff] = useState('')
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)

  const runReview = async () => {
    if (!diff.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diff, session_id: sessionId }),
      })
      const data = await res.json()
      setSessionId(data.session_id)
      setRuns(prev => [...prev, data])
    } catch (err) {
      console.error('Review failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadSample = () => setDiff(SAMPLE_DIFF)
  const currentRun = runs[runs.length - 1]
  const prevRun = runs.length > 1 ? runs[runs.length - 2] : null

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logo}>
          <span style={styles.skull}>💀</span>
          <h1 style={styles.title}>MergeGuard</h1>
        </div>
        <p style={styles.tagline}>The ghost that gets angrier when right</p>
      </header>

      <main style={styles.main}>
        <div style={styles.leftPanel}>
          <div style={styles.panelHeader}>
            <span>PR DIFF</span>
            <button onClick={loadSample} style={styles.sampleBtn}>Load Sample</button>
          </div>
          {!currentRun ? (
            <textarea
              style={styles.textarea}
              value={diff}
              onChange={e => setDiff(e.target.value)}
              placeholder="Paste your PR diff here..."
              spellCheck={false}
            />
          ) : (
            <DiffViewer diff={diff} rejections={currentRun.rejections} />
          )}
          <button
            onClick={runReview}
            disabled={loading || !diff.trim()}
            style={{
              ...styles.runBtn,
              opacity: loading || !diff.trim() ? 0.5 : 1,
            }}
          >
            {loading ? 'Ghost is reviewing...' : runs.length > 0 ? `RE-RUN (Run ${runs.length + 1})` : 'RUN MERGEGUARD'}
          </button>
        </div>

        <div style={styles.rightPanel}>
          <div style={styles.panelHeader}>
            <span>GHOST&apos;S VERDICT</span>
            {currentRun && (
              <span style={styles.runBadge}>Run {runs.length}</span>
            )}
          </div>

          {!currentRun && !loading && (
            <div style={styles.empty}>
              <span style={{ fontSize: 48 }}>👻</span>
              <p>Paste a diff and run MergeGuard.</p>
              <p style={{ color: '#6e7681' }}>Ghost will tear it apart.</p>
            </div>
          )}

          {loading && (
            <div style={styles.empty}>
              <div style={styles.spinner} />
              <p>Ghost is analyzing your code...</p>
              <p style={{ color: '#f85149', fontSize: 12 }}>Finding every way it will fail</p>
            </div>
          )}

          {currentRun && !loading && (
            <RejectionList rejections={currentRun.rejections} />
          )}

          {currentRun && <TracePanel traceUrl={currentRun.trace_url} />}
        </div>
      </main>

      {prevRun && currentRun && (
        <footer style={styles.comparison}>
          <span>Run {runs.length - 1}: {prevRun.rejections.length} issues</span>
          <span style={{ margin: '0 12px' }}>&rarr;</span>
          <span>Run {runs.length}: {currentRun.rejections.length} issues</span>
          <span style={{ marginLeft: 16 }}>
            {currentRun.rejections.length < prevRun.rejections.length
              ? '✅ Ghost is calming down'
              : currentRun.rejections.length === prevRun.rejections.length
              ? '😐 No change'
              : '🔥 Ghost found MORE issues'}
          </span>
        </footer>
      )}
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0d1117',
    color: '#e6edf3',
    fontFamily: "'Inter', sans-serif",
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '20px 32px',
    borderBottom: '1px solid #21262d',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: { display: 'flex', alignItems: 'center', gap: 12 },
  skull: { fontSize: 28 },
  title: {
    margin: 0,
    fontSize: 22,
    fontWeight: 700,
    background: 'linear-gradient(90deg, #f85149, #ff7b72)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  tagline: { margin: 0, color: '#8b949e', fontSize: 14, fontStyle: 'italic' },
  main: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 0,
  },
  leftPanel: {
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #21262d',
    padding: 20,
  },
  rightPanel: {
    display: 'flex',
    flexDirection: 'column',
    padding: 20,
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 1.5,
    color: '#8b949e',
    textTransform: 'uppercase',
  },
  textarea: {
    flex: 1,
    minHeight: 400,
    backgroundColor: '#161b22',
    border: '1px solid #30363d',
    borderRadius: 8,
    color: '#e6edf3',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 13,
    padding: 16,
    resize: 'none',
    outline: 'none',
  },
  runBtn: {
    marginTop: 12,
    padding: '12px 24px',
    backgroundColor: '#f85149',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: 0.5,
  },
  sampleBtn: {
    padding: '4px 10px',
    backgroundColor: '#21262d',
    color: '#8b949e',
    border: '1px solid #30363d',
    borderRadius: 6,
    fontSize: 11,
    cursor: 'pointer',
  },
  runBadge: {
    backgroundColor: '#21262d',
    padding: '2px 8px',
    borderRadius: 10,
    fontSize: 11,
    color: '#8b949e',
  },
  empty: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    color: '#8b949e',
  },
  spinner: {
    width: 32,
    height: 32,
    border: '3px solid #21262d',
    borderTop: '3px solid #f85149',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  comparison: {
    padding: '12px 32px',
    borderTop: '1px solid #21262d',
    fontSize: 14,
    color: '#8b949e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}
