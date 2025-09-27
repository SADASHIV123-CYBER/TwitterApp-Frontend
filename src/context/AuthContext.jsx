import {  useState, useEffect } from "react";
import { client } from "../api/client";
import { AuthContext } from "./context";


export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verify login on app load
  useEffect(() => {
    const verifyLogin = async () => {
      try {
        const res = await client.get("/verify"); // ✅ cookie will be sent
        if (res.data.success) setUser(res.data.user);
        else setUser(null);
      } catch (err) {
        console.log(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verifyLogin();
  }, []);

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
