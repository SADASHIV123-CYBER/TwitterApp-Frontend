import { useState } from "react";
import axios from "axios";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!form.email || !form.password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "https://twitterapp-backend-85c9.onrender.com/api/v1/auth",
        form,
        { withCredentials: true }
      );

      // ✅ save token in localStorage if backend sends token
      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
      }

      setMessage(response.data.message || "Logged in successfully ✅");
      navigate("/"); // redirect to home after login
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex flex-col md:flex-row bg-white shadow-lg rounded-lg overflow-hidden max-w-4xl w-full">
        
        {/* Left Side - Info / Image */}
        <div className="hidden md:flex md:flex-col justify-center items-center bg-blue-500 text-white md:w-1/2 p-10">
          <h2 className="text-4xl font-bold mb-6">Welcome Back!</h2>
          <p className="text-lg">
            Sign in to access your account and start exploring our amazing features.
          </p>
          <img
            src="https://static-assets-web.flixcart.com/www/linchpin/fk-cp-zion/img/login_img.svg"
            alt="Login Illustration"
            className="mt-6 w-64"
          />
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-3xl font-bold mb-6 text-center md:text-left">Login</h2>

          <form className="space-y-4" onSubmit={handleLogin}>
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <Button
              text={loading ? "Logging in..." : "Login"}
              type="submit"
              styleType="primary"
              className="w-full"
              disabled={loading}
            />
          </form>

          {error && <p className="mt-4 text-red-600 text-sm text-center">{error}</p>}
          {message && <p className="mt-4 text-green-600 text-sm text-center">{message}</p>}

          <div className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-blue-500 font-semibold hover:underline"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
