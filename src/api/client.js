// src/api/client.js
import axios from "axios";

const DEFAULT_BACKEND = "https://twitterapp-backend-85c9.onrender.com";

/**
 * API root: prefer VITE_API_URL, otherwise fall back to deployed backend.
 * Trim trailing slashes to avoid double // in URLs.
 */
export const API_ROOT = (import.meta.env.VITE_API_URL || DEFAULT_BACKEND).replace(/\/+$/, "");

/**
 * Shared axios instance for all API modules
 * - withCredentials: true so cookies (httpOnly) are sent automatically
 * - baseURL left blank here; per-module baseURLs will be used
 */
export const client = axios.create({
  timeout: 15000,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

// Optional: a central response interceptor could be added here in future
// client.interceptors.response.use(response => response, error => Promise.reject(error));
