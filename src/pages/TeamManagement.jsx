import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "../styles/teamManagement.css";

function TeamManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    password: "",
  });

  useEffect(() => {
    loadTeamData();
  }, [user]);

  const loadTeamData = async () => {
    try {
      setLoading(true);
      if (user?.team_id) {
        const response = await api.getTeam(user.team_id);
        const teamData = response.data;

        // Fetch full member data if members are just IDs
        if (teamData.members && teamData.members.length > 0) {
          // Check if members are just IDs (numbers) or full objects
          if (typeof teamData.members[0] === "number") {
            // Fetch full member data
            const memberPromises = teamData.members.map((memberId) =>
              api.getUser(memberId).catch((err) => {
                console.error(`Failed to load member ${memberId}:`, err);
                return null;
              })
            );

            const memberResponses = await Promise.all(memberPromises);
            teamData.members = memberResponses
              .filter((r) => r && r.data)
              .map((r) => r.data);
          }
        }

        console.log("Processed team data:", teamData);
        setTeam(teamData);
      }
    } catch (err) {
      console.error("Failed to load team:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await api.createTeam({
        name: formData.name,
        password: formData.password,
      });

      if (response.success) {
        setSuccess("Team created successfully!");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (err) {
      setError(err.message || "Failed to create team");
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await api.joinTeam(formData.name, formData.password);

      if (response.success) {
        setSuccess("Successfully joined team!");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (err) {
      setError(err.message || "Failed to join team");
    }
  };

  const handleLeaveTeam = async () => {
    setShowLeaveConfirm(false);
    setError("");
    setSuccess("");

    try {
      const result = await api.leaveTeam(user.team_id);

      if (result.success) {
        setSuccess("Successfully left the team!");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (err) {
      console.error("Leave team error:", err);
      setError(err.message || "Failed to leave team");
    }
  };

  const handleCopyInvite = () => {
    const link = `Team Name: ${team.name}`;
    navigator.clipboard.writeText(link);
    setSuccess("Team name copied to clipboard!");
    setTimeout(() => setSuccess(""), 3000);
  };

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

  // User has a team - show team info
  if (user?.team_id && team) {
    return (
      <div className="team-management-page">
        <div className="container">
          <div className="team-management-header">
            <h1 className="team-management-title">{team.name}</h1>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {/* Team Stats */}
          <div className="team-stats-section">
            <div className="team-stat-card">
              <div className="team-stat-label">RANK</div>
              <div className="team-stat-value">#{team.place || "N/A"}</div>
            </div>
            <div className="team-stat-card">
              <div className="team-stat-label">SCORE</div>
              <div className="team-stat-value">{team.score || 0}</div>
            </div>
          </div>

          {/* Team Members */}
          <div className="team-members-section">
            <h2 className="section-title">TEAM MEMBERS</h2>
            <div className="team-members-grid">
              {team.members &&
                team.members.map((member) => (
                  <div key={member.id} className="team-member-card">
                    <div className="team-member-info">
                      <div className="team-member-name">
                        {member.name}
                        {member.id === team.captain_id && (
                          <span className="captain-badge">👑 CAPTAIN</span>
                        )}
                      </div>
                      <div className="team-member-score">
                        {member.score || 0} pts
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Team Actions */}
          <div className="team-actions-section">
            <button className="arcade-button" onClick={handleCopyInvite}>
              📋 COPY TEAM NAME
            </button>
            <button
              className="arcade-button-danger"
              onClick={() => setShowLeaveConfirm(true)}
            >
              🚪 LEAVE TEAM
            </button>
          </div>

          {/* Leave Confirmation Modal */}
          {showLeaveConfirm && (
            <div
              className="confirm-modal-overlay"
              onClick={() => setShowLeaveConfirm(false)}
            >
              <div
                className="confirm-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="confirm-modal-icon">⚠️</div>
                <h2 className="confirm-modal-title">LEAVE TEAM?</h2>
                <p className="confirm-modal-message">
                  Are you sure you want to leave <strong>{team.name}</strong>?
                </p>
                <p className="confirm-modal-warning">
                  This action cannot be undone.
                </p>
                <div className="confirm-modal-actions">
                  <button
                    className="confirm-button confirm-cancel"
                    onClick={() => setShowLeaveConfirm(false)}
                  >
                    CANCEL
                  </button>
                  <button
                    className="confirm-button confirm-leave"
                    onClick={handleLeaveTeam}
                  >
                    LEAVE TEAM
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // User has no team - show create/join options
  return (
    <div className="team-management-page">
      <div className="container">
        <div className="team-management-header">
          <h1 className="team-management-title">TEAM MANAGEMENT</h1>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="no-team-section">
          <div className="no-team-message">
            <div className="no-team-icon">👥</div>
            <h2>You are not on a team</h2>
            <p>Create a new team or join an existing one</p>
          </div>

          <div className="team-options">
            <button
              className="team-option-button"
              onClick={() => {
                setShowCreateForm(true);
                setShowJoinForm(false);
                setFormData({ name: "", password: "" });
                setError("");
              }}
            >
              <div className="option-icon">➕</div>
              <div className="option-title">CREATE TEAM</div>
              <div className="option-desc">Start your own team</div>
            </button>

            <button
              className="team-option-button"
              onClick={() => {
                setShowJoinForm(true);
                setShowCreateForm(false);
                setFormData({ name: "", password: "" });
                setError("");
              }}
            >
              <div className="option-icon">🔗</div>
              <div className="option-title">JOIN TEAM</div>
              <div className="option-desc">Join an existing team</div>
            </button>
          </div>

          {/* Create Team Form */}
          {showCreateForm && (
            <div className="team-form-section">
              <h3 className="form-title">CREATE NEW TEAM</h3>
              <form onSubmit={handleCreateTeam} className="team-form">
                <div className="form-field">
                  <label>Team Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="arcade-input"
                    placeholder="Enter team name"
                  />
                </div>

                <div className="form-field">
                  <label>Team Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    className="arcade-input"
                    placeholder="Enter team password"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="arcade-button-secondary"
                    onClick={() => setShowCreateForm(false)}
                  >
                    CANCEL
                  </button>
                  <button type="submit" className="arcade-button">
                    CREATE TEAM
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Join Team Form */}
          {showJoinForm && (
            <div className="team-form-section">
              <h3 className="form-title">JOIN EXISTING TEAM</h3>
              <form onSubmit={handleJoinTeam} className="team-form">
                <div className="form-field">
                  <label>Team Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="arcade-input"
                    placeholder="Enter team name"
                  />
                </div>

                <div className="form-field">
                  <label>Team Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    className="arcade-input"
                    placeholder="Enter team password"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="arcade-button-secondary"
                    onClick={() => setShowJoinForm(false)}
                  >
                    CANCEL
                  </button>
                  <button type="submit" className="arcade-button">
                    JOIN TEAM
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TeamManagement;
