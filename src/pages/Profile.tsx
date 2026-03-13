import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
const Profile = () => {
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    officerId: "",
    image: "",
    password: "",
    role: "",
  });
  
  const [showPopup1, setShowPopup1] = useState(false);
  const [showPopup2, setShowPopup2] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  // Load profile
  useEffect(() => {
    const saved = localStorage.getItem("officerProfile");
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  // Image upload
  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setProfile({ ...profile, image: imageURL });
    }
  };

  // Save profile
  const handleSave = () => {
    const updatedProfile = {
      ...profile,
      password: newPassword || profile.password,
    };

    setProfile(updatedProfile);
    localStorage.setItem("officerProfile", JSON.stringify(updatedProfile));

    setNewPassword("");
    setShowEditPopup(false);
    alert("Profile Updated Successfully!");
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("officerProfile");
  const navigate = useNavigate();
  navigate("/login");
  };

  return (
    <div className="relative">

      {/* Profile Avatar */}
      <img
        src={profile.image || "https://via.placeholder.com/50"}
        className="w-14 h-14 rounded-full object-cover cursor-pointer border-2 border-white shadow"
        onClick={() => {
          setShowPopup1(!showPopup1);
          setShowPopup2(false);
        }}
      />

      {/* POPUP LIST 1 */}
      {showPopup1 && (
        <div className="absolute right-0 mt-3 w-[250px] bg-white p-4 rounded-xl shadow-xl z-[9999]">

          <div className="text-center">
            <img
              src={profile.image || "https://via.placeholder.com/80"}
              className="w-16 h-16 rounded-full mx-auto object-cover"
            />
            <p className="font-medium mt-2">
              {profile.name || "Officer"}
            </p>
          </div>

          <button
            onClick={() => setShowPopup2(!showPopup2)}
            className="w-full mt-3 bg-gray-200 py-2 rounded hover:bg-gray-300"
          >
            More Options
          </button>

          {/* POPUP LIST 2 */}
          {showPopup2 && (
            <div className="mt-3 bg-gray-100 p-3 rounded space-y-2">

              <button
                onClick={() => {
                  setShowPopup1(false);
                  setShowPopup2(false);
                  setShowEditPopup(true);
                }}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Edit Profile
              </button>

              <button
                onClick={() => setConfirmLogout(true)}
                className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
              >
                Sign Out
              </button>

            </div>
          )}
        </div>
      )}

      {/* EDIT PROFILE POPUP */}
      {showEditPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
          <div className="bg-white p-6 rounded-xl shadow-lg space-y-3 w-[350px]">

            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="text-sm"
            />

            <input
              type="text"
              placeholder="Officer ID"
              value={profile.officerId}
              onChange={(e) =>
                setProfile({ ...profile, officerId: e.target.value })
              }
              className="w-full p-2 border rounded"
            />

            <input
              type="text"
              placeholder="Phone"
              value={profile.phone}
              onChange={(e) =>
                setProfile({ ...profile, phone: e.target.value })
              }
              className="w-full p-2 border rounded"
            />

            {/* Password Section */}
            <div className="bg-gray-100 p-2 rounded text-sm flex justify-between items-center">
              <span>
                <strong>Password:</strong>{" "}
                {showPassword
                  ? profile.password || "Not Set"
                  : "••••••"}
              </span>

              <button
                onClick={() => setShowPassword(!showPassword)}
                className="text-blue-600 text-xs"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border rounded"
            />

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                Save
              </button>

              <button
                onClick={() => setShowEditPopup(false)}
                className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}
    
      {/* Logout Confirmation */}
      {confirmLogout && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center space-y-4 w-[300px]">
            <p className="font-medium">
              Are you sure you want to sign out?
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Sure
              </button>

              <button
                onClick={() => setConfirmLogout(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;