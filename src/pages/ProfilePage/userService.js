import axios from "axios";

const API_BASE = "/api/v1";

// Fetch user profile
export const getUserProfile = async (userId) => {
  try {
    const res = await axios.get(`${API_BASE}/user/${userId}`);
    return res.data.data;
  } catch (err) {
    throw err.response?.data?.message || "Failed to fetch user profile";
  }
};

// Toggle follow/unfollow
export const toggleFollowService = async (targetUserId) => {
  try {
    const res = await axios.post(`${API_BASE}/user/follow/${targetUserId}`);
    return res.data.data;
  } catch (err) {
    throw err.response?.data?.message || "Failed to toggle follow";
  }
};
