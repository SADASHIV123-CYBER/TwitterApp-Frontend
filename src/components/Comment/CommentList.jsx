import React, { useState, useCallback, memo, useMemo, useContext } from "react";
import Button from "../Button/Button";
import { ThemeContext } from "../../context/context";

function isSameId(a, b) {
  if (!a || !b) return false;
  return String(a) === String(b) || (a._id && String(a._id) === String(b));
}

/**
 * ReplyItem - memoized subcomponent for rendering a single reply
 */
// const ReplyItem = memo(function ReplyItem({ r }) {
//   return (
//     <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:border-gray-300 transition-colors duration-200">
//       <div className="flex items-center gap-2 mb-1">
//         <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
//           {(r.user?.displayName || r.user?.userName || "U").charAt(0).toUpperCase()}
//         </div>
//         <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
//           {r.user?.displayName || r.user?.userName || "User"}
//         </div>
//         <div className="text-gray-500 dark:text-gray-400 text-xs ml-auto">
//           {new Date(r.createdAt).toLocaleString()}
//         </div>
//       </div>
//       <div className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">{r.text}</div>
//     </div>
//   );
// });

const ReplyItem = memo(function ReplyItem({ r }) {
  const { darkMode } = useContext(ThemeContext);

  const containerBg = darkMode ? "bg-gray-800" : "bg-gray-50";
  const containerBorder = darkMode ? "border-gray-700" : "border-gray-200";
  const textPrimary = darkMode ? "text-gray-100" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-500";

  return (
    <div
      className={`${containerBg} rounded-lg p-3 border ${containerBorder} hover:border-gray-300 transition-colors duration-200`}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
          {(r.user?.displayName || r.user?.userName || "U")
            .charAt(0)
            .toUpperCase()}
        </div>
        <div className={`font-medium ${textPrimary} text-sm`}>
          {r.user?.displayName || r.user?.userName || "User"}
        </div>
        <div className={`${textSecondary} text-xs ml-auto`}>
          {new Date(r.createdAt).toLocaleString()}
        </div>
      </div>
      <div className={`${textPrimary} text-sm leading-relaxed`}>
        {r.text}
      </div>
    </div>
  );
});



