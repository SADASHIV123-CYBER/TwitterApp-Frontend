import { useSearchParams, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/context";
import FollowListModal from "../../components/FollowList/FollowListModal";

export default function FollowListPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const tab = searchParams.get("tab") || "followers";
  const userId = searchParams.get("userId") || user?._id;

  if (!userId) {
    return <p className="p-4 text-center">User not found</p>;
  }

  return <FollowListModal isOpen={true} onClose={() => navigate(-1)} userId={userId} initialTab={tab} />;
}
