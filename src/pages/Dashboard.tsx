import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

/* Leaflet Fix */
(L.Icon.Default.prototype as any)._getIconUrl = undefined;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, shadowUrl: markerShadow });

/* ─── API BASE ───────────────────────────────────────────────────────────── */
const API_BASE = "ngrok_url";

/* ─── CSS-in-JS (injected once) ──────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500&display=swap');

  html, body, #root {
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }

  * { box-sizing: border-box; }

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

  .dw-shell {
    display: flex;
    flex-direction: column;
    height: 100vh;
    min-height: 100vh;
    background: var(--dw-bg);
    color: var(--dw-text);
    font-family: var(--body-font);
    overflow: hidden;
  }

  /* ── Header ── */
  .dw-header {
    height: 52px;
    flex-shrink: 0;
    border-bottom: 1px solid var(--dw-border);
    background: var(--dw-surface);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    z-index: 500;
  }

  .dw-logo { display: flex; align-items: center; gap: 10px; }

  .dw-logo-mark {
    width: 28px; height: 28px; border-radius: 6px;
    background: var(--dw-accent);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--display); font-size: 1.1rem; font-weight: 800; color: #fff;
    box-shadow: 0 0 16px var(--dw-accent-glow);
  }

  .dw-logo-text {
    font-family: var(--display); font-size: 1.1rem; font-weight: 700;
    letter-spacing: 0.06em; text-transform: uppercase; color: var(--dw-text);
  }

  .dw-logo-sub {
    font-family: var(--mono); font-size: 0.58rem; color: var(--dw-muted);
    text-transform: uppercase; letter-spacing: 0.1em; margin-top: 1px;
  }

  .dw-header-right { display: flex; align-items: center; gap: 12px; }

  .dw-live-pill {
    display: flex; align-items: center; gap: 6px;
    background: var(--dw-accent-dim); border: 1px solid var(--dw-accent-glow);
    padding: 4px 10px; border-radius: 20px;
    font-family: var(--mono); font-size: 0.65rem;
    color: var(--dw-accent); text-transform: uppercase; letter-spacing: 0.08em;
  }

  .dw-live-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--dw-accent);
    animation: dw-blink 1.4s infinite;
  }

  @keyframes dw-blink { 0%,100%{opacity:1} 50%{opacity:0.2} }

  .dw-last-updated {
    font-family: var(--mono); font-size: 0.65rem; color: var(--dw-muted);
  }

  .dw-refresh-btn {
    background: var(--dw-surface2); border: 1px solid var(--dw-border-lit);
    color: var(--dw-muted2); width: 30px; height: 30px;
    border-radius: 6px; cursor: pointer; font-size: 1rem;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
  }

  .dw-refresh-btn:hover { border-color: var(--dw-blue); color: var(--dw-blue); }
  .dw-refresh-btn.spinning { animation: dw-spin 0.7s linear infinite; }
  @keyframes dw-spin { to { transform: rotate(360deg); } }

  .dw-signout-btn {
    background: var(--dw-surface2); border: 1px solid var(--dw-border-lit);
    color: var(--dw-muted2); padding: 5px 14px; border-radius: 6px;
    font-family: var(--mono); font-size: 0.68rem; cursor: pointer;
    text-transform: uppercase; letter-spacing: 0.06em; transition: all 0.2s;
  }

  .dw-signout-btn:hover { border-color: var(--dw-accent); color: var(--dw-accent); }

  /* Profile */
  .dw-profile-wrap { position: relative; }

  .dw-profile-icon {
    width: 30px; height: 30px; border-radius: 6px;
    background: var(--dw-surface2); border: 1px solid var(--dw-border-lit);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 0.9rem; transition: border-color 0.2s;
  }

  .dw-profile-icon:hover { border-color: var(--dw-blue); }

  .dw-profile-popup {
    position: absolute; right: 0; top: calc(100% + 8px);
    width: 240px; background: var(--dw-surface2);
    border: 1px solid var(--dw-border-lit); border-radius: 8px;
    padding: 14px; z-index: 9999;
    box-shadow: 0 8px 24px rgba(0,0,0,0.6);
  }

  .dw-profile-popup p {
    font-family: var(--mono); font-size: 0.7rem;
    color: var(--dw-muted2); margin-bottom: 6px;
  }

  .dw-profile-popup p strong { color: var(--dw-text); }

  /* ── Layout ── */
  .dw-layout {
    height: calc(100vh - 52px);
    min-height: calc(100vh - 52px);
    display: grid;
    grid-template-columns: 340px 1fr;
    overflow: hidden;
  }

  /* ── Left panel ── */
  .dw-left {
    border-right: 1px solid var(--dw-border);
    display: flex; flex-direction: column;
    overflow: hidden; background: var(--dw-surface);
    min-height: 0; height: 100%;
  }

  /* Stats bar */
  .dw-stats {
    display: grid; grid-template-columns: repeat(4, 1fr);
    border-bottom: 1px solid var(--dw-border); flex-shrink: 0;
  }

  .dw-stat {
    padding: 10px 12px; text-align: center;
    border-right: 1px solid var(--dw-border);
  }

  .dw-stat:last-child { border-right: none; }

  .dw-stat-num {
    font-family: var(--display); font-size: 1.6rem;
    font-weight: 800; line-height: 1; display: block;
  }

  .dw-stat-lbl {
    font-family: var(--mono); font-size: 0.52rem;
    color: var(--dw-muted); text-transform: uppercase;
    letter-spacing: 0.08em; margin-top: 3px; display: block;
  }

  /* Filters */
  .dw-filters {
    padding: 10px 12px; border-bottom: 1px solid var(--dw-border);
    flex-shrink: 0; display: flex; flex-direction: column; gap: 7px;
  }

  .dw-filter-row { display: flex; gap: 6px; }

  .dw-filter-select, .dw-filter-search {
    background: var(--dw-surface2); border: 1px solid var(--dw-border-lit);
    color: var(--dw-text); font-family: var(--mono); font-size: 0.7rem;
    padding: 6px 10px; border-radius: 5px; outline: none; flex: 1;
    transition: border-color 0.15s; -webkit-appearance: none; appearance: none;
  }

  .dw-filter-search {
    font-family: var(--body-font); font-size: 0.78rem;
    padding: 8px 12px; width: 100%;
  }

  .dw-filter-search::placeholder { color: var(--dw-muted); }
  .dw-filter-select:focus, .dw-filter-search:focus { border-color: var(--dw-blue); }
  .dw-filter-select option { background: var(--dw-surface2); }

  .dw-clear-btn {
    background: none; border: 1px solid var(--dw-border-lit); color: var(--dw-muted);
    font-family: var(--mono); font-size: 0.65rem; padding: 6px 10px;
    border-radius: 5px; cursor: pointer; white-space: nowrap;
    text-transform: uppercase; letter-spacing: 0.05em; transition: all 0.15s;
  }

  .dw-clear-btn:hover { color: var(--dw-text); border-color: var(--dw-muted2); }

  /* Card list */
  .dw-card-list {
    flex: 1; min-height: 0;
    overflow-y: auto; padding: 8px;
    scrollbar-width: thin; scrollbar-color: var(--dw-border-lit) transparent;
  }

  .dw-card-list::-webkit-scrollbar { width: 4px; }
  .dw-card-list::-webkit-scrollbar-thumb { background: var(--dw-border-lit); border-radius: 2px; }

  /* Disaster card */
  .dw-card {
    background: var(--dw-surface2); border: 1px solid var(--dw-border);
    border-radius: 8px; padding: 12px; margin-bottom: 8px;
    cursor: pointer; transition: border-color 0.15s, transform 0.15s;
    animation: dw-fadeIn 0.3s ease both;
  }

  @keyframes dw-fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }

  .dw-card:hover { border-color: var(--dw-border-lit); transform: translateX(2px); }
  .dw-card.active { border-color: var(--dw-blue); background: rgba(79,172,247,0.04); }

  .dw-card-header {
    display: flex; align-items: flex-start;
    justify-content: space-between; gap: 8px; margin-bottom: 8px;
  }

  .dw-card-icon {
    width: 32px; height: 32px; border-radius: 6px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: 1rem;
  }

  .dw-card-title-wrap { flex: 1; min-width: 0; }

  .dw-card-type-label {
    font-family: var(--display); font-size: 0.68rem; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.1em; color: var(--dw-muted2);
    display: block; margin-bottom: 2px;
  }

  .dw-card-title {
    font-size: 0.8rem; font-weight: 500; line-height: 1.35; color: var(--dw-text);
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  }

  .dw-urgency-badge {
    flex-shrink: 0; width: 26px; height: 26px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--display); font-size: 0.85rem; font-weight: 800;
  }

  .dw-card-meta {
    display: flex; gap: 8px; flex-wrap: wrap;
    margin-bottom: 5px; align-items: center;
  }

  .dw-meta-chip {
    font-family: var(--mono); font-size: 0.62rem;
    color: var(--dw-muted2); display: flex; align-items: center; gap: 3px;
  }

  .dw-cat-pill {
    font-family: var(--mono); font-size: 0.6rem; padding: 2px 7px;
    border-radius: 3px; text-transform: uppercase; letter-spacing: 0.07em; font-weight: 500;
  }

  .dw-card-summary {
    font-size: 0.74rem; color: var(--dw-muted2); line-height: 1.45;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    margin-bottom: 4px;
  }

  .dw-details-link {
    display: inline-block; margin-top: 4px;
    font-family: var(--mono); font-size: 0.65rem;
    color: var(--dw-blue); text-decoration: none;
    text-transform: uppercase; letter-spacing: 0.05em;
    transition: opacity 0.15s;
    background: none; border: none; padding: 0; cursor: pointer;
  }

  .dw-details-link:hover { opacity: 0.7; }

  /* Loading / empty states */
  .dw-loading-state {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; height: 100%; gap: 14px; color: var(--dw-muted);
  }

  .dw-loader-ring {
    width: 36px; height: 36px;
    border: 2px solid var(--dw-border-lit); border-top-color: var(--dw-accent);
    border-radius: 50%; animation: dw-spin 0.8s linear infinite;
  }

  .dw-loading-text {
    font-family: var(--mono); font-size: 0.72rem;
    color: var(--dw-muted); text-align: center; line-height: 1.7;
  }

  .dw-loading-step { color: var(--dw-blue); display: block; margin-bottom: 2px; }

  .dw-empty {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; height: 200px; color: var(--dw-muted);
    font-family: var(--mono); font-size: 0.72rem; text-align: center; gap: 8px;
  }

  .dw-error-state {
    margin: 12px 8px; padding: 14px;
    background: rgba(255,61,46,0.07); border: 1px solid rgba(255,61,46,0.25);
    border-radius: 8px; font-family: var(--mono); font-size: 0.7rem;
    color: var(--dw-accent); line-height: 1.6; text-align: center;
  }

  .dw-error-state small {
    display: block; margin-top: 6px; color: var(--dw-muted); font-size: 0.62rem;
  }

  /* Toast */
  .dw-toast {
    position: fixed; bottom: 20px; left: 50%;
    transform: translateX(-50%) translateY(60px);
    background: var(--dw-surface2); border: 1px solid var(--dw-border-lit);
    color: var(--dw-text); font-family: var(--mono); font-size: 0.72rem;
    padding: 10px 18px; border-radius: 8px; z-index: 9999;
    transition: transform 0.3s ease; white-space: nowrap; pointer-events: none;
  }

  .dw-toast.show { transform: translateX(-50%) translateY(0); }
  .dw-toast.error { border-color: var(--dw-accent); color: var(--dw-accent); }
  .dw-toast.success { border-color: rgba(0,229,160,0.4); color: var(--dw-green); }

  /* ── Map ── */
  .dw-map-wrap {
    position: relative; overflow: hidden;
    height: 100%; min-height: 0; background: var(--dw-bg);
  }

  .dw-map-inner { width: 100%; height: 100%; }

  .dw-map-wrap .leaflet-container {
    width: 100% !important; height: 100% !important; background: #0b1018 !important;
  }

  .dw-map-wrap .leaflet-tile-pane {
    filter: brightness(0.55) contrast(1.05) saturate(0.45) hue-rotate(180deg);
  }

  .dw-map-wrap .leaflet-control-zoom {
    border: 1px solid var(--dw-border-lit) !important;
    box-shadow: 0 6px 18px rgba(0,0,0,0.35) !important;
  }

  .dw-map-wrap .leaflet-control-zoom a {
    background: rgba(14,18,25,0.95) !important;
    color: var(--dw-text) !important;
    border-bottom: 1px solid var(--dw-border) !important;
  }

  .dw-map-wrap .leaflet-control-zoom a:hover { color: var(--dw-blue) !important; }

  .dw-map-overlay {
    position: absolute; top: 12px; right: 12px; z-index: 400; pointer-events: none;
    display: flex; flex-direction: column; gap: 6px;
  }

  .dw-map-pill {
    background: rgba(14,18,25,0.92); border: 1px solid var(--dw-border-lit);
    backdrop-filter: blur(8px); padding: 6px 12px; border-radius: 6px;
    font-family: var(--mono); font-size: 0.65rem; color: var(--dw-muted2);
    display: flex; align-items: center; gap: 7px;
  }

  .dw-map-pill strong { color: var(--dw-text); font-weight: 500; }

  /* Leaflet popup dark theme */
  .dw-shell .leaflet-popup-content-wrapper {
    background: var(--dw-surface2) !important; border: 1px solid var(--dw-border-lit) !important;
    border-radius: 8px !important; box-shadow: 0 8px 24px rgba(0,0,0,0.6) !important;
    color: var(--dw-text) !important; font-family: var(--body-font) !important;
  }

  .dw-shell .leaflet-popup-tip { background: var(--dw-surface2) !important; }
  .dw-shell .leaflet-popup-close-button { color: var(--dw-muted) !important; }

  .dw-popup { padding: 4px 2px; max-width: 240px; }
  .dw-popup-type {
    font-family: var(--mono); font-size: 0.6rem; text-transform: uppercase;
    letter-spacing: 0.08em; color: var(--dw-muted2); margin-bottom: 4px;
  }
  .dw-popup-title {
    font-size: 0.8rem; font-weight: 500; line-height: 1.35; color: var(--dw-text); margin-bottom: 6px;
  }
  .dw-popup-loc { font-size: 0.72rem; color: var(--dw-muted2); margin-bottom: 5px; }
  .dw-popup-summary { font-size: 0.72rem; color: var(--dw-muted2); line-height: 1.4; margin-bottom: 6px; }

  .dw-popup-details-btn {
    margin-top: 8px; display: inline-block;
    background: rgba(79,172,247,0.15); border: 1px solid rgba(79,172,247,0.3);
    color: var(--dw-blue); font-family: var(--mono); font-size: 0.65rem;
    padding: 4px 10px; border-radius: 4px; cursor: pointer;
    text-transform: uppercase; letter-spacing: 0.05em; transition: background 0.15s;
  }

  .dw-popup-details-btn:hover { background: rgba(79,172,247,0.25); }

  .dw-source-link {
    font-family: var(--mono); font-size: 0.62rem;
    color: var(--dw-blue); text-decoration: none; opacity: 0.8;
  }

  .dw-source-link:hover { opacity: 1; }

  /* Responsive */
  @media (max-width: 768px) {
    html, body, #root { overflow: auto; }
    .dw-shell { height: auto; min-height: 100vh; overflow: visible; }
    .dw-layout { height: auto; min-height: auto; grid-template-columns: 1fr; grid-template-rows: 50vh auto; }
    .dw-map-wrap { order: -1; min-height: 50vh; }
    .dw-card-list { max-height: 380px; }
    .dw-stats { grid-template-columns: repeat(2, 1fr); }
  }
