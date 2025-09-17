import axios from "axios";
import { Twitter, Home, Users, Search } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router-dom";


function Navbar() {

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://twitterapp-backend-85c9.onrender.com/ping');
        console.log('API response:', response.data); // actual data
      } catch (error) {
        console.error('Error fetching API:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <nav className="w-full bg-white shadow-sm px-4 flex items-center justify-between h-12">
      {/* Left Logo */}
      <div className="flex items-center">
        <Twitter className="text-sky-500 w-6 h-6" />
      </div>

      {/* Search Bar */}
      <div className="mx-4 w-64"> {/* fixed width instead of flex-1 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-9 pr-3 h-8 border border-gray-300 rounded-full text-sm focus:ring-1 focus:ring-sky-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Right Side Menu */}
      <div className="flex items-center space-x-5 text-gray-600">
        <button className="flex flex-col items-center hover:text-sky-500">
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </button>

        <button className="flex flex-col items-center hover:text-sky-500">
          <Users className="w-5 h-5" />
          <span className="text-[10px]">Network</span>
        </button>

        {/* Profile */}
        <div className="flex flex-col items-center cursor-pointer hover:text-sky-500">

          <Link to='/profile' >
          <img
            src=""
            alt="profile"
            className="w-7 h-7 rounded-full"


          />
          <span className="text-[10px]">Me</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
