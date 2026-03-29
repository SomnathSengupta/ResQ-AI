import React, { useEffect } from "react";

const FOOTER_CSS = `
  .rq-footer {
    width: 100%;
    background:
      radial-gradient(circle at top right, rgba(79,172,247,0.06), transparent 28%),
      radial-gradient(circle at bottom left, rgba(255,61,46,0.06), transparent 30%),
      linear-gradient(180deg, #0e1219 0%, #0a0e14 100%);
    border-top: 1px solid #1c2433;
    color: #dce8f5;
    margin-top: 0;
  }

  .rq-footer-inner {
    max-width: 1320px;
    margin: 0 auto;
    padding: 42px 20px 28px;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 28px;
  }

  .rq-footer-brand {
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 2rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #ff3d2e;
    margin: 0;
    text-shadow: 0 0 16px rgba(255,61,46,0.12);
  }

  .rq-footer-brand-sub {
    margin-top: 10px;
    color: #6b7f96;
    font-size: 0.92rem;
    line-height: 1.8;
    max-width: 320px;
  }

  .rq-footer-heading {
    margin: 0 0 14px 0;
    font-family: 'Barlow Condensed', sans-serif;
    font-size: 1.1rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #dce8f5;
  }

  .rq-footer-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .rq-footer-list li {
    margin-bottom: 10px;
    color: #6b7f96;
    font-size: 0.9rem;
    line-height: 1.6;
    transition: color 0.2s ease;
    cursor: pointer;
  }

  .rq-footer-list li:hover {
    color: #4facf7;
  }

  .rq-footer-static li {
    cursor: default;
  }

  .rq-footer-static li:hover {
    color: #6b7f96;
  }

  .rq-footer-icons {
    display: flex;
    gap: 10px;
    margin-top: 14px;
  }

  .rq-footer-icon {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(20, 25, 34, 0.95);
    border: 1px solid #1c2433;
    color: #dce8f5;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.22s ease;
  }

  .rq-footer-icon:hover {
    border-color: #4facf7;
    color: #4facf7;
    transform: translateY(-2px);
    box-shadow: 0 8px 18px rgba(0,0,0,0.22);
  }

  .rq-footer-bottom {
    border-top: 1px solid #1c2433;
    padding: 16px 20px;
  }

  .rq-footer-bottom-inner {
    max-width: 1320px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .rq-footer-copy {
    color: #6b7f96;
    font-size: 0.86rem;
  }

  .rq-footer-tagline {
    color: #4a5d74;
    font-family: 'IBM Plex Mono', monospace;
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  @media (max-width: 1000px) {
    .rq-footer-inner {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 640px) {
    .rq-footer-inner {
      grid-template-columns: 1fr;
      padding: 32px 16px 22px;
      gap: 22px;
    }

    .rq-footer-bottom {
      padding: 14px 16px;
    }

    .rq-footer-bottom-inner {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`;

const Footer = () => {
  useEffect(() => {
    const id = "rq-footer-global-css";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = FOOTER_CSS;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <footer className="rq-footer">
      {/* Main Footer */}
      <div className="rq-footer-inner">
        {/* Project Info */}
        <div>
          <h1 className="rq-footer-brand">ResQAI</h1>
          <p className="rq-footer-brand-sub">
            AI-powered disaster information aggregation and response system.
            Helping save lives through real-time intelligence.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h2 className="rq-footer-heading">Quick Links</h2>
          <ul className="rq-footer-list">
            <li>Home</li>
            <li>Features</li>
            <li>Workflow</li>
            <li>Contact</li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h2 className="rq-footer-heading">Resources</h2>
          <ul className="rq-footer-list">
            <li>Documentation</li>
            <li>API</li>
            <li>Support</li>
            <li>Privacy Policy</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h2 className="rq-footer-heading">Contact</h2>
          <ul className="rq-footer-list rq-footer-static">
            <li>Email: support@resqai.com</li>
            <li>Location: India</li>
          </ul>

          <div className="rq-footer-icons">
            <span className="rq-footer-icon">🌐</span>
            <span className="rq-footer-icon">🐦</span>
            <span className="rq-footer-icon">💼</span>
            <span className="rq-footer-icon">📷</span>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="rq-footer-bottom">
        <div className="rq-footer-bottom-inner">
          <div className="rq-footer-copy">© 2026 ResQAI. All rights reserved.</div>
          <div className="rq-footer-tagline">AI Disaster Response Dashboard</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;