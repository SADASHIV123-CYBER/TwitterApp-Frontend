// src/components/Navbar/Navbar.jsx
import { memo, useContext, useEffect, useCallback, useMemo } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { Twitter, Home, Users, Search } from "lucide-react";
import axios from "axios";

function NavbarComponent() {
  const { user } = useContext(AuthContext);

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get(
        "https://twitterapp-backend-85c9.onrender.com/ping"
      );
      console.log("API response:", response.data);
    } catch (error) {
      console.error("Error fetching API:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const networkLink = useMemo(() => {
    return user ? `/followList?tab=followers&userId=${user._id}` : "/login";
  }, [user]);

  const profileLink = useMemo(() => {
    return user ? `/profile/${user._id}` : "/login";
  }, [user]);

  return (
    <nav className="sticky top-0 z-50 w-full bg-gradient-to-r from-yellow-100 via-yellow-200 to-yellow-300 shadow-lg px-4 sm:px-8 py-3 flex items-center justify-between h-16 backdrop-blur-md">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <Twitter className="text-yellow-600 w-8 h-8" />
        <span className="text-lg sm:text-xl font-bold text-gray-800 hidden sm:block">
          TwitterX
        </span>
      </Link>

      {/* Search bar */}
      <div className="mx-4 flex-1 max-w-xs sm:max-w-md hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-3 h-10 border border-yellow-300 rounded-full text-sm focus:ring-2 focus:ring-yellow-400 focus:outline-none bg-white/80 backdrop-blur-sm placeholder-gray-500 transition"
          />
        </div>
      </div>

      {/* Links */}
      <div className="flex items-center gap-6 sm:gap-8 text-gray-700">
        {/* Home */}
        <Link
          to="/"
          className="flex flex-col items-center hover:text-yellow-700 transition"
        >
          <Home className="w-6 h-6" />
          <span className="hidden sm:block text-xs mt-1">Home</span>
        </Link>

        {/* Network */}
        <Link
          to={networkLink}
          className="flex flex-col items-center hover:text-yellow-700 transition"
        >
          <Users className="w-6 h-6" />
          <span className="hidden sm:block text-xs mt-1">Network</span>
        </Link>

        {/* Profile / Login */}
        {user ? (
          <Link
            to={profileLink}
            className="flex flex-col items-center hover:text-yellow-700 transition"
          >
            <img
              src={user.profilePicture || "/default-avatar.png"}
              alt="profile"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover shadow-md border-2 border-yellow-300 transition-transform hover:scale-105"
            />
            <span className="hidden sm:block text-xs mt-1">Me</span>
          </Link>
        ) : (
          <Link
            to="/login"
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-yellow-400 text-white text-sm rounded-full hover:bg-yellow-500 transition shadow-md"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

const Navbar = memo(NavbarComponent);

export default Navbar;
