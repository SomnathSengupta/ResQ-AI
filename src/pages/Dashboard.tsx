import { useState, useEffect, useRef } from "react";
import { User } from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import { useNavigate } from "react-router-dom";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

/* Leaflet Fix */
(L.Icon.Default.prototype as any)._getIconUrl = undefined;

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/* ---------------- TYPES ---------------- */
interface DisasterAlert {
  id: number;
  location: string;
  lat: number;
  lng: number;
  category: "Rescue" | "Medical";
  urgency: number;
  credibility: "High" | "Medium" | "Low";
  reason: string;
  affectedPeople: number;
  obstacle: string;
}

/* ---------------- SAMPLE DATA ---------------- */
const initialAlerts: DisasterAlert[] = [
  {
    id: 1,
    location: "Kolkata",
    lat: 22.5726,
    lng: 88.3639,
    category: "Rescue",
    urgency: 5,
    credibility: "High",
    reason: "Severe flooding",
    affectedPeople: 120,
    obstacle: "Flood Water",
  },
  {
    id: 2,
    location: "Mumbai",
    lat: 19.076,
    lng: 72.8777,
    category: "Medical",
    urgency: 4,
    credibility: "Medium",
    reason: "Building collapse",
    affectedPeople: 45,
    obstacle: "Debris Blockage",
  },
];

/* ---------------- COMPONENT ---------------- */

