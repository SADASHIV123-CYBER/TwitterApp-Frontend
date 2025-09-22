// src/api/tweetApi.js
import { client, API_ROOT } from "./client.js";

const API_BASE = `${API_ROOT}/api/v1/tweets`;

/**
 * Utility to extract data consistently:
 * - prefer response.data.data
 * - fallback to response.data
 */
function unwrap(res) {
  if (!res) return null;
  if (res.data && res.data.data !== undefined) return res.data.data;
  if (res.data !== undefined) return res.data;
  return res;
}

function makeError(err, fallbackMessage = "Unknown error") {
  const message =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    fallbackMessage;
  const e = new Error(message);
  e.raw = err;
  e.status = err?.response?.status ?? null;
  return e;
}

/* ---------- Tweets (CRUD + image upload) ---------- */

export async function createTweet(payload) {
  try {
    if (payload instanceof FormData) {
      const res = await client.post(`${API_BASE}/`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return unwrap(res);
    }
    if (typeof payload === "string") {
      const res = await client.post(`${API_BASE}/`, { tweet: payload });
      return unwrap(res);
    }
    const res = await client.post(`${API_BASE}/`, payload);
    return unwrap(res);
  } catch (err) {
    throw makeError(err, "Failed to create tweet");
  }
}

export async function getTweets() {
  try {
    const res = await client.get(`${API_BASE}/`);
    return unwrap(res);
  } catch (err) {
    throw makeError(err, "Failed to fetch tweets");
  }
}

export async function getTweetById(id) {
  try {
    const res = await client.get(`${API_BASE}/${encodeURIComponent(id)}`);
    return unwrap(res);
  } catch (err) {
    throw makeError(err, "Failed to fetch tweet");
  }
}

export async function updateTweet(id, tweetText) {
  try {
    const res = await client.put(`${API_BASE}/${encodeURIComponent(id)}`, { tweet: tweetText });
    return unwrap(res);
  } catch (err) {
    throw makeError(err, "Failed to update tweet");
  }
}

export async function deleteTweet(id) {
  try {
    const res = await client.delete(`${API_BASE}/${encodeURIComponent(id)}`);
    return unwrap(res);
  } catch (err) {
    throw makeError(err, "Failed to delete tweet");
  }
}

/* ---------- Like / Unlike ---------- */
export async function likeTweet(tweetId) {
  try {
    const res = await client.post(`${API_BASE}/${encodeURIComponent(tweetId)}/like`);
    return unwrap(res);
  } catch (err) {
    throw makeError(err, "Failed to like tweet");
  }
}

export async function unlikeTweet(tweetId) {
  try {
    const res = await client.post(`${API_BASE}/${encodeURIComponent(tweetId)}/unlike`);
    return unwrap(res);
  } catch (err) {
    throw makeError(err, "Failed to unlike tweet");
  }
}

/* ---------- Retweet (toggle) ---------- */
export async function retweet(tweetId) {
  try {
    const res = await client.post(`${API_BASE}/${encodeURIComponent(tweetId)}/retweet`);
    return unwrap(res);
  } catch (err) {
    throw makeError(err, "Failed to retweet");
  }
}

/* ---------- Quote ---------- */
export async function quoteTweet(tweetId, quoteTextOrForm) {
  try {
    if (quoteTextOrForm instanceof FormData) {
      const res = await client.post(`${API_BASE}/${encodeURIComponent(tweetId)}/quote`, quoteTextOrForm, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return unwrap(res);
    } else {
      const res = await client.post(`${API_BASE}/${encodeURIComponent(tweetId)}/quote`, { text: String(quoteTextOrForm) });
      return unwrap(res);
    }
  } catch (err) {
    throw makeError(err, "Failed to quote tweet");
  }
}

export async function deleteQuote(quoteId) {
  try {
    const res = await client.delete(`${API_BASE}/${encodeURIComponent(quoteId)}/quote`);
    return unwrap(res);
  } catch (err) {
    throw makeError(err, "Failed to delete quote");
  }
}

/* ---------- Comments & Replies ---------- */

export async function addComment(tweetId, text) {
  try {
    const res = await client.post(`${API_BASE}/${encodeURIComponent(tweetId)}/comments`, { text });
    return unwrap(res);
  } catch (err) {
    throw makeError(err, "Failed to add comment");
  }
}

export async function updateComment(tweetId, commentId, text) {
  try {
    const res = await client.put(`${API_BASE}/${encodeURIComponent(tweetId)}/comments/${encodeURIComponent(commentId)}`, { text });
    return unwrap(res);
  } catch (err) {
    throw makeError(err, "Failed to update comment");
  }
}

export async function replyToComment(tweetId, commentId, text) {
  try {
    const res = await client.post(`${API_BASE}/${encodeURIComponent(tweetId)}/comments/${encodeURIComponent(commentId)}/replies`, { text });
    return unwrap(res);
  } catch (err) {
    throw makeError(err, "Failed to reply to comment");
  }
}

export async function toggleCommentLike(tweetId, commentId) {
  try {
    const res = await client.post(`${API_BASE}/${encodeURIComponent(tweetId)}/comments/${encodeURIComponent(commentId)}/like`);
    return unwrap(res);
  } catch (err) {
    throw makeError(err, "Failed to toggle comment like");
  }
}

export async function softDeleteComment(tweetId, commentId) {
  try {
    const res = await client.delete(`${API_BASE}/${encodeURIComponent(tweetId)}/comments/${encodeURIComponent(commentId)}/soft`);
    return unwrap(res);
  } catch (err) {
    throw makeError(err, "Failed to soft delete comment");
  }
}

/* ---------- Default export convenience object ---------- */
export default {
  createTweet,
  getTweets,
  getTweetById,
  updateTweet,
  deleteTweet,
  likeTweet,
  unlikeTweet,
  retweet,
  quoteTweet,
  deleteQuote,
  addComment,
  updateComment,
  replyToComment,
  toggleCommentLike,
  softDeleteComment,
};
