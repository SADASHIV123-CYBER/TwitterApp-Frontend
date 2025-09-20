// src/components/TweetCard/TweetCard.jsx
import { useState, useEffect, useContext } from "react";
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
} from "../../api/tweetApi";
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

  const [tweetState, setTweetState] = useState(tweet);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteText, setQuoteText] = useState("");

  useEffect(() => {
    setTweetState(tweet);
  }, [tweet]);

  const applyServerResult = (resObj) => {
    if (!resObj) return;

    // If server returned full tweet object
    if (resObj._id && String(resObj._id) === String(tweetState._id)) {
      if (Array.isArray(resObj.likes) && (resObj.likeCount === undefined || resObj.likeCount === null)) {
        resObj.likeCount = resObj.likes.length;
      }
      setTweetState(resObj);
      if (onUpdate) onUpdate(resObj);
      return;
    }

    // If server returned { updatedTweet }
    if (resObj.updatedTweet && resObj.updatedTweet._id) {
      const t = resObj.updatedTweet;
      if (Array.isArray(t.likes) && (t.likeCount === undefined || t.likeCount === null)) {
        t.likeCount = t.likes.length;
      }
      setTweetState(t);
      if (onUpdate) onUpdate(t);
      return;
    }

    // quote object (has user && originalTweet)
    if (resObj.user && resObj.originalTweet) {
      const oid = String(resObj.originalTweet);
      if (tweetState && String(tweetState._id) === oid) {
        setTweetState((prev) => {
          const next = { ...prev, quoteCount: (prev.quoteCount || 0) + 1 };
          if (onUpdate) onUpdate(next);
          return next;
        });
      }
      return;
    }

    // patch by fields
    const patch = {};
    if (Array.isArray(resObj.likes)) {
      patch.likes = resObj.likes;
      patch.likeCount = resObj.likeCount ?? resObj.likes.length;
    }
    if (typeof resObj.likeCount === "number") patch.likeCount = resObj.likeCount;
    if (typeof resObj.retweetCount === "number") patch.retweetCount = resObj.retweetCount;
    if (typeof resObj.quoteCount === "number") patch.quoteCount = resObj.quoteCount;

    if (resObj.action === "done") patch.retweetCount = (tweetState.retweetCount || 0) + 1;
    if (resObj.action === "undone") patch.retweetCount = Math.max(0, (tweetState.retweetCount || 0) - 1);

    if (Object.keys(patch).length > 0) {
      setTweetState((prev) => {
        const next = { ...prev, ...patch };
        if (onUpdate) onUpdate(next);
        return next;
      });
    }
  };

  const doAction = async (apiCallPromise) => {
    setLoadingAction(true);
    try {
      const res = await apiCallPromise;
      const data = pickData(res);
      applyServerResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  const toggleLike = async () => {
    if (!tweetState?._id) return;
    const liked = idIn(tweetState.likes || [], currentUserId);
    await doAction(liked ? unlikeTweet(tweetState._id) : likeTweet(tweetState._id));
  };

  const doRetweet = async () => {
    if (!tweetState?._id) return;
    await doAction(retweet(tweetState._id));
  };

  const submitComment = async () => {
    const text = commentText.trim();
    if (!text) return;
    setLoadingAction(true);
    try {
      const res = await addComment(tweetState._id, text);
      const data = pickData(res);
      if (data && data.comments) {
        setTweetState(data);
        if (onUpdate) onUpdate(data);
      } else {
        applyServerResult(data);
      }
      setCommentText("");
      setShowComments(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  const submitReply = async (commentId, text) => {
    if (!commentId) return;
    setLoadingAction(true);
    try {
      const res = await replyToComment(tweetState._id, commentId, text);
      const data = pickData(res);
      applyServerResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  const toggleCmtLike = async (commentId) => {
    if (!commentId) return;
    setLoadingAction(true);
    try {
      const res = await toggleCommentLike(tweetState._id, commentId);
      const data = pickData(res);
      if (data && data.updatedTweet) {
        setTweetState(data.updatedTweet);
        if (onUpdate) onUpdate(data.updatedTweet);
      } else {
        applyServerResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  // NEW: update comment handler (called from CommentList)
  const handleUpdateComment = async (commentId, newText) => {
    if (!tweetState?._id) return;
    setLoadingAction(true);
    try {
      const res = await updateComment(tweetState._id, commentId, newText);
      const data = pickData(res);
      // server may return updated tweet or updated comment container
      if (data && data.updatedTweet) {
        setTweetState(data.updatedTweet);
        if (onUpdate) onUpdate(data.updatedTweet);
      } else {
        // if the server returned full tweet object or patchable fields
        applyServerResult(data);
      }
    } catch (err) {
      console.error("Failed to update comment", err);
      // optionally show UI alert
    } finally {
      setLoadingAction(false);
    }
  };

  // NEW: soft delete comment handler
  const handleSoftDeleteComment = async (commentId) => {
    if (!tweetState?._id) return;
    if (!confirm("Delete this comment?")) return;
    setLoadingAction(true);
    try {
      const res = await softDeleteComment(tweetState._id, commentId);
      const data = pickData(res);
      if (data && data.updatedTweet) {
        setTweetState(data.updatedTweet);
        if (onUpdate) onUpdate(data.updatedTweet);
      } else {
        applyServerResult(data);
      }
    } catch (err) {
      console.error("Failed to delete comment", err);
    } finally {
      setLoadingAction(false);
    }
  };

  const submitQuote = async () => {
    const text = quoteText.trim();
    if (!text) return;
    setLoadingAction(true);
    try {
      const res = await quoteTweet(tweetState._id, text);
      const data = pickData(res);
      applyServerResult(data);
      setQuoteText("");
      setQuoteOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  const author = tweetState && typeof tweetState.author === "object" ? tweetState.author : null;
  const authorName = (author && (author.displayName || author.userName)) || (typeof tweetState.author === "string" ? tweetState.author : "Unknown");
  const authorPic = (author && (author.profilePicture || author.avatar)) || "/default-avatar.png";

  const tweetImage = tweetState.image || tweetState.imagePath || tweetState.tweetImage || tweetState.media || tweetState.imageUrl;
  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const clean = path.replace(/^\/+/, "");
    return `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/${clean}`;
  };

  const liked = idIn(tweetState.likes || [], currentUserId);
  const likeCount = tweetState.likeCount ?? (tweetState.likes ? tweetState.likes.length : 0);
  const retweetCount = tweetState.retweetCount ?? 0;
  const commentCount = tweetState.comments ? tweetState.comments.length : 0;
  const quoteCount = tweetState.quoteCount ?? 0;

  return (
    <Card className="mb-4">
      <div className="flex gap-4">
        <img src={authorPic} alt={authorName} className="w-12 h-12 rounded-full object-cover" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">{authorName}</div>
              <div className="text-xs text-gray-400">{new Date(tweetState.createdAt).toLocaleString()}</div>
            </div>
          </div>

          <div className="mt-3 text-gray-800 whitespace-pre-wrap">{tweetState.body}</div>

          {tweetImage && (
            <div className="mt-3">
              <img src={getFullImageUrl(tweetImage)} alt="tweet media" className="w-full max-h-96 object-cover rounded-md border" />
            </div>
          )}

          <div className="mt-4 flex gap-6 text-sm text-gray-600">
            <Button
              text={`${liked ? "Unlike" : "Like"} (${likeCount})`}
              onClickHandler={toggleLike}
              disabled={loadingAction}
              styleType="secondary"
              className="px-0 py-0 text-sm text-gray-600 hover:underline"
            />

            <Button
              text={`Retweet (${retweetCount})`}
              onClickHandler={doRetweet}
              disabled={loadingAction}
              styleType="secondary"
              className="px-0 py-0 text-sm text-gray-600 hover:underline"
            />

            <Button
              text={`Comments (${commentCount})`}
              onClickHandler={() => setShowComments((s) => !s)}
              styleType="secondary"
              className="px-0 py-0 text-sm text-gray-600 hover:underline"
            />

            <Button
              text={`Quote (${quoteCount})`}
              onClickHandler={() => setQuoteOpen((s) => !s)}
              styleType="secondary"
              className="px-0 py-0 text-sm text-gray-600 hover:underline"
            />
          </div>

          {quoteOpen && (
            <div className="mt-3">
              <textarea rows={2} value={quoteText} onChange={(e) => setQuoteText(e.target.value)} className="w-full p-2 border rounded" placeholder="Add a comment to your quote" />
              <div className="flex gap-2 justify-end mt-2">
                <Button text="Cancel" onClickHandler={() => setQuoteOpen(false)} styleType="secondary" />
                <Button text="Quote" onClickHandler={submitQuote} disabled={!quoteText.trim() || loadingAction} />
              </div>
            </div>
          )}

          <div className="mt-4">
            <div className="flex gap-2">
              <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a comment" className="flex-1 p-2 rounded border" />
              <Button text="Comment" onClickHandler={submitComment} disabled={!commentText.trim() || loadingAction} />
            </div>
          </div>

          {showComments && (
            <div className="mt-4">
              <CommentList
                comments={tweetState.comments || []}
                currentUserId={currentUserId}
                onReplyToComment={submitReply}
                onToggleCommentLike={toggleCmtLike}
                onUpdateComment={handleUpdateComment}         // NEW
                onSoftDeleteComment={handleSoftDeleteComment} // NEW
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
