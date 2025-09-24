import React, { useState, useEffect, useContext, useCallback, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Card from "../Card/Card";
import Button from "../Button/Button";
import CommentList from "../Comment/CommentList";
import {
  likeTweet,
  unlikeTweet,
  retweet,
  quoteTweet,
  addComment,
  replyToComment,
  toggleCommentLike,
  updateComment,
  softDeleteComment,
  updateTweet,
  deleteTweet,
} from "../../api/tweetApi";
import { toggleFollow, getUserProfile } from "../../api/userApi";
import { AuthContext } from "../../context/AuthContext";

function idIn(arr = [], id) {
  return arr.some(
    (it) =>
      String(it) === String(id) ||
      (it && typeof it === "object" && String(it._id || it.id) === String(id))
  );
}

function pickData(res) {
  if (!res) return null;
  if (res.data && res.data.data) return res.data.data;
  if (res.data) return res.data;
  return res;
}

export default function TweetCard({ tweet, onUpdate }) {
  const { user } = useContext(AuthContext);
  const currentUserId = user?.id ?? user?._id;
  const navigate = useNavigate();

  const [tweetState, setTweetState] = useState(tweet);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteText, setQuoteText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [isDeletedLocally, setIsDeletedLocally] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    setTweetState(tweet);
  }, [tweet]);

  useEffect(() => {
    if (isEditing) {
      setEditText(tweetState?.body ?? "");
    }
  }, [isEditing, tweetState]);

  // fetch author follow state if missing
  useEffect(() => {
    const authorObj = tweetState?.author;
    const authorId = authorObj?._id ?? authorObj;
    if (!authorId) return;

    if (typeof authorObj === "object" && authorObj.isFollowed === undefined) {
      let mounted = true;
      (async () => {
        try {
          const profile = await getUserProfile(authorId);
          if (!mounted) return;
          setTweetState((prev) => {
            const prevAuthor = prev?.author || {};
            const nextAuthor = {
              ...prevAuthor,
              ...(profile ? { isFollowed: profile.isFollowed, followerCount: profile.followerCount } : {}),
            };
            return { ...prev, author: nextAuthor };
          });
        } catch (err) {
          // ignore
        }
      })();
      return () => { mounted = false; };
    }
  }, [tweetState?.author]);

  // schedule parent updates asynchronously (avoids setState-in-render errors)
  const callOnUpdate = useCallback((payload) => {
    if (!onUpdate) return;
    if (typeof queueMicrotask === "function") {
      queueMicrotask(() => onUpdate(payload));
    } else if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => onUpdate(payload));
    } else {
      setTimeout(() => onUpdate(payload), 0);
    }
  }, [onUpdate]);

  const applyServerResult = useCallback((resObj) => {
    if (!resObj) return;

    if (resObj._id && String(resObj._id) === String(tweetState._id)) {
      if (Array.isArray(resObj.likes) && (resObj.likeCount === undefined || resObj.likeCount === null)) {
        resObj.likeCount = resObj.likes.length;
      }
      setTweetState(resObj);
      callOnUpdate(resObj);
      return;
    }

    if (resObj.updatedTweet && resObj.updatedTweet._id) {
      const t = resObj.updatedTweet;
      if (Array.isArray(t.likes) && (t.likeCount === undefined || t.likeCount === null)) {
        t.likeCount = t.likes.length;
      }
      setTweetState(t);
      callOnUpdate(t);
      return;
    }

    if (resObj.user && resObj.originalTweet) {
      const oid = String(resObj.originalTweet);
      if (tweetState && String(tweetState._id) === oid) {
        const next = { ...tweetState, quoteCount: (tweetState.quoteCount || 0) + 1 };
        setTweetState(next);
        callOnUpdate(next);
      }
      return;
    }

    const patch = {};
    if (Array.isArray(resObj.likes)) {
      patch.likes = resObj.likes;
      patch.likeCount = resObj.likeCount ?? resObj.likes.length;
    }
    if (typeof resObj.likeCount === "number") patch.likeCount = resObj.likeCount;
    if (typeof resObj.retweetCount === "number") patch.retweetCount = resObj.retweetCount;
    if (typeof resObj.quoteCount === "number") patch.quoteCount = resObj.quoteCount;

    if (resObj.action === "done")
      patch.retweetCount = (tweetState.retweetCount || 0) + 1;
    if (resObj.action === "undone")
      patch.retweetCount = Math.max(0, (tweetState.retweetCount || 0) - 1);

    if (Object.keys(patch).length > 0) {
      setTweetState((prev) => {
        const next = { ...prev, ...patch };
        callOnUpdate(next);
        return next;
      });
    }
  }, [tweetState, callOnUpdate]);

  const doAction = useCallback(async (apiCallPromise) => {
    setLoadingAction(true);
    try {
      const res = await apiCallPromise;
      const data = pickData(res);
      applyServerResult(data);
      return data;
    } catch (err) {
      throw err;
    } finally {
      setLoadingAction(false);
    }
  }, [applyServerResult]);

  // Helper: fetch latest tweet from server to reconcile after flaky responses
  const fetchLatestTweetFromServer = useCallback(async (attempt = 1) => {
    const API_ROOT = import.meta.env.VITE_API_URL || "";
    const url = `${API_ROOT}/api/v1/tweets/${encodeURIComponent(String(tweetState._id))}`;
    try {
      const res = await axios.get(url, { withCredentials: true });
      const serverData = pickData(res);
      return serverData;
    } catch (err) {
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 400));
        return fetchLatestTweetFromServer(attempt + 1);
      }
      return null;
    }
  }, [tweetState?._id]);

  // LIKE
  const toggleLike = useCallback(async () => {
    if (!tweetState?._id) return;
    const liked = idIn(tweetState.likes || [], currentUserId);

    setTweetState((prev) => {
      const prevLikes = Array.isArray(prev.likes) ? [...prev.likes] : [];
      const nextLikes = liked ? prevLikes.filter((x) => String(x) !== String(currentUserId)) : [currentUserId, ...prevLikes];
      const next = { ...prev, likes: nextLikes, likeCount: nextLikes.length };
      callOnUpdate(next);
      return next;
    });

    try {
      await doAction(liked ? unlikeTweet(tweetState._id) : likeTweet(tweetState._id));
    } catch (err) {
      const server = await fetchLatestTweetFromServer();
      if (server) {
        setTweetState(server);
        callOnUpdate(server);
      } else {
        // best-effort rollback
        setTweetState((prev) => {
          const prevLikes = Array.isArray(prev.likes) ? [...prev.likes] : [];
          const nowLiked = idIn(prevLikes, currentUserId);
          const nextLikes = nowLiked ? prevLikes.filter((x) => String(x) !== String(currentUserId)) : [currentUserId, ...prevLikes];
          const next = { ...prev, likes: nextLikes, likeCount: nextLikes.length };
          callOnUpdate(next);
          return next;
        });
      }
      alert(err?.message || "Failed to toggle like");
    }
  }, [tweetState, currentUserId, doAction, callOnUpdate, fetchLatestTweetFromServer]);

  // RETWEET (optimistic + reconcile)
  const doRetweet = useCallback(async () => {
    if (!tweetState?._id) return;

    setTweetState((prev) => {
      const next = { ...prev, retweetCount: (prev.retweetCount || 0) + 1 };
      callOnUpdate(next);
      return next;
    });

    try {
      await doAction(retweet(tweetState._id));
    } catch (err) {
      const server = await fetchLatestTweetFromServer();
      if (server) {
        setTweetState(server);
        callOnUpdate(server);
        return;
      }
      setTweetState((prev) => {
        const next = { ...prev, retweetCount: Math.max(0, (prev.retweetCount || 1) - 1) };
        callOnUpdate(next);
        return next;
      });
      alert(err?.message || "Retweet failed");
    }
  }, [tweetState, doAction, callOnUpdate, fetchLatestTweetFromServer]);

  // COMMENT
  const submitComment = useCallback(async () => {
    const text = commentText.trim();
    if (!text) return;
    setLoadingAction(true);
    try {
      const res = await addComment(tweetState._id, text);
      const data = pickData(res);
      if (data && data.comments) {
        setTweetState(data);
        callOnUpdate(data);
      } else {
        applyServerResult(data);
      }
      setCommentText("");
      setShowComments(true);
    } catch (err) {
      console.error("Add comment failed", err);
      alert(err?.message || "Failed to add comment");
    } finally {
      setLoadingAction(false);
    }
  }, [commentText, tweetState, applyServerResult, callOnUpdate]);

  // REPLY
  const submitReply = useCallback(async (commentId, text) => {
    if (!commentId) return;
    setLoadingAction(true);
    try {
      const res = await replyToComment(tweetState._id, commentId, text);
      const data = pickData(res);
      applyServerResult(data);
    } catch (err) {
      console.error("Reply failed", err);
      alert(err?.message || "Failed to reply");
    } finally {
      setLoadingAction(false);
    }
  }, [tweetState, applyServerResult]);

  // TOGGLE COMMENT LIKE
  const toggleCmtLike = useCallback(async (commentId) => {
    if (!commentId) return;
    setLoadingAction(true);
    try {
      const res = await toggleCommentLike(tweetState._id, commentId);
      const data = pickData(res);
      if (data && data.updatedTweet) {
        setTweetState(data.updatedTweet);
        callOnUpdate(data.updatedTweet);
      } else {
        applyServerResult(data);
      }
    } catch (err) {
      console.error("Toggle comment like failed", err);
      alert(err?.message || "Failed to toggle comment like");
    } finally {
      setLoadingAction(false);
    }
  }, [tweetState, applyServerResult, callOnUpdate]);

  // UPDATE COMMENT
  const handleUpdateComment = useCallback(async (commentId, newText) => {
    if (!tweetState?._id) return;
    setLoadingAction(true);
    try {
      const res = await updateComment(tweetState._id, commentId, newText);
      const data = pickData(res);
      if (data && data.updatedTweet) {
        setTweetState(data.updatedTweet);
        callOnUpdate(data.updatedTweet);
      } else {
        applyServerResult(data);
      }
    } catch (err) {
      console.error("Failed to update comment", err);
      alert(err?.message || "Failed to update comment");
    } finally {
      setLoadingAction(false);
    }
  }, [tweetState, applyServerResult, callOnUpdate]);

  // SOFT DELETE COMMENT
  const handleSoftDeleteComment = useCallback(async (commentId) => {
    if (!tweetState?._id) return;
    if (!confirm("Delete this comment?")) return;
    setLoadingAction(true);
    try {
      const res = await softDeleteComment(tweetState._id, commentId);
      const data = pickData(res);
      if (data && data.updatedTweet) {
        setTweetState(data.updatedTweet);
        callOnUpdate(data.updatedTweet);
      } else {
        applyServerResult(data);
      }
    } catch (err) {
      console.error("Failed to delete comment", err);
      alert(err?.message || "Failed to delete comment");
    } finally {
      setLoadingAction(false);
    }
  }, [tweetState, applyServerResult, callOnUpdate]);

  // QUOTE (optimistic + reconcile)
  const submitQuote = useCallback(async () => {
    const text = quoteText.trim();
    if (!text) return;

    setTweetState((prev) => {
      const next = { ...prev, quoteCount: (prev.quoteCount || 0) + 1 };
      callOnUpdate(next);
      return next;
    });

    setLoadingAction(true);
    try {
      const res = await quoteTweet(tweetState._id, text);
      const data = pickData(res);
      applyServerResult(data);
      setQuoteText("");
      setQuoteOpen(false);
    } catch (err) {
      const server = await fetchLatestTweetFromServer();
      if (server) {
        setTweetState(server);
        callOnUpdate(server);
        setQuoteText("");
        setQuoteOpen(false);
        setLoadingAction(false);
        return;
      }
      setTweetState((prev) => {
        const next = { ...prev, quoteCount: Math.max(0, (prev.quoteCount || 1) - 1) };
        callOnUpdate(next);
        return next;
      });
      console.error("Quote failed:", err);
      alert(err?.message || "Failed to quote");
    } finally {
      setLoadingAction(false);
    }
  }, [quoteText, tweetState, applyServerResult, callOnUpdate, fetchLatestTweetFromServer]);

  const startEdit = useCallback(() => {
    setIsEditing(true);
    setEditText(tweetState?.body ?? "");
  }, [tweetState]);

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditText("");
  }, []);

  const saveEdit = useCallback(async () => {
    const trimmed = (editText || "").trim();
    if (!trimmed) {
      alert("Tweet cannot be empty.");
      return;
    }
    setLoadingAction(true);
    try {
      const res = await updateTweet(tweetState._id, trimmed);
      const data = pickData(res);
      if (data && data._id) {
        setTweetState(data);
        callOnUpdate(data);
      } else if (data && data.updatedTweet) {
        setTweetState(data.updatedTweet);
        callOnUpdate(data.updatedTweet);
      } else {
        applyServerResult(data);
      }
      setIsEditing(false);
      setEditText("");
    } catch (err) {
      console.error("Failed to save edit:", err);
      alert(err?.message || "Failed to update tweet");
    } finally {
      setLoadingAction(false);
    }
  }, [editText, tweetState, applyServerResult, callOnUpdate]);

  const confirmAndDelete = useCallback(async () => {
    if (!tweetState?._id) return;
    if (!confirm("Are you sure you want to delete this tweet?")) return;
    setLoadingAction(true);
    try {
      await deleteTweet(tweetState._id);
      setIsDeletedLocally(true);
      callOnUpdate({ _id: tweetState._id, deleted: true });
    } catch (err) {
      console.error("Delete tweet failed:", err);
      alert(err?.message || "Failed to delete tweet");
    } finally {
      setLoadingAction(false);
    }
  }, [tweetState, callOnUpdate]);

  const handleToggleFollow = useCallback(async () => {
    const authorObj = tweetState?.author;
    const authorId = authorObj?._id ?? authorObj;
    if (!authorId || String(authorId) === String(currentUserId)) return;

    setFollowLoading(true);
    try {
      const result = await toggleFollow(authorId);

      if (result && typeof result.action === "string") {
        setTweetState((prev) => {
          const prevAuthor = prev?.author || {};
          const nextAuthor = { ...prevAuthor, isFollowed: result.action === "followed" };
          if (result.followerCount !== undefined) nextAuthor.followerCount = result.followerCount;
          return { ...prev, author: nextAuthor };
        });
      } else {
        setTweetState((prev) => {
          const prevAuthor = prev?.author || {};
          const nextAuthor = { ...prevAuthor, isFollowed: !prevAuthor?.isFollowed };
          if (result && result.followerCount !== undefined) nextAuthor.followerCount = result.followerCount;
          return { ...prev, author: nextAuthor };
        });
      }
    } catch (err) {
      console.error("Follow toggle failed", err);
      alert(err?.message || "Failed to toggle follow");
    } finally {
      setFollowLoading(false);
    }
  }, [tweetState, currentUserId]);

  const goToProfile = useCallback((ev) => {
    ev?.stopPropagation?.();
    const authorObj = tweetState?.author;
    const authorId = authorObj?._id ?? authorObj;
    if (!authorId) return;
    navigate(`/profile/${authorId}`, { state: { hideContact: true } });
  }, [tweetState, navigate]);

  if (!tweetState || isDeletedLocally) return null;

  const author = useMemo(() => (tweetState && typeof tweetState.author === "object" ? tweetState.author : null), [tweetState]);
  const authorName = useMemo(() =>
    (author && (author.displayName || author.userName)) ||
    (typeof tweetState.author === "string" ? tweetState.author : "Unknown"),
  [author, tweetState.author]);
  const authorPic = useMemo(() => (author && (author.profilePicture || author.avatar)) || "/default-avatar.png", [author]);

  const tweetImage = useMemo(() =>
    tweetState.image || tweetState.imagePath || tweetState.tweetImage || tweetState.media || tweetState.imageUrl,
    [tweetState]
  );

  const getFullImageUrl = useCallback((path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const clean = path.replace(/^\/+/, "");
    return `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/${clean}`;
  }, []);

  const liked = useMemo(() => idIn(tweetState.likes || [], currentUserId), [tweetState.likes, currentUserId]);
  const likeCount = useMemo(() => tweetState.likeCount ?? (tweetState.likes ? tweetState.likes.length : 0), [tweetState]);
  const retweetCount = tweetState.retweetCount ?? 0;
  const commentCount = tweetState.comments ? tweetState.comments.length : 0;
  const quoteCount = tweetState.quoteCount ?? 0;
  const isAuthor = String(tweetState.author?._id ?? tweetState.author) === String(currentUserId);
  const isAuthorFollowed = author?.isFollowed ?? false;

  return (
    <Card className="mb-4 p-3 sm:p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100">
      <div className="flex gap-3 sm:gap-4 items-start">
        {/* Avatar */}
        <div
          onClick={goToProfile}
          role="button"
          tabIndex={0}
          aria-label={`Open profile of ${authorName}`}
          className="flex-shrink-0 cursor-pointer"
          onKeyDown={(e) => { if (e.key === "Enter") goToProfile(e); }}
          style={{ lineHeight: 0 }}
        >
          <img
            src={authorPic}
            alt={authorName}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white shadow-sm"
            onError={(e) => {
              e.target.src = "/default-avatar.png";
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0">
              <div className="min-w-0">
                <div
                  onClick={goToProfile}
                  onKeyDown={(e) => { if (e.key === "Enter") goToProfile(e); }}
                  role="button"
                  tabIndex={0}
                  className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors truncate text-sm sm:text-base"
                >
                  {authorName}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {new Date(tweetState.createdAt).toLocaleString()}
                </div>
              </div>

              {!isAuthor && (
                <div className="sm:self-start">
                  <Button
                    text={followLoading ? "..." : isAuthorFollowed ? "Following" : "Follow"}
                    onClickHandler={handleToggleFollow}
                    disabled={followLoading}
                    styleType={isAuthorFollowed ? "outline" : "primary"}
                    className="px-3 py-1.5 text-xs rounded-full min-w-[80px] sm:min-w-[90px]"
                  />
                </div>
              )}
            </div>

            {isAuthor && (
              <div className="flex gap-2 self-start sm:self-auto">
                {!isEditing && (
                  <>
                    <button 
                      onClick={startEdit} 
                      className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={confirmAndDelete} 
                      className="text-xs sm:text-sm text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Tweet Content */}
          {isEditing ? (
            <div className="mt-3">
              <textarea 
                rows={3} 
                value={editText} 
                onChange={(e) => setEditText(e.target.value)} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="Edit your tweet..."
              />
              <div className="mt-3 flex flex-col sm:flex-row gap-2 justify-end">
                <Button 
                  text="Cancel" 
                  onClickHandler={cancelEdit} 
                  styleType="secondary" 
                  className="w-full sm:w-auto px-4 py-2 text-sm"
                />
                <Button 
                  text="Save Changes" 
                  onClickHandler={saveEdit} 
                  disabled={loadingAction || !editText.trim()} 
                  className="w-full sm:w-auto px-4 py-2 text-sm"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="mt-2 text-gray-800 whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                {tweetState.body}
              </div>

              {tweetImage && (
                <div className="mt-3 rounded-lg overflow-hidden border border-gray-200">
                  <img 
                    src={getFullImageUrl(tweetImage)} 
                    alt="Tweet media" 
                    className="w-full max-h-80 sm:max-h-96 object-cover"
                    loading="lazy"
                  />
                </div>
              )}
            </>
          )}

          {/* Action Buttons */}
          <div className="mt-4 flex flex-wrap gap-3 sm:gap-6 text-sm">
            <Button
              text={`${liked ? "❤️" : "🤍"} ${likeCount}`}
              onClickHandler={toggleLike}
              disabled={loadingAction}
              styleType="secondary"
              className={`px-3 py-2 text-xs sm:text-sm rounded-full border transition-all duration-200 ${
                liked 
                  ? "bg-red-50 text-red-700 border-red-200" 
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
              }`}
            />

            <Button
              text={`🔁 ${retweetCount}`}
              onClickHandler={doRetweet}
              disabled={loadingAction}
              styleType="secondary"
              className="px-3 py-2 text-xs sm:text-sm bg-gray-50 text-gray-700 border border-gray-200 rounded-full hover:bg-gray-100 transition-all duration-200"
            />

            <Button
              text={`💬 ${commentCount}`}
              onClickHandler={() => setShowComments((s) => !s)}
              styleType="secondary"
              className="px-3 py-2 text-xs sm:text-sm bg-gray-50 text-gray-700 border border-gray-200 rounded-full hover:bg-gray-100 transition-all duration-200"
            />

            <Button
              text={`🔖 ${quoteCount}`}
              onClickHandler={() => setQuoteOpen((s) => !s)}
              styleType="secondary"
              className="px-3 py-2 text-xs sm:text-sm bg-gray-50 text-gray-700 border border-gray-200 rounded-full hover:bg-gray-100 transition-all duration-200"
            />
          </div>

          {/* Quote Tweet Section */}
          {quoteOpen && (
            <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
              <textarea 
                rows={3} 
                value={quoteText} 
                onChange={(e) => setQuoteText(e.target.value)} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="Add your thoughts to this quote tweet..."
              />
              <div className="mt-3 flex flex-col sm:flex-row gap-2 justify-end">
                <Button 
                  text="Cancel" 
                  onClickHandler={() => setQuoteOpen(false)} 
                  styleType="secondary" 
                  className="w-full sm:w-auto px-4 py-2 text-sm"
                />
                <Button 
                  text="Post Quote" 
                  onClickHandler={submitQuote} 
                  disabled={!quoteText.trim() || loadingAction} 
                  className="w-full sm:w-auto px-4 py-2 text-sm"
                />
              </div>
            </div>
          )}

          {/* Comment Input */}
          <div className="mt-4 bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                value={commentText} 
                onChange={(e) => setCommentText(e.target.value)} 
                placeholder="Write a comment..." 
                className="flex-1 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
              <Button 
                text="Comment" 
                onClickHandler={submitComment} 
                disabled={!commentText.trim() || loadingAction} 
                className="w-full sm:w-auto px-4 py-3 text-sm font-medium"
              />
            </div>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <CommentList
                comments={tweetState.comments || []}
                currentUserId={currentUserId}
                onReplyToComment={submitReply}
                onToggleCommentLike={toggleCmtLike}
                onUpdateComment={handleUpdateComment}
                onSoftDeleteComment={handleSoftDeleteComment}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}