export const CommentItem = memo(function CommentItem({
  comment,
  currentUserId,
  onReply,
  onToggleLike,
  onUpdate, // (commentId, newText)
  onSoftDelete, // (commentId)
}) {
  const { darkMode } = useContext(ThemeContext);

  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text || "");

  // memoized derived values
  const liked = useMemo(
    () => (comment.likes || []).some((id) => String(id) === String(currentUserId)),
    [comment.likes, currentUserId]
  );

  const isOwner = useMemo(
    () => isSameId(comment.user?._id ?? comment.user, currentUserId),
    [comment.user, currentUserId]
  );

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

  const handleToggleLike = useCallback(async () => {
    if (!onToggleLike) return;
    await onToggleLike(comment._id);
  }, [onToggleLike, comment._id]);

  // theme-aware utility classes
  const containerBg = darkMode ? "bg-gray-800" : "bg-white";
  const containerBorder = darkMode ? "border-gray-700" : "border-gray-100";
  const textPrimary = darkMode ? "text-gray-100" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-500";
  const mutedBg = darkMode ? "bg-gray-900" : "bg-gray-50";

  return (
    <div
      className={`py-3 border ${containerBorder} ${containerBg} rounded-lg px-4 sm:px-0 mb-3 shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out transition-colors`}
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {(comment.user?.displayName || comment.user?.userName || "U").charAt(0).toUpperCase()}
          </div>
          <div>
            <span className={`font-medium ${textPrimary} text-sm sm:text-base`}>
              {comment.user?.displayName || comment.user?.userName || "User"}
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-xs ${textSecondary}`}>
                {new Date(comment.createdAt).toLocaleString()}
              </span>
              {isOwner && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">You</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Comment Content */}
      {!editing ? (
        <div className={`mt-2 ${textPrimary} text-sm sm:text-base leading-relaxed`}>
          {comment.isDeleted ? <em className="text-gray-400 italic">Comment deleted</em> : comment.text}
        </div>
      ) : (
        <div className="mt-2">
          <textarea
            rows={3}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:outline-none focus:border-transparent transition-all duration-200 text-sm sm:text-base ${darkMode ? 'bg-gray-800 text-gray-100 border-gray-700 focus:ring-yellow-400' : 'bg-white text-gray-900 border-gray-300 focus:ring-blue-500'}`}
            placeholder="Edit your comment..."
          />
          <div className="mt-3 flex flex-col sm:flex-row gap-2 justify-end">
            <Button text="Cancel" onClickHandler={handleCancelEdit} styleType="secondary" className="w-full sm:w-auto text-sm px-4 py-2" />
            <Button text="Save Changes" onClickHandler={handleSaveEdit} disabled={!editText.trim()} className="w-full sm:w-auto text-sm px-4 py-2" />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-3 flex flex-wrap gap-2 sm:gap-4 text-sm items-center">
        <Button
          text={`${liked ? "👍 Unlike" : "👍 Like"} ${comment.likes?.length || 0}`}
          onClickHandler={handleToggleLike}
          styleType="secondary"
          className={`px-3 py-1.5 text-xs sm:text-sm rounded-full border transition-all duration-200 transform ${
            liked ? "bg-blue-50 text-blue-700 border-blue-200 hover:scale-105" : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
          }`}
        />

        <Button
          text="💬 Reply"
          onClickHandler={toggleReplyOpen}
          styleType="secondary"
          className={`px-3 py-1.5 text-xs sm:text-sm rounded-full border ${mutedBg} ${darkMode ? 'text-gray-200 border-gray-700' : 'text-gray-700 border-gray-200'} hover:scale-105 transition-transform duration-150`}
        />

        {isOwner && !comment.isDeleted && (
          <>
            <Button
              text="✏️ Edit"
              onClickHandler={() => setEditing(true)}
              styleType="secondary"
              className={`px-3 py-1.5 text-xs sm:text-sm rounded-full border ${darkMode ? 'bg-gray-900 text-gray-200 border-gray-700 hover:bg-gray-800' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'} transition-colors duration-150`}
            />
            <Button
              text="🗑️ Delete"
              onClickHandler={handleSoftDelete}
              styleType="secondary"
              className={`px-3 py-1.5 text-xs sm:text-sm rounded-full border ${darkMode ? 'bg-red-900 text-red-300 border-red-700 hover:bg-red-800' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'} transition-colors duration-150`}
            />
          </>
        )}
      </div>

      {/* Reply Section */}
      {replyOpen && (
        <div className={`mt-4 rounded-lg p-3 border ${darkMode ? 'border-gray-700' : 'border-gray-200'} ${mutedBg}`}>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={3}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:outline-none focus:border-transparent transition-all duration-200 text-sm sm:text-base ${darkMode ? 'bg-gray-800 text-gray-100 border-gray-700 focus:ring-yellow-400' : 'bg-white text-gray-900 border-gray-300 focus:ring-blue-500'}`}
            placeholder="Write your reply..."
          />
          <div className="mt-3 flex flex-col sm:flex-row gap-2 justify-end">
            <Button text="Cancel" onClickHandler={() => setReplyOpen(false)} styleType="secondary" className="w-full sm:w-auto text-sm px-4 py-2" />
            <Button text="Post Reply" onClickHandler={handleReplySubmit} disabled={!replyText.trim()} className="w-full sm:w-auto text-sm px-4 py-2" />
          </div>
        </div>
      )}

      {/* Replies Section */}
      {comment.replies?.length > 0 && (
        <div className="mt-4 pl-3 sm:pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-3">
          {comment.replies.map((r) => (
            <ReplyItem key={r._id || `${r.user}_${r.createdAt}`} r={r} />
          ))}
        </div>
      )}
    </div>
  );
});

export default memo(function CommentList({
  comments = [],
  currentUserId,
  onReplyToComment,
  onToggleCommentLike,
  onUpdateComment, // (commentId, newText)
  onSoftDeleteComment, // (commentId)
}) {
  // small optimization: memoize the mapped list so parent re-renders don't force remapping
  const items = useMemo(
    () =>
      comments.map((c) => (
        <CommentItem
          key={c._id}
          comment={c}
          currentUserId={currentUserId}
          onReply={onReplyToComment}
          onToggleLike={onToggleCommentLike}
          onUpdate={onUpdateComment}
          onSoftDelete={onSoftDeleteComment}
        />
      )),
    [comments, currentUserId, onReplyToComment, onToggleCommentLike, onUpdateComment, onSoftDeleteComment]
  );

  return (
    <div className="space-y-4 p-4 sm:p-0 max-w-full overflow-hidden">
      {comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">💬</div>
          <p className="text-lg font-medium">No comments yet</p>
          <p className="text-sm">Be the first to start the conversation!</p>
        </div>
      ) : (
        items
      )}
    </div>
  );
});
