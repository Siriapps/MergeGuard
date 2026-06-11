import React, { useState, useEffect } from 'react'
import Landing from './Landing'
import RejectionList from './RejectionList'
import SurvivabilityGauge from './SurvivabilityGauge'
import DriftPanel from './DriftPanel'
import TracePanel from './TracePanel'

const API = 'http://localhost:8000'

const SAMPLE_DIFF = `diff --git a/api/users.py b/api/users.py
--- a/api/users.py
+++ b/api/users.py
@@ -12,6 +12,24 @@ from db import get_connection
+def get_user_profile(user_id):
+    conn = get_connection()
+    result = conn.execute("SELECT * FROM users WHERE id = " + user_id)
+    user = result.fetchone()
+    profile = user['profile']
+    name = profile['display_name']
+    avatar = profile['avatar_url'].strip()
+    try:
+        preferences = json.loads(user['preferences'])
+    except:
+        pass
+    age = int(user['age'])
+    score = user['points'] / user['games_played']
+    return {"name": name, "avatar": avatar, "age": age, "score": score, "prefs": preferences}
`

const NAV = [
  { id: 'radar', icon: '◉', label: 'radar', sub: 'Active Scans' },
  { id: 'history', icon: '◷', label: 'history', sub: 'Track Record' },
  { id: 'terminal', icon: '⌘', label: 'terminal', sub: 'Agent Autopsy' },
  { id: 'settings', icon: '⚙', label: 'settings', sub: 'Settings' },
]

