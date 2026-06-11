import React from 'react'

export default function TracePanel({ traceUrl }) {
  if (!traceUrl) return null

  return (
    <div style={s.wrap}>
      <div style={s.left}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span style={s.hint}>Every rejection is traced via Arize Phoenix. Ghost learns from outcomes.</span>
      </div>
      <a href={traceUrl} target="_blank" rel="noopener noreferrer" style={s.link}>
        VIEW IN PHOENIX →
      </a>
    </div>
  )
}

const s = {
  wrap: {
    marginTop: 16,
    padding: '12px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 8,
  },
  left: { display: 'flex', alignItems: 'center', gap: 8 },
  hint: { color: '#5a6577', fontSize: 11 },
  link: {
    color: '#a855f7', textDecoration: 'none', fontSize: 11, fontWeight: 700,
    letterSpacing: 0.5, transition: 'color 0.2s',
  },
}
