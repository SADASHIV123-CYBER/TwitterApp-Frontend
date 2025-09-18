// src/pages/Auth/Register.jsx
import { useState } from "react";
import axios from "axios";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import { z } from "zod";
import { Link } from "react-router-dom";

// 🔹 Zod Schema (matches backend validator)
const registerSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  userName: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  mobileNumber: z
    .string()
    .regex(/^[0-9]{10}$/, "Mobile number must be 10 digits"),
  displayName: z.string().optional(),
  role: z.enum(["User", "Admin"]).default("User"),
  profilePicture: z.any().optional(),
});

function Register() {
  const [form, setForm] = useState({
    fullName: "",
    userName: "",
    email: "",
    password: "",
    mobileNumber: "",
    displayName: "",
    role: "User",
    profilePicture: null,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e) =>
    setForm({ ...form, profilePicture: e.target.files[0] });

  const handleRegisterClick = async () => {
    setMessage(null);
    setError(null);

    // 🔹 Client-side validation with Zod
    const result = registerSchema.safeParse(form);
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        if (form[key] !== null) formData.append(key, form[key]);
      });

      // ✅ use Vite proxy (/api → localhost:4000 in dev)
      const res = await axios.post("/api/v1/user", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(res.data.message || "User created successfully ✅");

      // Reset form
      setForm({
        fullName: "",
        userName: "",
        email: "",
        password: "",
        mobileNumber: "",
        displayName: "",
        role: "User",
        profilePicture: null,
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.errors?.[0] ||
          "Something went wrong ❌"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-lg bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Create Account
        </h2>

        <div className="space-y-3">
          <Input
            label="Full Name"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />
          <Input
            label="Username"
            name="userName"
            value={form.userName}
            onChange={handleChange}
            placeholder="Enter username"
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter email"
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter password"
            required
          />
          <Input
            label="Mobile Number"
            name="mobileNumber"
            type="tel"
            value={form.mobileNumber}
            onChange={handleChange}
            placeholder="Enter mobile number"
            required
          />
          <Input
            label="Display Name"
            name="displayName"
            value={form.displayName}
            onChange={handleChange}
            placeholder="Enter display name"
          />
          <Input
            key={form.profilePicture ? form.profilePicture.name : "fileInput"}
            label="Profile Picture"
            name="profilePicture"
            type="file"
            onChange={handleFileChange}
            accept="image/*"
          />

          <Button
            text={loading ? "Creating Account..." : "Register"}
            onClickHandler={handleRegisterClick}
            styleType="primary"
            disabled={loading}
            className="w-full"
          />
        </div>

        {error && <p className="mt-3 text-red-600 text-sm text-center">{error}</p>}
        {message && <p className="mt-3 text-green-600 text-sm text-center">{message}</p>}

        {/* 🔹 Navigation link */}
        <p className="text-sm text-gray-600 text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