`;

/* ─── API TYPES ──────────────────────────────────────────────────────────── */
interface AiAnalysis {
  category: string;      // Rescue | Relief | Damage | Warning | Casualty
  urgency: number;       // 1–5
  credibility: string;   // High | Medium | Low
  summary: string;
}

interface Coordinates {
  lat: number;
  lng: number;
}

interface Location {
  city?: string | null;
  state?: string | null;
  country?: string | null;
  coordinates?: Coordinates | null;
}

export interface DisasterDocument {
  reddit_id: string;
  source: string;
  source_url: string;
  disaster_type: string;
  original_text: string;
  location?: Location | null;
  ai_analysis?: AiAnalysis | null;
  status: string;
  created_at: string;
  fetched_at: string;
  is_saved: boolean;
}

interface FetchResponse  { fetch_id: string; total: number; fetched_at: string; }
interface VerifyResponse { total_verified: number; total_saved: number; total_rejected: number; verified_at: string; }
interface StoredResponse { total: number; fetched_at: string; posts: DisasterDocument[]; }

/* ─── HELPERS ────────────────────────────────────────────────────────────── */
const DISASTER_ICONS: Record<string, string> = {
  flood: "🌊", earthquake: "🌋", wildfire: "🔥", fire: "🔥",
  hurricane: "🌀", tornado: "🌪", cyclone: "🌀", tsunami: "🌊",
  landslide: "⛰", drought: "☀", volcano: "🌋", storm: "⛈",
  blizzard: "❄", snow: "❄", heat: "🌡", rescue: "🚨", medical: "🏥",
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
  1: "#4facf7", 2: "#4facf7", 3: "#ffc940", 4: "#ff7722", 5: "#ff3d2e",
};

const CAT_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  Rescue:   { bg: "rgba(79,172,247,0.12)",  color: "var(--dw-blue)",   border: "rgba(79,172,247,0.3)" },
  Relief:   { bg: "rgba(0,229,160,0.1)",    color: "var(--dw-green)",  border: "rgba(0,229,160,0.3)" },
  Damage:   { bg: "rgba(255,201,64,0.1)",   color: "var(--dw-yellow)", border: "rgba(255,201,64,0.3)" },
  Warning:  { bg: "rgba(255,61,46,0.1)",    color: "var(--dw-accent)", border: "rgba(255,61,46,0.3)" },
  Casualty: { bg: "rgba(200,40,40,0.15)",   color: "#ff6666",          border: "rgba(200,40,40,0.3)" },
};

const CRED_COLOR: Record<string, string> = {
  High: "var(--dw-accent)", Medium: "var(--dw-yellow)", Low: "var(--dw-green)",
};

function urgencyColor(u: number): string {
  return U_COLOR[u] ?? "var(--dw-muted)";
}

function makeMarkerIcon(urgency: number, disasterType: string, active = false) {
  const c = urgencyColor(urgency);
  const icon = getDisasterIcon(disasterType);
  const s = 12 + urgency * 4;
  return L.divIcon({
    className: "",
    html: `<div style="
      width:${s + 18}px; height:${s + 18}px;
      background:${c}22; border:2px solid ${c}; border-radius:50%;
      display:flex; align-items:center; justify-content:center;
      font-size:${Math.round(s * 0.62)}px;
      box-shadow:0 0 ${active ? urgency * 9 : urgency * 5}px ${c}88;
      transform:${active ? "scale(1.12)" : "scale(1)"};
      transition:all .2s ease;
    ">${icon}</div>`,
    iconSize: [s + 18, s + 18],
    iconAnchor: [(s + 18) / 2, (s + 18) / 2],
    popupAnchor: [0, -(s + 18) / 2],
  });
}

