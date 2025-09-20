import axios from "axios";
const API_ROOT = import.meta.env.VITE_API_URL || "";
const API_BASE = `${API_ROOT}/api/v1/user`;

/**
 * Toggle follow/unfollow for a target user.
 * Backend route (server) currently: POST /api/v1/user/follow/:targetUser/toggle
 */
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

export default {
  toggleFollow,
  getUserProfile,
};
