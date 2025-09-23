import axios from "axios";

const DEFAULT_BACKEND = "https://twitterapp-backend-85c9.onrender.com";

// Remove trailing slash
export const API_ROOT = (import.meta.env.VITE_API_URL || DEFAULT_BACKEND).replace(/\/+$/, "");

// Axios instance
export const client = axios.create({
  baseURL: `${API_ROOT}/api/v1`,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    // ❌ removed Content-Type, let Axios decide
  },
});