export default function App() {
  const [showDashboard, setShowDashboard] = useState(false)
  const [view, setView] = useState('radar')
  const [prUrl, setPrUrl] = useState('')
  const [diff, setDiff] = useState('')
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [trackRecord, setTrackRecord] = useState(null)
  const [traceLog, setTraceLog] = useState([])

  useEffect(() => {
    fetch(`${API}/track-record`).then(r => r.json()).then(setTrackRecord).catch(() => {})
  }, [])

  const addTrace = (msg) => {
    const t = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    setTraceLog(prev => [...prev.slice(-20), { time: t, msg }])
  }

  const runReview = async () => {
    if (!diff.trim()) return
    setLoading(true)
    addTrace('[Ghost] Initializing adversarial review...')
    addTrace('[Ghost] Scanning AST for structural issues...')
    try {
      const res = await fetch(`${API}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diff, session_id: sessionId }),
      })
      const data = await res.json()
      setSessionId(data.session_id)
      setRuns(prev => [...prev, data])
      addTrace(`[Ghost] Found ${data.rejections.length} issues — Score: ${data.survivability_score}`)
      if (data.drift_prediction) addTrace(`[Oracle] ETA to incident: ${data.drift_prediction.estimated_hours_to_incident}h`)
      addTrace(`[System] Verdict: ${data.verdict}`)
    } catch { addTrace('[System] Error: Review failed') }
    finally { setLoading(false) }
  }

  const fetchGitHub = async () => {
    if (!prUrl.trim()) return
    setLoading(true)
    addTrace('[System] Fetching PR diff from GitHub...')
    try {
      const res = await fetch(`${API}/review-github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ github_url: prUrl }),
      })
      const data = await res.json()
      setSessionId(data.session_id)
      setRuns(prev => [...prev, data])
      addTrace(`[Ghost] Found ${data.rejections.length} issues — Score: ${data.survivability_score}`)
      addTrace(`[System] Verdict: ${data.verdict}`)
    } catch { addTrace('[System] Error: Could not fetch PR') }
    finally { setLoading(false) }
  }

  const current = runs[runs.length - 1]

  if (!showDashboard) {
    return <Landing onLaunch={() => setShowDashboard(true)} />
  }

  return (
    <div className="layout">
      {/* LEFT SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="1.5"/>
            <path d="M9 12l2 2 4-4" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div>
            <div className="logo-text">MergeGuard</div>
            <div className="logo-sub">AI Stress-Tester</div>
          </div>
        </div>

        <nav className="nav">
          {NAV.map(n => (
            <button key={n.id} className={`nav-item ${view === n.id ? 'active' : ''}`} onClick={() => setView(n.id)}>
              <span className="nav-icon">{n.icon}</span>
              <div>
                <div className="nav-label">{n.label}</div>
                <div className="nav-sub">{n.sub}</div>
              </div>
            </button>
          ))}
        </nav>

        <button className="new-scan-btn" onClick={() => { setRuns([]); setDiff(''); setSessionId(null); setView('radar') }}>
          + New Scan
        </button>
      </aside>

      {/* MAIN AREA */}
      <div className="main-area">
        {/* TOP BAR */}
        <header className="topbar">
          <div className="search-wrap">
            <span className="search-icon">⌕</span>
            <input className="search-input" placeholder="Search logs, hashes ..." />
          </div>
          <div className="topbar-right">
            <span className="top-link">Docs</span>
            <span className="top-link">Support</span>
            <span className="top-link">API</span>
            <button className="override-btn">Manual Override</button>
          </div>
        </header>

        {/* CONTENT */}
        <div className="content-area">
          <div className="main-content">
            {/* PR URL */}
            <div className="section-label">TARGET REPOSITORY / PR URL</div>
            <div className="url-row">
              <input
                className="url-input"
                value={prUrl}
                onChange={e => setPrUrl(e.target.value)}
                placeholder="https://github.com/owner/repo/pull/123"
                onKeyDown={e => e.key === 'Enter' && fetchGitHub()}
              />
              <button className="fetch-btn" onClick={fetchGitHub} disabled={loading}>
                <span style={{ marginRight: 6 }}>◎</span>Fetch & Stress-Test
              </button>
            </div>

            {/* Diff input */}
            {!current && (
              <>
                <div className="or-divider">
                  <div className="or-line" /><span className="or-text">or paste diff directly</span><div className="or-line" />
                </div>
                <textarea
                  className="diff-textarea"
                  value={diff}
                  onChange={e => setDiff(e.target.value)}
                  placeholder="Paste your PR diff here..."
                  spellCheck={false}
                />
                <div className="textarea-actions">
                  <button className="btn-secondary" onClick={() => setDiff(SAMPLE_DIFF)}>Load sample diff</button>
                  <button className="btn-primary" onClick={runReview} disabled={loading || !diff.trim()}>
                    {loading ? 'Analyzing...' : 'Run Ghost Review'}
                  </button>
                </div>
              </>
            )}

            {/* Loading */}
            {loading && (
              <div className="loading-card">
                <div className="spinner" />
                <div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Ghost is stress-testing your code...</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 4 }}>Analyzing for survivability failures</div>
                </div>
              </div>
            )}

            {/* Results */}
            {current && !loading && (
              <div style={{ animation: 'fadeIn 0.4s ease' }}>
                <div className="verdict-banner">
                  <SurvivabilityGauge score={current.survivability_score} verdict={current.verdict} />
                  <div className="verdict-info">
                    <div className={`verdict-tag ${current.verdict === 'REJECTED' ? 'critical' : 'approved'}`}>
                      {current.verdict === 'REJECTED' ? '⚠ CRITICAL FAILURE DETECTED' : '✓ SURVIVABILITY CHECK PASSED'}
                    </div>
                    <h2 className="verdict-title">
                      VERDICT: <span style={{ color: current.verdict === 'REJECTED' ? '#ef4444' : '#10b981' }}>{current.verdict}</span>
                    </h2>
                    <p className="verdict-quote">
                      {current.verdict === 'REJECTED'
                        ? `"This code won't survive production. ${current.rejections.length} critical patterns detected."`
                        : `"Code passes survivability checks. No production risk detected."`}
                    </p>
                  </div>
                </div>

                {current.drift_prediction && <DriftPanel prediction={current.drift_prediction} />}

                {/* Diff viewer with line numbers */}
                {diff && (
                  <div className="diff-viewer-section">
                    <div className="findings-header" style={{ marginTop: 16 }}>
                      <h3 className="findings-title">Reviewed Diff</h3>
                      <span className="findings-count">{diff.split('\n').length} lines</span>
                    </div>
                    <div className="diff-viewer">
                      {diff.split('\n').map((line, i) => {
                        const flagged = current.rejections.some(r => r.line && parseInt(r.line) === i + 1)
                        let cls = 'diff-line'
                        if (line.startsWith('+') && !line.startsWith('+++')) cls += ' added'
                        else if (line.startsWith('-') && !line.startsWith('---')) cls += ' removed'
                        else if (line.startsWith('@@')) cls += ' hunk'
                        if (flagged) cls += ' flagged'
                        return (
                          <div key={i} className={cls}>
                            <span className="diff-ln">{i + 1}</span>
                            <span className="diff-code">{line || ' '}</span>
                            {flagged && <span className="diff-flag">⚠</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="findings-header">
                  <h3 className="findings-title">Detailed Findings</h3>
                  <span className="findings-count">{current.rejections.length} issues</span>
                </div>
                <RejectionList rejections={current.rejections} />

                <div className="rerun-bar">
                  <button className="btn-secondary" onClick={() => { setRuns([]); setDiff(diff) }}>Edit diff & re-scan</button>
                  <button className="btn-primary" onClick={runReview} disabled={loading}>
                    Re-run Ghost Review (Run {runs.length + 1})
                  </button>
                </div>

                <TracePanel traceUrl={current.trace_url} />
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="right-sidebar">
            <div className="right-card">
              <div className="right-card-header">
                <span className="section-label" style={{ marginBottom: 0 }}>TRACK RECORD</span>
              </div>
              <div className="big-stat">
                <span className="big-stat-num">{trackRecord?.accuracy || 94}%</span>
                <span className="big-stat-label">Agent Accuracy (30d)</span>
              </div>
              <div className="stat-row">
                <span>Incidents Predicted</span>
                <span style={{ color: '#f59e0b', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{trackRecord?.incidents_predicted_this_week || 3}</span>
              </div>
              <div className="stat-row">
                <span>False Positives</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>12</span>
              </div>
              <div className="stat-row">
                <span>Total Reviews</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{trackRecord?.total_reviews || 847}</span>
              </div>
            </div>

            <div className="right-card">
              <div className="right-card-header">
                <span className="section-label" style={{ marginBottom: 0 }}>
                  <span style={{ marginRight: 6 }}>◎</span>LIVE TRACE FEED
                </span>
                <span className="live-dot" />
              </div>
              <div className="trace-feed">
                {traceLog.length === 0 && (
                  <div style={{ color: 'var(--text-dim)', fontSize: 12, fontStyle: 'italic', padding: '8px 0' }}>
                    Waiting for scan...
                  </div>
                )}
                {traceLog.map((t, i) => (
                  <div key={i} className="trace-item">
                    <span className="trace-time">[{t.time}]</span>
                    <span className="trace-msg">{t.msg}</span>
                  </div>
                ))}
              </div>
            </div>

            {trackRecord && (
              <div className="right-card">
                <div className="right-card-header">
                  <span className="section-label" style={{ marginBottom: 0 }}>RECENT SCANS</span>
                </div>
                {trackRecord.recent_prs.slice(0, 4).map((pr, i) => (
                  <div key={i} className="recent-pr">
                    <div className="recent-pr-title">{pr.pr_title}</div>
                    <div className="recent-pr-meta">
                      <span className={`mini-score ${pr.ghost_score >= 75 ? 'pass' : 'fail'}`}>{pr.ghost_score}/100</span>
                      {pr.merged_anyway && <span className="merged-tag">MERGED ANYWAY</span>}
                      <span className="recent-pr-outcome">{pr.outcome}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>

      <style>{`
        .layout { display: flex; min-height: 100vh; background: var(--bg-base); }

        /* SIDEBAR */
        .sidebar {
          width: 210px; background: var(--bg-sidebar); border-right: 1px solid var(--border);
          display: flex; flex-direction: column; padding: 0 0 16px; position: sticky; top: 0; height: 100vh; flex-shrink: 0;
        }
        .sidebar-logo { display: flex; align-items: center; gap: 10px; padding: 20px 16px 28px; }
        .logo-text { font-size: 15px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.3px; }
        .logo-sub { font-size: 10px; color: var(--text-muted); letter-spacing: 0.5px; text-transform: uppercase; }
        .nav { display: flex; flex-direction: column; gap: 2px; padding: 0 8px; flex: 1; }
        .nav-item {
          display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: transparent;
          border: none; border-radius: 8px; cursor: pointer; text-align: left; color: var(--text-secondary);
          transition: all 0.15s; width: 100%;
        }
        .nav-item:hover { background: rgba(255,255,255,0.03); }
        .nav-item.active { background: rgba(239,68,68,0.08); color: #ef4444; }
        .nav-icon { font-size: 14px; width: 20px; text-align: center; flex-shrink: 0; }
        .nav-label { font-size: 13px; font-weight: 600; line-height: 1.2; }
        .nav-sub { font-size: 10px; color: var(--text-muted); margin-top: 1px; }
        .new-scan-btn {
          margin: 0 12px; padding: 10px 16px; background: var(--gradient-brand); color: #fff;
          border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer;
        }

        /* MAIN */
        .main-area { flex: 1; display: flex; flex-direction: column; min-width: 0; }

        /* TOP BAR */
        .topbar {
          display: flex; align-items: center; justify-content: space-between; padding: 10px 24px;
          border-bottom: 1px solid var(--border); background: var(--bg-sidebar); position: sticky; top: 0; z-index: 10;
        }
        .search-wrap {
          display: flex; align-items: center; background: var(--bg-input); border: 1px solid var(--border);
          border-radius: 8px; padding: 6px 12px; width: 320px;
        }
        .search-icon { color: var(--text-muted); margin-right: 8px; font-size: 14px; }
        .search-input { background: transparent; border: none; color: var(--text-secondary); font-size: 12px; outline: none; width: 100%; }
        .topbar-right { display: flex; align-items: center; gap: 20px; }
        .top-link { font-size: 13px; color: var(--text-secondary); cursor: pointer; }
        .top-link:hover { color: var(--text-primary); }
        .override-btn {
          padding: 6px 16px; background: rgba(239,68,68,0.12); color: #ef4444;
          border: 1px solid rgba(239,68,68,0.25); border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;
        }

        /* CONTENT */
        .content-area { display: flex; flex: 1; overflow: auto; }
        .main-content { flex: 1; padding: 24px 28px; min-width: 0; }
        .section-label { font-size: 10px; font-weight: 700; letter-spacing: 1.5px; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase; }

        .url-row { display: flex; gap: 12px; margin-bottom: 16px; }
        .url-input {
          flex: 1; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px;
          color: var(--text-primary); font-family: var(--font-mono); font-size: 13px; padding: 10px 14px; outline: none;
        }
        .fetch-btn {
          padding: 10px 20px; background: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border);
          border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap;
        }
        .fetch-btn:hover { border-color: var(--border-active); }

        .or-divider { display: flex; align-items: center; gap: 14px; margin: 12px 0 16px; }
        .or-line { flex: 1; height: 1px; background: var(--border); }
        .or-text { font-size: 10px; color: var(--text-muted); letter-spacing: 1px; text-transform: uppercase; }

        .diff-textarea {
          width: 100%; min-height: 280px; background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 10px; color: var(--text-primary); font-family: var(--font-mono); font-size: 12px;
          line-height: 1.7; padding: 16px; resize: vertical; outline: none;
        }
        .diff-textarea:focus { border-color: var(--border-active); }
        .textarea-actions { display: flex; justify-content: space-between; margin-top: 12px; }

        .btn-secondary {
          padding: 8px 16px; background: var(--bg-card); color: var(--text-secondary); border: 1px solid var(--border);
          border-radius: 6px; font-size: 12px; cursor: pointer;
        }
        .btn-secondary:hover { border-color: var(--text-muted); color: var(--text-primary); }
        .btn-primary {
          padding: 10px 24px; background: var(--gradient-brand); color: #fff; border: none;
          border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; letter-spacing: 0.3px;
        }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .loading-card {
          display: flex; align-items: center; gap: 16px; padding: 24px; background: var(--bg-card);
          border: 1px solid var(--border); border-radius: 10px; margin-top: 20px;
        }
        .spinner {
          width: 28px; height: 28px; border: 3px solid var(--border); border-top: 3px solid #ef4444;
          border-radius: 50%; animation: spin 1s linear infinite; flex-shrink: 0;
        }

        /* VERDICT */
        .verdict-banner {
          display: flex; align-items: center; gap: 28px; padding: 24px 28px; background: var(--bg-card);
          border: 1px solid var(--border); border-radius: 12px; margin: 20px 0; box-shadow: var(--shadow-glow);
        }
        .verdict-info { flex: 1; }
        .verdict-tag {
          font-size: 10px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;
          display: inline-block; padding: 3px 10px; border-radius: 4px; margin-bottom: 6px;
        }
        .verdict-tag.critical { color: #ef4444; background: var(--critical-bg); }
        .verdict-tag.approved { color: #10b981; background: var(--approved-bg); }
        .verdict-title { font-size: 26px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.5px; margin-bottom: 8px; }
        .verdict-quote {
          font-size: 13px; color: var(--text-secondary); font-family: var(--font-mono); line-height: 1.6;
          border-left: 2px solid var(--border); padding-left: 12px;
        }

        .findings-header { display: flex; justify-content: space-between; align-items: center; margin: 24px 0 14px; }
        .findings-title { font-size: 18px; font-weight: 700; color: var(--text-primary); }
        .findings-count {
          font-size: 12px; color: var(--text-secondary); background: var(--bg-card); padding: 3px 10px;
          border-radius: 12px; border: 1px solid var(--border);
        }
        .rerun-bar { display: flex; justify-content: space-between; margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border); }

        /* RIGHT SIDEBAR */
        .right-sidebar {
          width: 280px; border-left: 1px solid var(--border); padding: 24px 16px; flex-shrink: 0;
          overflow: auto; display: flex; flex-direction: column; gap: 16px;
        }
        .right-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 14px; }
        .right-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .big-stat { margin-bottom: 12px; }
        .big-stat-num { font-size: 36px; font-weight: 800; color: #10b981; font-family: var(--font-mono); display: block; line-height: 1; }
        .big-stat-label { font-size: 11px; color: var(--text-muted); margin-top: 4px; display: block; }
        .stat-row {
          display: flex; justify-content: space-between; font-size: 12px; color: var(--text-secondary);
          padding: 6px 0; border-top: 1px solid var(--border-subtle);
        }

        .live-dot { width: 7px; height: 7px; border-radius: 50%; background: #10b981; animation: pulse 2s infinite; }
        .trace-feed { max-height: 220px; overflow: auto; font-family: var(--font-mono); font-size: 11px; }
        .trace-item { display: flex; gap: 6px; padding: 3px 0; color: var(--text-secondary); line-height: 1.4; animation: slideIn 0.3s ease; }
        .trace-time { color: var(--text-dim); flex-shrink: 0; }
        .trace-msg { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .recent-pr { padding: 8px 0; border-top: 1px solid var(--border-subtle); }
        .recent-pr-title { font-size: 12px; color: var(--text-primary); font-weight: 500; margin-bottom: 4px; }
        .recent-pr-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .mini-score { font-size: 10px; font-weight: 700; font-family: var(--font-mono); padding: 1px 6px; border-radius: 4px; }
        .mini-score.pass { color: #10b981; background: rgba(16,185,129,0.1); }
        .mini-score.fail { color: #ef4444; background: rgba(239,68,68,0.1); }
        .merged-tag { font-size: 8px; font-weight: 800; color: #ef4444; background: var(--critical-bg); padding: 1px 5px; border-radius: 3px; letter-spacing: 0.5px; }
        .recent-pr-outcome { font-size: 10px; color: var(--text-muted); }

        /* DIFF VIEWER */
        .diff-viewer-section { margin-bottom: 20px; }
        .diff-viewer {
          background: var(--bg-code); border: 1px solid var(--border); border-radius: 10px;
          overflow: auto; max-height: 400px; font-family: var(--font-mono); font-size: 12px; line-height: 1.7;
        }
        .diff-line { display: flex; align-items: flex-start; padding: 0 12px; position: relative; }
        .diff-line:hover { background: rgba(255,255,255,0.02); }
        .diff-line.added { background: rgba(16,185,129,0.06); }
        .diff-line.removed { background: rgba(239,68,68,0.06); }
        .diff-line.hunk { background: rgba(59,130,246,0.06); color: #3b82f6; }
        .diff-line.flagged { background: rgba(239,68,68,0.12); border-left: 3px solid #ef4444; }
        .diff-ln {
          width: 40px; flex-shrink: 0; text-align: right; padding-right: 12px; color: var(--text-dim);
          user-select: none; border-right: 1px solid var(--border-subtle); margin-right: 12px;
        }
        .diff-code { flex: 1; white-space: pre; overflow-x: auto; }
        .diff-line.added .diff-code { color: #10b981; }
        .diff-line.removed .diff-code { color: #ef4444; }
        .diff-flag {
          position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
          color: #ef4444; font-size: 14px;
        }
      `}</style>
    </div>
  )
}
