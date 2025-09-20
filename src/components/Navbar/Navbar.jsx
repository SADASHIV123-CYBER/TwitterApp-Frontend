import { useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { Twitter, Home, Users, Search } from "lucide-react";
import axios from "axios";

function Navbar() {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("https://twitterapp-backend-85c9.onrender.com/ping");
        console.log("API response:", response.data);
      } catch (error) {
        console.error("Error fetching API:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white shadow-md px-8 py-3 flex items-center justify-between h-16">
      <Link to="/">
        <div className="flex items-center space-x-2">
          <Twitter className="text-sky-500 w-8 h-8" />
          <span className="text-xl font-bold text-gray-800 hidden sm:block">TwitterX</span>
        </div>
      </Link>

      <div className="mx-6 flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          <input type="text" placeholder="Search..." className="w-full pl-10 pr-3 h-10 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none" />
        </div>
      </div>

      <div className="flex items-center space-x-8 text-gray-600">
        <Link to="/" className="flex flex-col items-center hover:text-sky-500 transition">
          <Home className="w-6 h-6" />
          <span className="text-xs mt-1">Home</span>
        </Link>

        {user ? (
          <Link to={`/followList?tab=followers&userId=${user._id}`} className="flex flex-col items-center hover:text-sky-500 transition">
            <Users className="w-6 h-6" />
            <span className="text-xs mt-1">Network</span>
          </Link>
        ) : (
          <Link to="/login" className="flex flex-col items-center hover:text-sky-500 transition">
            <Users className="w-6 h-6" />
            <span className="text-xs mt-1">Network</span>
          </Link>
        )}

        {user ? (
          <Link to={`/profile/${user._id}`} className="flex flex-col items-center hover:text-sky-500 transition">
            <img src={user.profilePicture || "/default-avatar.png"} alt="profile" className="w-10 h-10 rounded-full object-cover shadow-md" />
            <span className="text-xs mt-1">Me</span>
          </Link>
        ) : (
          <Link to="/login" className="px-4 py-2 bg-sky-500 text-white text-sm rounded-full hover:bg-sky-600 transition">Login</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
