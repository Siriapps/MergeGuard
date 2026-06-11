import React from 'react'

export default function Landing({ onLaunch }) {
  return (
    <div className="landing-page">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="nav-brand">MergeGuard</div>
        <div className="nav-links">
          <a href="#" className="nav-link active">Protocol</a>
          <a href="#" className="nav-link">Oracle</a>
          <a href="#" className="nav-link">Autopsy</a>
          <a href="#" className="nav-link">Docs</a>
        </div>
        <div className="nav-actions">
          <a href="#" className="nav-link">Login</a>
          <button className="deploy-btn" onClick={onLaunch}>Deploy Ghost Reviewer</button>
        </div>
      </nav>

      <main className="landing-main">
        {/* Hero */}
        <section className="hero">
          <div className="hero-bg">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAo_NuBeCYdtdBJtfG7gLPzFlXJ9Z_qqsIVU9Ic7BQSXsm3pPrlvFIWgzwlGlRXHXG0uqGK1xo5SNOKdnvRhNnreZz_d_H5AIBSU999N1pisPmzDsilfDwF1cQ0TI__DyPWe7hDpIfVVloQVCewWH88fepNHjQGBPRmtvp8D6fq_kNhA15fGPWjQ5GTL6OvzEQJI63ivyJElm3MnPg_N6TbRGUauHw40XdYsftqi4nmlJgJ4SqTSdDulJCG-RBtKWf_haWTXq-p-24" alt="" />
            <div className="hero-overlay" />
          </div>
          <div className="hero-content">
            <div className="status-badge">
              <span className="status-dot" />
              <span className="status-text">SYSTEM OPERATIONAL</span>
            </div>
            <h1 className="hero-title">
              AI Code is structurally fine.<br />
              <span className="hero-accent">It just won't survive production.</span>
            </h1>
            <p className="hero-desc">
              MergeGuard is the first survivability stress-tester for AI-generated code. Ghost Reviewer hunts failure modes; DriftOracle predicts the incident timeline.
            </p>
            <div className="hero-actions">
              <button className="cta-primary" onClick={onLaunch}>Launch Command Center</button>
              <button className="cta-secondary">View Documentation</button>
            </div>
          </div>
        </section>

        {/* Paradigm Gap */}
        <section className="section gap-section">
          <div className="gap-grid">
            <div className="gap-text">
              <h2 className="section-title">The Paradigm Gap</h2>
              <p className="section-desc">
                Human and AI reviewers check for immediate syntactic correctness. They assume a static environment. MergeGuard operates on the premise that production is hostile and dynamic. We don't check if the code works now; we stress-test if it will survive tomorrow's edge cases, data drift, and adversarial inputs.
              </p>
            </div>
            <div className="gap-cards">
              <div className="gap-card">
                <span className="gap-icon">✓✓</span>
                <h3 className="gap-card-title">Standard Review</h3>
                <p className="gap-card-desc">Checks logic & syntax.</p>
              </div>
              <div className="gap-card highlight">
                <div className="gap-card-glow" />
                <span className="gap-icon highlight">◈</span>
                <h3 className="gap-card-title highlight">MergeGuard</h3>
                <p className="gap-card-desc">Checks survivability under stress.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento */}
        <section className="section">
          <div className="bento-grid">
            {/* Ghost Reviewer */}
            <div className="bento-card wide">
              <div className="bento-top">
                <div className="bento-icon-wrap"><span className="bento-icon purple">🔍</span></div>
                <span className="module-tag">MODULE_01</span>
              </div>
              <h3 className="bento-title">Ghost Reviewer</h3>
              <p className="bento-desc">
                Adversarial audits targeting complex vulnerabilities. Ghost Reviewer autonomously simulates race conditions, attempts SQL injections, and uncovers silent architectural assumptions before they reach production.
              </p>
              <div className="bento-footer">
                <div className="progress-bar"><div className="progress-fill purple" style={{ width: '85%' }} /></div>
                <span className="progress-label purple">85% Threat Coverage</span>
              </div>
            </div>

            {/* DriftOracle */}
            <div className="bento-card">
              <div className="bento-top">
                <div className="bento-icon-wrap"><span className="bento-icon green">⏱</span></div>
                <span className="module-tag">MODULE_02</span>
              </div>
              <h3 className="bento-title">DriftOracle</h3>
              <p className="bento-desc">
                Time-to-failure predictions based on known infrastructure drift patterns.
              </p>
              <div className="bento-footer">
                <div className="progress-bar">
                  <div className="progress-fill green pulse" style={{ width: '100%', opacity: 0.3 }} />
                  <div className="progress-fill green" style={{ width: '40%', position: 'absolute', top: 0, left: 0 }} />
                </div>
                <span className="progress-label green">T-Minus 42h to probable drift</span>
              </div>
            </div>

            {/* Agent Autopsy */}
            <div className="bento-card full">
              <div className="bento-row">
                <div className="bento-left">
                  <div className="bento-top">
                    <div className="bento-icon-wrap"><span className="bento-icon red">📊</span></div>
                    <span className="module-tag">MODULE_03</span>
                  </div>
                  <h3 className="bento-title">Agent Autopsy</h3>
                  <p className="bento-desc">
                    A closed-loop system that ingests post-mortem data. It learns from real production incidents, dynamically recalibrating the Ghost Reviewer's heuristic models to improve future detection accuracy.
                  </p>
                </div>
                <div className="autopsy-table">
                  <div className="table-header">
                    <span>INCIDENT_ID</span><span>RESOLUTION_STATUS</span>
                  </div>
                  <div className="table-row">
                    <span>#ERR-8492</span><span className="green">ASSIMILATED</span>
                  </div>
                  <div className="table-row">
                    <span>#ERR-8493</span><span className="purple pulse-text">LEARNING...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feedback Loop */}
        <section className="section">
          <h2 className="section-title">The Feedback Loop Protocol</h2>
          <div className="feedback-img-wrap">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDeLpsWVwipNprjqCWMUnjblT4tSNJpbxzkN7vekzCn-0yLhD3tg93DOxWa6Dnu4igCcJjxg5BxZeQVhx-TJe8wsfWCgKcMH-s9xaJLnJMG362SHpZYAOvN2pHBSu5wU5fKDZWBgWLtr_0luwKQgOuMFBBaOjc46-dJOGfbP8lRfNfai11gR11N6D4GgjzTb67JtUqRBDznEAvmK3r3l3Aw8R6SWZomhab2p39eM2UA6WLTZJ3F6mZywTiM_Sb0xXYDdbh7LmgEtfE" alt="Feedback Loop Architecture" />
          </div>
        </section>

        {/* Stats */}
        <section className="section stats-section">
          <div className="stats-grid">
            <div className="stat-card purple-border">
              <span className="stat-num purple">94%</span>
              <span className="stat-label">AGENT ACCURACY RATING</span>
              <p className="stat-desc">Continuous recalibration ensures detection models remain ahead of novel failure modes.</p>
            </div>
            <div className="stat-card green-border">
              <span className="stat-num green">03</span>
              <span className="stat-label">INCIDENTS PREDICTED THIS WEEK</span>
              <p className="stat-desc">Critical production failures averted through proactive drift analysis and stress testing.</p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="section cta-section">
          <button className="cta-final" onClick={onLaunch}>
            <span>DEPLOY GHOST REVIEWER</span>
            <div className="cta-inner-border" />
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-brand">MergeGuard</div>
        <div className="footer-links">
          <a href="#">Documentation</a>
          <a href="#">Changelog</a>
          <a href="#">Security</a>
          <a href="#">Status</a>
        </div>
        <div className="footer-copy">© 2026 MergeGuard Protocol. All systems nominal.</div>
      </footer>

      <style>{`
        .landing-page {
          background: #131315; color: #e5e1e4; font-family: 'Inter', sans-serif; min-height: 100vh;
          -webkit-font-smoothing: antialiased;
        }

        /* NAV */
        .landing-nav {
          position: fixed; top: 0; width: 100%; background: rgba(19,19,21,0.8); backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(73,68,86,0.3); display: flex; justify-content: space-between;
          align-items: center; padding: 4px 24px; z-index: 50; max-width: 100%;
        }
        .nav-brand { font-family: 'Geist', sans-serif; font-size: 18px; font-weight: 700; letter-spacing: -0.03em; }
        .nav-links { display: flex; gap: 16px; }
        .nav-link {
          font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; letter-spacing: 0.05em;
          text-transform: uppercase; color: #cbc3d9; text-decoration: none; transition: color 0.2s;
        }
        .nav-link:hover, .nav-link.active { color: #cfbcff; }
        .nav-link.active { border-bottom: 2px solid #cfbcff; padding-bottom: 4px; }
        .nav-actions { display: flex; align-items: center; gap: 12px; }
        .deploy-btn {
          background: #6200ea; color: #cfbcff; padding: 8px 16px; border: none; border-radius: 2px;
          font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; letter-spacing: 0.05em;
          text-transform: uppercase; cursor: pointer; transition: opacity 0.2s;
        }
        .deploy-btn:hover { opacity: 0.8; }

        /* HERO */
        .hero {
          position: relative; min-height: 80vh; display: flex; align-items: center; padding: 0 24px;
          max-width: 1280px; margin: 0 auto; width: 100%; padding-top: 72px;
        }
        .hero-bg {
          position: absolute; inset: 0; z-index: 0; opacity: 0.3; overflow: hidden; border-radius: 12px;
          border: 1px solid #2D2D30; margin-top: 32px;
        }
        .hero-bg img { width: 100%; height: 100%; object-fit: cover; }
        .hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to right, #131315, rgba(19,19,21,0.8), transparent);
        }
        .hero-content {
          position: relative; z-index: 10; max-width: 640px; display: flex; flex-direction: column; gap: 24px; margin-top: 32px;
        }
        .status-badge {
          display: inline-flex; align-items: center; gap: 8px; padding: 4px 8px; border-radius: 2px;
          background: #2a2a2c; border: 1px solid #2D2D30; width: fit-content;
        }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #7dffa2; }
        .status-text {
          font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; letter-spacing: 0.05em;
          color: #7dffa2; text-transform: uppercase;
        }
        .hero-title {
          font-family: 'Geist', sans-serif; font-size: 48px; font-weight: 700; line-height: 1.1;
          letter-spacing: -0.02em; color: #e5e1e4;
        }
        .hero-accent { color: #cfbcff; }
        .hero-desc { font-size: 16px; line-height: 1.5; color: #cbc3d9; max-width: 560px; }
        .hero-actions { display: flex; gap: 16px; margin-top: 8px; }
        .cta-primary {
          background: #cfbcff; color: #3a0092; padding: 12px 24px; border: none; border-radius: 2px;
          font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.05em; cursor: pointer; box-shadow: 0 0 15px rgba(207,188,255,0.15);
          transition: background 0.2s;
        }
        .cta-primary:hover { background: #e9ddff; }
        .cta-secondary {
          padding: 12px 24px; border: 1px solid #958da2; border-radius: 2px; background: transparent;
          color: #e5e1e4; font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 450;
          text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer; transition: background 0.2s;
        }
        .cta-secondary:hover { background: #1f1f21; }

        /* SECTIONS */
        .section { padding: 32px 24px; max-width: 1280px; margin: 0 auto; width: 100%; }
        .section-title { font-family: 'Geist', sans-serif; font-size: 24px; font-weight: 600; line-height: 1.33; margin-bottom: 24px; }
        .section-desc { font-size: 14px; line-height: 1.43; color: #cbc3d9; }

        /* GAP */
        .gap-section { border-top: 1px solid rgba(73,68,86,0.3); }
        .gap-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: center; }
        .gap-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .gap-card {
          background: #1f1f21; padding: 24px; border-radius: 2px; border: 1px solid #2D2D30;
          display: flex; flex-direction: column; gap: 8px;
        }
        .gap-card.highlight {
          background: #1C1C1F; border: 1px solid #cfbcff; box-shadow: 0 0 15px rgba(207,188,255,0.15);
          position: relative; overflow: hidden;
        }
        .gap-card-glow {
          position: absolute; top: 0; right: 0; width: 64px; height: 64px;
          background: rgba(207,188,255,0.1); filter: blur(16px); border-radius: 50%;
        }
        .gap-icon { color: #494456; font-size: 20px; }
        .gap-icon.highlight { color: #cfbcff; }
        .gap-card-title {
          font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 450; color: #e5e1e4;
        }
        .gap-card-title.highlight { color: #cfbcff; font-weight: 700; }
        .gap-card-desc { font-size: 12px; color: #cbc3d9; }

        /* BENTO */
        .bento-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .bento-card {
          background: #1f1f21; padding: 24px; border-radius: 2px; border: 1px solid #2D2D30;
          display: flex; flex-direction: column; gap: 16px; position: relative; overflow: hidden;
          transition: border-color 0.2s;
        }
        .bento-card:hover { border-color: #cfbcff; }
        .bento-card.wide { grid-column: span 2; }
        .bento-card.full { grid-column: span 3; }
        .bento-top { display: flex; justify-content: space-between; align-items: flex-start; }
        .bento-icon-wrap {
          background: #131315; padding: 8px; border-radius: 2px; border: 1px solid rgba(73,68,86,0.5);
          width: fit-content; font-size: 18px;
        }
        .module-tag { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #494456; }
        .bento-title { font-family: 'Geist', sans-serif; font-size: 18px; font-weight: 600; }
        .bento-desc { font-size: 14px; color: #cbc3d9; line-height: 1.43; }
        .bento-footer { margin-top: auto; padding-top: 16px; border-top: 1px solid rgba(73,68,86,0.3); }
        .bento-row { display: flex; gap: 24px; align-items: center; }
        .bento-left { flex: 1; display: flex; flex-direction: column; gap: 16px; }

        .progress-bar {
          width: 100%; height: 4px; background: #353437; border-radius: 2px; overflow: hidden;
          position: relative; margin-bottom: 4px;
        }
        .progress-fill { height: 100%; border-radius: 2px; }
        .progress-fill.purple { background: #cfbcff; }
        .progress-fill.green { background: #7dffa2; }
        .progress-fill.pulse { animation: pulse 2s infinite; }
        .progress-label {
          font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 400;
        }
        .progress-label.purple { color: #cfbcff; }
        .progress-label.green { color: #7dffa2; }

        .autopsy-table {
          flex: 1; background: #131315; border: 1px solid #2D2D30; border-radius: 2px; padding: 16px;
          display: flex; flex-direction: column; gap: 8px; justify-content: center;
        }
        .table-header {
          display: flex; justify-content: space-between; font-family: 'JetBrains Mono', monospace;
          font-size: 11px; color: #cbc3d9; border-bottom: 1px solid rgba(73,68,86,0.3); padding-bottom: 4px;
        }
        .table-row {
          display: flex; justify-content: space-between; font-family: 'JetBrains Mono', monospace;
          font-size: 11px; color: #e5e1e4; padding: 4px 0;
        }
        .green { color: #7dffa2; }
        .purple { color: #cfbcff; }
        .red { color: #ffb4ab; }
        .pulse-text { animation: pulse 2s infinite; }

        /* FEEDBACK IMAGE */
        .feedback-img-wrap {
          border-radius: 12px; overflow: hidden; border: 1px solid #2D2D30; height: 500px;
        }
        .feedback-img-wrap img { width: 100%; height: 100%; object-fit: cover; }

        /* STATS */
        .stats-section { border-top: 1px solid rgba(73,68,86,0.3); }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .stat-card { background: #2a2a2c; padding: 32px; border-radius: 2px; }
        .stat-card.purple-border { border-left: 2px solid #cfbcff; }
        .stat-card.green-border { border-left: 2px solid #7dffa2; }
        .stat-num {
          font-family: 'Geist', sans-serif; font-size: 48px; font-weight: 700; line-height: 1.1;
          letter-spacing: -0.02em; display: block; margin-bottom: 8px;
        }
        .stat-label {
          font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 450;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .stat-desc { font-size: 12px; color: #cbc3d9; margin-top: 16px; }

        /* CTA FINAL */
        .cta-section { display: flex; justify-content: center; }
        .cta-final {
          background: #1f1f21; color: #cfbcff; font-family: 'JetBrains Mono', monospace; font-size: 13px;
          font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 24px 48px;
          border: 2px solid #cfbcff; cursor: pointer; position: relative; overflow: hidden;
          box-shadow: 0 0 15px rgba(207,188,255,0.15); transition: background 0.2s;
        }
        .cta-final:hover { background: rgba(207,188,255,0.1); }
        .cta-inner-border {
          position: absolute; inset: 0; border: 1px solid rgba(207,188,255,0.5); margin: 4px;
        }

        /* FOOTER */
        .landing-footer {
          background: #0e0e10; width: 100%; padding: 32px 24px; border-top: 1px solid rgba(73,68,86,0.2);
          display: flex; justify-content: space-between; align-items: center;
        }
        .footer-brand { font-family: 'Geist', sans-serif; font-size: 24px; font-weight: 600; }
        .footer-links {
          display: flex; gap: 16px; font-family: 'JetBrains Mono', monospace; font-size: 10px;
          font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
        }
        .footer-links a { color: #cbc3d9; text-decoration: none; transition: color 0.2s; }
        .footer-links a:hover { color: #e5e1e4; }
        .footer-copy { font-size: 12px; color: #cbc3d9; }

        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

        @media (max-width: 768px) {
          .gap-grid, .stats-grid { grid-template-columns: 1fr; }
          .bento-grid { grid-template-columns: 1fr; }
          .bento-card.wide, .bento-card.full { grid-column: span 1; }
          .bento-row { flex-direction: column; }
          .hero-title { font-size: 32px; }
          .landing-footer { flex-direction: column; gap: 16px; text-align: center; }
          .nav-links { display: none; }
        }
      `}</style>
    </div>
  )
}