const Dashboard = () => {
  const [alerts, setAlerts] = useState<DisasterAlert[]>(initialAlerts);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [urgencyFilter, setUrgencyFilter] = useState("All");

  const [profile] = useState({
    officerId: "DMA-001",
    role: "Disaster Management Authority Officer",
  });

  const [showProfilePopup, setShowProfilePopup] = useState(false);

  const popupRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  /* ---- Real-Time Simulation ---- */

  useEffect(() => {
    const interval = setInterval(() => {
      const newAlert: DisasterAlert = {
        id: Date.now(),
        location: "Delhi",
        lat: 28.6139,
        lng: 77.209,
        category: Math.random() > 0.5 ? "Rescue" : "Medical",
        urgency: Math.floor(Math.random() * 3) + 3,
        credibility: "High",
        reason: "New emergency detected",
        affectedPeople: Math.floor(Math.random() * 200),
        obstacle: "Road Block / Water Logging",
      };

      setAlerts((prev) => [...prev, newAlert]);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  /* ---- FILTER LOGIC ---- */

  const filteredAlerts = alerts.filter((alert) => {
    const categoryMatch =
      categoryFilter === "All" || alert.category === categoryFilter;

    const urgencyMatch =
      urgencyFilter === "All" ||
      alert.urgency === Number(urgencyFilter);

    return categoryMatch && urgencyMatch;
  });

  const sortedAlerts = [...filteredAlerts].sort(
    (a, b) => b.urgency - a.urgency
  );

  /* ---- SUMMARY COUNTS ---- */

  const rescueCount = alerts.filter(
    (a) => a.category === "Rescue"
  ).length;

  const medicalCount = alerts.filter(
    (a) => a.category === "Medical"
  ).length;

  const highUrgencyCount = alerts.filter(
    (a) => a.urgency >= 4
  ).length;

  const lowCredibilityCount = alerts.filter(
    (a) => a.credibility === "Low"
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 p-8">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-3xl font-bold text-slate-800">
          Disaster Control Room
        </h1>

        <div className="flex items-center gap-4">

          <div
            className="relative"
            onMouseEnter={() => setShowProfilePopup(true)}
            onMouseLeave={() => setShowProfilePopup(false)}
          >

            {<User />}

            {showProfilePopup && (
              <div
                ref={popupRef}
                className="absolute right-0 mt-3 w-[260px] bg-white p-4 rounded-xl shadow-lg z-[9999]"
              >
                <p className="text-sm">
                  <strong>Category:</strong> {profile.role}
                </p>

                <p className="text-sm">
                  <strong>Official ID:</strong> {profile.officerId}
                </p>
              </div>
            )}

          </div>

          <button
            onClick={() => navigate("/")}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Sign Out
          </button>

        </div>

      </div>

      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

        <div className="bg-orange-500 text-white p-6 rounded-xl shadow-lg">
          <p className="text-sm opacity-80">Rescue Needed</p>
          <h2 className="text-3xl font-bold">{rescueCount}</h2>
        </div>

        <div className="bg-pink-500 text-white p-6 rounded-xl shadow-lg">
          <p className="text-sm opacity-80">Medical Cases</p>
          <h2 className="text-3xl font-bold">{medicalCount}</h2>
        </div>

        <div className="bg-red-900 text-white p-6 rounded-xl shadow-lg">
          <p className="text-sm opacity-80">High Urgency Alerts</p>
          <h2 className="text-3xl font-bold">{highUrgencyCount}</h2>
        </div>

        <div className="bg-green-500 text-white p-6 rounded-xl shadow-lg">
          <p className="text-sm opacity-80">Low Credibility Alerts</p>
          <h2 className="text-3xl font-bold">{lowCredibilityCount}</h2>
        </div>

      </div>

      {/* FILTER */}

      <div className="flex gap-4 mb-8">

        <select
          value={categoryFilter}
          className="p-2 rounded border"
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="Rescue">Rescue</option>
          <option value="Medical">Medical</option>
        </select>

        <select
          value={urgencyFilter}
          className="p-2 rounded border"
          onChange={(e) => setUrgencyFilter(e.target.value)}
        >
          <option value="All">All Urgency</option>
          <option value="5">5</option>
          <option value="4">4</option>
          <option value="3">3</option>
        </select>

      </div>

      {/* MAP */}

      <div className="bg-white p-6 rounded-xl shadow mb-8">

        <h2 className="text-xl font-semibold mb-4">
          Live Disaster Map
        </h2>

        <MapContainer
          center={[22.5726, 88.3639]}
          zoom={5}
          style={{ height: "350px", width: "100%" }}
        >

          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {alerts.map((alert) => {

            const customIcon = L.divIcon({
              html: `<div style="
                background-color: ${
                  alert.category === "Rescue" ? "orange" : "pink"
                };
                width:18px;
                height:18px;
                border-radius:50%;
                border:2px solid white;
              "></div>`
            });

            return (
              <Marker
                key={alert.id}
                position={[alert.lat, alert.lng]}
                icon={customIcon}
              >

                <Popup>

                  <div className="space-y-1">

                    <h3 className="font-bold text-lg">
                      {alert.location}
                    </h3>

                    <p>
                      <strong>Category:</strong> {alert.category}
                    </p>

                    <p>
                      <strong>Urgency:</strong> {alert.urgency}
                    </p>

                    <p>
                      <strong>Affected People:</strong> {alert.affectedPeople}
                    </p>

                    <p>
                      <strong>Obstacle:</strong> {alert.obstacle}
                    </p>

                  </div>

                </Popup>

              </Marker>
            );
          })}

        </MapContainer>

      </div>

      {/* TABLE */}

      <div className="bg-white p-8 rounded-xl shadow">

        <div className="overflow-x-auto">

          <table className="w-full border-collapse">

            <thead>
              <tr className="bg-slate-100 text-left text-sm text-slate-600">

                <th className="p-4">Location</th>
                <th className="p-4">Category</th>
                <th className="p-4">Urgency</th>
                <th className="p-4">Credibility</th>
                <th className="p-4">Action</th>

              </tr>
            </thead>

            <tbody>

              {sortedAlerts.map((alert) => {

                let categoryDot = "";
                let credibilityDot = "";

                if (alert.category === "Rescue") {
                  categoryDot = "bg-orange-500";
                }

                if (alert.category === "Medical") {
                  categoryDot = "bg-pink-500";
                }

                if (alert.credibility === "High") {
                  credibilityDot = "bg-red-600";
                }

                if (alert.credibility === "Medium") {
                  credibilityDot = "bg-yellow-500";
                }

                if (alert.credibility === "Low") {
                  credibilityDot = "bg-green-500";
                }

                return (
                  <tr
                    key={alert.id}
                    className="border-b hover:bg-slate-50 transition"
                  >

                    <td className="p-4 font-medium">
                      {alert.location}
                    </td>

                    <td className="p-4 flex items-center gap-2">

                      <span
                        className={`w-3 h-3 rounded-full ${categoryDot}`}
                      ></span>

                      {alert.category}

                    </td>

                    <td className="p-4">
                      {alert.urgency}
                    </td>

                    <td className="p-4">

                      <div className="flex items-center gap-2">

                        <span
                          className={`w-3 h-3 rounded-full ${credibilityDot}`}
                        ></span>

                        {alert.credibility}

                      </div>

                    </td>

                    <td className="p-4">

                      <button
                        onClick={() =>
                          window.alert(
`Location: ${alert.location}
Category: ${alert.category}
Urgency: ${alert.urgency}
Affected People: ${alert.affectedPeople}
Obstacle: ${alert.obstacle}`
                          )
                        }
                        className="bg-blue-600 text-white px-4 py-1 rounded-md text-sm hover:bg-blue-700 transition"
                      >
                        Show Details
                      </button>

                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;