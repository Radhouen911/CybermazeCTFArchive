import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "../styles/teams.css";

function Teams() {
  const { user, isAuthenticated } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    password: "",
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await api.getTeams();
      if (response.success) {
        setTeams(response.data || []);
      }
    } catch (err) {
      // Check if teams mode is disabled
      if (err.message && err.message.includes("not found")) {
        setError(
          "Teams mode is not enabled. Please enable it in CTFd admin settings."
        );
      } else {
        setError("Failed to load teams");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.createTeam({
        name: formData.name,
        password: formData.password,
      });

      if (response.success) {
        setShowCreateModal(false);
        setFormData({ name: "", password: "" });
        fetchTeams();
        window.location.reload(); // Reload to update user's team status
      }
    } catch (err) {
      setError(err.message || "Failed to create team");
    }
  };

  const handleJoinTeam = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.joinTeam(selectedTeam.id, formData.password);

      if (response.success) {
        setShowJoinModal(false);
        setFormData({ name: "", password: "", website: "" });
        setSelectedTeam(null);
        fetchTeams();
        window.location.reload(); // Reload to update user's team status
      }
    } catch (err) {
      setError(err.message || "Failed to join team");
    }
  };

  const handleLeaveTeam = async (teamId) => {
    if (!window.confirm("Are you sure you want to leave this team?")) return;

    setError("");
    try {
      await api.leaveTeam(teamId);
      await fetchTeams();
      window.location.reload(); // Reload to update user's team status
    } catch (err) {
      console.error("Leave team error:", err);
      setError(err.message || "Failed to leave team");
    }
  };

  const openJoinModal = (team) => {
    setSelectedTeam(team);
    setShowJoinModal(true);
    setError("");
  };

  if (loading) {
    return (
      <div className="teams-page">
        <div className="container">
          <div className="loading">Loading teams...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="teams-page">
      <div className="container">
        <div className="teams-header">
          <h1 className="teams-title">TEAMS</h1>
          {isAuthenticated && !user?.team_id && (
            <button
              className="arcade-button"
              onClick={() => setShowCreateModal(true)}
            >
              CREATE TEAM
            </button>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="teams-list">
          {teams.map((team) => (
            <Link
              key={team.id}
              to={`/teams/${team.id}`}
              className="team-list-item"
            >
              <div className="team-list-name">{team.name}</div>
            </Link>
          ))}
        </div>

        {teams.length === 0 && !error && (
          <div className="no-teams">
            <p>No teams yet. Be the first to create one!</p>
          </div>
        )}

        {error && teams.length === 0 && (
          <div className="teams-disabled-message">
            <div className="teams-disabled-icon">🚫</div>
            <h2>Teams Mode Not Enabled</h2>
            <p>Teams functionality is currently disabled.</p>
            <p className="teams-admin-note">
              Admin: Enable teams mode in{" "}
              <a href="/admin/config">CTFd Settings</a>
            </p>
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>CREATE TEAM</h2>
              <button
                className="modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>

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
                />
              </div>

              <div className="form-field">
                <label>Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  className="arcade-input"
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="arcade-button">
                CREATE TEAM
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Join Team Modal */}
      {showJoinModal && selectedTeam && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>JOIN {selectedTeam.name}</h2>
              <button
                className="modal-close"
                onClick={() => setShowJoinModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleJoinTeam} className="team-form">
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
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <button type="submit" className="arcade-button">
                JOIN TEAM
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Teams;
