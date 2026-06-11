import React from 'react'

const SEV = {
  CRITICAL: { color: '#ef4444', bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.2)' },
  WARN:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.2)' },
  STYLE:    { color: '#3b82f6', bg: 'rgba(59,130,246,0.06)',  border: 'rgba(59,130,246,0.2)' },
}

export default function RejectionList({ rejections }) {
  if (!rejections || rejections.length === 0) {
    return (
      <div style={s.clean}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5">
          <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/>
          <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p style={{ color: '#10b981', fontWeight: 600 }}>All clear — no issues found</p>
        <p style={{ color: '#5a6577', fontSize: 12 }}>Ghost found nothing. Suspicious.</p>
      </div>
    )
  }

  const sorted = [...rejections].sort((a, b) => {
    const ord = { CRITICAL: 0, WARN: 1, STYLE: 2 }
    return (ord[a.severity] ?? 3) - (ord[b.severity] ?? 3)
  })

  return (
    <div style={s.list}>
      {sorted.map((r, i) => {
        const cfg = SEV[r.severity] || SEV.STYLE
        return (
          <div key={i} style={{ ...s.card, borderLeftColor: cfg.color, background: cfg.bg }}>
            <div style={s.top}>
              <div style={s.topLeft}>
                <span style={{ ...s.badge, color: cfg.color, background: `${cfg.color}18`, border: `1px solid ${cfg.border}` }}>
                  {r.severity}
                </span>
                {r.line && <span style={s.lineRef}>Line {r.line}</span>}
              </div>
              <span style={s.confidence}>{r.confidence}%</span>
            </div>

            <div style={s.issue}>{r.issue}</div>

            <div style={s.section}>
              <div style={s.label}>WHY THIS KILLS PRODUCTION</div>
              <div style={s.detail}>{r.why_prod_fails}</div>
            </div>

            <div style={s.fixWrap}>
              <div style={s.fixHeader}>
                <span style={s.fixTag}>RECOMMENDED FIX</span>
              </div>
              <code style={s.fixCode}>{r.fix}</code>
            </div>
          </div>
        )
      })}
    </div>
  )
}

const s = {
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: {
    padding: 16,
    borderLeft: '3px solid',
    borderRadius: 10,
    border: '1px solid var(--border)',
    borderLeft: '3px solid',
    animation: 'fadeIn 0.4s ease',
  },
  top: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  topLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  badge: { fontSize: 10, fontWeight: 800, letterSpacing: 1, padding: '2px 8px', borderRadius: 4 },
  lineRef: { fontSize: 11, color: '#3b82f6', fontFamily: 'var(--font-mono)', fontWeight: 500 },
  confidence: { fontSize: 13, color: '#8b95a5', fontFamily: 'var(--font-mono)', fontWeight: 600 },
  issue: { fontSize: 14, fontWeight: 600, color: '#e8ecf1', marginBottom: 10, lineHeight: 1.4 },
  section: { marginBottom: 10 },
  label: { fontSize: 9, fontWeight: 700, letterSpacing: 1.2, color: '#5a6577', textTransform: 'uppercase', marginBottom: 4 },
  detail: { fontSize: 12, color: '#8b95a5', lineHeight: 1.6 },
  fixWrap: {
    background: 'rgba(16,185,129,0.06)',
    border: '1px solid rgba(16,185,129,0.12)',
    borderRadius: 8,
    padding: 10,
  },
  fixHeader: { marginBottom: 6 },
  fixTag: { fontSize: 9, fontWeight: 800, color: '#10b981', letterSpacing: 1 },
  fixCode: {
    fontSize: 11, color: '#10b981', fontFamily: 'var(--font-mono)', lineHeight: 1.6,
    wordBreak: 'break-word', display: 'block',
  },
  clean: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: 40, textAlign: 'center',
  },
}
