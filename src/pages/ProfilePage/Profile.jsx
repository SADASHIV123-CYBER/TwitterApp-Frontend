import { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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


// import { 
//   getUserProfile,
//   toggleFollowService,
//   getUserTweets,
//   getUserRetweets,
//   getUserQuotes
//  } from "../../api/userApi";

const profileCache = new Map();

function EmptyState({ message }) {
  return <p className="text-center py-6 text-gray-500">{message}</p>;
}

const tryGetIdFromCandidate = (c) => {
  if (!c) return null;
  if (typeof c === "string") return c;
  if (typeof c === "number") return String(c);
  if (typeof c === "object") {
    if (c._id) return String(c._id);
    if (c.id) return String(c.id);
    if (c.toString && typeof c.toString === "function") {
      const s = c.toString();
      if (s && s !== "[object Object]") return s;
    }
  }
  return null;
};

const hasProfileInfo = (p) => {
  if (!p) return false;
  return Boolean(p.displayName || p.userName || p.fullName || p.profilePicture || p.avatar);
};

const resolveProfileById = async (id) => {
  if (!id) return null;
  if (profileCache.has(id)) return profileCache.get(id);
  try {
    const prof = await getUserProfile(id);
    if (prof) profileCache.set(id, prof);
    return prof;
  } catch {
    return null;
  }
};

const resolveTweetUser = async (orig) => {
  if (!orig) return null;
  const tweet = { ...orig };
  const candidates = [
    tweet.user,
    tweet.author,
    tweet.postedBy,
    tweet.userId,
    tweet.authorId,
    tweet.poster,
    tweet.owner,
    tweet.createdBy,
    tweet.created_by,
  ];
  let candidate = null;
  for (let c of candidates) {
    if (c !== undefined && c !== null) {
      candidate = c;
      break;
    }
  }
  if (!candidate) return tweet;
  if (typeof candidate === "object") {
    if (hasProfileInfo(candidate)) {
      tweet.user = candidate;
      return tweet;
    }
    const id = tryGetIdFromCandidate(candidate);
    if (id) {
      const prof = await resolveProfileById(id);
      if (prof) {
        tweet.user = prof;
        return tweet;
      }
      tweet.user = candidate;
      return tweet;
    }
    tweet.user = candidate;
    return tweet;
  }
  const id = tryGetIdFromCandidate(candidate);
  if (id) {
    const prof = await resolveProfileById(id);
    if (prof) {
      tweet.user = prof;
      return tweet;
    }
    tweet.user = { _id: id };
    return tweet;
  }
  return tweet;
};

export default function Profile() {
  const { user, loading: authLoading, logout } = useContext(AuthContext);
  const { userId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState("");

  const [activeTab, setActiveTab] = useState("tweets");

  const [tweets, setTweets] = useState(null);
  const [tweetsLoading, setTweetsLoading] = useState(false);
  const [tweetsError, setTweetsError] = useState("");

  const [retweets, setRetweets] = useState(null);
  const [retweetsLoading, setRetweetsLoading] = useState(false);
  const [retweetsError, setRetweetsError] = useState("");

  const [quotes, setQuotes] = useState(null);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [quotesError, setQuotesError] = useState("");

  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!userId) return;
    let mounted = true;
    const fetchProfile = async () => {
      setLoadingProfile(true);
      setProfileError("");
      try {
        const data = await getUserProfile(userId);
        if (mounted) setProfile(data);
      } catch (err) {
        if (mounted) setProfileError(err?.message || "Failed to load profile");
      } finally {
        if (mounted) setLoadingProfile(false);
      }
    };
    fetchProfile();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const fetchTweets = useCallback(async () => {
    setTweetsLoading(true);
    setTweetsError("");
    try {
      const data = await getUserTweets(userId);
      setTweets(Array.isArray(data) ? data : []);
    } catch (err) {
      setTweetsError(err?.message || "Failed to load tweets");
      setTweets([]);
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
      setRetweetsError(err?.message || "Failed to load retweets");
      setRetweets([]);
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
      setQuotesError(err?.message || "Failed to load quotes");
      setQuotes([]);
    } finally {
      setQuotesLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    if (activeTab === "tweets" && tweets === null && !tweetsLoading) fetchTweets();
    if (activeTab === "retweets" && retweets === null && !retweetsLoading) fetchRetweets();
    if (activeTab === "quotes" && quotes === null && !quotesLoading) fetchQuotes();
  }, [activeTab, userId, tweets, retweets, quotes, tweetsLoading, retweetsLoading, quotesLoading, fetchTweets, fetchRetweets, fetchQuotes]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleToggleFollow = async () => {
    if (!profile) return;
    setFollowLoading(true);
    try {
      const result = await toggleFollowService(profile._id);
      setProfile((prev) => {
        if (!prev) return prev;
        const prevFollowerCount = prev.followerCount ?? 0;
        let isFollowed = prev.isFollowed ?? false;
        if (result && typeof result.action === "string") {
          isFollowed = result.action === "followed";
        } else if (result && typeof result.followerCount === "number") {
          isFollowed = result.followerCount > prevFollowerCount;
        } else {
          isFollowed = !isFollowed;
        }
        return {
          ...prev,
          followerCount: result?.followerCount ?? prev.followerCount,
          followingCount: result?.followingCount ?? prev.followingCount,
          isFollowed,
        };
      });
    } catch (err) {
      console.error("Follow toggle failed", err);
      alert(err?.message || "Failed to follow/unfollow");
    } finally {
      setFollowLoading(false);
    }
  };

  if (authLoading || loadingProfile) return <p className="text-center mt-16 text-gray-500">Loading...</p>;
  if (profileError) return <p className="text-center mt-16 text-red-600 font-medium">{profileError}</p>;
  if (!profile) return <p className="text-center mt-16 text-gray-600">No profile found</p>;

  const isOwnProfile = user && String(user._id) === String(profile._id);

  const RetweetItem = ({ rt }) => {
    const [actorName, setActorName] = useState("");
    const [actorProfilePic, setActorProfilePic] = useState(null);
    const [resolvedOrig, setResolvedOrig] = useState(null);

    useEffect(() => {
      let mounted = true;
      const actor = rt?.user || rt?.retweetedBy || null;
      const load = async () => {
        if (!actor) {
          if (mounted) {
            setActorName("Unknown");
            setActorProfilePic(null);
          }
        } else if (typeof actor === "object") {
          if (hasProfileInfo(actor)) {
            if (mounted) {
              setActorName(actor.displayName || actor.userName || actor.fullName || "Unknown");
              setActorProfilePic(actor.profilePicture || actor.avatar || null);
            }
          } else {
            const id = tryGetIdFromCandidate(actor);
            const prof = await resolveProfileById(id);
            if (mounted) {
              setActorName(prof ? (prof.displayName || prof.userName || prof.fullName || "Unknown") : "Unknown");
              setActorProfilePic(prof?.profilePicture || prof?.avatar || null);
            }
          }
        } else {
          const id = tryGetIdFromCandidate(actor);
          const prof = await resolveProfileById(id);
          if (mounted) {
            setActorName(prof ? (prof.displayName || prof.userName || prof.fullName || "Unknown") : "Unknown");
            setActorProfilePic(prof?.profilePicture || prof?.avatar || null);
          }
        }

        const origSource = rt?.originalTweet || rt?.tweet || rt || null;
        if (!origSource) {
          if (mounted) setResolvedOrig(null);
          return;
        }
        const resolved = await resolveTweetUser(origSource);
        if (mounted) setResolvedOrig(resolved);
      };

      load();
      return () => {
        mounted = false;
      };
    }, [rt]);

    const orig = resolvedOrig;
    return (
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-1 flex items-center gap-2">
          <span>Retweeted by</span>
          <span className="font-medium">{actorName || "Unknown"}</span>
          {actorProfilePic ? <img src={actorProfilePic} alt={actorName} className="w-6 h-6 rounded-full object-cover" /> : null}
        </div>
        {orig ? <TweetCard tweet={orig} onUpdate={() => {}} /> : <EmptyState message="Original tweet not available" />}
      </div>
    );
  };

  const QuoteItem = ({ q }) => {
    const [actorName, setActorName] = useState("");
    const [actorProfilePic, setActorProfilePic] = useState(null);
    const [resolvedOrig, setResolvedOrig] = useState(null);

    useEffect(() => {
      let mounted = true;
      const actor = q?.user || null;
      const load = async () => {
        if (!actor) {
          if (mounted) {
            setActorName("Unknown");
            setActorProfilePic(null);
          }
        } else if (typeof actor === "object") {
          if (hasProfileInfo(actor)) {
            if (mounted) {
              setActorName(actor.displayName || actor.userName || actor.fullName || "Unknown");
              setActorProfilePic(actor.profilePicture || actor.avatar || null);
            }
          } else {
            const id = tryGetIdFromCandidate(actor);
            const prof = await resolveProfileById(id);
            if (mounted) {
              setActorName(prof ? (prof.displayName || prof.userName || prof.fullName || "Unknown") : "Unknown");
              setActorProfilePic(prof?.profilePicture || prof?.avatar || null);
            }
          }
        } else {
          const id = tryGetIdFromCandidate(actor);
          const prof = await resolveProfileById(id);
          if (mounted) {
            setActorName(prof ? (prof.displayName || prof.userName || prof.fullName || "Unknown") : "Unknown");
            setActorProfilePic(prof?.profilePicture || prof?.avatar || null);
          }
        }

        const origSource = q?.originalTweet || q?.tweet || null;
        if (!origSource) {
          if (mounted) setResolvedOrig(null);
          return;
        }
        const resolved = await resolveTweetUser(origSource);
        if (mounted) setResolvedOrig(resolved);
      };

      load();
      return () => {
        mounted = false;
      };
    }, [q]);

    const orig = resolvedOrig;
    return (
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-1 flex items-center gap-2">
          <span>Quoted by</span>
          <span className="font-medium">{actorName || "Unknown"}</span>
          {actorProfilePic ? <img src={actorProfilePic} alt={actorName} className="w-6 h-6 rounded-full object-cover" /> : null}
        </div>
        <div className="mb-2">
          <Card className="p-3 bg-gray-50">
            <div className="text-sm text-gray-800">{q?.text}</div>
          </Card>
        </div>
        {orig ? <TweetCard tweet={orig} onUpdate={() => {}} /> : <EmptyState message="Original tweet not available" />}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
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
            <Button text="Logout" styleType="error" onClickHandler={handleLogout} className="px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300" />
          ) : (
            <div className="flex gap-3">
              <Button
                text={followLoading ? "Loading..." : profile.isFollowed ? "Unfollow" : "Follow"}
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

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="text-center">
          <Link to={`/followList?tab=followers&userId=${profile._id}`} className="block">
            <p className="text-gray-500 text-sm">Followers</p>
            <p className="text-2xl font-bold">{profile.followerCount ?? 0}</p>
          </Link>
        </Card>
        <Card className="text-center">
          <Link to={`/followList?tab=following&userId=${profile._id}`} className="block">
            <p className="text-gray-500 text-sm">Following</p>
            <p className="text-2xl font-bold">{profile.followingCount ?? 0}</p>
          </Link>
        </Card>
        <Card className="text-center">
          <p className="text-gray-500 text-sm">Tweets</p>
          <p className="text-2xl font-bold">{Array.isArray(tweets) ? tweets.length : 0}</p>
        </Card>
        <Card className="text-center">
          <p className="text-gray-500 text-sm">Role</p>
          <p className="text-2xl font-bold">{profile.role ?? "user"}</p>
        </Card>
      </div>

      <div className="mt-8">
        <div className="flex gap-3 border-b pb-2">
          {["tweets", "retweets", "quotes"].map((tab) => (
            <button
              key={tab}
              className={`px-3 py-2 ${activeTab === tab ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {activeTab === "tweets" && (
            <>
              {tweetsLoading && <EmptyState message="Loading tweets..." />}
              {tweetsError && <p className="text-red-600">{tweetsError}</p>}
              {!tweetsLoading && Array.isArray(tweets) && tweets.length === 0 && <EmptyState message="No tweets yet" />}
              {Array.isArray(tweets) && tweets.map((t) => <TweetCard key={t._id || t.id} tweet={t} onUpdate={() => {}} />)}
            </>
          )}

          {activeTab === "retweets" && (
            <>
              {retweetsLoading && <EmptyState message="Loading retweets..." />}
              {retweetsError && <p className="text-red-600">{retweetsError}</p>}
              {!retweetsLoading && Array.isArray(retweets) && retweets.length === 0 && <EmptyState message="No retweets yet" />}
              {Array.isArray(retweets) && retweets.map((r) => <RetweetItem key={r._id || r.id} rt={r} />)}
            </>
          )}

          {activeTab === "quotes" && (
            <>
              {quotesLoading && <EmptyState message="Loading quotes..." />}
              {quotesError && <p className="text-red-600">{quotesError}</p>}
              {!quotesLoading && Array.isArray(quotes) && quotes.length === 0 && <EmptyState message="No quotes yet" />}
              {Array.isArray(quotes) && quotes.map((q) => <QuoteItem key={q._id || q.id} q={q} />)}
            </>
          )}
        </div>
      </div>

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
