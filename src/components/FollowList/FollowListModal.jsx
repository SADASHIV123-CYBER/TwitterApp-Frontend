import React, { useEffect, useState, useCallback, useContext } from "react";
import { X } from "lucide-react";
import { getFollowers, getFollowing, toggleFollow } from "../../api/userApi";
import Button from "../Button/Button";
import { ThemeContext } from "../../context/context";

export default function FollowListModal({ isOpen, onClose, userId, initialTab = "followers" }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [count, setCount] = useState(0);
  const [error, setError] = useState(null);

  const { darkMode } = useContext(ThemeContext);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      fetchList(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (isOpen) fetchList(activeTab);
  }, [activeTab, isOpen]);

  const fetchList = useCallback(
    async (tab) => {
      setLoading(true);
      setError(null);
      try {
        let res;
        if (tab === "followers") res = await getFollowers(userId);
        else res = await getFollowing(userId);
        setUsers(res.users || []);
        setCount(res.count ?? (res.users || []).length);
      } catch (err) {
        setError(err.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  const handleToggleFollow = useCallback(
    async (targetUserId, index) => {
      try {
        const newUsers = [...users];
        newUsers[index] = {
          ...newUsers[index],
          isFollowed: !newUsers[index].isFollowed,
        };
        setUsers(newUsers);
        await toggleFollow(targetUserId);
      } catch (err) {
        setUsers((prev) => {
          const copy = [...prev];
          copy[index] = {
            ...copy[index],
            isFollowed: !copy[index].isFollowed,
          };
          return copy;
        });
        alert(err.message || "Failed to update follow");
      }
    },
    [users]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={`relative w-full max-w-md mx-auto rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] sm:max-h-[80vh] flex flex-col ${
          darkMode
            ? "bg-gray-900 text-gray-100 border border-gray-800"
            : "bg-white text-gray-900 border border-gray-200"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-4 py-3 sm:py-4 sticky top-0 z-10 border-b ${
            darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="text-lg sm:text-xl font-semibold">
              {activeTab === "followers" ? "Followers" : "Following"}
            </div>
            <div
              className={`px-2 py-1 rounded-full text-xs sm:text-sm font-medium ${
                darkMode
                  ? "bg-gray-800 text-gray-200 border border-gray-700"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {count} {count === 1 ? "user" : "users"}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className={`p-2 rounded-full ${
              darkMode
                ? "hover:bg-gray-800 text-gray-400"
                : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div
          className={`flex px-2 sm:px-3 py-2 sm:py-3 space-x-1 sm:space-x-2 border-b ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
          }`}
        >
          <button
            className={`flex-1 py-3 sm:py-2 rounded-lg text-sm font-medium ${
              activeTab === "followers"
                ? darkMode
                  ? "bg-gray-900 text-yellow-400 shadow-sm border border-gray-700"
                  : "bg-white text-blue-600 shadow-sm border border-gray-200"
                : darkMode
                ? "text-gray-400 hover:text-gray-200"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("followers")}
          >
            Followers
          </button>
          <button
            className={`flex-1 py-3 sm:py-2 rounded-lg text-sm font-medium ${
              activeTab === "following"
                ? darkMode
                  ? "bg-gray-900 text-yellow-400 shadow-sm border border-gray-700"
                  : "bg-white text-blue-600 shadow-sm border border-gray-200"
                : darkMode
                ? "text-gray-400 hover:text-gray-200"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("following")}
          >
            Following
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Loading State */}
          {loading && (
            <div className="p-4 sm:p-6 space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center space-x-3 animate-pulse">
                  <div
                    className={`w-12 h-12 rounded-full ${
                      darkMode ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  ></div>
                  <div className="flex-1 space-y-2">
                    <div
                      className={`h-4 rounded w-3/4 ${
                        darkMode ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    ></div>
                    <div
                      className={`h-3 rounded w-1/2 ${
                        darkMode ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    ></div>
                  </div>
                  <div
                    className={`w-20 h-8 rounded-full ${
                      darkMode ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  ></div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="p-6 text-center">
              <div
                className={`rounded-lg p-4 border ${
                  darkMode
                    ? "bg-red-900/20 border-red-800 text-red-400"
                    : "bg-red-50 border-red-200 text-red-600"
                }`}
              >
                <div className="text-sm font-medium">{error}</div>
                <button
                  onClick={() => fetchList(activeTab)}
                  className={`mt-2 text-sm font-medium ${
                    darkMode
                      ? "text-red-400 hover:text-red-300"
                      : "text-red-700 hover:text-red-800"
                  }`}
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && users.length === 0 && (
            <div className="p-8 text-center">
              <div className="text-4xl mb-3">👥</div>
              <p
                className={`${darkMode ? "text-gray-300" : "text-gray-600"}`}
              >
                No users to show
              </p>
              <p
                className={`text-sm mt-1 ${
                  darkMode ? "text-gray-500" : "text-gray-500"
                }`}
              >
                {activeTab === "followers"
                  ? "This user doesn't have any followers yet."
                  : "This user isn't following anyone yet."}
              </p>
            </div>
          )}

          {/* Users List */}
          {!loading &&
            users.map((u, idx) => (
              <div
                key={u._id}
                className={`flex items-center justify-between px-4 py-3 border-b last:border-b-0 ${
                  darkMode
                    ? "border-gray-800 hover:bg-gray-800/50"
                    : "border-gray-100 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <img
                    src={u.profilePicture || "/default-avatar.png"}
                    alt={u.userName}
                    className={`w-12 h-12 sm:w-10 sm:h-10 rounded-full object-cover border-2 shadow-sm ${
                      darkMode ? "border-gray-700" : "border-white"
                    }`}
                    onError={(e) => {
                      e.target.src = "/default-avatar.png";
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-sm font-semibold truncate ${
                        darkMode ? "text-gray-100" : "text-gray-900"
                      }`}
                    >
                      {u.fullName || u.displayName || u.userName}
                    </div>
                    <div
                      className={`text-xs truncate ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      @{u.userName}
                    </div>
                  </div>
                </div>

                {/* Follow Button */}
                {u._id && u.isFollowed != null && (
                  <Button
                    text={u.isFollowed ? "Following" : "Follow"}
                    onClickHandler={() => handleToggleFollow(u._id, idx)}
                    styleType={u.isFollowed ? "secondary" : "primary"}
                    className={`
                      px-4 py-2 text-xs sm:text-sm rounded-full border font-medium min-w-[80px] sm:min-w-[90px]
                      ${
                        u.isFollowed
                          ? darkMode
                            ? "bg-gray-900 text-gray-300 border-gray-700 hover:border-red-400 hover:text-red-400 hover:bg-red-900/20"
                            : "bg-white text-gray-700 border-gray-300 hover:border-red-300 hover:text-red-600 hover:bg-red-50"
                          : "bg-blue-500 text-white border-transparent hover:bg-blue-600"
                      }
                    `}
                  />
                )}
              </div>
            ))}
        </div>

        {/* Footer for Mobile */}
        <div
          className={`border-t px-4 py-3 sm:hidden ${
            darkMode ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-200"
          }`}
        >
          <button
            onClick={onClose}
            className={`w-full py-2 text-sm font-medium rounded-lg border ${
              darkMode
                ? "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
