import React, { useState, useCallback, memo } from "react";
import Button from "../Button/Button";

function isSameId(a, b) {
  if (!a || !b) return false;
  return String(a) === String(b) || (a._id && String(a._id) === String(b));
}

/**
 * CommentItem
 * - memoized to avoid rerenders when unrelated comments change
 * - handlers are stable via useCallback
 */
export const CommentItem = memo(function CommentItem({
  comment,
  currentUserId,
  onReply,
  onToggleLike,
  onUpdate,     // (commentId, newText)
  onSoftDelete, // (commentId)
}) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text || "");

  const liked = (comment.likes || []).some((id) => String(id) === String(currentUserId));
  const isOwner = isSameId(comment.user?._id ?? comment.user, currentUserId);

  // stable handlers
  const handleReplySubmit = useCallback(async () => {
    const t = replyText.trim();
    if (!t) return;
    if (onReply) await onReply(comment._id, t);
    setReplyText("");
    setReplyOpen(false);
  }, [replyText, onReply, comment._id]);

  const handleSaveEdit = useCallback(async () => {
    const t = editText.trim();
    if (!t) return;
    if (onUpdate) {
      await onUpdate(comment._id, t);
    }
    setEditing(false);
  }, [editText, onUpdate, comment._id]);

  const handleCancelEdit = useCallback(() => {
    setEditText(comment.text || "");
    setEditing(false);
  }, [comment.text]);

  const handleSoftDelete = useCallback(async () => {
    if (!onSoftDelete) return;
    await onSoftDelete(comment._id);
  }, [onSoftDelete, comment._id]);

  const toggleReplyOpen = useCallback(() => setReplyOpen((s) => !s), []);

  return (
    <div className="py-3 border-b border-gray-100">
      <div className="text-sm flex items-center justify-between">
        <div>
          <span className="font-medium">{comment.user?.displayName || comment.user?.userName || "User"}</span>
          <span className="text-gray-400 text-xs ml-2">{new Date(comment.createdAt).toLocaleString()}</span>
        </div>
        <div className="text-xs text-gray-400">
          {isOwner && <span className="ml-2">• you</span>}
        </div>
      </div>

      {!editing ? (
        <div className="mt-1 text-gray-700">
          {comment.isDeleted ? <em className="text-gray-400">Comment deleted</em> : comment.text}
        </div>
      ) : (
        <div className="mt-1">
          <textarea rows={2} value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full p-2 border rounded" />
          <div className="mt-2 flex gap-2 justify-end">
            <Button text="Cancel" onClickHandler={handleCancelEdit} styleType="secondary" />
            <Button text="Save" onClickHandler={handleSaveEdit} disabled={!editText.trim()} />
          </div>
        </div>
      )}

      <div className="mt-2 flex gap-4 text-sm text-gray-500">
        <Button
          text={`${liked ? "Unlike" : "Like"} (${comment.likes?.length || 0})`}
          onClickHandler={() => onToggleLike && onToggleLike(comment._id)}
          styleType="secondary"
          className="px-0 py-0 text-sm text-gray-500 hover:underline"
        />
        <Button
          text="Reply"
          onClickHandler={toggleReplyOpen}
          styleType="secondary"
          className="px-0 py-0 text-sm text-gray-500 hover:underline"
        />

        {isOwner && !comment.isDeleted && (
          <>
            <Button
              text="Edit"
              onClickHandler={() => setEditing(true)}
              styleType="secondary"
              className="px-0 py-0 text-sm text-gray-500 hover:underline"
            />
            <Button
              text="Delete"
              onClickHandler={handleSoftDelete}
              styleType="secondary"
              className="px-0 py-0 text-sm text-red-500 hover:underline"
            />
          </>
        )}
      </div>

      {replyOpen && (
        <div className="mt-3">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={2}
            className="w-full p-2 border rounded"
            placeholder="Write a reply"
          />
          <div className="mt-2 flex gap-2 justify-end">
            <Button text="Cancel" onClickHandler={() => setReplyOpen(false)} styleType="secondary" />
            <Button text="Reply" onClickHandler={handleReplySubmit} disabled={!replyText.trim()} />
          </div>
        </div>
      )}

      {comment.replies?.length > 0 && (
        <div className="mt-3 pl-4 border-l border-gray-100">
          {comment.replies.map((r) => (
            <div key={r._id || `${r.user}_${r.createdAt}`} className="mb-3">
              <div className="text-sm font-medium">{r.user?.displayName || r.user?.userName || "User"}</div>
              <div className="text-gray-700">{r.text}</div>
              <div className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // custom equality: only rerender when important comment fields change or currentUserId changes
  const a = prevProps.comment || {};
  const b = nextProps.comment || {};

  if (String(a._id) !== String(b._id)) return false;
  if (a.text !== b.text) return false;
  if (a.isDeleted !== b.isDeleted) return false;
  if ((a.likes?.length || 0) !== (b.likes?.length || 0)) return false;
  if ((a.replies?.length || 0) !== (b.replies?.length || 0)) return false;
  if (prevProps.currentUserId !== nextProps.currentUserId) return false;

  // handlers may change reference but we accept that (they should be stable when passed from parent)
  return true;
});

export default memo(function CommentList({
  comments = [],
  currentUserId,
  onReplyToComment,
  onToggleCommentLike,
  onUpdateComment,    // (commentId, newText)
  onSoftDeleteComment // (commentId)
}) {
  return (
    <div className="space-y-3">
      {comments.map((c) => (
        <CommentItem
          key={c._id}
          comment={c}
          currentUserId={currentUserId}
          onReply={onReplyToComment}
          onToggleLike={onToggleCommentLike}
          onUpdate={onUpdateComment}
          onSoftDelete={onSoftDeleteComment}
        />
      ))}
    </div>
  );
});
