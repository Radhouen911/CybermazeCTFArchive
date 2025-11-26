import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/teamModal.css";

function TeamModal({ user, onClose }) {
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    if (user?.team_id) {
      loadTeam();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadTeam = async () => {
    try {
      setLoading(true);
      const response = await api.getTeam(user.team_id);
      setTeam(response.data);
    } catch (err) {
      setError("Failed to load team");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!window.confirm("Are you sure you want to leave this team?")) return;

    setError("");
    try {
      const result = await api.leaveTeam(user.team_id);

      // If successful, reload to update state
      if (result.success) {
        window.location.reload();
      }
    } catch (err) {
      console.error("Leave team error:", err);
      // Show the actual error message from CTFd
      setError(err.message || "Failed to leave team");
    }
  };

  const handleCopyInvite = () => {
    const link = `${window.location.origin}/teams?join=${user.team_id}`;
    navigator.clipboard.writeText(link);
    setInviteLink(link);
    setShowInvite(true);
    setTimeout(() => setShowInvite(false), 3000);
  };

  const handleGoToTeams = () => {
    onClose();
    navigate("/teams");
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="modal-content team-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2>TEAM</h2>
            <button className="modal-close" onClick={onClose}>
              ×
            </button>
          </div>
          <div className="team-modal-loading">Loading...</div>
        </div>
      </div>
    );
  }

  // User has no team
  if (!user?.team_id || !team) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="modal-content team-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2>TEAM REQUIRED</h2>
            <button className="modal-close" onClick={onClose}>
              ×
            </button>
          </div>

          <div className="team-modal-body">
            <div className="no-team-message">
              <div className="no-team-icon">👥</div>
              <p>You are not on a team yet.</p>
              <p className="no-team-subtitle">
                Join or create a team to participate!
              </p>
            </div>

            <button className="arcade-button" onClick={handleGoToTeams}>
              GO TO TEAMS PAGE
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User has a team
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content team-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{team.name}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="team-modal-body">
          {/* Team Stats */}
          <div className="team-stats-grid">
            <div className="team-stat-card">
              <div className="team-stat-label">RANK</div>
              <div className="team-stat-value">#{team.place || "N/A"}</div>
            </div>
            <div className="team-stat-card">
              <div className="team-stat-label">SCORE</div>
              <div className="team-stat-value">{team.score || 0}</div>
            </div>
            <div className="team-stat-card">
              <div className="team-stat-label">MEMBERS</div>
              <div className="team-stat-value">{team.members?.length || 0}</div>
            </div>
          </div>

          {/* Team Info */}
          {team.website && (
            <div className="team-info-section">
              <div className="team-info-label">Website:</div>
              <a
                href={team.website}
                target="_blank"
                rel="noopener noreferrer"
                className="team-website-link"
              >
                {team.website}
              </a>
            </div>
          )}

          {/* Team Members */}
          {team.members && team.members.length > 0 && (
            <div className="team-members-section">
              <h3 className="team-section-title">MEMBERS</h3>
              <div className="team-members-list">
                {team.members.map((member) => (
                  <div key={member.id} className="team-member-item">
                    <span className="team-member-name">
                      {member.name}
                      {member.id === team.captain_id && (
                        <span className="team-captain-badge">👑 Captain</span>
                      )}
                    </span>
                    <span className="team-member-score">
                      {member.score || 0} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="team-actions">
            <button
              className="arcade-button-secondary"
              onClick={handleCopyInvite}
            >
              📋 COPY INVITE LINK
            </button>
            <button
              className="arcade-button-secondary"
              onClick={handleGoToTeams}
            >
              👥 VIEW ALL TEAMS
            </button>
            <button className="arcade-button-danger" onClick={handleLeaveTeam}>
              🚪 LEAVE TEAM
            </button>
          </div>

          {showInvite && (
            <div className="invite-copied-message">
              ✓ Invite link copied to clipboard!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeamModal;
