import React, { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
import { getFollowers, getFollowing, toggleFollow } from "../../api/userApi";
import Button from "../Button/Button";

export default function FollowListModal({ isOpen, onClose, userId, initialTab = "followers" }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [count, setCount] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      fetchList(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (isOpen) fetchList(activeTab);
  }, [activeTab, isOpen]);

  const fetchList = useCallback(async (tab) => {
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
  }, [userId]);

  const handleToggleFollow = useCallback(async (targetUserId, index) => {
    try {
      const newUsers = [...users];
      newUsers[index] = { ...newUsers[index], isFollowed: !newUsers[index].isFollowed };
      setUsers(newUsers);
      await toggleFollow(targetUserId);
    } catch (err) {
      setUsers((prev) => {
        const copy = [...prev];
        copy[index] = { ...copy[index], isFollowed: !copy[index].isFollowed };
        return copy;
      });
      alert(err.message || "Failed to update follow");
    }
  }, [users]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop with better mobile styling */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-md mx-auto bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] sm:max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="text-lg sm:text-xl font-semibold text-gray-900">
              {activeTab === "followers" ? "Followers" : "Following"}
            </div>
            <div className="bg-blue-100 text-blue-800 text-xs sm:text-sm px-2 py-1 rounded-full font-medium">
              {count} {count === 1 ? "user" : "users"}
            </div>
          </div>
          <button 
            onClick={onClose} 
            aria-label="Close" 
            className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-2 sm:px-3 py-2 sm:py-3 space-x-1 sm:space-x-2 border-b border-gray-200 bg-gray-50">
          <button 
            className={`flex-1 py-3 sm:py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "followers" 
                ? "bg-white text-blue-600 shadow-sm border border-gray-200" 
                : "text-gray-600 hover:text-gray-900"
            }`} 
            onClick={() => setActiveTab("followers")}
          >
            Followers
          </button>
          <button 
            className={`flex-1 py-3 sm:py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "following" 
                ? "bg-white text-blue-600 shadow-sm border border-gray-200" 
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
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-20 h-8 bg-gray-200 rounded-full"></div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="p-6 text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-600 text-sm font-medium">{error}</div>
                <button 
                  onClick={() => fetchList(activeTab)}
                  className="mt-2 text-red-700 text-sm font-medium hover:text-red-800"
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
              <p className="text-gray-600 font-medium">No users to show</p>
              <p className="text-gray-500 text-sm mt-1">
                {activeTab === "followers" 
                  ? "This user doesn't have any followers yet." 
                  : "This user isn't following anyone yet."
                }
              </p>
            </div>
          )}

          {/* Users List */}
          {!loading && users.map((u, idx) => (
            <div 
              key={u._id} 
              className="flex items-center justify-between px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors duration-150"
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <img 
                  src={u.profilePicture || "/default-avatar.png"} 
                  alt={u.userName} 
                  className="w-12 h-12 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white shadow-sm"
                  onError={(e) => {
                    e.target.src = "/default-avatar.png";
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {u.fullName || u.displayName || u.userName}
                  </div>
                  <div className="text-xs text-gray-500 truncate">@{u.userName}</div>
                </div>
              </div>

              {/* Follow Button */}
              {u._id && u.isFollowed != null && (
                <Button
                  text={u.isFollowed ? "Following" : "Follow"}
                  onClickHandler={() => handleToggleFollow(u._id, idx)}
                  styleType={u.isFollowed ? "secondary" : "primary"}
                  className={`
                    px-4 py-2 text-xs sm:text-sm rounded-full border font-medium transition-all duration-200
                    ${u.isFollowed 
                      ? "bg-white text-gray-700 border-gray-300 hover:border-red-300 hover:text-red-600 hover:bg-red-50 min-w-[80px] sm:min-w-[90px]" 
                      : "bg-blue-500 text-white border-transparent hover:bg-blue-600 min-w-[70px] sm:min-w-[80px]"
                    }
                  `}
                />
              )}
            </div>
          ))}
        </div>

        {/* Footer for better mobile experience */}
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 sm:hidden">
          <button 
            onClick={onClose}
            className="w-full py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}