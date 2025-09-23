import axios from "axios";

const DEFAULT_BACKEND = "https://twitterapp-backend-85c9.onrender.com";

// Vite envs are replaced at build time.
// Use VITE_API_URL if set, otherwise fallback to DEFAULT_BACKEND
export const API_ROOT = (import.meta.env.VITE_API_URL || DEFAULT_BACKEND).replace(/\/+$/, "");

console.log("🔗 Using API_ROOT:", API_ROOT);

export const client = axios.create({
  baseURL: `${API_ROOT}/api/v1`,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    // ❌ DO NOT set "Content-Type" here — let axios set the proper one per request
  },
});
