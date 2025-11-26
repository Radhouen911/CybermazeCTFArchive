import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import "../styles/userProfile.css";

function PublicUserProfile() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [solves, setSolves] = useState([]);
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError("");

      // Try to fetch user data from API first
      let userData = null;
      try {
        const userResponse = await api.getUser(userId);
        if (userResponse.success) {
          userData = userResponse.data;
        }
      } catch (err) {
        console.log("Direct user API not available, trying scoreboard...");

        // Fallback: Get user data from scoreboard
        const scoreboardResponse = await api.getScoreboard();
        const scoreboardData = scoreboardResponse.data || [];
        const userEntry = scoreboardData.find(
          (entry) => entry.account_id === parseInt(userId)
        );

        if (userEntry) {
          userData = {
            id: userEntry.account_id,
            name: userEntry.name,
            score: userEntry.score || 0,
            place: userEntry.pos,
          };
        } else {
          throw new Error("User not found in scoreboard");
        }
      }

      if (userData) {
        setUser(userData);
      } else {
        throw new Error("User not found");
      }

      // Fetch solves
      try {
        const solvesResponse = await api.getUserSolves(userId);
        if (solvesResponse.success) {
          setSolves(solvesResponse.data || []);
        }
      } catch (err) {
        console.log("Solves not available or hidden");
      }

      // Fetch awards
      try {
        const awardsResponse = await api.getUserAwards(userId);
        if (awardsResponse.success) {
          setAwards(awardsResponse.data || []);
        }
      } catch (err) {
        console.log("Awards not available or hidden");
      }
    } catch (err) {
      setError(
        err.message ||
          "Failed to load user profile. Public profiles may be disabled."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="user-profile-container">
        <div className="loading-arcade">LOADING PROFILE...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="user-profile-container">
        <div className="error-arcade">{error || "User not found"}</div>
        <Link to="/users" className="back-link">
          ← Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div className="user-profile-container">
      <Link
        to="/users"
        className="back-link"
        style={{ marginBottom: "20px", display: "inline-block" }}
      >
        ← BACK TO USERS
      </Link>

      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-icon">👤</div>
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{user.name}</h1>
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-label">RANK</span>
              <span className="stat-value">#{user.place || "N/A"}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">SCORE</span>
              <span className="stat-value">{user.score || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">SOLVES</span>
              <span className="stat-value">{solves.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">AWARDS</span>
              <span className="stat-value">{awards.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          OVERVIEW
        </button>
        <button
          className={`tab-button ${activeTab === "solves" ? "active" : ""}`}
          onClick={() => setActiveTab("solves")}
        >
          SOLVES ({solves.length})
        </button>
        <button
          className={`tab-button ${activeTab === "awards" ? "active" : ""}`}
          onClick={() => setActiveTab("awards")}
        >
          AWARDS ({awards.length})
        </button>
      </div>

      <div className="profile-content">
        {activeTab === "overview" && (
          <div className="tab-content">
            <div className="info-grid">
              <div className="info-card">
                <h3>USER INFORMATION</h3>
                <div className="info-list">
                  {user.affiliation && (
                    <div className="info-row">
                      <span className="info-key">Affiliation:</span>
                      <span className="info-value">{user.affiliation}</span>
                    </div>
                  )}
                  {user.country && (
                    <div className="info-row">
                      <span className="info-key">Country:</span>
                      <span className="info-value">{user.country}</span>
                    </div>
                  )}
                  {user.website && (
                    <div className="info-row">
                      <span className="info-key">Website:</span>
                      <a
                        href={user.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="info-link"
                      >
                        {user.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="info-card">
                <h3>RECENT SOLVES</h3>
                {solves.length > 0 ? (
                  <div className="recent-solves">
                    {solves.slice(0, 5).map((solve) => (
                      <div key={solve.id} className="solve-item">
                        <span className="solve-name">
                          {solve.challenge?.name || "Challenge"}
                        </span>
                        <span className="solve-points">
                          {solve.challenge?.value || 0} pts
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No solves yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "solves" && (
          <div className="tab-content">
            <div className="solves-list">
              {solves.length > 0 ? (
                <table className="arcade-table">
                  <thead>
                    <tr>
                      <th>CHALLENGE</th>
                      <th>CATEGORY</th>
                      <th>POINTS</th>
                      <th>DATE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solves.map((solve) => (
                      <tr key={solve.challenge_id}>
                        <td>{solve.challenge?.name || "Unknown"}</td>
                        <td>{solve.challenge?.category || "N/A"}</td>
                        <td className="points-cell">
                          {solve.challenge?.value || 0}
                        </td>
                        <td>{formatDate(solve.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="no-data-large">
                  <p>NO SOLVES YET</p>
                  <p className="no-data-subtitle">
                    This user hasn't solved any challenges yet
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "awards" && (
          <div className="tab-content">
            <div className="awards-list">
              {awards.length > 0 ? (
                <div className="awards-grid">
                  {awards.map((award) => (
                    <div key={award.id} className="award-card">
                      <div className="award-icon">🏆</div>
                      <div className="award-info">
                        <h4 className="award-name">{award.name}</h4>
                        {award.description && (
                          <p className="award-description">
                            {award.description}
                          </p>
                        )}
                        <div className="award-value">+{award.value} points</div>
                        <div className="award-date">
                          {formatDate(award.date)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data-large">
                  <p>NO AWARDS YET</p>
                  <p className="no-data-subtitle">
                    This user hasn't earned any awards yet
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PublicUserProfile;
