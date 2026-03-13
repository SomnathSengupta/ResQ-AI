import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("Disaster Management Authority Officer");

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
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-[#dbe3ef] via-[#c7d4e5] to-[#aabbd1] overflow-hidden">

      <div className="relative rounded-2xl">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-400 to-blue-600 blur-xl opacity-60 animate-pulse" />

        <div className="relative w-[380px] bg-white/90 backdrop-blur-md rounded-2xl p-10 text-center">

          <h2 className="text-xl font-semibold text-slate-900 mb-2 tracking-wide">
            National Disaster Response Portal
          </h2>

          <p className="text-sm text-slate-500 mb-8">
            ResQAI Government Monitoring System
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Authentication Category */}
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-50 text-sm focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-600 transition"
            >
              <option>Disaster Management Authority Officer</option>
              <option>NGO Worker</option>
              <option>Emergency Response Team</option>
            </select>

            {/* Official ID */}
            <input
              type="text"
              placeholder="Official ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-50 text-sm focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-600 transition"
            />

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Secure Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-12 rounded-lg border border-slate-300 bg-slate-50 text-sm focus:outline-none focus:ring-4 focus:ring-blue-200 focus:border-blue-600 transition"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 text-white font-medium tracking-wide hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-400/40 transition"
            >
              Secure Login
            </button>

          </form>

          <div className="mt-6 text-xs text-slate-400">
            © 2026 Government of India | Disaster Control Authority
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;