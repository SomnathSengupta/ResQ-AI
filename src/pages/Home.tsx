import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

const HOME_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500;600;700&display=swap');

  :root {
    --dw-bg:          #080b10;
    --dw-surface:     #0e1219;
    --dw-surface2:    #141922;
    --dw-border:      #1c2433;
    --dw-border-lit:  #243040;
    --dw-text:        #dce8f5;
    --dw-muted:       #4a5d74;
    --dw-muted2:      #6b7f96;
    --dw-accent:      #ff3d2e;
    --dw-accent-glow: rgba(255,61,46,0.2);
    --dw-accent-dim:  rgba(255,61,46,0.1);
    --dw-green:       #00e5a0;
    --dw-yellow:      #ffc940;
    --dw-blue:        #4facf7;
    --mono:           'IBM Plex Mono', monospace;
    --display:        'Barlow Condensed', sans-serif;
    --body-font:      'Barlow', sans-serif;
  }

  html, body, #root {
    margin: 0;
    padding: 0;
    min-height: 100%;
    background: var(--dw-bg);
  }

  * { box-sizing: border-box; }

  .hp-shell {
    min-height: 100vh;
    background:
      radial-gradient(circle at top right, rgba(79,172,247,0.08), transparent 35%),
      radial-gradient(circle at bottom left, rgba(255,61,46,0.06), transparent 35%),
      var(--dw-bg);
    color: var(--dw-text);
    font-family: var(--body-font);
  }

  .hp-header {
    height: 64px;
    border-bottom: 1px solid var(--dw-border);
    background: rgba(14, 18, 25, 0.92);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 22px;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .hp-logo {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .hp-logo-mark {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    background: var(--dw-accent);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    box-shadow: 0 0 18px var(--dw-accent-glow);
  }

  .hp-logo-text {
    font-family: var(--display);
    font-size: 1.2rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .hp-logo-sub {
    font-family: var(--mono);
    font-size: 0.58rem;
    color: var(--dw-muted);
    text-transform: uppercase;
    letter-spacing: 0.12em;
    margin-top: 2px;
  }

  .hp-header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .hp-btn {
    border: 1px solid var(--dw-border-lit);
    background: var(--dw-surface2);
    color: var(--dw-text);
    padding: 10px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-family: var(--mono);
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    transition: all 0.2s ease;
  }

  .hp-btn:hover {
    border-color: var(--dw-blue);
    color: var(--dw-blue);
  }

  .hp-btn.primary {
    background: linear-gradient(135deg, rgba(255,61,46,0.15), rgba(255,61,46,0.08));
    border-color: rgba(255,61,46,0.35);
    color: #fff;
  }

  .hp-btn.primary:hover {
    border-color: var(--dw-accent);
    box-shadow: 0 0 20px rgba(255,61,46,0.12);
    color: #fff;
  }

  .hp-container {
    max-width: 1320px;
    margin: 0 auto;
    padding: 28px 20px 60px;
  }

  .hp-hero {
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 22px;
    align-items: stretch;
    margin-top: 18px;
    margin-bottom: 28px;
  }

  .hp-card {
    background: var(--dw-surface2);
    border: 1px solid var(--dw-border);
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 10px 24px rgba(0,0,0,0.22);
  }

  .hp-hero-left {
    padding: 28px;
    position: relative;
    overflow: hidden;
  }

  .hp-hero-left::before {
    content: "";
    position: absolute;
    top: -60px;
    right: -60px;
    width: 220px;
    height: 220px;
    background: radial-gradient(circle, rgba(255,61,46,0.14), transparent 70%);
    pointer-events: none;
  }

  .hp-kicker {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(255,61,46,0.08);
    border: 1px solid rgba(255,61,46,0.18);
    font-family: var(--mono);
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--dw-accent);
    margin-bottom: 18px;
  }

  .hp-title {
    margin: 0;
    font-family: var(--display);
    font-size: clamp(2.5rem, 6vw, 5rem);
    line-height: 0.95;
    font-weight: 800;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  .hp-title span {
    color: var(--dw-accent);
    text-shadow: 0 0 18px rgba(255,61,46,0.18);
  }

  .hp-subtitle {
    margin-top: 16px;
    color: var(--dw-muted2);
    font-size: 1rem;
    line-height: 1.8;
    max-width: 720px;
  }

  .hp-cta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 22px;
  }

  .hp-mini-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-top: 24px;
  }

  .hp-stat {
    background: rgba(8, 11, 16, 0.45);
    border: 1px solid var(--dw-border);
    border-radius: 12px;
    padding: 14px;
  }

  .hp-stat-value {
    font-family: var(--display);
    font-size: 1.6rem;
    font-weight: 800;
    letter-spacing: 0.03em;
  }

  .hp-stat-label {
    margin-top: 6px;
    color: var(--dw-muted2);
    font-family: var(--mono);
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .hp-hero-right {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .hp-panel-title {
    margin: 0 0 14px 0;
    font-family: var(--display);
    font-size: 1.15rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .hp-user-list {
    display: grid;
    gap: 12px;
  }

  .hp-user-item {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(8, 11, 16, 0.45);
    border: 1px solid var(--dw-border);
    border-radius: 12px;
    padding: 14px;
  }

  .hp-user-icon {
    width: 42px;
    height: 42px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    background: rgba(79,172,247,0.08);
    border: 1px solid rgba(79,172,247,0.18);
  }

  .hp-user-title {
    font-weight: 600;
    font-size: 0.95rem;
  }

  .hp-user-sub {
    color: var(--dw-muted2);
    font-size: 0.82rem;
    margin-top: 4px;
    line-height: 1.5;
  }

  .hp-section {
    margin-top: 28px;
  }

  .hp-section-head {
    margin-bottom: 16px;
  }

  .hp-section-kicker {
    font-family: var(--mono);
    font-size: 0.66rem;
    color: var(--dw-muted2);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 6px;
  }

  .hp-section-title {
    margin: 0;
    font-family: var(--display);
    font-size: clamp(1.7rem, 3vw, 2.5rem);
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .hp-section-desc {
    color: var(--dw-muted2);
    line-height: 1.7;
    margin-top: 8px;
    max-width: 900px;
  }

  .hp-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
  }

  .hp-feature-card {
    background: var(--dw-surface2);
    border: 1px solid var(--dw-border);
    border-radius: 14px;
    padding: 18px;
    transition: all 0.25s ease;
  }

  .hp-feature-card:hover {
    transform: translateY(-4px);
    border-color: var(--dw-border-lit);
    box-shadow: 0 12px 24px rgba(0,0,0,0.18);
  }

  .hp-feature-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.15rem;
    margin-bottom: 14px;
    background: rgba(255,61,46,0.08);
    border: 1px solid rgba(255,61,46,0.16);
  }

  .hp-feature-title {
    margin: 0;
    font-weight: 700;
    font-size: 1rem;
  }

  .hp-feature-text {
    margin-top: 8px;
    color: var(--dw-muted2);
    line-height: 1.7;
    font-size: 0.9rem;
  }

  .hp-workflow {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
  }

  .hp-step {
    position: relative;
    background: var(--dw-surface2);
    border: 1px solid var(--dw-border);
    border-radius: 14px;
    padding: 18px;
    min-height: 220px;
  }

  .hp-step-no {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: rgba(79,172,247,0.08);
    border: 1px solid rgba(79,172,247,0.18);
    color: var(--dw-blue);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--mono);
    font-size: 0.8rem;
    font-weight: 600;
    margin-bottom: 14px;
  }

  .hp-step-title {
    margin: 0;
    font-weight: 700;
    font-size: 1rem;
  }

  .hp-step-text {
    margin-top: 8px;
    color: var(--dw-muted2);
    line-height: 1.7;
    font-size: 0.9rem;
  }

  .hp-highlight {
    margin-top: 28px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .hp-highlight-card {
    background: linear-gradient(135deg, rgba(20,25,34,1), rgba(14,18,25,1));
    border: 1px solid var(--dw-border);
    border-radius: 16px;
    padding: 20px;
  }

  .hp-highlight-title {
    margin: 0 0 12px 0;
    font-family: var(--display);
    font-size: 1.1rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .hp-bullets {
    margin: 0;
    padding-left: 18px;
    color: var(--dw-muted2);
    line-height: 1.8;
  }

  .hp-footer {
    margin-top: 36px;
    border-top: 1px solid var(--dw-border);
    padding: 20px 0 8px;
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
  }

  .hp-footer-left {
    color: var(--dw-muted2);
    font-size: 0.88rem;
  }

  .hp-footer-right {
    color: var(--dw-muted);
    font-family: var(--mono);
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  @media (max-width: 1100px) {
    .hp-hero,
    .hp-highlight {
      grid-template-columns: 1fr;
    }

    .hp-grid,
    .hp-workflow {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 700px) {
    .hp-header {
      height: auto;
      padding: 14px 16px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .hp-container {
      padding: 20px 14px 50px;
    }

    .hp-hero-left {
      padding: 20px;
    }

    .hp-mini-stats,
    .hp-grid,
    .hp-workflow {
      grid-template-columns: 1fr;
    }

    .hp-footer {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`;

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const id = "hp-global-css";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = HOME_CSS;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div className="hp-shell">
      {/* Header */}
      <header className="hp-header">
        <div className="hp-logo">
          <div className="hp-logo-mark">🚨</div>
          <div>
            <div className="hp-logo-text">ResQAI</div>
            <div className="hp-logo-sub">AI Disaster Response Dashboard</div>
          </div>
        </div>

        <div className="hp-header-actions">
          <button className="hp-btn primary" onClick={() => navigate("/login")}>
            Login
          </button>
        </div>
      </header>

      <div className="hp-container">
        {/* Hero */}
        <section className="hp-hero">
          <div className="hp-card hp-hero-left">
            <div className="hp-kicker">⚡ Real-Time Crisis Intelligence</div>

            <h1 className="hp-title">
              From <span>Chaos</span> to
              <br />
              Coordinated Response
            </h1>

            <p className="hp-subtitle">
              ResQAI is an AI-powered disaster intelligence platform that collects
              reports from News APIs and Reddit, analyzes them using LLMs, and
              converts unstructured information into actionable emergency insights
              for officers, NGOs, and response teams.
            </p>

            <div className="hp-cta-row">
              <button className="hp-btn primary" onClick={() => navigate("/login")}>
                Access Control Room
              </button>
            </div>

            <div className="hp-mini-stats">
              <div className="hp-stat">
                <div className="hp-stat-value">News + Reddit</div>
                <div className="hp-stat-label">Live Input Sources</div>
              </div>

              <div className="hp-stat">
                <div className="hp-stat-value">LLM Powered</div>
                <div className="hp-stat-label">AI Analysis Engine</div>
              </div>

              <div className="hp-stat">
                <div className="hp-stat-value">Fast Triage</div>
                <div className="hp-stat-label">Prioritized Response</div>
              </div>
            </div>
          </div>

          <div className="hp-hero-right">
            <div className="hp-card">
              <h3 className="hp-panel-title">👥 Primary Users</h3>

              <div className="hp-user-list">
                <div className="hp-user-item">
                  <div className="hp-user-icon">🏛</div>
                  <div>
                    <div className="hp-user-title">Disaster Management Officers</div>
                    <div className="hp-user-sub">
                      Monitor alerts, prioritize incidents, and coordinate official response actions.
                    </div>
                  </div>
                </div>

                <div className="hp-user-item">
                  <div className="hp-user-icon">🤝</div>
                  <div>
                    <div className="hp-user-title">NGO Workers</div>
                    <div className="hp-user-sub">
                      Identify urgent support requests like shelter, relief, and medical assistance.
                    </div>
                  </div>
                </div>

                <div className="hp-user-item">
                  <div className="hp-user-icon">🚑</div>
                  <div>
                    <div className="hp-user-title">Emergency Response Teams</div>
                    <div className="hp-user-sub">
                      Receive actionable intelligence for rescue, evacuation, and field operations.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="hp-card">
              <h3 className="hp-panel-title">🎯 Core Objective</h3>
              <p style={{ margin: 0, color: "var(--dw-muted2)", lineHeight: 1.8 }}>
                Detect critical disaster-related reports, classify them by response category,
                assign urgency and credibility scores, and present a structured dashboard
                that supports faster decision-making during emergencies.
              </p>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="hp-section">
          <div className="hp-section-head">
            <div className="hp-section-kicker">Platform Capabilities</div>
            <h2 className="hp-section-title">What ResQAI Does</h2>
            <p className="hp-section-desc">
              The platform aggregates incoming reports, analyzes them using an existing LLM,
              and helps teams focus on what matters most during high-pressure situations.
            </p>
          </div>

          <div className="hp-grid">
            <div className="hp-feature-card">
              <div className="hp-feature-icon">📰</div>
              <h3 className="hp-feature-title">Collects Multi-Source Reports</h3>
              <p className="hp-feature-text">
                Fetches disaster-related content from News APIs and Reddit for centralized monitoring.
              </p>
            </div>

            <div className="hp-feature-card">
              <div className="hp-feature-icon">🤖</div>
              <h3 className="hp-feature-title">LLM-Based AI Analysis</h3>
              <p className="hp-feature-text">
                Classifies reports into response categories like Rescue, Medical, Shelter, and more.
              </p>
            </div>

            <div className="hp-feature-card">
              <div className="hp-feature-icon">📍</div>
              <h3 className="hp-feature-title">Location & Prioritization</h3>
              <p className="hp-feature-text">
                Extracts location context and scores urgency to surface the most critical incidents first.
              </p>
            </div>

            <div className="hp-feature-card">
              <div className="hp-feature-icon">⚠</div>
              <h3 className="hp-feature-title">Credibility Awareness</h3>
              <p className="hp-feature-text">
                Flags low-confidence or potentially misleading reports to reduce operational noise.
              </p>
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section className="hp-section">
          <div className="hp-section-head">
            <div className="hp-section-kicker">Operational Flow</div>
            <h2 className="hp-section-title">How the Workflow Operates</h2>
            <p className="hp-section-desc">
              A clean, realistic process that aligns with your final-year project workflow and dashboard.
            </p>
          </div>

          <div className="hp-workflow">
            <div className="hp-step">
              <div className="hp-step-no">01</div>
              <h3 className="hp-step-title">Secure Login</h3>
              <p className="hp-step-text">
                Officers, NGO staff, and emergency teams log in to access the disaster control system.
              </p>
            </div>

            <div className="hp-step">
              <div className="hp-step-no">02</div>
              <h3 className="hp-step-title">Fetch Latest Data</h3>
              <p className="hp-step-text">
                The system gathers fresh reports from News APIs and Reddit based on disaster-related signals.
              </p>
            </div>

            <div className="hp-step">
              <div className="hp-step-no">03</div>
              <h3 className="hp-step-title">AI Triage & Categorization</h3>
              <p className="hp-step-text">
                An LLM analyzes each report for response category, urgency level, credibility, and summary.
              </p>
            </div>

            <div className="hp-step">
              <div className="hp-step-no">04</div>
              <h3 className="hp-step-title">Actionable Dashboard View</h3>
              <p className="hp-step-text">
                Structured alerts appear on the dashboard, where users can filter and open detailed views.
              </p>
            </div>
          </div>
        </section>

        {/* Highlights */}
        <section className="hp-highlight">
          <div className="hp-highlight-card">
            <h3 className="hp-highlight-title">📊 Dashboard Outputs</h3>
            <ul className="hp-bullets">
              <li>Summary cards for Rescue, Medical, Shelter, and Low Credibility reports</li>
              <li>Filterable action table for faster triage</li>
              <li>Detailed incident view with original source + AI summary</li>
              <li>Ready for future map/heatmap integration</li>
            </ul>
          </div>

          <div className="hp-highlight-card">
            <h3 className="hp-highlight-title">🧠 AI-Driven Decisions</h3>
            <ul className="hp-bullets">
              <li>Transforms scattered data into structured operational intelligence</li>
              <li>Reduces information overload during emergency scenarios</li>
              <li>Helps responders prioritize high-urgency cases first</li>
              <li>Supports smarter and faster real-world disaster response</li>
            </ul>
          </div>
        </section>
      </div>
      <div>
        {/* Footer */}
        <Footer/>
      </div>
    </div>
  );
};

export default HomePage;