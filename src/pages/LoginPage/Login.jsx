import { useState, useContext } from "react";
import axios from "axios";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1) Login
      const loginRes = await axios.post("/api/v1/auth", form, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("loginRes:", loginRes.status, loginRes.data);

      // 2) Verify user
      const verifyRes = await axios.get("/api/v1/verify");
      console.log("verifyRes:", verifyRes.status, verifyRes.data);

      if (verifyRes?.data?.success && verifyRes.data.user) {
        setUser(verifyRes.data.user);
        navigate(`/`);
        return;
      }

      setError(verifyRes?.data?.message || "Unable to verify user after login");
    } catch (err) {
      console.error("Login flow error:", err?.response || err);
      const serverMsg = err?.response?.data?.message;
      if (serverMsg) {
        setError(serverMsg);
      } else if (err?.response?.status === 401) {
        setError("Unauthorized — invalid credentials or token.");
      } else {
        setError("Invalid email or password. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            required
          />

          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          <Button
            text={loading ? "Logging in..." : "Login"}
            type="submit"
            styleType="primary"
            disabled={loading}
            className="w-full"
          />
        </form>

        {/* 🔹 Register link */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-blue-600 hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
