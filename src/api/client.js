// src/api/client.js
import axios from "axios";

const DEFAULT_BACKEND = "https://twitterapp-backend-85c9.onrender.com";

// Prefer VITE_API_URL if defined, else fallback to deployed backend
export const API_ROOT = (import.meta.env.VITE_API_URL || DEFAULT_BACKEND).replace(/\/+$/, "");

// Shared axios client
export const client = axios.create({
  baseURL: `${API_ROOT}/api/v1`, // ✅ always points to backend
  timeout: 15000,
  withCredentials: true, // ✅ send cookies
  headers: {
    Accept: "application/json",
  },
});

// Optional: add interceptors for logging/debugging
// client.interceptors.response.use(
//   res => res,
//   err => Promise.reject(err)
// );
