// src/pages/Profile/userService.js
import axios from "axios";

const API_ROOT = import.meta.env.VITE_API_URL || ""; 
const API_BASE = `${API_ROOT}/api/v1`;

/**
 * Helper to safely extract data array
 */
const extractDataArray = (res) => {
  const data = res?.data?.data ?? res?.data;
  return Array.isArray(data) ? data : data ? [data] : [];
};

/**
 * Fetch user profile
 * GET /api/v1/user/:userId
 */
export const getUserProfile = async (userId) => {
  try {
    const res = await axios.get(`${API_BASE}/user/${userId}`);
    return res.data?.data ?? res.data;
  } catch (err) {
    const msg = err?.response?.data?.message ?? err?.message ?? "Failed to fetch user profile";
    throw new Error(msg);
  }
};

/**
 * Toggle follow/unfollow user
 * POST /api/v1/user/follow/:targetUserId
 */
export const toggleFollowService = async (targetUserId) => {
  try {
    const res = await axios.post(`${API_BASE}/user/follow/${targetUserId}`);
    return res.data?.data ?? res.data;
  } catch (err) {
    const msg = err?.response?.data?.message ?? err?.message ?? "Failed to toggle follow";
    throw new Error(msg);
  }
};

/**
 * Get tweets authored by the user
 * GET /api/v1/tweets/user/:userId
 * Returns array of tweets
 */
export const getUserTweets = async (userId) => {
  try {
    const res = await axios.get(`${API_BASE}/tweets/user/${userId}`);
    return extractDataArray(res);
  } catch (err) {
    const msg = err?.response?.data?.message ?? err?.message ?? "Failed to fetch user tweets";
    throw new Error(msg);
  }
};

/**
 * Get retweets by the user
 * GET /api/v1/tweets/user/:userId/retweets
 */
export const getUserRetweets = async (userId) => {
  try {
    const res = await axios.get(`${API_BASE}/tweets/user/${userId}/retweets`);
    return extractDataArray(res);
  } catch (err) {
    const msg = err?.response?.data?.message ?? err?.message ?? "Failed to fetch user retweets";
    throw new Error(msg);
  }
};

/**
 * Get quote tweets by the user
 * GET /api/v1/tweets/user/:userId/quotes
 */
export const getUserQuotes = async (userId) => {
  try {
    const res = await axios.get(`${API_BASE}/tweets/user/${userId}/quotes`);
    return extractDataArray(res);
  } catch (err) {
    const msg = err?.response?.data?.message ?? err?.message ?? "Failed to fetch user quotes";
    throw new Error(msg);
  }
};