function formatLocString(loc?: Location | null): string {
  if (!loc) return "";
  return [loc.city, loc.state, loc.country].filter(Boolean).join(", ");
}

function formatRelTime(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  } catch { return ""; }
}

/* ─── LEAFLET HELPERS ───────────────────────────────────────────────────── */
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 250);
    const onResize = () => setTimeout(() => map.invalidateSize(), 100);
    window.addEventListener("resize", onResize);
    return () => { clearTimeout(t); window.removeEventListener("resize", onResize); };
  }, [map]);
  return null;
}

function FlyToAlert({ alert }: { alert: DisasterDocument | null }) {
  const map = useMap();
  useEffect(() => {
    if (!alert?.location?.coordinates) return;
    const { lat, lng } = alert.location.coordinates;
    map.flyTo([lat, lng], Math.max(map.getZoom(), 6), { duration: 0.8 });
  }, [alert, map]);
  return null;
}

/* ─── COMPONENT ──────────────────────────────────────────────────────────── */
const Dashboard = () => {
  const navigate = useNavigate();

  /* ── Data state ── */
  const [disasters, setDisasters]     = useState<DisasterDocument[]>([]);
  const [loading, setLoading]         = useState(false);
  const [loadStep, setLoadStep]       = useState("");
  const [loadMsg, setLoadMsg]         = useState("");
  const [lastUpdated, setLastUpdated] = useState("Never loaded");
  const [apiError, setApiError]       = useState<string | null>(null);
  const [toast, setToast]             = useState({ msg: "", type: "", visible: false });

  /* ── Filter state ── */
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter]         = useState("");
  const [urgencyFilter, setUrgencyFilter]   = useState("");
  const [searchQuery, setSearchQuery]       = useState("");

  /* ── UI state ── */
  const [activeId, setActiveId]                 = useState<string | null>(null);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [spinning, setSpinning]                 = useState(false);

  const popupRef    = useRef<HTMLDivElement>(null);
  const toastTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Inject CSS once ── */
  useEffect(() => {
    const id = "dw-global-css";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = GLOBAL_CSS;
      document.head.appendChild(style);
    }
  }, []);

  /* ── Toast helper ── */
  const showToast = useCallback((msg: string, type: "success" | "error" | "" = "") => {
    setToast({ msg, type, visible: true });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(
      () => setToast((t) => ({ ...t, visible: false })),
      3500
    );
  }, []);

  /* ── 3-step API pipeline ── */
  const loadDisasters = useCallback(async () => {
    setLoading(true);
    setSpinning(true);
    setApiError(null);
    setLastUpdated("Refreshing…");

    const step = (n: number, msg: string) => {
      setLoadStep(`Step ${n}/3`);
      setLoadMsg(msg);
    };

    // Required for ngrok — without this header ngrok returns an HTML
    // interstitial warning page instead of JSON, breaking all API calls.
    const NGROK_HEADERS: Record<string, string> = {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    };

    try {
      /* STEP 1 — POST /reddit/fetch */
      step(1, "Fetching Reddit posts…");
      const fetchRes = await fetch(`${API_BASE}/reddit/fetch`, {
        method: "POST",
        headers: NGROK_HEADERS,
      });
      if (!fetchRes.ok) throw new Error(`Reddit fetch failed (HTTP ${fetchRes.status})`);
      const fetchData: FetchResponse = await fetchRes.json();

      /* STEP 2 — POST /gemini/verify */
      step(2, "Verifying with Gemini AI…");
      const verifyRes = await fetch(`${API_BASE}/gemini/verify`, {
        method: "POST",
        headers: NGROK_HEADERS,
        body: JSON.stringify({ fetch_id: fetchData.fetch_id }),
      });
      if (!verifyRes.ok) throw new Error(`Gemini verify failed (HTTP ${verifyRes.status})`);
      const verifyData: VerifyResponse = await verifyRes.json();

      /* STEP 3 — GET /disasters/stored */
      step(3, "Loading stored disasters…");
      const storedRes = await fetch(`${API_BASE}/disasters/stored?limit=100`, {
        headers: { "ngrok-skip-browser-warning": "true" },
      });
      if (!storedRes.ok) throw new Error(`Stored fetch failed (HTTP ${storedRes.status})`);
      const storedData: StoredResponse = await storedRes.json();

      setDisasters(storedData.posts);
      setActiveId(storedData.posts[0]?.reddit_id ?? null);
      setLastUpdated("Updated " + new Date().toLocaleTimeString());
      showToast(
        `✓ ${verifyData.total_saved} new · ${storedData.total} total disasters`,
        "success"
      );

    } catch (_err) {
      /* Fallback — try GET /disasters/stored only */
      try {
        const res = await fetch(`${API_BASE}/disasters/stored?limit=100`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        });
        if (!res.ok) throw new Error("Stored also failed");
        const data: StoredResponse = await res.json();
        setDisasters(data.posts);
        setActiveId(data.posts[0]?.reddit_id ?? null);
        setLastUpdated("Cached · " + new Date().toLocaleTimeString());
        showToast("⚠ Live fetch failed — showing stored data", "error");
      } catch {
        setApiError(
          `Cannot reach the API at ${API_BASE}.\n\nMake sure the backend server is running.`
        );
        setLastUpdated("Offline");
        showToast("✗ API unreachable", "error");
      }
    } finally {
      setLoading(false);
      setSpinning(false);
    }
  }, [showToast]);

  /* Auto-load on mount */
  useEffect(() => { loadDisasters(); }, [loadDisasters]);

  /* ── Dynamic type list for filter dropdown ── */
  const disasterTypes = Array.from(
    new Set(disasters.map((d) => d.disaster_type).filter(Boolean))
  ).sort();

  /* ── Filter + sort ── */
  const filteredDisasters = disasters
    .filter((d) => {
      if (typeFilter     && d.disaster_type              !== typeFilter)           return false;
      if (categoryFilter && d.ai_analysis?.category      !== categoryFilter)       return false;
      if (urgencyFilter  && (d.ai_analysis?.urgency ?? 0) < Number(urgencyFilter)) return false;
      if (searchQuery) {
        const hay = [
          d.disaster_type, d.original_text, d.ai_analysis?.summary,
          d.location?.city, d.location?.state, d.location?.country,
        ].join(" ").toLowerCase();
        if (!hay.includes(searchQuery.toLowerCase())) return false;
      }
      return true;
    })
    .sort((a, b) => (b.ai_analysis?.urgency ?? 0) - (a.ai_analysis?.urgency ?? 0));

  const activeAlert  = filteredDisasters.find((d) => d.reddit_id === activeId) ?? filteredDisasters[0] ?? null;
  const mappedCount  = filteredDisasters.filter((d) => d.location?.coordinates?.lat).length;

  /* ── Summary stats ── */
  const totalCount    = disasters.length;
  const criticalCount = disasters.filter((d) => (d.ai_analysis?.urgency ?? 0) === 5).length;
  const rescueCount   = disasters.filter((d) => d.ai_analysis?.category === "Rescue").length;
  const mappedTotal   = disasters.filter((d) => d.location?.coordinates?.lat).length;

  const clearFilters = () => {
    setCategoryFilter(""); setTypeFilter(""); setUrgencyFilter(""); setSearchQuery("");
  };

  const goToDetails = (d: DisasterDocument) => navigate("/details", { state: d });

  /* ── Render ── */
  return (
    <div className="dw-shell">

      {/* ── HEADER ── */}
      <header className="dw-header">
        <div className="dw-logo">
          <div className="dw-logo-mark">⚠</div>
          <div>
            <div className="dw-logo-text">Disaster Control Room</div>
            <div className="dw-logo-sub">Live Global Monitor</div>
          </div>
        </div>

        <div className="dw-header-right">
          <div className="dw-live-pill">
            <div className="dw-live-dot" />
            Live
          </div>

          <span className="dw-last-updated">{lastUpdated}</span>

          <button
            className={`dw-refresh-btn${spinning ? " spinning" : ""}`}
            onClick={loadDisasters}
            title="Refresh"
            disabled={loading}
          >
            ↻
          </button>

          {/* Profile */}
          <div
            className="dw-profile-wrap"
            onMouseEnter={() => setShowProfilePopup(true)}
            onMouseLeave={() => setShowProfilePopup(false)}
          >
            <div className="dw-profile-icon">👤</div>
            {showProfilePopup && (
              <div ref={popupRef} className="dw-profile-popup">
                <p><strong>Role:</strong> Disaster Management Authority Officer</p>
                <p><strong>Official ID:</strong> DMA-001</p>
              </div>
            )}
          </div>

          <button className="dw-signout-btn" onClick={() => navigate("/")}>
            Sign Out
          </button>
        </div>
      </header>

      {/* ── LAYOUT ── */}
      <div className="dw-layout">

        {/* ── LEFT PANEL ── */}
        <div className="dw-left">

          {/* Stats bar */}
          <div className="dw-stats">
            <div className="dw-stat">
              <span className="dw-stat-num" style={{ color: "var(--dw-text)" }}>{totalCount}</span>
              <span className="dw-stat-lbl">Total</span>
            </div>
            <div className="dw-stat">
              <span className="dw-stat-num" style={{ color: "var(--dw-accent)" }}>{criticalCount}</span>
              <span className="dw-stat-lbl">Critical</span>
            </div>
            <div className="dw-stat">
              <span className="dw-stat-num" style={{ color: "var(--dw-blue)" }}>{rescueCount}</span>
              <span className="dw-stat-lbl">Rescue</span>
            </div>
            <div className="dw-stat">
              <span className="dw-stat-num" style={{ color: "var(--dw-green)" }}>{mappedTotal}</span>
              <span className="dw-stat-lbl">Mapped</span>
            </div>
          </div>

          {/* Filters */}
          <div className="dw-filters">
            <input
              className="dw-filter-search"
              placeholder="🔍  Search disasters, locations…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="dw-filter-row">
              {/* Dynamic type list populated from real API data */}
              <select
                className="dw-filter-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All types</option>
                {disasterTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              <select
                className="dw-filter-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All categories</option>
                <option value="Rescue">Rescue</option>
                <option value="Relief">Relief</option>
                <option value="Damage">Damage</option>
                <option value="Warning">Warning</option>
                <option value="Casualty">Casualty</option>
              </select>
            </div>

            <div className="dw-filter-row">
              <select
                className="dw-filter-select"
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
              >
                <option value="">Any urgency</option>
                <option value="5">5 — Critical</option>
                <option value="4">4+ — High</option>
                <option value="3">3+ — Medium</option>
                <option value="2">2+ — Low</option>
              </select>
              <button className="dw-clear-btn" onClick={clearFilters}>Clear all</button>
            </div>
          </div>

          {/* Card list */}
          <div className="dw-card-list">

            {/* API error */}
            {apiError && !loading && (
              <div className="dw-error-state">
                ⚠ {apiError.split("\n\n")[0]}
                <small>{apiError.split("\n\n")[1]}</small>
              </div>
            )}

            {/* Loading spinner with step indicator */}
            {loading && (
              <div className="dw-loading-state">
                <div className="dw-loader-ring" />
                <div className="dw-loading-text">
                  <span className="dw-loading-step">{loadStep}</span>
                  {loadMsg}
                </div>
              </div>
            )}

            {/* Empty after filter */}
            {!loading && !apiError && filteredDisasters.length === 0 && disasters.length > 0 && (
              <div className="dw-empty">
                No disasters match your filters.
                <span style={{ fontSize: "0.62rem", color: "var(--dw-muted)", marginTop: 4 }}>
                  Try clearing the filters.
                </span>
              </div>
            )}

            {/* Disaster cards */}
            {!loading && filteredDisasters.map((d, i) => {
              const ai       = d.ai_analysis;
              const u        = ai?.urgency ?? 1;
              const uc       = urgencyColor(u);
              const catStyle = ai?.category ? CAT_STYLE[ai.category] : null;
              const isActive = activeId === d.reddit_id;
              const locStr   = formatLocString(d.location);
              const icon     = getDisasterIcon(d.disaster_type);

              return (
                <div
                  key={d.reddit_id}
                  className={`dw-card${isActive ? " active" : ""}`}
                  style={{ animationDelay: `${Math.min(i * 0.04, 0.5)}s` }}
                  onClick={() => setActiveId(d.reddit_id)}
                >
                  <div className="dw-card-header">
                    <div
                      className="dw-card-icon"
                      style={{ background: `${uc}18`, border: `1px solid ${uc}40` }}
                    >
                      {icon}
                    </div>

                    <div className="dw-card-title-wrap">
                      <span className="dw-card-type-label">{d.disaster_type}</span>
                      <div className="dw-card-title">
                        {d.original_text.length > 110
                          ? d.original_text.substring(0, 110) + "…"
                          : d.original_text}
                      </div>
                    </div>

                    {ai?.urgency && (
                      <div
                        className="dw-urgency-badge"
                        style={{ background: `${uc}20`, color: uc, border: `1.5px solid ${uc}55` }}
                      >
                        {ai.urgency}
                      </div>
                    )}
                  </div>

                  <div className="dw-card-meta">
                    {catStyle && ai?.category && (
                      <span
                        className="dw-cat-pill"
                        style={{
                          background: catStyle.bg,
                          color: catStyle.color,
                          border: `1px solid ${catStyle.border}`,
                        }}
                      >
                        {ai.category}
                      </span>
                    )}
                    {locStr && <span className="dw-meta-chip">📍 {locStr}</span>}
                    {ai?.credibility && (
                      <span
                        className="dw-meta-chip"
                        style={{ color: CRED_COLOR[ai.credibility] ?? "var(--dw-muted2)" }}
                      >
                        ● {ai.credibility}
                      </span>
                    )}
                    {d.created_at && (
                      <span className="dw-meta-chip" style={{ marginLeft: "auto" }}>
                        {formatRelTime(d.created_at)}
                      </span>
                    )}
                  </div>

                  {ai?.summary && (
                    <div className="dw-card-summary">{ai.summary}</div>
                  )}

                  <button
                    className="dw-details-link"
                    onClick={(e) => { e.stopPropagation(); goToDetails(d); }}
                  >
                    Show Details →
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── MAP ── */}
        <div className="dw-map-wrap">
          <div className="dw-map-inner">
            <MapContainer
              center={[20, 10]}
              zoom={2}
              scrollWheelZoom
              zoomControl
              style={{ height: "100%", width: "100%" }}
            >
              <MapResizer />
              <FlyToAlert alert={activeAlert} />

              <TileLayer
                attribution="© OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {filteredDisasters
                .filter((d) => d.location?.coordinates?.lat && d.location?.coordinates?.lng)
                .map((d) => {
                  const ai       = d.ai_analysis;
                  const u        = ai?.urgency ?? 1;
                  const isActive = activeId === d.reddit_id;
                  const locStr   = formatLocString(d.location);
                  const cat      = ai?.category ?? "";
                  const catStyle = CAT_STYLE[cat];

                  return (
                    <Marker
                      key={d.reddit_id}
                      position={[d.location!.coordinates!.lat, d.location!.coordinates!.lng]}
                      icon={makeMarkerIcon(u, d.disaster_type, isActive)}
                      eventHandlers={{ click: () => setActiveId(d.reddit_id) }}
                    >
                      <Popup>
                        <div className="dw-popup">
                          <div className="dw-popup-type">{d.disaster_type}</div>
                          <div className="dw-popup-title">
                            {d.original_text.length > 100
                              ? d.original_text.substring(0, 100) + "…"
                              : d.original_text}
                          </div>
                          {locStr && <div className="dw-popup-loc">📍 {locStr}</div>}
                          {cat && catStyle && (
                            <div style={{ marginBottom: 6 }}>
                              <span
                                className="dw-cat-pill"
                                style={{
                                  background: catStyle.bg,
                                  color: catStyle.color,
                                  border: `1px solid ${catStyle.border}`,
                                }}
                              >
                                {cat}
                              </span>
                            </div>
                          )}
                          {ai?.summary && (
                            <div className="dw-popup-summary">{ai.summary}</div>
                          )}
                          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
                            <button
                              className="dw-popup-details-btn"
                              onClick={() => goToDetails(d)}
                            >
                              Show Details →
                            </button>
                            <a
                              href={d.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="dw-source-link"
                            >
                              Source ↗
                            </a>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
            </MapContainer>
          </div>

          <div className="dw-map-overlay">
            <div className="dw-map-pill">
              📍 <strong>{mappedCount}</strong> locations mapped
            </div>
            {filteredDisasters.length !== disasters.length && (
              <div className="dw-map-pill">
                🔍 <strong>{filteredDisasters.length}</strong> of {disasters.length} shown
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── TOAST ── */}
      <div
        className={`dw-toast${toast.visible ? " show" : ""}${toast.type ? " " + toast.type : ""}`}
      >
        {toast.msg}
      </div>

    </div>
  );
};

export default Dashboard;
