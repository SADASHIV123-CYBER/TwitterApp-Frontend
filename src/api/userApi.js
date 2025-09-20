import axios from "axios";
const API_ROOT = import.meta.env.VITE_API_URL || "";
const API_BASE = `${API_ROOT}/api/v1/user`;

export async function toggleFollow(targetUserId) {
  try {
    const res = await axios.post(`${API_BASE}/follow/${targetUserId}/toggle`, {}, { withCredentials: true });
    return res.data?.data ?? res.data;
  } catch (err) {
    const msg = err?.response?.data?.message ?? err?.message ?? "Failed to toggle follow";
    throw new Error(msg);
  }
}

export async function getUserProfile(userId) {
  try {
    const res = await axios.get(`${API_BASE}/${userId}`, { withCredentials: true });
    return res.data?.data ?? res.data;
  } catch (err) {
    const msg = err?.response?.data?.message ?? err?.message ?? "Failed to fetch user profile";
    throw new Error(msg);
  }
}

export async function getFollowers(userId) {
  try {
    const res = await axios.get(`${API_BASE}/${userId}/followers`, { withCredentials: true });
    return res.data?.data ?? res.data;
  } catch (err) {
    const msg = err?.response?.data?.message ?? err?.message ?? "Failed to fetch followers";
    throw new Error(msg);
  }
}

export async function getFollowing(userId) {
  try {
    const res = await axios.get(`${API_BASE}/${userId}/following`, { withCredentials: true });
    return res.data?.data ?? res.data;
  } catch (err) {
    const msg = err?.response?.data?.message ?? err?.message ?? "Failed to fetch following";
    throw new Error(msg);
  }
}

export default {
  toggleFollow,
  getUserProfile,
  getFollowers,
  getFollowing,
};
