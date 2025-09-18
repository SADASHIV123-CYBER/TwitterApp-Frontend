import axios from "axios";

const API_BASE = "/api/v1";

export const getUserProfile = async (userId) => {
  try {
    const res = await axios.get(`${API_BASE}/user/${userId}`);
    return res.data.data;
  } catch (err) {
    throw err.response?.data?.message || "Failed to fetch user profile";
  }
};
