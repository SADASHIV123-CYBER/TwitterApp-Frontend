import axios from "axios";

const DEFAULT_BACKEND = "https://twitterapp-backend-85c9.onrender.com";

// Remove trailing slash
export const API_ROOT = (import.meta.env.VITE_API_URL || DEFAULT_BACKEND).replace(/\/+$/, "");

// Axios instance — ✅ important: withCredentials
export const client = axios.create({
  baseURL: `${API_ROOT}/api/v1`, // points to backend v1 routes
  withCredentials: true,         // ✅ send cookies automatically
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});
