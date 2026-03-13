import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./ShowDetails.css";

interface DisasterDetails {
  id?: number;
  location: string;
  lat?: number;
  lng?: number;
  category: string;
  urgency: number;
  credibility: string;
  reason?: string;
  affectedPeople?: number;
  obstacle?: string;
  originalPost?: string;
  source?: string;
  summary?: string;
}

const ShowDetails: React.FC = () => {
  const locationHook = useLocation();
  const navigate = useNavigate();

  const data = locationHook.state as DisasterDetails | undefined;

  // If user directly opens /details without state
  if (!data) {
    return (
      <div className="details-page">
        <div className="header">
          <h1>🚨 Disaster Report Details</h1>
        </div>

        <div className="cards-container">
          <div className="card summary-card">
            <h2>⚠️ No Details Found</h2>
            <p>
              No disaster alert data was received. Please go back to the dashboard
              and select an alert.
            </p>

            <button
              onClick={() => navigate("/dashboard")}
              style={{
                marginTop: "16px",
                padding: "10px 16px",
                border: "none",
                borderRadius: "8px",
                backgroundColor: "#2563eb",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Go Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dynamic fallback values if some fields are not passed
  const originalPost =
    data.originalPost ||
    `Emergency reported in ${data.location} due to ${data.reason || "a disaster situation"}. Immediate response required.`;

  const source = data.source || "Twitter / Social Media";

  const summary =
    data.summary ||
    `${data.category} emergency reported in ${data.location} with urgency level ${data.urgency}. ${
      data.affectedPeople
        ? `${data.affectedPeople} people are estimated to be affected. `
        : ""
    }${data.obstacle ? `Main obstacle identified: ${data.obstacle}.` : ""}`;

  return (
    <div className="details-page">
      <div className="header">
        <h1>🚨 Disaster Report Details</h1>
      </div>

      <div className="cards-container">
        {/* Original Post */}
        <div className="card post-card">
          <h2>📢 Original Post</h2>
          <p className="post-text">{originalPost}</p>
          <p className="source">
            <strong>Source:</strong> {source}
          </p>
        </div>

        {/* AI Analysis */}
        <div className="card analysis-card">
          <h2>🤖 AI Analysis</h2>

          <div className="analysis-grid">
            <div className="analysis-item">
              <span className="label">Location</span>
              <span className="value">{data.location}</span>
            </div>

            <div className="analysis-item">
              <span className="label">Category</span>
              <span className="badge rescue">{data.category}</span>
            </div>

            <div className="analysis-item">
              <span className="label">Urgency</span>
              <span className="badge urgency">{data.urgency}</span>
            </div>

            <div className="analysis-item">
              <span className="label">Credibility</span>
              <span className="badge credibility">{data.credibility}</span>
            </div>

            {/* Extra details from Dashboard */}
            {data.reason && (
              <div className="analysis-item">
                <span className="label">Reason</span>
                <span className="value">{data.reason}</span>
              </div>
            )}

            {data.affectedPeople !== undefined && (
              <div className="analysis-item">
                <span className="label">Affected People</span>
                <span className="value">{data.affectedPeople}</span>
              </div>
            )}

            {data.obstacle && (
              <div className="analysis-item">
                <span className="label">Obstacle</span>
                <span className="value">{data.obstacle}</span>
              </div>
            )}
          </div>
        </div>

        {/* AI Summary */}
        <div className="card summary-card">
          <h2>🧠 AI Summary</h2>
          <p>{summary}</p>

          <button
            onClick={() => navigate("/dashboard")}
            style={{
              marginTop: "16px",
              padding: "10px 16px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: "#16a34a",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowDetails;