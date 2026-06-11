import React, { useState, useEffect } from 'react'

const API_URL = 'http://localhost:8000'

export default function TrackRecord() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch(`${API_URL}/track-record`)
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  if (!data) return null

  return (
    <section style={styles.section}>
      <div style={styles.inner}>
        <h2 style={styles.heading}>Ghost&apos;s Track Record</h2>
        <p style={styles.sub}>Institutional memory. Every prediction tracked.</p>

        <div style={styles.statsRow}>
          <Stat value={`${data.accuracy}%`} label="Prediction Accuracy" color="#10b981" />
          <Stat value={data.incidents_predicted_this_week} label="Incidents Predicted This Week" color="#f59e0b" />
          <Stat value={data.merged_anyway_count} label="Merged Anyway" color="#ef4444" />
          <Stat value={data.failed_within_48h} label="Failed Within 48h" color="#ef4444" />
        </div>

        <div style={styles.feed}>
          {data.recent_prs.map((pr, i) => (
            <div key={i} className="card" style={styles.prCard}>
              <div style={styles.prHeader}>
                <span style={styles.prTitle}>{pr.pr_title}</span>
                <span style={{
                  ...styles.scoreBadge,
                  color: pr.ghost_score >= 75 ? '#10b981' : '#ef4444',
                  background: pr.ghost_score >= 75 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                }}>
                  {pr.ghost_score}/100
                </span>
              </div>
              <div style={styles.prPrediction}>{pr.prediction}</div>
              <div style={styles.prOutcome}>
                <span style={{
                  ...styles.outcomeDot,
                  background: pr.outcome.startsWith('INCIDENT') ? '#ef4444'
                    : pr.outcome.startsWith('FIXED') ? '#10b981' : '#3b82f6',
                }} />
                {pr.outcome}
              </div>
              <div style={styles.prMeta}>
                {pr.date}
                {pr.merged_anyway && <span style={styles.mergedTag}>MERGED ANYWAY</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Stat({ value, label, color }) {
  return (
    <div style={styles.stat}>
      <div style={{ ...styles.statValue, color }}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  )
}

const styles = {
  section: {
    padding: '60px 20px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  inner: {
    maxWidth: 900,
    margin: '0 auto',
  },
  heading: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 6,
    color: '#f1f5f9',
    textAlign: 'center',
  },
  sub: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 12,
    marginBottom: 32,
  },
  stat: {
    textAlign: 'center',
    padding: 16,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 800,
    fontFamily: 'var(--font-mono)',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  feed: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  prCard: {
    padding: 14,
  },
  prHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  prTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#e2e8f0',
  },
  scoreBadge: {
    padding: '2px 10px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 700,
    fontFamily: 'var(--font-mono)',
  },
  prPrediction: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 6,
    fontStyle: 'italic',
  },
  prOutcome: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 6,
    fontSize: 12,
    color: '#e2e8f0',
    lineHeight: 1.5,
    marginBottom: 6,
  },
  outcomeDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    marginTop: 5,
    flexShrink: 0,
  },
  prMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 11,
    color: '#64748b',
  },
  mergedTag: {
    padding: '1px 6px',
    borderRadius: 4,
    background: 'rgba(239,68,68,0.12)',
    color: '#ef4444',
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 0.5,
  },
}
