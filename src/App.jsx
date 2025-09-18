// App.jsx
import { Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import Home from './pages/Home/Home';
import Navbar from './pages/Navbar/Navbar';
import Login from './pages/LoginPage/Login';
import ProtectedRoute from './components/Routes/ProtectedRoute';
import Profile from './pages/ProfilePage/Profile';
import Register from './pages/RegiseterPage/Register';

function App() {
  const location = useLocation();

  // ❌ Old: Only homepage
  // const showNavbar = location.pathname === '/';

  // ✅ New: Hide only on login page
  const hideNavbar = location.pathname === '/login';

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path='/register' element={<Register />} />
      </Routes>

    </>
  );
}

export default App;
