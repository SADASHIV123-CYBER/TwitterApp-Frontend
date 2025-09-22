// src/api/client.js
import axios from "axios";

const DEFAULT_BACKEND = "https://twitterapp-backend-85c9.onrender.com";

export const API_ROOT = (import.meta.env.VITE_API_URL || DEFAULT_BACKEND).replace(/\/+$/, "");

// Axios instance with credentials
export const client = axios.create({
  baseURL: `${API_ROOT}/api/v1`, // ✅ points to your backend v1 routes
  withCredentials: true,        // ✅ send cookies for auth
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});
