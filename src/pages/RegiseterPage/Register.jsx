import { useState } from "react";
import axios from "axios";
import Input from "../../components/Input/Input";
import Button from "../../components/Button/Button";

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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setForm({ ...form, profilePicture: e.target.files[0] });

  const handleRegisterClick = async () => {
    setMessage(null);
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        if (form[key] !== null) formData.append(key, form[key]);
      });

      const res = await axios.post(
        "https://twitterapp-backend-85c9.onrender.com/api/v1/user",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setMessage(res.data.message || "User created successfully ✅");
      setForm({
        fullName: "",
        userName: "",
        email: "",
        password: "",
        mobileNumber: "",
        displayName: "",
        role: "Admin",
        profilePicture: null,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Create Account</h2>

      <div className="space-y-3">
        <Input label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Enter your full name" required />
        <Input label="Username" name="userName" value={form.userName} onChange={handleChange} placeholder="Enter username" required />
        <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="Enter email" required />
        <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Enter password" required />
        <Input label="Mobile Number" name="mobileNumber" type="tel" value={form.mobileNumber} onChange={handleChange} placeholder="Enter mobile number" required />
        <Input label="Display Name" name="displayName" value={form.displayName} onChange={handleChange} placeholder="Enter display name" />
        <Input label="Profile Picture" name="profilePicture" type="file" onChange={handleFileChange} accept="image/*" />

        <Button text={loading ? "Creating Account..." : "Register"} onClickHandler={handleRegisterClick} styleType="primary" disabled={loading} className="w-full" />
      </div>

      {error && <p className="mt-3 text-red-600 text-sm text-center">{error}</p>}
      {message && <p className="mt-3 text-green-600 text-sm text-center">{message}</p>}
    </div>
  );
}

export default Register;
