import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const PublicRoute = ({ children }) => {
  const { user, authReady } = useAuth();

  // wait until auth check finishes
  if (!authReady) return null;   // or loading spinner

  // if logged in → block login page
  if (user) return <Navigate to="/dashboard" replace />;

  return children;
};

export default PublicRoute;
