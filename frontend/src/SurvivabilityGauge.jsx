import React from 'react'

export default function SurvivabilityGauge({ score, verdict }) {
  const r = 48
  const c = 2 * Math.PI * r
  const offset = c - (score / 100) * c
  const color = score >= 75 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444'
  const glow = score >= 75 ? 'rgba(16,185,129,0.3)' : score >= 40 ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0 }}>
      <svg width="130" height="130" viewBox="0 0 130 130">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="7" />
        <circle
          cx="65" cy="65" r={r} fill="none"
          stroke={color} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
          transform="rotate(-90 65 65)"
          filter="url(#glow)"
          style={{ transition: 'stroke-dashoffset 1.2s ease-out', animation: 'gaugeStroke 1.2s ease-out' }}
        />
        <text x="65" y="60" textAnchor="middle" fill={color} fontSize="30" fontWeight="800" fontFamily="var(--font-mono)">
          {score}
        </text>
        <text x="65" y="78" textAnchor="middle" fill="#5a6577" fontSize="9" fontWeight="700" letterSpacing="1.5">
          SURVIVABILITY
        </text>
      </svg>
    </div>
  )
}
