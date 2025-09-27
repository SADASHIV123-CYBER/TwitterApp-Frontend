import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/context";

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <p className="text-center mt-16">Loading...</p>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
