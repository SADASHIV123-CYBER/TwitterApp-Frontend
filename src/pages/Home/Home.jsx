import React, { useEffect, useState, useCallback } from "react";
import TweetComposer from "../../components/TweetComposer/TweetComposer";
import TweetCard from "../../components/TweetCard/TweetCard";
import { getTweets } from "../../api/tweetApi";

export default function Home() {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const handleCreated = useCallback((payload) => {
    if (!payload) return;
    if (payload.refresh) {
      fetchTweets();
      return;
    }
    setTweets((prev) => [payload, ...(prev || [])]);
  }, [fetchTweets]);

  const handleTweetUpdate = useCallback((updatedTweet) => {
    if (!updatedTweet) return;
    if (updatedTweet.deleted) {
      setTweets((prev) => (prev || []).filter((t) => String(t._id) !== String(updatedTweet._id)));
      return;
    }
    setTweets((prev) => (prev || []).map((t) => (String(t._id) === String(updatedTweet._id) ? updatedTweet : t)));
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <TweetComposer onCreated={handleCreated} />

      {loading && <p className="text-center mt-6 text-gray-500">Loading feed...</p>}
      {error && <p className="text-center mt-6 text-red-600">{error}</p>}

      <div className="mt-6">
        {tweets.map((t) => (
          <TweetCard key={t._id} tweet={t} onUpdate={handleTweetUpdate} />
        ))}
      </div>
    </div>
  );
}
