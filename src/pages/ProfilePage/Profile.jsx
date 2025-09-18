// src/pages/Profile/Profile.jsx
import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import { getUserProfile } from "./userService";
import { AuthContext } from "../../context/AuthContext";

function Profile() {
  const { user, logout } = useContext(AuthContext);
  const { userId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getUserProfile(userId);
        setProfile(data);
      } catch (err) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading)
    return <p className="text-center mt-16 text-gray-500">Loading profile...</p>;
  if (error)
    return <p className="text-center mt-16 text-red-600 font-medium">{error}</p>;
  if (!profile)
    return <p className="text-center mt-16 text-gray-600">No profile found</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Profile Header */}
      <div className="flex items-center justify-between bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-center gap-6">
          <img
            src={profile.profilePicture || "/default-avatar.png"}
            alt={profile.fullName}
            className="w-28 h-28 rounded-full border-2 border-gray-200 shadow-md object-cover"
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {profile.fullName}
            </h2>
            <p className="text-gray-500 text-sm">@{profile.userName}</p>
            {profile.displayName && (
              <p className="text-gray-600 italic mt-1">{profile.displayName}</p>
            )}
          </div>
        </div>

        {/* 🚀 Logout button (only for own profile) */}
        {user && user._id === profile._id && (
          <Button
            text="Logout"
            styleType="error"
            onClickHandler={handleLogout}
            className="px-5 py-2 rounded-lg shadow-sm"
          />
        )}
      </div>

      {/* Details Card */}
      <div className="mt-8 bg-white rounded-2xl shadow-md p-8 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Profile Details
        </h3>
        <div className="space-y-3 text-gray-700">
          <p>
            <span className="font-medium">📧 Email:</span> {profile.email}
          </p>
          {profile.mobileNumber && (
            <p>
              <span className="font-medium">📱 Mobile:</span>{" "}
              {profile.mobileNumber}
            </p>
          )}
          <p>
            <span className="font-medium">👤 Role:</span> {profile.role}
          </p>
          <p>
            <span className="font-medium">✅ Verified:</span>{" "}
            {profile.isVerified ? (
              <span className="text-green-600 font-semibold">Yes</span>
            ) : (
              <span className="text-red-600 font-semibold">No</span>
            )}
          </p>
        </div>
      </div>

      {/* Action Buttons (only for other users' profiles) */}
      {user && user._id !== profile._id && (
        <div className="mt-8 flex gap-4">
          <Button
            text="Follow / Unfollow"
            styleType="primary"
            onClickHandler={() => alert("Toggle follow")}
            className="px-5 py-2 rounded-lg shadow-sm"
          />
          <Button
            text="Message"
            styleType="secondary"
            onClickHandler={() => alert("Open chat")}
            className="px-5 py-2 rounded-lg shadow-sm"
          />
        </div>
      )}
    </div>
  );
}

export default Profile;
