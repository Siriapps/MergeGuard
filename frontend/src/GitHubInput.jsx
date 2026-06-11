import React, { useState } from 'react'

const API_URL = 'http://localhost:8000'

export default function GitHubInput({ onDiffFetched }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchPR = async () => {
    if (!url.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/review-github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ github_url: url }),
      })
      if (!res.ok) throw new Error('Failed to fetch PR')
      const data = await res.json()
      onDiffFetched(data)
    } catch (err) {
      setError('Could not fetch PR. Check URL or set GITHUB_TOKEN.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.inputRow}>
        <div style={styles.iconWrap}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="#94a3b8">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
        </div>
        <input
          style={styles.input}
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://github.com/owner/repo/pull/123"
          onKeyDown={e => e.key === 'Enter' && fetchPR()}
        />
        <button
          className="btn-secondary"
          onClick={fetchPR}
          disabled={loading || !url.trim()}
          style={{ opacity: loading || !url.trim() ? 0.5 : 1 }}
        >
          {loading ? 'Fetching...' : 'Fetch PR'}
        </button>
      </div>
      {error && <div style={styles.error}>{error}</div>}
    </div>
  )
}

const styles = {
  container: {
    marginBottom: 12,
  },
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '4px 8px',
  },
  iconWrap: {
    padding: '4px 4px 4px 6px',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    padding: '8px 4px',
    outline: 'none',
  },
  error: {
    fontSize: 11,
    color: '#ef4444',
    marginTop: 6,
    paddingLeft: 4,
  },
}
