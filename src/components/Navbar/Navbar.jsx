// src/components/Navbar/Navbar.jsx
import { memo, useContext, useEffect, useCallback, useMemo } from "react";
import { AuthContext } from "../../context/context";
import { Link } from "react-router-dom";
import { Twitter, Home, Users, Search, Sun, Moon } from "lucide-react";
import axios from "axios";
import { ThemeContext } from "../../context/context";

function NavbarComponent() {
  const { user } = useContext(AuthContext);
  const { darkMode, toggleTheme } = useContext(ThemeContext);

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
    <nav
      className={`sticky top-0 z-50 w-full shadow-lg px-4 sm:px-8 py-3 flex items-center justify-between h-16 backdrop-blur-md transition-colors duration-500
      ${
        !darkMode
          ? "bg-gradient-to-r from-yellow-100 via-yellow-200 to-yellow-300"
          : "bg-gradient-to-r from-gray-800 via-gray-900 to-black"
      }`}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <Twitter
          className={`w-8 h-8 transition-colors ${
            darkMode ? "text-yellow-400" : "text-yellow-600"
          }`}
        />
        <span
          className={`text-lg sm:text-xl font-bold hidden sm:block transition-colors
          ${darkMode ? "text-gray-100" : "text-gray-800"}`}
        >
          TwitterX
        </span>
      </Link>

      {/* Search bar */}
      <div className="mx-4 flex-1 max-w-xs sm:max-w-md hidden sm:block">
        <div className="relative">
          <Search
            className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors
            ${darkMode ? "text-gray-400" : "text-gray-500"}`}
          />
          <input
            type="text"
            placeholder="Search..."
            className={`w-full pl-10 pr-3 h-10 rounded-full text-sm focus:ring-2 focus:outline-none transition
              ${
                darkMode
                  ? "bg-gray-800 text-gray-200 border border-gray-600 focus:ring-yellow-400 placeholder-gray-400"
                  : "bg-white/80 text-gray-800 border border-yellow-300 focus:ring-yellow-400 placeholder-gray-500 backdrop-blur-sm"
              }`}
          />
        </div>
      </div>

      {/* Links */}
      <div
        className={`flex items-center gap-6 sm:gap-8 transition-colors
        ${darkMode ? "text-gray-200" : "text-gray-700"}`}
      >
        {/* Home */}
        <Link
          to="/"
          className={`flex flex-col items-center transition ${
            darkMode ? "hover:text-yellow-400" : "hover:text-yellow-400"
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="hidden sm:block text-xs mt-1">Home</span>
        </Link>

        {/* Network */}
        <Link
          to={networkLink}
          className={`flex flex-col items-center transition ${
            darkMode ? "hover:text-yellow-400" : "hover:text-yellow-400"
          }`}
        >
          <Users className="w-6 h-6" />
          <span className="hidden sm:block text-xs mt-1">Network</span>
        </Link>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex flex-col items-center p-2 rounded-full transition hover:scale-110"
        >
          {darkMode ? (
            <Sun className="w-6 h-6 text-yellow-400" />
          ) : (
            <Moon className="w-6 h-6 text-gray-800" />
          )}
          <span className="hidden sm:block text-xs mt-1">
            {darkMode ? "Light" : "Dark"}
          </span>
        </button>

        {/* Profile / Login */}
        {user ? (
          <Link
            to={profileLink}
            className={`flex flex-col items-center transition ${
              darkMode ? "hover:text-yellow-400" : "hover:text-yellow-400"
            }`}
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
            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-sm rounded-full transition shadow-md ${
              darkMode
                ? "bg-yellow-400 text-gray-900 hover:bg-yellow-500"
                : "bg-yellow-400 text-white hover:bg-yellow-500"
            }`}
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
