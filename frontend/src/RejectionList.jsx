import React from 'react'

const SEVERITY_CONFIG = {
  CRITICAL: { color: '#f85149', bg: 'rgba(248, 81, 73, 0.15)', icon: '🔴' },
  WARN: { color: '#d29922', bg: 'rgba(210, 153, 34, 0.15)', icon: '🟡' },
  STYLE: { color: '#58a6ff', bg: 'rgba(88, 166, 255, 0.15)', icon: '🔵' },
}

export default function RejectionList({ rejections }) {
  if (!rejections || rejections.length === 0) {
    return (
      <div style={styles.clean}>
        <span style={{ fontSize: 32 }}>✅</span>
        <p>Ghost found nothing. Suspicious.</p>
      </div>
    )
  }

  const sorted = [...rejections].sort((a, b) => {
    const order = { CRITICAL: 0, WARN: 1, STYLE: 2 }
    return (order[a.severity] ?? 3) - (order[b.severity] ?? 3)
  })

  return (
    <div style={styles.list}>
      {sorted.map((r, i) => {
        const cfg = SEVERITY_CONFIG[r.severity] || SEVERITY_CONFIG.STYLE
        return (
          <div key={i} style={{ ...styles.card, borderLeft: `3px solid ${cfg.color}` }}>
            <div style={styles.cardHeader}>
              <span style={{ ...styles.badge, backgroundColor: cfg.bg, color: cfg.color }}>
                {cfg.icon} {r.severity}
              </span>
              <span style={styles.confidence}>{r.confidence}% confidence</span>
            </div>
            {r.line && <div style={styles.lineRef}>Line {r.line}</div>}
            <div style={styles.reason}>{r.reason}</div>
            <div style={styles.evidence}>{r.evidence}</div>
          </div>
        )
      })}
    </div>
  )
}

const styles = {
  list: {
    flex: 1,
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  card: {
    backgroundColor: '#161b22',
    border: '1px solid #21262d',
    borderRadius: 8,
    padding: 14,
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    padding: '3px 10px',
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.5,
  },
  confidence: {
    fontSize: 12,
    color: '#8b949e',
    fontFamily: "'JetBrains Mono', monospace",
  },
  lineRef: {
    fontSize: 11,
    color: '#79c0ff',
    fontFamily: "'JetBrains Mono', monospace",
    marginBottom: 6,
  },
  reason: {
    fontSize: 13,
    color: '#e6edf3',
    lineHeight: 1.5,
    marginBottom: 6,
  },
  evidence: {
    fontSize: 11,
    color: '#8b949e',
    fontFamily: "'JetBrains Mono', monospace",
    whiteSpace: 'pre-wrap',
  },
  clean: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    color: '#8b949e',
  },
}
