import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function TeamRequiredGuard({ children }) {
  const { user, isAuthenticated, loading } = useAuth();

  // Wait for auth to load
  if (loading) {
    return (
      <div className="arcade-loading-container">
        <div className="arcade-loading">
          <div className="arcade-spinner"></div>
          <div className="arcade-loading-text">LOADING...</div>
        </div>
      </div>
    );
  }

  // Check if team mode is enabled from backend
  const isTeamMode = window.init?.userMode === "teams";

  // If not team mode (solo/users mode), allow access
  if (!isTeamMode) {
    return children;
  }

  // If not authenticated, allow access (login/register pages)
  if (!isAuthenticated) {
    return children;
  }

  // Admins bypass team requirement
  const isAdmin = user?.isAdmin || window.init?.userType === "admin";
  if (isAdmin) {
    return children;
  }

  // Regular users in team mode need a team
  if (!user?.team_id) {
    return <Navigate to="/team" replace />;
  }

  // User has a team, allow access
  return children;
}

export default TeamRequiredGuard;
