import axios from "axios";

const API_ROOT = import.meta.env.VITE_API_URL || "";
const API_BASE = `${API_ROOT}/api/v1`;

const extractDataArray = (res) => {
  const data = res?.data?.data ?? res?.data;
  return Array.isArray(data) ? data : data ? [data] : [];
};

export const getUserProfile = async (userId) => {
  try {
    const res = await axios.get(`${API_BASE}/user/${userId}`, { withCredentials: true });
    return res.data?.data ?? res.data;
  } catch (err) {
    const msg = err?.response?.data?.message ?? err?.message ?? "Failed to fetch user profile";
    throw new Error(msg);
  }
};

export const toggleFollowService = async (targetUserId) => {
  try {
    const res = await axios.post(`${API_BASE}/user/follow/${targetUserId}/toggle`, {}, { withCredentials: true });
    return res.data?.data ?? res.data;
  } catch (err) {
    const msg = err?.response?.data?.message ?? err?.message ?? "Failed to toggle follow";
    throw new Error(msg);
  }
};

export const getUserTweets = async (userId) => {
  try {
    const res = await axios.get(`${API_BASE}/tweets/user/${userId}`, { withCredentials: true });
    return extractDataArray(res);
  } catch (err) {
    const msg = err?.response?.data?.message ?? err?.message ?? "Failed to fetch user tweets";
    throw new Error(msg);
  }
};

export const getUserRetweets = async (userId) => {
  try {
    const res = await axios.get(`${API_BASE}/tweets/user/${userId}/retweets`, { withCredentials: true });
    return extractDataArray(res);
  } catch (err) {
    const msg = err?.response?.data?.message ?? err?.message ?? "Failed to fetch user retweets";
    throw new Error(msg);
  }
};

export const getUserQuotes = async (userId) => {
  try {
    const res = await axios.get(`${API_BASE}/tweets/user/${userId}/quotes`, { withCredentials: true });
    return extractDataArray(res);
  } catch (err) {
    const msg = err?.response?.data?.message ?? err?.message ?? "Failed to fetch user quotes";
    throw new Error(msg);
  }
};
