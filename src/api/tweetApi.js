// src/api/tweetApi.js
import axios from "axios";

const API_BASE_ROOT = import.meta.env.VITE_API_URL || ""; // e.g. "http://localhost:4000"
const API_BASE = `${API_BASE_ROOT}/api/v1/tweets`;

/**
 * Shared axios instance so we can enable cookies, timeouts, interceptors later.
 */
const client = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  withCredentials: true, // enable if backend uses cookies/session auth
  headers: {
    Accept: "application/json",
  },
});

function unwrap(response) {
  if (!response) return null;
  // backend wrapper: { success, data, message }
  if (response.data && response.data.data !== undefined) return response.data.data;
  if (response.data !== undefined) return response.data;
  return response;
}

function throwError(err) {
  const message =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    "Unknown error";
  const e = new Error(message);
  e.raw = err;
  e.status = err?.response?.status ?? null;
  throw e;
}

/* ---------- Tweets (CRUD + image upload) ---------- */

/**
 * Create tweet.
 * Accepts:
 *  - FormData (fields: 'tweet' (text) and 'tweetImage' (file))
 *  - plain string (tweet text)
 *  - object { tweet: "...", ... } (JSON)
 */
export async function createTweet(payload) {
  try {
    if (payload instanceof FormData) {
      const res = await client.post("/", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return unwrap(res);
    }

    if (typeof payload === "string") {
      const res = await client.post("/", { tweet: payload });
      return unwrap(res);
    }

    // assume object-like JSON
    const res = await client.post("/", payload);
    return unwrap(res);
  } catch (err) {
    throwError(err);
  }
}

export async function getTweets() {
  try {
    const res = await client.get("/");
    return unwrap(res);
  } catch (err) {
    throwError(err);
  }
}

export async function getTweetById(id) {
  try {
    const res = await client.get(`/${id}`);
    return unwrap(res);
  } catch (err) {
    throwError(err);
  }
}

export async function updateTweet(id, tweetText) {
  try {
    // backend expects { tweet: "..." } in many places
    const res = await client.put(`/${id}`, { tweet: tweetText });
    return unwrap(res);
  } catch (err) {
    throwError(err);
  }
}

export async function deleteTweet(id) {
  try {
    const res = await client.delete(`/${id}`);
    return unwrap(res);
  } catch (err) {
    throwError(err);
  }
}

/* ---------- Like / Unlike ---------- */
export async function likeTweet(tweetId) {
  try {
    const res = await client.post(`/${tweetId}/like`);
    return unwrap(res);
  } catch (err) {
    throwError(err);
  }
}

export async function unlikeTweet(tweetId) {
  try {
    const res = await client.post(`/${tweetId}/unlike`);
    return unwrap(res);
  } catch (err) {
    throwError(err);
  }
}

/* ---------- Retweet (toggle) ---------- */
export async function retweet(tweetId) {
  try {
    const res = await client.post(`/${tweetId}/retweet`);
    return unwrap(res);
  } catch (err) {
    throwError(err);
  }
}

/* ---------- Quote ---------- */
/**
 * quoteTextOrForm:
 *  - string: { text }
 *  - FormData: must contain 'text' and optionally 'quoteImage' file
 */
export async function quoteTweet(tweetId, quoteTextOrForm) {
  try {
    if (quoteTextOrForm instanceof FormData) {
      const res = await client.post(`/${tweetId}/quote`, quoteTextOrForm, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return unwrap(res);
    } else {
      const res = await client.post(`/${tweetId}/quote`, { text: String(quoteTextOrForm) });
      return unwrap(res);
    }
  } catch (err) {
    throwError(err);
  }
}

export async function deleteQuote(quoteId) {
  try {
    const res = await client.delete(`/${quoteId}/quote`);
    return unwrap(res);
  } catch (err) {
    throwError(err);
  }
}

/* ---------- Comments & Replies ---------- */

/**
 * Add comment: POST /:id/comment  body: { text }
 */
export async function addComment(tweetId, text) {
  try {
    const res = await client.post(`/${tweetId}/comment`, { text });
    return unwrap(res);
  } catch (err) {
    throwError(err);
  }
}

/**
 * Update comment: PUT /:tweetId/comment/:commentId body: { text }
 */
export async function updateComment(tweetId, commentId, text) {
  try {
    const res = await client.put(`/${tweetId}/comment/${commentId}`, { text });
    return unwrap(res);
  } catch (err) {
    throwError(err);
  }
}

/**
 * Reply to comment: POST /:tweetId/comments/:commentId/replies body: { text }
 */
export async function replyToComment(tweetId, commentId, text) {
  try {
    const res = await client.post(`/${tweetId}/comments/${commentId}/replies`, { text });
    return unwrap(res);
  } catch (err) {
    throwError(err);
  }
}

/**
 * Toggle comment like: POST /:tweetId/comments/:commentId/like
 */
export async function toggleCommentLike(tweetId, commentId) {
  try {
    const res = await client.post(`/${tweetId}/comments/${commentId}/like`);
    return unwrap(res);
  } catch (err) {
    throwError(err);
  }
}

/**
 * Soft delete comment: DELETE /:tweetId/comment/:commentId/soft
 */
export async function softDeleteComment(tweetId, commentId) {
  try {
    const res = await client.delete(`/${tweetId}/comment/${commentId}/soft`);
    return unwrap(res);
  } catch (err) {
    throwError(err);
  }
}



/* ---------- Export default convenience object ---------- */
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
