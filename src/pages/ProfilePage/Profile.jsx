import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import { getUserProfile, toggleFollowService } from "./userService";
import { AuthContext } from "../../context/AuthContext";
import Card from "../../components/Card/Card";

function Profile() {
  const { user, loading: authLoading, logout } = useContext(AuthContext);
  const { userId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!userId) return;

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

  const handleToggleFollow = async () => {
    if (!profile) return;
    setFollowLoading(true);
    try {
      const result = await toggleFollowService(profile._id);
      setProfile((prev) => ({
        ...prev,
        followerCount: result.followerCount,
        followingCount: result.followingCount,
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setFollowLoading(false);
    }
  };

  if (authLoading || loading) {
    return <p className="text-center mt-16 text-gray-500">Loading...</p>;
  }

  if (error) {
    return <p className="text-center mt-16 text-red-600 font-medium">{error}</p>;
  }

  if (!profile) {
    return <p className="text-center mt-16 text-gray-600">No profile found</p>;
  }

  const isOwnProfile = user && user._id === profile._id;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Profile Header */}
      <Card className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <img
            src={profile.profilePicture || "/default-avatar.png"}
            alt={profile.fullName}
            className="w-28 h-28 rounded-full border-2 border-gray-200 shadow-md object-cover hover:scale-105 transition-transform duration-300"
          />
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{profile.fullName}</h2>
            <p className="text-gray-500 text-sm">@{profile.userName}</p>
            {profile.displayName && (
              <p className="text-gray-600 italic mt-1">{profile.displayName}</p>
            )}
          </div>
        </div>

        {isOwnProfile && (
          <Button
            text="Logout"
            styleType="error"
            onClickHandler={handleLogout}
            className="px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 mt-4 md:mt-0"
          />
        )}
      </Card>

      {/* Stats Cards */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="text-center">
          <p className="text-gray-500 text-sm">Followers</p>
          <p className="text-2xl font-bold">{profile.followerCount}</p>
        </Card>
        <Card className="text-center">
          <p className="text-gray-500 text-sm">Following</p>
          <p className="text-2xl font-bold">{profile.followingCount}</p>
        </Card>
        <Card className="text-center">
          <p className="text-gray-500 text-sm">Role</p>
          <p className="text-2xl font-bold">{profile.role}</p>
        </Card>
      </div>

      {/* Profile Details */}
      <Card className="mt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Profile Details</h3>
        <div className="space-y-3 text-gray-700">
          <p><span className="font-medium">Email:</span> {profile.email}</p>
          {profile.mobileNumber && <p><span className="font-medium">Mobile:</span> {profile.mobileNumber}</p>}
          <p>
            <span className="font-medium">Verified:</span>{" "}
            {profile.isVerified ? (
              <span className="text-green-600 font-semibold">Yes</span>
            ) : (
              <span className="text-red-600 font-semibold">No</span>
            )}
          </p>
        </div>
      </Card>

      {/* Actions */}
      {!isOwnProfile && (
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Button
            text={followLoading ? "Loading..." : "Follow / Unfollow"}
            styleType="primary"
            onClickHandler={handleToggleFollow}
            className="px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            disabled={followLoading}
          />
          <Button
            text="Message"
            styleType="secondary"
            onClickHandler={() => alert("Open chat")}
            className="px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
          />
        </div>
      )}
    </div>
  );
}

export default Profile;
