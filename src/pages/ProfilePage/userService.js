// src/pages/Profile/userService.js
import axios from "axios";

const API_ROOT = import.meta.env.VITE_API_URL || ""; // e.g. "http://localhost:4000"
const API_BASE = `${API_ROOT}/api/v1`;

/**
 * Fetch user profile (existing)
 */
export const getUserProfile = async (userId) => {
  try {
    const res = await axios.get(`${API_BASE}/user/${userId}`);
    // expected { success, data, message } or data directly
    return res.data?.data ?? res.data;
  } catch (err) {
    const msg = err?.response?.data?.message ?? err?.message ?? "Failed to fetch user profile";
    throw new Error(msg);
  }
};

/**
 * Toggle follow/unfollow (existing)
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
 * New: get tweets authored by the user
 * Endpoint assumed: GET /api/v1/tweets/user/:userId
 * Returns an array of tweets (populated author preferred)
 */
export const getUserTweets = async (userId) => {
  try {
    const res = await axios.get(`${API_BASE}/tweets/user/${userId}`);
    return res.data?.data ?? res.data;
  } catch (err) {
    const msg = err?.response?.data?.message ?? err?.message ?? "Failed to fetch user tweets";
    throw new Error(msg);
  }
};

/**
 * New: get retweets by the user
 * Endpoint assumed: GET /api/v1/tweets/user/:userId/retweets
 * Returns an array of retweet documents populated with user and originalTweet
 */
export const getUserRetweets = async (userId) => {
  try {
    const res = await axios.get(`${API_BASE}/tweets/user/${userId}/retweets`);
    return res.data?.data ?? res.data;
  } catch (err) {
    const msg = err?.response?.data?.message ?? err?.message ?? "Failed to fetch user retweets";
    throw new Error(msg);
  }
};

/**
 * New: get quote tweets by the user
 * Endpoint assumed: GET /api/v1/tweets/user/:userId/quotes
 * Returns an array of quote tweet documents populated with user and originalTweet
 */
export const getUserQuotes = async (userId) => {
  try {
    const res = await axios.get(`${API_BASE}/tweets/user/${userId}/quotes`);
    return res.data?.data ?? res.data;
  } catch (err) {
    const msg = err?.response?.data?.message ?? err?.message ?? "Failed to fetch user quotes";
    throw new Error(msg);
  }
};
