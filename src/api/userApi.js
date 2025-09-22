// src/api/userApi.js
import { client, API_ROOT } from "./client.js";

const API_BASE = `${API_ROOT}/api/v1`;

/**
 * Helpers
 */
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

const extractData = (res) => {
  return res?.data?.data ?? res?.data;
};

function makeError(err, fallback = "Request failed") {
  const msg = err?.response?.data?.message ?? err?.message ?? fallback;
  const e = new Error(msg);
  e.status = err?.response?.status ?? null;
  e.raw = err;
  return e;
}

/* ---------- User endpoints ---------- */

/**
 * Toggle follow (POST /api/v1/user/follow/:targetUserId/toggle)
 */
export async function toggleFollow(targetUserId) {
  const id = normalizeId(targetUserId);
  try {
    const res = await client.post(`${API_BASE}/user/follow/${encodeURIComponent(id)}/toggle`, {}, { withCredentials: true });
    return extractData(res);
  } catch (err) {
    throw makeError(err, "Failed to toggle follow");
  }
}

/**
 * Get user profile (GET /api/v1/user/:userId)
 */
export async function getUserProfile(userId) {
  const id = normalizeId(userId);
  try {
    const res = await client.get(`${API_BASE}/user/${encodeURIComponent(id)}`, { withCredentials: true });
    return extractData(res);
  } catch (err) {
    throw makeError(err, "Failed to fetch user profile");
  }
}

/**
 * GET followers (GET /api/v1/user/:userId/followers)
 */
export async function getFollowers(userId) {
  const id = normalizeId(userId);
  try {
    const res = await client.get(`${API_BASE}/user/${encodeURIComponent(id)}/followers`, { withCredentials: true });
    return extractData(res);
  } catch (err) {
    throw makeError(err, "Failed to fetch followers");
  }
}

/**
 * GET following (GET /api/v1/user/:userId/following)
 */
export async function getFollowing(userId) {
  const id = normalizeId(userId);
  try {
    const res = await client.get(`${API_BASE}/user/${encodeURIComponent(id)}/following`, { withCredentials: true });
    return extractData(res);
  } catch (err) {
    throw makeError(err, "Failed to fetch following list");
  }
}

/* ---------- Tweets by user (convenience functions) ---------- */

export const getUserTweets = async (userId) => {
  const id = normalizeId(userId);
  try {
    const res = await client.get(`${API_BASE}/tweets/user/${encodeURIComponent(id)}`, { withCredentials: true });
    const data = res?.data?.data ?? res?.data ?? [];
    return Array.isArray(data) ? data : [data];
  } catch (err) {
    throw makeError(err, "Failed to fetch user tweets");
  }
};

export const getUserRetweets = async (userId) => {
  const id = normalizeId(userId);
  try {
    const res = await client.get(`${API_BASE}/tweets/user/${encodeURIComponent(id)}/retweets`, { withCredentials: true });
    const data = res?.data?.data ?? res?.data ?? [];
    return Array.isArray(data) ? data : [data];
  } catch (err) {
    throw makeError(err, "Failed to fetch user retweets");
  }
};

export const getUserQuotes = async (userId) => {
  const id = normalizeId(userId);
  try {
    const res = await client.get(`${API_BASE}/tweets/user/${encodeURIComponent(id)}/quotes`, { withCredentials: true });
    const data = res?.data?.data ?? res?.data ?? [];
    return Array.isArray(data) ? data : [data];
  } catch (err) {
    throw makeError(err, "Failed to fetch user quotes");
  }
};

export default {
  toggleFollow,
  getUserProfile,
  getFollowers,
  getFollowing,
  getUserTweets,
  getUserRetweets,
  getUserQuotes,
};
