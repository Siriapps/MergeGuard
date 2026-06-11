import React from 'react'

export default function DriftPanel({ prediction }) {
  if (!prediction) return null
  const { estimated_hours_to_incident, failure_mode, drift_pattern, early_signals, incident_probability } = prediction

  return (
    <div style={s.card}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <span style={s.oracleTag}>DRIFTORACLE</span>
          <span style={s.subtitle}>Failure Prediction Engine</span>
        </div>
        <div style={s.eta}>
          <span style={s.etaNum}>~{estimated_hours_to_incident}h</span>
          <span style={s.etaLabel}>to incident</span>
        </div>
      </div>

      <div style={s.body}>
        {/* Left: Failure info */}
        <div style={s.infoCol}>
          <div style={s.infoBlock}>
            <div style={s.label}>FAILURE MODE</div>
            <div style={s.infoText}>{failure_mode}</div>
          </div>
          <div style={s.infoBlock}>
            <div style={s.label}>DRIFT PATTERN</div>
            <div style={s.infoText}>{drift_pattern}</div>
          </div>
          {early_signals && early_signals.length > 0 && (
            <div style={s.infoBlock}>
              <div style={s.label}>EARLY WARNING SIGNALS</div>
              {early_signals.map((sig, i) => (
                <div key={i} style={s.signal}>
                  <span style={s.signalDot} />{sig}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Probability bars */}
        <div style={s.probCol}>
          <div style={s.label}>INCIDENT PROBABILITY</div>
          {incident_probability && Object.entries(incident_probability).map(([period, pct]) => (
            <div key={period} style={s.probRow}>
              <span style={s.probLabel}>T+{period}</span>
              <div style={s.probTrack}>
                <div style={{
                  ...s.probFill,
                  width: `${pct}%`,
                  background: pct >= 80 ? '#ef4444' : pct >= 50 ? '#f59e0b' : '#3b82f6',
                  boxShadow: pct >= 80 ? '0 0 8px rgba(239,68,68,0.4)' : 'none',
                }} />
              </div>
              <span style={s.probPct}>{pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const s = {
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    animation: 'fadeIn 0.4s ease',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: '1px solid var(--border-subtle)',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 10 },
  oracleTag: {
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: 1.5,
    color: '#a855f7',
    background: 'rgba(168,85,247,0.1)',
    padding: '3px 8px',
    borderRadius: 4,
  },
  subtitle: { fontSize: 12, color: '#5a6577' },
  eta: { textAlign: 'right' },
  etaNum: { fontSize: 24, fontWeight: 800, color: '#ef4444', fontFamily: 'var(--font-mono)', display: 'block', lineHeight: 1 },
  etaLabel: { fontSize: 10, color: '#5a6577', letterSpacing: 0.5 },
  body: { display: 'flex', gap: 24 },
  infoCol: { flex: 1 },
  infoBlock: { marginBottom: 14 },
  label: { fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: '#5a6577', marginBottom: 6, textTransform: 'uppercase' },
  infoText: { fontSize: 13, color: '#e8ecf1', lineHeight: 1.5 },
  signal: { display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: '#8b95a5', lineHeight: 1.5, marginTop: 4 },
  signalDot: { width: 5, height: 5, borderRadius: '50%', background: '#f59e0b', marginTop: 6, flexShrink: 0 },
  probCol: { width: 220, flexShrink: 0 },
  probRow: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 },
  probLabel: { width: 40, fontSize: 11, color: '#8b95a5', fontFamily: 'var(--font-mono)', flexShrink: 0 },
  probTrack: { flex: 1, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' },
  probFill: { height: '100%', borderRadius: 4, transition: 'width 1s ease-out' },
  probPct: { width: 36, fontSize: 11, color: '#8b95a5', fontFamily: 'var(--font-mono)', textAlign: 'right', fontWeight: 600 },
}
