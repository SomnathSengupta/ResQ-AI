import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Shield, Lock, UserCircle2 } from "lucide-react";

const LOGIN_CSS = `
  .rq-login-shell {
    min-height: 100vh;
    width: 100%;
    position: relative;
    overflow: hidden;
    background:
      radial-gradient(circle at 18% 20%, rgba(79, 172, 247, 0.10), transparent 24%),
      radial-gradient(circle at 82% 18%, rgba(255, 61, 46, 0.08), transparent 22%),
      radial-gradient(circle at 50% 82%, rgba(79, 172, 247, 0.05), transparent 28%),
      linear-gradient(180deg, #0b1017 0%, #0e1219 48%, #0a0e14 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px 18px;
    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .rq-login-grid {
    width: 100%;
    max-width: 1180px;
    display: grid;
    grid-template-columns: 1.1fr 0.9fr;
    gap: 28px;
    align-items: stretch;
  }

  .rq-login-info,
  .rq-login-card {
    position: relative;
    border-radius: 24px;
    border: 1px solid #1c2433;
    background:
      linear-gradient(180deg, rgba(17, 23, 33, 0.96) 0%, rgba(11, 16, 23, 0.98) 100%);
    box-shadow:
      0 18px 60px rgba(0, 0, 0, 0.34),
      inset 0 1px 0 rgba(255, 255, 255, 0.02);
    overflow: hidden;
  }

  .rq-login-info::before,
  .rq-login-card::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(135deg, rgba(79, 172, 247, 0.05), transparent 35%),
      linear-gradient(315deg, rgba(255, 61, 46, 0.04), transparent 30%);
  }

  .rq-login-info {
    padding: 34px 34px 30px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 620px;
  }

  .rq-login-badge {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    width: fit-content;
    padding: 8px 14px;
    border-radius: 999px;
    background: rgba(255, 61, 46, 0.08);
    border: 1px solid rgba(255, 61, 46, 0.18);
    color: #ff6a5e;
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 20px;
  }

  .rq-login-title {
    margin: 0;
    font-family: "Barlow Condensed", sans-serif;
    font-size: clamp(2.4rem, 5vw, 4rem);
    line-height: 0.95;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: #dce8f5;
  }

  .rq-login-title span {
    color: #ff3d2e;
    text-shadow: 0 0 18px rgba(255, 61, 46, 0.14);
  }

  .rq-login-subtitle {
    margin-top: 18px;
    max-width: 540px;
    color: #6b7f96;
    font-size: 1rem;
    line-height: 1.8;
  }

  .rq-login-panel {
    margin-top: 28px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }

  .rq-login-panel-card {
    border-radius: 18px;
    padding: 16px 16px 14px;
    border: 1px solid #1c2433;
    background: rgba(14, 20, 30, 0.82);
  }

  .rq-login-panel-label {
    color: #6b7f96;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .rq-login-panel-value {
    color: #dce8f5;
    font-family: "Barlow Condensed", sans-serif;
    font-size: 1.55rem;
    font-weight: 700;
    line-height: 1;
  }

  .rq-login-panel-value.alert {
    color: #ff6a5e;
  }

  .rq-login-panel-value.active {
    color: #4facf7;
  }

  .rq-login-points {
    margin-top: 26px;
    display: grid;
    gap: 12px;
  }

  .rq-login-point {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 16px;
    border: 1px solid #1c2433;
    background: rgba(14, 20, 30, 0.72);
  }

  .rq-login-point-icon {
    width: 38px;
    height: 38px;
    min-width: 38px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(79, 172, 247, 0.08);
    border: 1px solid rgba(79, 172, 247, 0.16);
    color: #4facf7;
  }

  .rq-login-point-title {
    color: #dce8f5;
    font-size: 0.95rem;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .rq-login-point-text {
    color: #6b7f96;
    font-size: 0.86rem;
    line-height: 1.6;
  }

  .rq-login-footer-note {
    margin-top: 24px;
    color: #4a5d74;
    font-size: 0.72rem;
    font-family: "IBM Plex Mono", monospace;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .rq-login-card {
    padding: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 620px;
  }

  .rq-login-form-wrap {
    width: 100%;
    max-width: 420px;
    position: relative;
    z-index: 1;
  }

  .rq-login-form-top {
    margin-bottom: 24px;
  }

  .rq-login-form-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(79, 172, 247, 0.08);
    border: 1px solid rgba(79, 172, 247, 0.16);
    color: #4facf7;
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 14px;
  }

  .rq-login-form-title {
    margin: 0;
    font-family: "Barlow Condensed", sans-serif;
    font-size: 2.3rem;
    line-height: 1;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    color: #dce8f5;
  }

  .rq-login-form-subtitle {
    margin-top: 10px;
    color: #6b7f96;
    font-size: 0.92rem;
    line-height: 1.7;
  }

  .rq-login-form {
    display: grid;
    gap: 18px;
  }

  .rq-login-field {
    display: grid;
    gap: 8px;
  }

  .rq-login-label {
    color: #9fb3c8;
    font-size: 0.76rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .rq-login-input-wrap {
    position: relative;
  }

  .rq-login-input-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    color: #4a5d74;
    pointer-events: none;
  }

  .rq-login-input,
  .rq-login-select {
    width: 100%;
    height: 54px;
    border-radius: 16px;
    border: 1px solid #1c2433;
    background: rgba(10, 15, 22, 0.92);
    color: #dce8f5;
    padding: 0 16px;
    font-size: 0.95rem;
    outline: none;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
    box-sizing: border-box;
  }

  .rq-login-input.has-icon,
  .rq-login-select.has-icon {
    padding-left: 46px;
  }

  .rq-login-input.password {
    padding-right: 52px;
  }

  .rq-login-input::placeholder {
    color: #5b6d83;
  }

  .rq-login-input:focus,
  .rq-login-select:focus {
    border-color: #4facf7;
    box-shadow: 0 0 0 4px rgba(79, 172, 247, 0.12);
  }

  .rq-login-select {
    appearance: none;
    cursor: pointer;
  }

  .rq-login-toggle {
    position: absolute;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    border: none;
    background: transparent;
    color: #6b7f96;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    transition: color 0.2s ease;
  }

  .rq-login-toggle:hover {
    color: #4facf7;
  }

  .rq-login-submit {
    margin-top: 4px;
    width: 100%;
    height: 56px;
    border: none;
    border-radius: 16px;
    cursor: pointer;
    background: linear-gradient(135deg, #ff3d2e 0%, #e63324 45%, #b9281d 100%);
    color: #ffffff;
    font-family: "Barlow Condensed", sans-serif;
    font-size: 1rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    box-shadow: 0 12px 28px rgba(255, 61, 46, 0.22);
    transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
  }

  .rq-login-submit:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 34px rgba(255, 61, 46, 0.28);
    filter: brightness(1.04);
  }

  .rq-login-bottom {
    margin-top: 18px;
    text-align: center;
    color: #4a5d74;
    font-size: 0.75rem;
    line-height: 1.6;
  }

  @media (max-width: 980px) {
    .rq-login-grid {
      grid-template-columns: 1fr;
      max-width: 620px;
    }

    .rq-login-info {
      min-height: auto;
      padding: 28px 24px;
    }

    .rq-login-card {
      min-height: auto;
      padding: 24px;
    }
  }

  @media (max-width: 640px) {
    .rq-login-shell {
      padding: 18px 12px;
    }

    .rq-login-info,
    .rq-login-card {
      border-radius: 20px;
    }

    .rq-login-info {
      padding: 22px 18px;
    }

    .rq-login-card {
      padding: 18px;
    }

    .rq-login-panel {
      grid-template-columns: 1fr;
    }

    .rq-login-form-title {
      font-size: 1.9rem;
    }

    .rq-login-title {
      font-size: 2.1rem;
    }
  }
`;

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("Disaster Management Authority Officer");

  useEffect(() => {
    const id = "rq-login-global-css";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = LOGIN_CSS;
      document.head.appendChild(style);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const existingProfile = JSON.parse(
      localStorage.getItem("officerProfile") || "{}"
    );

    const updatedProfile = {
      ...existingProfile,
      officerId: email,
      password: password,
      role: role,
    };

    localStorage.setItem("officerProfile", JSON.stringify(updatedProfile));

    // Direct Login (No strict validation)
    navigate("/dashboard");
  };

  return (
    <div className="rq-login-shell">
      <div className="rq-login-grid">
        {/* Left Side Info Panel */}
        <div className="rq-login-info">
          <div>
            <div className="rq-login-badge">
              <Shield size={16} />
              Secure Emergency Intelligence Access
            </div>

            <h1 className="rq-login-title">
              <span>ResQAI</span> Control Portal
            </h1>

            <p className="rq-login-subtitle">
              Unified AI-powered disaster intelligence platform for emergency
              monitoring, humanitarian coordination, and rapid response
              decision-making across verified social and news sources.
            </p>

            <div className="rq-login-panel">
              <div className="rq-login-panel-card">
                <div className="rq-login-panel-label">Live Feed</div>
                <div className="rq-login-panel-value active">24/7</div>
              </div>

              <div className="rq-login-panel-card">
                <div className="rq-login-panel-label">Alert Priority</div>
                <div className="rq-login-panel-value alert">High</div>
              </div>

              <div className="rq-login-panel-card">
                <div className="rq-login-panel-label">Source Coverage</div>
                <div className="rq-login-panel-value">Multi</div>
              </div>
            </div>

            <div className="rq-login-points">
              <div className="rq-login-point">
                <div className="rq-login-point-icon">
                  <Shield size={18} />
                </div>
                <div>
                  <div className="rq-login-point-title">Verified Monitoring Access</div>
                  <div className="rq-login-point-text">
                    Role-based entry for disaster management officers, NGOs, and
                    emergency response personnel.
                  </div>
                </div>
              </div>

              <div className="rq-login-point">
                <div className="rq-login-point-icon">
                  <Lock size={18} />
                </div>
                <div>
                  <div className="rq-login-point-title">Secure Operational Login</div>
                  <div className="rq-login-point-text">
                    Controlled access to live dashboards, filtered incident feeds,
                    credibility scores, and response-oriented AI summaries.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rq-login-footer-note">
            National Disaster Response Intelligence Interface
          </div>
        </div>

        {/* Right Side Login Form */}
        <div className="rq-login-card">
          <div className="rq-login-form-wrap">
            <div className="rq-login-form-top">
              <div className="rq-login-form-badge">
                <Shield size={14} />
                Authorized Access Only
              </div>

              <h2 className="rq-login-form-title">Secure Login</h2>

              <p className="rq-login-form-subtitle">
                Sign in to access the ResQAI disaster monitoring dashboard and
                real-time response intelligence.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="rq-login-form">
              {/* Role */}
              <div className="rq-login-field">
                <label className="rq-login-label">Access Role</label>
                <div className="rq-login-input-wrap">
                  <UserCircle2 size={18} className="rq-login-input-icon" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="rq-login-select has-icon"
                  >
                    <option>Disaster Management Authority Officer</option>
                    <option>NGO Worker</option>
                    <option>Emergency Response Team</option>
                  </select>
                </div>
              </div>

              {/* Official ID */}
              <div className="rq-login-field">
                <label className="rq-login-label">Official ID</label>
                <div className="rq-login-input-wrap">
                  <UserCircle2 size={18} className="rq-login-input-icon" />
                  <input
                    type="text"
                    placeholder="Enter your official ID"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="rq-login-input has-icon"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="rq-login-field">
                <label className="rq-login-label">Secure Password</label>
                <div className="rq-login-input-wrap">
                  <Lock size={18} className="rq-login-input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="rq-login-input has-icon password"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="rq-login-toggle"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" className="rq-login-submit">
                Enter Control Dashboard
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;