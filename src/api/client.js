import axios from "axios";

const DEFAULT_BACKEND = "https://twitterapp-backend-85c9.onrender.com";
// const DEFAULT_BACKEND = "http://localhost:4000";

export const API_ROOT = (import.meta.env.VITE_API_URL || DEFAULT_BACKEND).replace(/\/+$/, "");

export const client = axios.create({
  baseURL: `${API_ROOT}/api/v1`,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json", // ensure JSON works
  },
});

// Optional: Response interceptor for cleaner errors
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      console.warn("Unauthorized – redirecting to login");
      // example: window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);
