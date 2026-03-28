import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/* ─── TYPES (same shape as Dashboard state) ─────────────────────────────── */
interface AiAnalysis {
  category: string;
  urgency: number;
  credibility: string;
  summary: string;
}

interface Coordinates {
  lat: number;
  lng: number;
}

interface DisasterLocation {
  city?: string | null;
  state?: string | null;
  country?: string | null;
  coordinates?: Coordinates | null;
}

interface DisasterDocument {
  reddit_id: string;
  source: string;
  source_url: string;
  disaster_type: string;
  original_text: string;
  location?: DisasterLocation | null;
  ai_analysis?: AiAnalysis | null;
  status: string;
  created_at: string;
  fetched_at: string;
  is_saved: boolean;
}

/* ─── GLOBAL CSS (Dashboard style matching) ─────────────────────────────── */
const DETAILS_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500;600&display=swap');

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

  .sd-shell {
    min-height: 100vh;
    background: var(--dw-bg);
    color: var(--dw-text);
    font-family: var(--body-font);
  }

  /* Header */
  .sd-header {
    height: 52px;
    border-bottom: 1px solid var(--dw-border);
    background: var(--dw-surface);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .sd-logo {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .sd-logo-mark {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: var(--dw-accent);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--display);
    font-size: 1.1rem;
    font-weight: 800;
    color: #fff;
    box-shadow: 0 0 16px var(--dw-accent-glow);
  }

  .sd-logo-text {
    font-family: var(--display);
    font-size: 1.1rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--dw-text);
  }

  .sd-logo-sub {
    font-family: var(--mono);
    font-size: 0.58rem;
    color: var(--dw-muted);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-top: 1px;
  }

  .sd-header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .sd-btn {
    background: var(--dw-surface2);
    border: 1px solid var(--dw-border-lit);
    color: var(--dw-muted2);
    padding: 8px 14px;
    border-radius: 6px;
    cursor: pointer;
    font-family: var(--mono);
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    transition: all 0.2s ease;
  }

  .sd-btn:hover {
    border-color: var(--dw-blue);
    color: var(--dw-blue);
  }

  .sd-btn.primary:hover {
    border-color: var(--dw-green);
    color: var(--dw-green);
  }

  .sd-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 20px;
  }

  .sd-topbar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
  }

  .sd-title-block {
    min-width: 0;
  }

  .sd-type {
    font-family: var(--mono);
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--dw-muted2);
    margin-bottom: 6px;
  }

  .sd-title {
    font-family: var(--display);
    font-size: clamp(1.6rem, 3vw, 2.5rem);
    line-height: 1;
    font-weight: 800;
    letter-spacing: 0.02em;
    margin: 0;
  }

  .sd-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 10px;
  }

  .sd-pill {
    padding: 6px 10px;
    border-radius: 6px;
    font-family: var(--mono);
    font-size: 0.66rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border: 1px solid var(--dw-border-lit);
    background: var(--dw-surface2);
    color: var(--dw-text);
  }

  .sd-grid {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: 16px;
    align-items: start;
  }

  .sd-left,
  .sd-right {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .sd-card {
    background: var(--dw-surface2);
    border: 1px solid var(--dw-border);
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 8px 20px rgba(0,0,0,0.25);
  }

  .sd-card-title {
    margin: 0 0 14px 0;
    font-family: var(--display);
    font-size: 1.15rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--dw-text);
  }

  .sd-text {
    color: var(--dw-text);
    font-size: 0.95rem;
    line-height: 1.65;
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .sd-muted {
    color: var(--dw-muted2);
  }

  .sd-link {
    display: inline-block;
    margin-top: 12px;
    color: var(--dw-blue);
    text-decoration: none;
    font-family: var(--mono);
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .sd-link:hover {
    opacity: 0.8;
  }

  .sd-info-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .sd-info-item {
    background: rgba(8, 11, 16, 0.45);
    border: 1px solid var(--dw-border);
    border-radius: 10px;
    padding: 12px;
    min-width: 0;
  }

  .sd-label {
    display: block;
    font-family: var(--mono);
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--dw-muted);
    margin-bottom: 6px;
  }

  .sd-value {
    display: block;
    color: var(--dw-text);
    font-size: 0.9rem;
    font-weight: 500;
    line-height: 1.5;
    word-break: break-word;
  }

  .sd-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 6px;
    font-family: var(--mono);
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border: 1px solid transparent;
  }

  .sd-empty {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  .sd-empty-card {
    width: 100%;
    max-width: 620px;
    background: var(--dw-surface2);
    border: 1px solid var(--dw-border);
    border-radius: 14px;
    padding: 24px;
    text-align: center;
  }

  .sd-empty-card h2 {
    margin-top: 0;
    font-family: var(--display);
    font-size: 1.6rem;
    letter-spacing: 0.04em;
  }

  .sd-empty-card p {
    color: var(--dw-muted2);
    line-height: 1.7;
    margin-bottom: 18px;
  }

  @media (max-width: 900px) {
    .sd-grid {
      grid-template-columns: 1fr;
    }

    .sd-info-grid {
      grid-template-columns: 1fr;
    }
  }
`;

/* ─── HELPERS ────────────────────────────────────────────────────────────── */
const DISASTER_ICONS: Record<string, string> = {
  flood: "🌊",
  earthquake: "🌋",
  wildfire: "🔥",
  fire: "🔥",
  hurricane: "🌀",
  tornado: "🌪",
  cyclone: "🌀",
  tsunami: "🌊",
  landslide: "⛰",
  drought: "☀",
  volcano: "🌋",
  storm: "⛈",
  blizzard: "❄",
  snow: "❄",
  heat: "🌡",
  rescue: "🚨",
  medical: "🏥",
  default: "⚠",
};

function getDisasterIcon(type: string): string {
  const s = (type || "").toLowerCase();
  for (const key of Object.keys(DISASTER_ICONS)) {
    if (s.includes(key)) return DISASTER_ICONS[key];
  }
  return DISASTER_ICONS.default;
}

const U_COLOR: Record<number, string> = {
  1: "#4facf7",
  2: "#4facf7",
  3: "#ffc940",
  4: "#ff7722",
  5: "#ff3d2e",
};

const CAT_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  Rescue:   { bg: "rgba(79,172,247,0.12)",  color: "var(--dw-blue)",   border: "rgba(79,172,247,0.3)" },
  Relief:   { bg: "rgba(0,229,160,0.1)",    color: "var(--dw-green)",  border: "rgba(0,229,160,0.3)" },
  Damage:   { bg: "rgba(255,201,64,0.1)",   color: "var(--dw-yellow)", border: "rgba(255,201,64,0.3)" },
  Warning:  { bg: "rgba(255,61,46,0.1)",    color: "var(--dw-accent)", border: "rgba(255,61,46,0.3)" },
  Casualty: { bg: "rgba(200,40,40,0.15)",   color: "#ff6666",          border: "rgba(200,40,40,0.3)" },
};

const CRED_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  High:   { bg: "rgba(255,61,46,0.10)", color: "var(--dw-accent)", border: "rgba(255,61,46,0.3)" },
  Medium: { bg: "rgba(255,201,64,0.10)", color: "var(--dw-yellow)", border: "rgba(255,201,64,0.3)" },
  Low:    { bg: "rgba(0,229,160,0.10)", color: "var(--dw-green)", border: "rgba(0,229,160,0.3)" },
};

function urgencyColor(u: number): string {
  return U_COLOR[u] ?? "var(--dw-muted)";
}

function formatLocString(loc?: DisasterLocation | null): string {
  if (!loc) return "Not available";
  const str = [loc.city, loc.state, loc.country].filter(Boolean).join(", ");
  return str || "Not available";
}

function formatDate(iso?: string): string {
  if (!iso) return "Not available";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function formatRelTime(iso?: string): string {
  if (!iso) return "Not available";
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  } catch {
    return "Not available";
  }
}

/* ─── COMPONENT ──────────────────────────────────────────────────────────── */
const ShowDetails: React.FC = () => {
  const locationHook = useLocation();
  const navigate = useNavigate();

  const data = locationHook.state as DisasterDocument | undefined;

  /* Inject CSS once */
  useEffect(() => {
    const id = "sd-global-css";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = DETAILS_CSS;
      document.head.appendChild(style);
    }
  }, []);

  if (!data) {
    return (
      <div className="sd-shell">
        <div className="sd-empty">
          <div className="sd-empty-card">
            <h2>⚠ No Details Found</h2>
            <p>
              No disaster alert data was received. Please go back to the dashboard
              and select an alert.
            </p>
            <button className="sd-btn primary" onClick={() => navigate("/dashboard")}>
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const ai = data.ai_analysis;
  const icon = getDisasterIcon(data.disaster_type);
  const locStr = formatLocString(data.location);
  const urgency = ai?.urgency ?? 1;
  const urgencyClr = urgencyColor(urgency);
  const catStyle = ai?.category ? CAT_STYLE[ai.category] : null;
  const credStyle = ai?.credibility ? CRED_STYLE[ai.credibility] : null;

  return (
    <div className="sd-shell">
      {/* Header */}
      <header className="sd-header">
        <div className="sd-logo">
          <div className="sd-logo-mark">{icon}</div>
          <div>
            <div className="sd-logo-text">Disaster Control Room</div>
            <div className="sd-logo-sub">Detailed Incident View</div>
          </div>
        </div>

        <div className="sd-header-actions">
          <button className="sd-btn" onClick={() => navigate("/dashboard")}>
            ← Dashboard
          </button>
        </div>
      </header>

      <div className="sd-container">
        {/* Top Title */}
        <div className="sd-topbar">
          <div className="sd-title-block">
            <div className="sd-type">{data.disaster_type}</div>
            <h1 className="sd-title">
              {icon} Disaster Report Details
            </h1>

            <div className="sd-badges">
              {ai?.category && catStyle && (
                <span
                  className="sd-badge"
                  style={{
                    background: catStyle.bg,
                    color: catStyle.color,
                    borderColor: catStyle.border,
                  }}
                >
                  {ai.category}
                </span>
              )}

              {ai?.credibility && credStyle && (
                <span
                  className="sd-badge"
                  style={{
                    background: credStyle.bg,
                    color: credStyle.color,
                    borderColor: credStyle.border,
                  }}
                >
                  {ai.credibility} Credibility
                </span>
              )}

              <span
                className="sd-badge"
                style={{
                  background: `${urgencyClr}15`,
                  color: urgencyClr,
                  borderColor: `${urgencyClr}55`,
                }}
              >
                Urgency {urgency}/5
              </span>

              <span className="sd-pill">
                {data.is_saved ? "Saved" : "Not Saved"}
              </span>

              <span className="sd-pill">
                Status: {data.status || "Unknown"}
              </span>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="sd-grid">
          {/* LEFT SIDE */}
          <div className="sd-left">
            {/* Original Post */}
            <div className="sd-card">
              <h2 className="sd-card-title">📢 Original Post</h2>
              <p className="sd-text">{data.original_text || "Not available"}</p>

              <div style={{ marginTop: "14px" }}>
                <span className="sd-label">Source Platform</span>
                <span className="sd-value">{data.source || "Unknown"}</span>

                {data.source_url && (
                  <a
                    href={data.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sd-link"
                  >
                    Open Original Source ↗
                  </a>
                )}
              </div>
            </div>

            {/* AI Summary */}
            <div className="sd-card">
              <h2 className="sd-card-title">🧠 AI Summary</h2>
              <p className="sd-text">
                {ai?.summary || "No AI summary available for this report."}
              </p>
            </div>

            {/* Raw Metadata */}
            <div className="sd-card">
              <h2 className="sd-card-title">🗂 Report Metadata</h2>

              <div className="sd-info-grid">
                <div className="sd-info-item">
                  <span className="sd-label">Reddit / Report ID</span>
                  <span className="sd-value">{data.reddit_id || "Not available"}</span>
                </div>

                <div className="sd-info-item">
                  <span className="sd-label">Disaster Type</span>
                  <span className="sd-value">{data.disaster_type || "Not available"}</span>
                </div>

                <div className="sd-info-item">
                  <span className="sd-label">Created At</span>
                  <span className="sd-value">{formatDate(data.created_at)}</span>
                </div>

                <div className="sd-info-item">
                  <span className="sd-label">Fetched At</span>
                  <span className="sd-value">{formatDate(data.fetched_at)}</span>
                </div>

                <div className="sd-info-item">
                  <span className="sd-label">Relative Time</span>
                  <span className="sd-value">{formatRelTime(data.created_at)}</span>
                </div>

                <div className="sd-info-item">
                  <span className="sd-label">Current Status</span>
                  <span className="sd-value">{data.status || "Not available"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="sd-right">
            {/* AI Analysis */}
            <div className="sd-card">
              <h2 className="sd-card-title">🤖 AI Analysis</h2>

              <div className="sd-info-grid">
                <div className="sd-info-item">
                  <span className="sd-label">Category</span>
                  <span className="sd-value">{ai?.category || "Not available"}</span>
                </div>

                <div className="sd-info-item">
                  <span className="sd-label">Urgency Level</span>
                  <span className="sd-value">{ai?.urgency ?? "Not available"} / 5</span>
                </div>

                <div className="sd-info-item">
                  <span className="sd-label">Credibility</span>
                  <span className="sd-value">{ai?.credibility || "Not available"}</span>
                </div>

                <div className="sd-info-item">
                  <span className="sd-label">Source Type</span>
                  <span className="sd-value">{data.source || "Not available"}</span>
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="sd-card">
              <h2 className="sd-card-title">📍 Location Details</h2>

              <div className="sd-info-grid">
                <div className="sd-info-item">
                  <span className="sd-label">Formatted Location</span>
                  <span className="sd-value">{locStr}</span>
                </div>

                <div className="sd-info-item">
                  <span className="sd-label">City</span>
                  <span className="sd-value">{data.location?.city || "Not available"}</span>
                </div>

                <div className="sd-info-item">
                  <span className="sd-label">State</span>
                  <span className="sd-value">{data.location?.state || "Not available"}</span>
                </div>

                <div className="sd-info-item">
                  <span className="sd-label">Country</span>
                  <span className="sd-value">{data.location?.country || "Not available"}</span>
                </div>

                <div className="sd-info-item">
                  <span className="sd-label">Latitude</span>
                  <span className="sd-value">
                    {data.location?.coordinates?.lat ?? "Not available"}
                  </span>
                </div>

                <div className="sd-info-item">
                  <span className="sd-label">Longitude</span>
                  <span className="sd-value">
                    {data.location?.coordinates?.lng ?? "Not available"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="sd-card">
              <h2 className="sd-card-title">⚡ Quick Actions</h2>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                <button className="sd-btn primary" onClick={() => navigate("/dashboard")}>
                  ← Back to Dashboard
                </button>

                {data.source_url && (
                  <a
                    href={data.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none" }}
                  >
                    <button className="sd-btn">Open Source ↗</button>
                  </a>
                )}
              </div>

              <p className="sd-muted" style={{ marginTop: "14px", fontSize: "0.85rem", lineHeight: "1.6" }}>
                This detailed view is synchronized with the Dashboard alert object and
                displays all available information passed from the selected disaster card.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowDetails;
