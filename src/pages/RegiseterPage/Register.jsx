// src/pages/Auth/Register.jsx
import { useState } from "react";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";
import { z } from "zod";
import { Link } from "react-router-dom";
import {registerUser} from './registerService'

const registerSchema = z.object({
  fullName: z
    .string({ required_error: "Full name is required" })
    .min(2, "Full name must be at least 2 characters"),
  userName: z
    .string({ required_error: "Username is required" })
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format"),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters"),
  mobileNumber: z
    .string({ required_error: "Mobile number is required" })
    .regex(/^[0-9]{10}$/, "Mobile number must be 10 digits"),
  displayName: z.string().optional(),
  role: z.enum(["User", "Admin"]).default("User"),
  profilePicture: z.any().optional(),
});

const serverToClientFieldMap = {
  username: "userName",
  user_name: "userName",
  full_name: "fullName",
  fullname: "fullName",
  email: "email",
  password: "password",
  mobile: "mobileNumber",
  mobileNumber: "mobileNumber",
  displayName: "displayName",
  profilePicture: "profilePicture",
  role: "role",
};

function mapServerKey(key) {
  if (!key) return key;
  return serverToClientFieldMap[key] || key;
}

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

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null, global: null }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, profilePicture: file }));
    setErrors((prev) => ({ ...prev, profilePicture: null, global: null }));
  };

  const parseAndSetServerErrors = (serverData) => {
    const fieldErrors = {};

    if (Array.isArray(serverData?.errors)) {
      serverData.errors.forEach((e) => {
        const key = e.path || e.field || e.param || e.name;
        const clientKey = mapServerKey(key);
        fieldErrors[clientKey] = e.message || e.msg || JSON.stringify(e);
      });
    } else if (serverData?.errors && typeof serverData.errors === "object") {
      Object.entries(serverData.errors).forEach(([k, v]) => {
        const clientKey = mapServerKey(k);
        if (Array.isArray(v)) fieldErrors[clientKey] = v.join(", ");
        else if (typeof v === "object" && v.message) fieldErrors[clientKey] = v.message;
        else fieldErrors[clientKey] = String(v);
      });
    } else if (serverData && typeof serverData === "object") {
      Object.entries(serverData).forEach(([k, v]) => {
        if (k === "message" || k === "status" || k === "success") return;
        const lowerK = k.toLowerCase();
        const clientKey =
          mapServerKey(k) ||
          (lowerK.includes("user") ? "userName" :
           lowerK.includes("name") ? "fullName" :
           lowerK.includes("email") ? "email" :
           lowerK.includes("pass") ? "password" :
           lowerK.includes("mobile") ? "mobileNumber" :
           k);
        if (Array.isArray(v)) fieldErrors[clientKey] = v.join(", ");
        else if (typeof v === "object" && v.message) fieldErrors[clientKey] = v.message;
        else fieldErrors[clientKey] = String(v);
      });
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...fieldErrors }));
      return true;
    }

    return false;
  };

  const handleRegisterClick = async () => {
    setMessage(null);
    setErrors({});

    const result = registerSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors = {};
      const zodIssues = result.error?.issues || result.error?.errors || [];
      zodIssues.forEach((err) => {
        const path =
          Array.isArray(err.path) && err.path.length ? err.path[0] :
          typeof err.path === "string" ? err.path :
          "global";
        fieldErrors[path] = err.message || String(err);
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      // Use registerUser service which handles FormData vs JSON and targets the backend directly
      const res = await registerUser(form);

      setMessage(res.data?.message || res.data?.msg || "User created successfully");

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
      const serverData = err.response?.data;
      const hadFieldErrors = parseAndSetServerErrors(serverData || {});
      if (!hadFieldErrors) {
        const msg =
          serverData?.message ||
          (serverData?.error && typeof serverData.error === "string" && serverData.error) ||
          err.message ||
          "Something went wrong";
        setErrors((prev) => ({ ...prev, global: msg }));
      }
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
          {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}

          <Input
            label="Username"
            name="userName"
            value={form.userName}
            onChange={handleChange}
            placeholder="Enter username"
            required
          />
          {errors.userName && <p className="text-red-500 text-sm">{errors.userName}</p>}

          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter email"
            required
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter password"
            required
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}

          <Input
            label="Mobile Number"
            name="mobileNumber"
            type="tel"
            value={form.mobileNumber}
            onChange={handleChange}
            placeholder="Enter mobile number"
            required
          />
          {errors.mobileNumber && <p className="text-red-500 text-sm">{errors.mobileNumber}</p>}

          <Input
            label="Display Name"
            name="displayName"
            value={form.displayName}
            onChange={handleChange}
            placeholder="Enter display name"
          />
          {errors.displayName && <p className="text-red-500 text-sm">{errors.displayName}</p>}

          <Input
            key={form.profilePicture ? form.profilePicture.name : "fileInput"}
            label="Profile Picture"
            name="profilePicture"
            type="file"
            onChange={handleFileChange}
            accept="image/*"
          />
          {errors.profilePicture && <p className="text-red-500 text-sm">{errors.profilePicture}</p>}

          <Button
            text={loading ? "Creating Account..." : "Register"}
            onClickHandler={handleRegisterClick}
            styleType="primary"
            disabled={loading}
            className="w-full"
          />
        </div>

        {errors.global && <p className="mt-3 text-red-600 text-sm text-center">{errors.global}</p>}
        {message && <p className="mt-3 text-green-600 text-sm text-center">{message}</p>}

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
