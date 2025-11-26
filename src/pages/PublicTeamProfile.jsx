import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "../styles/teamManagement.css";

function PublicTeamProfile() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeam();
  }, [teamId]);

  const loadTeam = async () => {
    try {
      setLoading(true);
      const response = await api.getTeam(teamId);
      const teamData = response.data;

      // Fetch full member data if needed
      if (teamData.members && teamData.members.length > 0) {
        if (typeof teamData.members[0] === "number") {
          const memberPromises = teamData.members.map((memberId) =>
            api.getUser(memberId).catch(() => null)
          );

          const memberResponses = await Promise.all(memberPromises);
          teamData.members = memberResponses
            .filter((r) => r && r.data)
            .map((r) => r.data);
        }
      }

      setTeam(teamData);
    } catch (err) {
      console.error("Failed to load team:", err);
    } finally {
      setLoading(false);
    }
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

  if (!team) {
    return (
      <div className="team-management-page">
        <div className="container">
          <div className="no-team-message">
            <h2>Team Not Found</h2>
            <button
              className="arcade-button"
              onClick={() => navigate("/teams")}
            >
              BACK TO TEAMS
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="team-management-page">
      <div className="container">
        <div className="team-management-header">
          <h1 className="team-management-title">{team.name}</h1>
          <button
            className="arcade-button-secondary"
            onClick={() => navigate("/teams")}
          >
            ← BACK TO TEAMS
          </button>
        </div>

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
      </div>
    </div>
  );
}

export default PublicTeamProfile;
