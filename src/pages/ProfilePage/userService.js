import axios from "axios";

const API_ROOT = 'https://twitterapp-backend-85c9.onrender.com' 
// const API_ROOT = "http://localhost:4000"
import.meta.env.VITE_API_URL || "";
const API_BASE = `${API_ROOT}/api/v1`;

const normalizeId = (id) => {
  if (id === null || id === undefined) return id;
  if (typeof id === "object") {
    if (id._id) return String(id._id);
    if (id.id) return String(id.id);
    if (typeof id.toString === "function") return id.toString();
    try {
      return JSON.stringify(id);
    } catch {
      return String(id);
    }
  }
  return String(id);
};

const extractDataArray = (res) => {
  const data = res?.data?.data ?? res?.data;
  return Array.isArray(data) ? data : data ? [data] : [];
};

export const getUserProfile = async (userId) => {
  const id = normalizeId(userId);
  try {
    const res = await axios.get(`${API_BASE}/user/${encodeURIComponent(id)}`, { withCredentials: true });
    return res.data?.data ?? res.data;
  } catch (err) {
    const msg = err?.response?.data?.message ?? err?.message ?? "Failed to fetch user profile";
    throw new Error(msg);
  }
};

export const toggleFollowService = async (targetUserId) => {
  const id = normalizeId(targetUserId);
  try {
    const res = await axios.post(`${API_BASE}/user/follow/${encodeURIComponent(id)}/toggle`, {}, { withCredentials: true });
    return res.data?.data ?? res.data;
  } catch (err) {
    const msg = err?.response?.data?.message ?? err?.message ?? "Failed to toggle follow";
    throw new Error(msg);
  }
};

export const getUserTweets = async (userId) => {
  const id = normalizeId(userId);
  try {
    const res = await axios.get(`${API_BASE}/tweets/user/${encodeURIComponent(id)}`, { withCredentials: true });
    return extractDataArray(res);
  } catch (err) {
    const msg = err?.response?.data?.message ?? err?.message ?? "Failed to fetch user tweets";
    throw new Error(msg);
  }
};

export const getUserRetweets = async (userId) => {
  const id = normalizeId(userId);
  try {
    const res = await axios.get(`${API_BASE}/tweets/user/${encodeURIComponent(id)}/retweets`, { withCredentials: true });
    return extractDataArray(res);
  } catch (err) {
    const msg = err?.response?.data?.message ?? err?.message ?? "Failed to fetch user retweets";
    throw new Error(msg);
  }
};

export const getUserQuotes = async (userId) => {
  const id = normalizeId(userId);
  try {
    const res = await axios.get(`${API_BASE}/tweets/user/${encodeURIComponent(id)}/quotes`, { withCredentials: true });
    return extractDataArray(res);
  } catch (err) {
    const msg = err?.response?.data?.message ?? err?.message ?? "Failed to fetch user quotes";
    throw new Error(msg);
  }
};
