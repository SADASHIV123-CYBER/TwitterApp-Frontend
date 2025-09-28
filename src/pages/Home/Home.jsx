// src/pages/Home/Home.jsx
import React, { useEffect, useState, useCallback, useContext } from "react";
import TweetComposer from "../../components/TweetComposer/TweetComposer";
import TweetCard from "../../components/TweetCard/TweetCard";
import { getTweets } from "../../api/tweetApi";
import { Link } from "react-router-dom";
import { AuthContext, ThemeContext } from "../../context/context";

export default function Home() {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useContext(AuthContext);
  const { darkMode } = useContext(ThemeContext);

  const fetchTweets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getTweets();
      setTweets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to load feed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTweets();
  }, [fetchTweets]);

  const handleCreated = useCallback(
    (payload) => {
      if (!payload) return;
      if (payload.refresh) {
        fetchTweets();
        return;
      }
      setTweets((prev) => [payload, ...(prev || [])]);
    },
    [fetchTweets]
  );

  const handleTweetUpdate = useCallback((updatedTweet) => {
    if (!updatedTweet) return;
    if (updatedTweet.deleted) {
      setTweets((prev) =>
        (prev || []).filter(
          (t) => String(t._id) !== String(updatedTweet._id)
        )
      );
      return;
    }
    setTweets((prev) =>
      (prev || []).map((t) =>
        String(t._id) === String(updatedTweet._id) ? updatedTweet : t
      )
    );
  }, []);

  return (
    <div
      className={`max-w-3xl mx-auto p-4 sm:p-6 min-h-screen transition-colors duration-500
        ${
          darkMode
            ? "bg-gradient-to-b from-gray-900 via-black to-gray-950 text-gray-200"
            : "bg-gradient-to-b from-yellow-50 via-white to-yellow-100 text-gray-900"
        }`}
    >
      {/* Composer */}
      <div className="mb-6">
        <TweetComposer onCreated={handleCreated} disabled={!user} />
        {!user && (
          <Link to="/login">
            <p
              className={`text-center mt-2 text-sm transition-colors duration-500
                ${darkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              Please{" "}
              <span
                className={`font-medium ${
                  darkMode ? "text-yellow-400" : "text-blue-600"
                }`}
              >
                log in
              </span>{" "}
              to post and interact with tweets.
            </p>
          </Link>
        )}
      </div>

      {/* Loader / Error */}
      {loading && (
        <p
          className={`text-center mt-6 transition-colors duration-500
            ${darkMode ? "text-gray-400" : "text-gray-500"}`}
        >
          Loading feed...
        </p>
      )}
      {error && (
        <p className="text-center mt-6 text-red-500 transition-colors duration-500">
          {error}
        </p>
      )}

      {/* Tweets */}
      <div className="mt-6 space-y-4">
        {tweets.map((t) => (
          <TweetCard key={t._id} tweet={t} onUpdate={handleTweetUpdate} />
        ))}
      </div>
    </div>
  );
}
