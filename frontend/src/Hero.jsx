import React from 'react'

const SHIELD_SVG = `
<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="shieldGrad" x1="0" y1="0" x2="64" y2="64">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
  </defs>
  <path d="M32 4L8 16v16c0 14.4 10.24 27.84 24 32 13.76-4.16 24-17.6 24-32V16L32 4z" fill="url(#shieldGrad)" opacity="0.15" stroke="url(#shieldGrad)" stroke-width="2"/>
  <text x="32" y="40" text-anchor="middle" font-size="24" fill="url(#shieldGrad)">👻</text>
</svg>`

export default function Hero({ onScrollToReview }) {
  return (
    <section style={styles.hero}>
      <div style={styles.glow} />
      <div style={styles.content} className="fade-in">
        <div
          style={styles.shield}
          dangerouslySetInnerHTML={{ __html: SHIELD_SVG }}
        />
        <h1 style={styles.title}>MergeGuard</h1>
        <p style={styles.tagline}>
          GitHub Copilot writes the code.<br />
          <span style={styles.highlight}>MergeGuard tears it apart before it ships.</span>
        </p>
        <p style={styles.sub}>
          Adversarial AI stress-testing for AI-generated code. No signup required.
        </p>

        <button className="btn-primary" style={styles.cta} onClick={onScrollToReview}>
          Try it now
        </button>

        <div style={styles.pills}>
          {['Ghost Reviewer', 'DriftOracle', 'Track Record'].map(label => (
            <span key={label} style={styles.pill}>{label}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

const styles = {
  hero: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    padding: '40px 20px',
  },
  glow: {
    position: 'absolute',
    top: '-30%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 600,
    height: 600,
    background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  content: {
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
    maxWidth: 640,
  },
  shield: {
    width: 80,
    height: 80,
    margin: '0 auto 24px',
  },
  title: {
    fontSize: 48,
    fontWeight: 800,
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-1px',
    marginBottom: 16,
  },
  tagline: {
    fontSize: 20,
    color: '#94a3b8',
    lineHeight: 1.6,
    marginBottom: 8,
  },
  highlight: {
    color: '#f1f5f9',
    fontWeight: 600,
  },
  sub: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 32,
  },
  cta: {
    fontSize: 16,
    padding: '14px 40px',
    marginBottom: 32,
  },
  pills: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  pill: {
    padding: '6px 16px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    color: '#94a3b8',
    border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.03)',
  },
}
