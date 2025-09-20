import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getFollowers, getFollowing, toggleFollow } from "../../api/userApi";

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

  async function fetchList(tab) {
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
  }

  async function handleToggleFollow(targetUserId, index) {
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
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md mx-auto mt-14 bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center space-x-4">
            <div className="text-lg font-semibold">{activeTab === "followers" ? "Followers" : "Following"}</div>
            <div className="text-sm text-gray-500">{count} {count === 1 ? "user" : "users"}</div>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1 rounded hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex px-3 py-2 space-x-2 border-b">
          <button className={`flex-1 py-2 rounded-md text-sm font-medium ${activeTab === "followers" ? "bg-sky-50 text-sky-600" : "text-gray-600"}`} onClick={() => setActiveTab("followers")}>Followers</button>
          <button className={`flex-1 py-2 rounded-md text-sm font-medium ${activeTab === "following" ? "bg-sky-50 text-sky-600" : "text-gray-600"}`} onClick={() => setActiveTab("following")}>Following</button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading && <div className="p-6"><div className="animate-pulse space-y-4"><div className="h-4 bg-gray-200 rounded w-3/4" /><div className="h-12 bg-gray-200 rounded" /><div className="h-12 bg-gray-200 rounded" /><div className="h-12 bg-gray-200 rounded" /></div></div>}

          {!loading && error && <div className="p-6 text-center text-sm text-red-600">{error}</div>}

          {!loading && !error && users.length === 0 && <div className="p-6 text-center text-sm text-gray-600">No users to show</div>}

          {!loading && users.map((u, idx) => (
            <div key={u._id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <img src={u.profilePicture || "/default-avatar.png"} alt={u.userName} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                <div>
                  <div className="text-sm font-semibold">{u.fullName || u.displayName || u.userName}</div>
                  <div className="text-xs text-gray-500">@{u.userName}</div>
                </div>
              </div>

              <div>
                {u._id && u.isFollowed != null && (
                  <button onClick={() => handleToggleFollow(u._id, idx)} className={`px-3 py-1 text-sm rounded-full border ${u.isFollowed ? "bg-white text-gray-700 border-gray-300" : "bg-sky-500 text-white border-transparent"}`}>
                    {u.isFollowed ? "Following" : "Follow"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
