import { useEffect, useState } from "react";
import axios from "axios";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        // ✅ Correct backend route
        const res = await axios.get(
          "https://twitterapp-backend-85c9.onrender.com/api/v1/user",
          { withCredentials: true } // sends authToken cookie
        );
        setUser(res.data.data); // adjust if your backend wraps differently
      } catch (err) {
        setError("Failed to load profile.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse">
        <div className="h-32 bg-gradient-to-r from-gray-300 to-gray-400"></div>
        <div className="flex items-center space-x-4 mt-6">
          <div className="w-24 h-24 rounded-full bg-gray-400"></div>
          <div>
            <div className="h-4 bg-gray-400 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-20"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!user) return <p className="text-center text-gray-500">No user found.</p>;

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
      <div className="p-6 relative">
        <div className="absolute -top-16 left-6">
          <img
            src={user.profilePicture || "https://via.placeholder.com/150"}
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 object-cover"
          />
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {user.fullName}
            {user.isVerified && <span className="ml-2 text-blue-500">✔️</span>}
          </h2>
          <p className="text-gray-500">@{user.userName}</p>
          <p className="mt-2 text-gray-700 dark:text-gray-300">{user.bio || "No bio available"}</p>

          <div className="flex gap-6 mt-4 text-gray-700 dark:text-gray-300">
            <span>
              <strong>{user.followers?.length || 0}</strong> Followers
            </span>
            <span>
              <strong>{user.following?.length || 0}</strong> Following
            </span>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Joined {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Profile;
