import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Play transition sound on click
  const playTransitionSound = () => {
    const audio = new Audio("/themes/Arcade/static/transition.mp3");
    audio.volume = 0.5;
    audio.play().catch((err) => console.log("Audio play failed:", err));
  };

  const handleLogout = async () => {
    playTransitionSound();
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      <nav className="arcade-navbar">
        <div className="container">
          <div className="arcade-nav-content">
            {/* Left side - Logo and main navigation */}
            <div className="arcade-nav-left">
              <Link
                to="/"
                className="arcade-logo"
                onClick={playTransitionSound}
              >
                <img
                  src="/themes/Arcade/static/LOGO.png"
                  alt="CyberMaze Logo"
                  className="arcade-logo-image"
                />
              </Link>

              <div className="arcade-nav-links">
                <Link
                  to="/users"
                  className="arcade-nav-link"
                  onClick={playTransitionSound}
                >
                  USERS
                </Link>
                <Link
                  to="/teams"
                  className="arcade-nav-link"
                  onClick={playTransitionSound}
                >
                  TEAMS
                </Link>
                <Link
                  to="/scoreboard"
                  className="arcade-nav-link"
                  onClick={playTransitionSound}
                >
                  SCOREBOARD
                </Link>
                <Link
                  to="/challenges"
                  className="arcade-nav-link"
                  onClick={playTransitionSound}
                >
                  CHALLENGES
                </Link>
              </div>
            </div>

            {/* Right side - Auth buttons or user info */}
            <div className="arcade-nav-right">
              {isAuthenticated && user ? (
                <>
                  {(user.isAdmin || window.init?.userType === "admin") && (
                    <a
                      href="/admin"
                      className="arcade-nav-button arcade-admin-button"
                      title="Admin Panel"
                      onClick={playTransitionSound}
                    >
                      ⚙️ ADMIN
                    </a>
                  )}
                  {window.init?.userMode === "teams" && (
                    <Link
                      to="/team"
                      className="arcade-nav-button"
                      title="Team Management"
                      onClick={playTransitionSound}
                    >
                      👥 TEAM
                    </Link>
                  )}
                  <NotificationBell />
                  <Link
                    to="/profile"
                    className="arcade-nav-button"
                    onClick={playTransitionSound}
                  >
                    👤 {user.name}
                  </Link>
                  <button onClick={handleLogout} className="arcade-nav-button">
                    LOGOUT
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="arcade-nav-button"
                    onClick={playTransitionSound}
                  >
                    REGISTER
                  </Link>
                  <Link
                    to="/login"
                    className="arcade-nav-button"
                    onClick={playTransitionSound}
                  >
                    LOGIN
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
