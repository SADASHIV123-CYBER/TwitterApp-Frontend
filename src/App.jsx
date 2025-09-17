import { Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import Home from './pages/Home/Home';
import Login from './pages/LoginPage/Login';
import Register from './pages/RegiseterPage/Register';
import Navbar from './pages/Navbar/Navbar';

function App() {
  const location = useLocation();

  // Show navbar only on home page
  const showNavbar = location.pathname === '/';

  return (
    <>
      {showNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
}

export default App;
