import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "../styles/userProfile.css";

function UserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [solves, setSolves] = useState([]);
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    website: "",
    affiliation: "",
    country: "",
  });
  const [updateMessage, setUpdateMessage] = useState(null);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [generatedToken, setGeneratedToken] = useState(null);
  const [generatingToken, setGeneratingToken] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);

      // Load user profile
      const profileResponse = await api.getCurrentUser();
      setProfile(profileResponse.data);
      setFormData({
        name: profileResponse.data.name || "",
        email: profileResponse.data.email || "",
        website: profileResponse.data.website || "",
        affiliation: profileResponse.data.affiliation || "",
        country: profileResponse.data.country || "",
      });

      // Load solves
      try {
        const solvesResponse = await api.getUserSolves();
        setSolves(solvesResponse.data || []);
      } catch (error) {
        setSolves([]);
      }

      // Load awards
      try {
        const awardsResponse = await api.getUserAwards();
        setAwards(awardsResponse.data || []);
      } catch (error) {
        setAwards([]);
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.updateProfile(formData);
      setUpdateMessage({
        type: "success",
        text: "Profile updated successfully!",
      });
      setEditing(false);
      loadUserData();
      setTimeout(() => setUpdateMessage(null), 3000);
    } catch (error) {
      setUpdateMessage({ type: "error", text: "Failed to update profile" });
      setTimeout(() => setUpdateMessage(null), 3000);
    }
  };

  const handleGenerateToken = async () => {
    try {
      setGeneratingToken(true);
      const response = await api.generateToken({
        description: "Admin API Token",
        expiration: null,
      });

      if (response.success && response.data) {
        setGeneratedToken(response.data.value);
        setShowTokenModal(true);
      }
    } catch (error) {
      setUpdateMessage({
        type: "error",
        text: error.message || "Failed to generate token",
      });
      setTimeout(() => setUpdateMessage(null), 3000);
    } finally {
      setGeneratingToken(false);
    }
  };

  const copyToken = () => {
    if (generatedToken) {
      navigator.clipboard.writeText(generatedToken);
      setUpdateMessage({ type: "success", text: "Token copied to clipboard!" });
      setTimeout(() => setUpdateMessage(null), 3000);
    }
  };

  const closeTokenModal = () => {
    setShowTokenModal(false);
    setGeneratedToken(null);
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

  if (!profile) {
    return (
      <div className="user-profile-container">
        <div className="error-arcade">Failed to load profile</div>
      </div>
    );
  }

  return (
    <div className="user-profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-icon">👤</div>
        </div>
        <div className="profile-info">
          <h1 className="profile-name">{profile.name}</h1>
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-label">RANK</span>
              <span className="stat-value">#{profile.place || "N/A"}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">SCORE</span>
              <span className="stat-value">{profile.score || 0}</span>
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
        <button
          className={`tab-button ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => setActiveTab("settings")}
        >
          SETTINGS
        </button>
      </div>

      <div className="profile-content">
        {activeTab === "overview" && (
          <div className="tab-content">
            <div className="info-grid">
              <div className="info-card">
                <h3>USER INFORMATION</h3>
                <div className="info-list">
                  <div className="info-row">
                    <span className="info-key">Email:</span>
                    <span className="info-value">{profile.email || "N/A"}</span>
                  </div>
                  {profile.website && (
                    <div className="info-row">
                      <span className="info-key">Website:</span>
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="info-link"
                      >
                        {profile.website}
                      </a>
                    </div>
                  )}
                  {profile.affiliation && (
                    <div className="info-row">
                      <span className="info-key">Affiliation:</span>
                      <span className="info-value">{profile.affiliation}</span>
                    </div>
                  )}
                  {profile.country && (
                    <div className="info-row">
                      <span className="info-key">Country:</span>
                      <span className="info-value">{profile.country}</span>
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
                      <tr key={solve.id}>
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
                    Start solving challenges to see them here!
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
                    Keep playing to earn awards!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="tab-content">
            <div className="settings-container">
              <h3>PROFILE SETTINGS</h3>

              {updateMessage && (
                <div className={`update-message ${updateMessage.type}`}>
                  {updateMessage.text}
                </div>
              )}

              {!editing ? (
                <div className="settings-view">
                  <div className="settings-info">
                    <div className="setting-row">
                      <span className="setting-label">Username:</span>
                      <span className="setting-value">{profile.name}</span>
                    </div>
                    <div className="setting-row">
                      <span className="setting-label">Email:</span>
                      <span className="setting-value">{profile.email}</span>
                    </div>
                    <div className="setting-row">
                      <span className="setting-label">Website:</span>
                      <span className="setting-value">
                        {profile.website || "Not set"}
                      </span>
                    </div>
                    <div className="setting-row">
                      <span className="setting-label">Affiliation:</span>
                      <span className="setting-value">
                        {profile.affiliation || "Not set"}
                      </span>
                    </div>
                    <div className="setting-row">
                      <span className="setting-label">Country:</span>
                      <span className="setting-value">
                        {profile.country || "Not set"}
                      </span>
                    </div>
                  </div>
                  <div className="settings-buttons">
                    <button
                      className="edit-button"
                      onClick={() => setEditing(true)}
                    >
                      EDIT PROFILE
                    </button>
                    {(user?.isAdmin || window.init?.userType === "admin") && (
                      <button
                        className="generate-token-button"
                        onClick={handleGenerateToken}
                        disabled={generatingToken}
                      >
                        {generatingToken
                          ? "GENERATING..."
                          : "🔑 GENERATE API TOKEN"}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="settings-form">
                  <div className="form-group">
                    <label>Username</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="arcade-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="arcade-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Website</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://example.com"
                      className="arcade-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Affiliation</label>
                    <input
                      type="text"
                      name="affiliation"
                      value={formData.affiliation}
                      onChange={handleInputChange}
                      placeholder="University, Company, etc."
                      className="arcade-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder="US, UK, FR, etc."
                      className="arcade-input"
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="save-button">
                      SAVE CHANGES
                    </button>
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={() => {
                        setEditing(false);
                        setFormData({
                          name: profile.name || "",
                          email: profile.email || "",
                          website: profile.website || "",
                          affiliation: profile.affiliation || "",
                          country: profile.country || "",
                        });
                      }}
                    >
                      CANCEL
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Token Modal */}
      {showTokenModal && (
        <div className="token-modal-overlay" onClick={closeTokenModal}>
          <div className="token-modal" onClick={(e) => e.stopPropagation()}>
            <div className="token-modal-header">
              <h2>🔑 API TOKEN GENERATED</h2>
              <button className="token-modal-close" onClick={closeTokenModal}>
                ✕
              </button>
            </div>
            <div className="token-modal-body">
              <div className="token-warning">
                ⚠️ Save this token now! You won't be able to see it again.
              </div>
              <div className="token-display">
                <code>{generatedToken}</code>
              </div>
              <button className="token-copy-button" onClick={copyToken}>
                📋 COPY TOKEN
              </button>
              <div className="token-usage">
                <h4>How to use:</h4>
                <code className="token-usage-example">
                  curl -H "Authorization: Token{" "}
                  {generatedToken?.substring(0, 20)}..."
                  https://your-ctf.com/api/v1/challenges
                </code>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserProfile;
