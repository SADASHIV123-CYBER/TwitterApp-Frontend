// src/pages/Profile/Profile.jsx
import { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import Card from "../../components/Card/Card";
import TweetCard from "../../components/TweetCard/TweetCard";
import { AuthContext } from "../../context/AuthContext";
import {
  getUserProfile,
  toggleFollowService,
  getUserTweets,
  getUserRetweets,
  getUserQuotes,
} from "./userService";

/*
Profile page now shows:
- Profile header and stats
- Tabs: Tweets | Retweets | Quotes
- Each tab lazy-loads its data and uses TweetCard for rendering.
- Retweets and Quotes render a small label (who retweeted / quoted) and then show the original tweet via TweetCard.
*/

function EmptyState({ message }) {
  return <p className="text-center py-6 text-gray-500">{message}</p>;
}

export default function Profile() {
  const { user, loading: authLoading, logout } = useContext(AuthContext);
  const { userId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");

  // tabs
  const [activeTab, setActiveTab] = useState("tweets"); // "tweets" | "retweets" | "quotes"

  // tweets state
  const [tweets, setTweets] = useState([]);
  const [tweetsLoading, setTweetsLoading] = useState(false);
  const [tweetsError, setTweetsError] = useState("");

  // retweets state
  const [retweets, setRetweets] = useState([]);
  const [retweetsLoading, setRetweetsLoading] = useState(false);
  const [retweetsError, setRetweetsError] = useState("");

  // quotes state
  const [quotes, setQuotes] = useState([]);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [quotesError, setQuotesError] = useState("");

  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      setLoadingProfile(true);
      setProfileError("");
      try {
        const data = await getUserProfile(userId);
        setProfile(data);
      } catch (err) {
        setProfileError(err?.message || String(err) || "Failed to load profile");
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [userId]);

  // fetch functions
  const fetchTweets = useCallback(async () => {
    setTweetsLoading(true);
    setTweetsError("");
    try {
      const data = await getUserTweets(userId);
      setTweets(Array.isArray(data) ? data : []);
    } catch (err) {
      setTweetsError(err?.message || String(err) || "Failed to load tweets");
    } finally {
      setTweetsLoading(false);
    }
  }, [userId]);

  const fetchRetweets = useCallback(async () => {
    setRetweetsLoading(true);
    setRetweetsError("");
    try {
      const data = await getUserRetweets(userId);
      setRetweets(Array.isArray(data) ? data : []);
    } catch (err) {
      setRetweetsError(err?.message || String(err) || "Failed to load retweets");
    } finally {
      setRetweetsLoading(false);
    }
  }, [userId]);

  const fetchQuotes = useCallback(async () => {
    setQuotesLoading(true);
    setQuotesError("");
    try {
      const data = await getUserQuotes(userId);
      setQuotes(Array.isArray(data) ? data : []);
    } catch (err) {
      setQuotesError(err?.message || String(err) || "Failed to load quotes");
    } finally {
      setQuotesLoading(false);
    }
  }, [userId]);

  // load data for the active tab lazily
  useEffect(() => {
    if (!userId) return;
    if (activeTab === "tweets" && tweets.length === 0 && !tweetsLoading) fetchTweets();
    if (activeTab === "retweets" && retweets.length === 0 && !retweetsLoading) fetchRetweets();
    if (activeTab === "quotes" && quotes.length === 0 && !quotesLoading) fetchQuotes();
  }, [activeTab, fetchTweets, fetchRetweets, fetchQuotes, tweets, retweets, quotes, userId, tweetsLoading, retweetsLoading, quotesLoading]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleToggleFollow = async () => {
    if (!profile) return;
    setFollowLoading(true);
    try {
      const result = await toggleFollowService(profile._id);
      // backend should return updated follower/following counts or updated profile
      if (result && result.followerCount !== undefined) {
        setProfile((prev) => ({ ...prev, followerCount: result.followerCount, followingCount: result.followingCount ?? prev.followingCount }));
      } else if (result && result._id) {
        // if backend returned updated profile
        setProfile(result);
      } else {
        // fallback — refetch profile after toggling
        const refreshed = await getUserProfile(userId);
        setProfile(refreshed);
      }
    } catch (err) {
      console.error("Follow toggle failed", err);
      alert(err?.message || "Failed to follow/unfollow");
    } finally {
      setFollowLoading(false);
    }
  };

  if (authLoading || loadingProfile) {
    return <p className="text-center mt-16 text-gray-500">Loading...</p>;
  }

  if (profileError) {
    return <p className="text-center mt-16 text-red-600 font-medium">{profileError}</p>;
  }

  if (!profile) {
    return <p className="text-center mt-16 text-gray-600">No profile found</p>;
  }

  const isOwnProfile = user && String(user._id) === String(profile._id);

  // small helpers for rendering special items
  function RetweetItem({ rt }) {
    // rt expected shape: { _id, user: {...}, originalTweet: {...} }
    const actor = rt.user || rt.retweetedBy || null;
    const orig = rt.originalTweet || rt.tweet || rt;
    return (
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-1">
          Retweeted by <span className="font-medium">{actor?.displayName || actor?.userName || "User"}</span>
        </div>
        <TweetCard tweet={orig} onUpdate={() => {}} />
      </div>
    );
  }

  function QuoteItem({ q }) {
    // q expected shape: { _id, user: {...}, originalTweet: {...}, text }
    const actor = q.user || null;
    const orig = q.originalTweet || q.tweet || null;
    return (
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-1">
          Quoted by <span className="font-medium">{actor?.displayName || actor?.userName || "User"}</span>
        </div>

        {/* show the quote text as separate card above the original */}
        <div className="mb-2">
          <Card className="p-3 bg-gray-50">
            <div className="text-sm text-gray-800">{q.text}</div>
          </Card>
        </div>

        {orig ? <TweetCard tweet={orig} onUpdate={() => {}} /> : <EmptyState message="Original tweet not available" />}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Profile Header */}
      <Card className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <img
            src={profile.profilePicture || "/default-avatar.png"}
            alt={profile.fullName || profile.userName}
            className="w-28 h-28 rounded-full border-2 border-gray-200 shadow-md object-cover hover:scale-105 transition-transform duration-300"
          />
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{profile.fullName || profile.displayName || profile.userName}</h2>
            <p className="text-gray-500 text-sm">@{profile.userName}</p>
            {profile.displayName && <p className="text-gray-600 italic mt-1">{profile.displayName}</p>}
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          {isOwnProfile ? (
            <Button
              text="Logout"
              styleType="error"
              onClickHandler={handleLogout}
              className="px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
            />
          ) : (
            <div className="flex gap-3">
              <Button
                text={followLoading ? "Loading..." : (profile.isFollowed ? "Unfollow" : "Follow")}
                styleType="primary"
                onClickHandler={handleToggleFollow}
                disabled={followLoading}
                className="px-4 py-2 rounded-lg"
              />
              <Button text="Message" styleType="secondary" onClickHandler={() => alert("Open chat")} />
            </div>
          )}
        </div>
      </Card>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-gray-500 text-sm">Followers</p>
          <p className="text-2xl font-bold">{profile.followerCount ?? 0}</p>
        </Card>
        <Card className="text-center">
          <p className="text-gray-500 text-sm">Following</p>
          <p className="text-2xl font-bold">{profile.followingCount ?? 0}</p>
        </Card>
        <Card className="text-center">
          <p className="text-gray-500 text-sm">Tweets</p>
          <p className="text-2xl font-bold">{profile.tweetCount ?? (profile.tweets ? profile.tweets.length : 0)}</p>
        </Card>
        <Card className="text-center">
          <p className="text-gray-500 text-sm">Role</p>
          <p className="text-2xl font-bold">{profile.role ?? "user"}</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="mt-8">
        <div className="flex gap-3 border-b pb-2">
          <button
            className={`px-3 py-2 ${activeTab === "tweets" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"}`}
            onClick={() => setActiveTab("tweets")}
          >
            Tweets
          </button>
          <button
            className={`px-3 py-2 ${activeTab === "retweets" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"}`}
            onClick={() => setActiveTab("retweets")}
          >
            Retweets
          </button>
          <button
            className={`px-3 py-2 ${activeTab === "quotes" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"}`}
            onClick={() => setActiveTab("quotes")}
          >
            Quotes
          </button>
        </div>

        <div className="mt-6">
          {activeTab === "tweets" && (
            <>
              {tweetsLoading && <EmptyState message="Loading tweets..." />}
              {tweetsError && <p className="text-red-600">{tweetsError}</p>}
              {!tweetsLoading && tweets.length === 0 && <EmptyState message="No tweets yet" />}
              <div className="space-y-4">
                {tweets.map((t) => (
                  <TweetCard key={t._id} tweet={t} onUpdate={() => {}} />
                ))}
              </div>
            </>
          )}

          {activeTab === "retweets" && (
            <>
              {retweetsLoading && <EmptyState message="Loading retweets..." />}
              {retweetsError && <p className="text-red-600">{retweetsError}</p>}
              {!retweetsLoading && retweets.length === 0 && <EmptyState message="No retweets yet" />}
              <div className="space-y-4">
                {retweets.map((r) => (
                  <RetweetItem key={r._id} rt={r} />
                ))}
              </div>
            </>
          )}

          {activeTab === "quotes" && (
            <>
              {quotesLoading && <EmptyState message="Loading quotes..." />}
              {quotesError && <p className="text-red-600">{quotesError}</p>}
              {!quotesLoading && quotes.length === 0 && <EmptyState message="No quotes yet" />}
              <div className="space-y-4">
                {quotes.map((q) => (
                  <QuoteItem key={q._id} q={q} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Profile details */}
      <Card className="mt-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Profile Details</h3>
        <div className="space-y-3 text-gray-700">
          <p><span className="font-medium">Email:</span> {profile.email}</p>
          {profile.mobileNumber && <p><span className="font-medium">Mobile:</span> {profile.mobileNumber}</p>}
          <p>
            <span className="font-medium">Verified:</span>{" "}
            {profile.isVerified ? <span className="text-green-600 font-semibold">Yes</span> : <span className="text-red-600 font-semibold">No</span>}
          </p>
        </div>
      </Card>
    </div>
  );
}
