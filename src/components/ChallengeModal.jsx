import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/challengeModal.css";

function ChallengeModal({ challenge, onClose, onSubmitSuccess }) {
  const [submission, setSubmission] = useState("");
  const [response, setResponse] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [container, setContainer] = useState(null);
  const [containerLoading, setContainerLoading] = useState(false);
  const [containerError, setContainerError] = useState(null);
  const [activeTab, setActiveTab] = useState("description"); // description, solves
  const [solves, setSolves] = useState([]);
  const [solvesLoading, setSolvesLoading] = useState(false);
  const [scoreVisibility, setScoreVisibility] = useState(true);

  // Check if this is a whale challenge
  const isWhaleChallenge = challenge.type === "dynamic_docker";

  // Hide navbar/footer when modal opens
  useEffect(() => {
    document.body.classList.add("modal-open");
    checkScoreVisibility();
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, []);

  // Check score visibility (dark hour)
  const checkScoreVisibility = () => {
    const visibility =
      window.init?.scoreVisibility !== false &&
      window.init?.scoreVisibility !== "false" &&
      window.init?.scoreVisibility !== "hidden";
    setScoreVisibility(visibility);
  };

  // Fetch solves when tab changes
  useEffect(() => {
    if (activeTab === "solves" && scoreVisibility) {
      fetchSolves();
    }
  }, [activeTab, scoreVisibility]);

  const fetchSolves = async () => {
    if (!scoreVisibility) return;

    setSolvesLoading(true);
    try {
      const result = await api.getChallengeSolves(challenge.id);
      if (result.success && result.data) {
        setSolves(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch solves:", error);
    } finally {
      setSolvesLoading(false);
    }
  };

  // Fetch container status if whale challenge
  useEffect(() => {
    if (isWhaleChallenge) {
      fetchContainerStatus();
    }
  }, [isWhaleChallenge]);

  // Extract URL from HTML if present
  const extractUrl = (text) => {
    if (!text) return "";

    // Check if it's HTML with an anchor tag
    const hrefMatch = text.match(/href=["']([^"']+)["']/);
    if (hrefMatch) {
      return hrefMatch[1];
    }

    // Otherwise return as-is (it's already just a URL)
    return text;
  };

  const fetchContainerStatus = async () => {
    try {
      const result = await api.getWhaleContainer(challenge.id);
      if (result.success && result.data && result.data.user_access) {
        // Extract clean URL from user_access
        result.data.user_access = extractUrl(result.data.user_access);
        setContainer(result.data);
      }
    } catch (error) {
      // No active container - silent fail
    }
  };

  // Ensure URL has protocol
  const formatContainerUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `http://${url}`;
  };

  const handleLaunchContainer = async () => {
    setContainerLoading(true);
    setContainerError(null);
    try {
      const result = await api.createWhaleContainer(challenge.id);
      if (result.success) {
        // Fetch the container details after creation
        await fetchContainerStatus();
      } else {
        setContainerError(result.message || "Failed to launch container");
      }
    } catch (error) {
      setContainerError(error.message || "Failed to launch container");
    } finally {
      setContainerLoading(false);
    }
  };

  const handleStopContainer = async () => {
    setContainerLoading(true);
    setContainerError(null);
    try {
      const result = await api.deleteWhaleContainer();
      if (result.success) {
        setContainer(null);
      } else {
        setContainerError(result.message || "Failed to stop container");
      }
    } catch (error) {
      setContainerError(error.message || "Failed to stop container");
    } finally {
      setContainerLoading(false);
    }
  };

  const handleRenewContainer = async () => {
    setContainerLoading(true);
    setContainerError(null);
    try {
      const result = await api.renewWhaleContainer(challenge.id);
      if (result.success) {
        await fetchContainerStatus();
      } else {
        setContainerError(result.message || "Failed to renew container");
      }
    } catch (error) {
      setContainerError(error.message || "Failed to renew container");
    } finally {
      setContainerLoading(false);
    }
  };

  // Simple Markdown to HTML converter
  const processMarkdown = (text) => {
    if (!text) return "";

    // Create a temporary div to decode HTML entities
    const txt = document.createElement("textarea");
    txt.innerHTML = text;
    let html = txt.value;

    // Check if text already contains HTML tags - if so, just return it
    if (
      html.includes("<a ") ||
      html.includes("<img ") ||
      html.includes("<br>")
    ) {
      return html;
    }

    // Convert line breaks
    html = html.replace(/\n/g, "<br />");

    // Convert links [text](url)
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Convert blockquotes (> text)
    html = html.replace(/^&gt;\s*(.+)$/gm, "<blockquote>$1</blockquote>");
    html = html.replace(/^>\s*(.+)$/gm, "<blockquote>$1</blockquote>");

    // Convert bold **text**
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

    // Convert italic *text*
    html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");

    // Convert inline code `code`
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

    return html;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submission.trim()) return;

    try {
      setSubmitting(true);
      const result = await api.submitFlag(challenge.id, submission);
      setResponse(result.data);

      if (result.data.status === "correct") {
        // Play success sound
        const successSound = new Audio("/themes/Arcade/static/submit.mp3");
        successSound.volume = 0.5;
        successSound.play().catch(() => {});

        setSubmission("");
        onSubmitSuccess();
        setTimeout(() => {
          onClose();
        }, 2000);
      } else if (result.data.status === "incorrect") {
        // Play fail sound
        const failSound = new Audio("/themes/Arcade/static/failsound.mp3");
        failSound.volume = 0.5;
        failSound.play().catch(() => {});
      }
    } catch (error) {
      console.error("Submission failed:", error);
      setResponse({ status: "error", message: "Submission failed" });
      // Play fail sound on error too
      const failSound = new Audio("/themes/Arcade/static/failsound.mp3");
      failSound.volume = 0.5;
      failSound.play().catch(() => {});
    } finally {
      setSubmitting(false);
    }
  };

  const getResponseClass = () => {
    if (!response) return "";
    switch (response.status) {
      case "correct":
        return "arcade-response-correct";
      case "incorrect":
        return "arcade-response-incorrect";
      default:
        return "arcade-response-error";
    }
  };

  const getResponseMessage = () => {
    if (!response) return "";
    switch (response.status) {
      case "correct":
        return "✓ CORRECT! CHALLENGE SOLVED!";
      case "incorrect":
        return "✗ INCORRECT. TRY AGAIN!";
      case "already_solved":
        return "✓ ALREADY SOLVED!";
      default:
        return response.message || "ERROR";
    }
  };

  return (
    <div className="arcade-modal-overlay" onClick={onClose}>
      <div className="arcade-modal" onClick={(e) => e.stopPropagation()}>
        <div className="arcade-modal-header">
          <h2 className="arcade-modal-title">{challenge.name}</h2>
          <button className="arcade-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="arcade-modal-body">
          <div className="arcade-challenge-info">
            <div className="arcade-info-item">
              <span className="arcade-info-label">CATEGORY:</span>
              <span className="arcade-info-value">{challenge.category}</span>
            </div>
            <div className="arcade-info-item">
              <span className="arcade-info-label">POINTS:</span>
              <span className="arcade-info-value">{challenge.value}</span>
            </div>
            {challenge.solves !== undefined && (
              <div className="arcade-info-item">
                <span className="arcade-info-label">SOLVES:</span>
                <span className="arcade-info-value">{challenge.solves}</span>
              </div>
            )}
          </div>

          {/* Tags Display */}
          {challenge.tags && challenge.tags.length > 0 && (
            <div className="arcade-challenge-tags">
              {challenge.tags.map((tag, idx) => {
                const tagValue =
                  typeof tag === "string" ? tag : tag.value || tag.name || tag;
                return (
                  <span key={idx} className="arcade-challenge-tag">
                    {tagValue}
                  </span>
                );
              })}
            </div>
          )}

          {/* Tabs */}
          <div className="arcade-modal-tabs">
            <button
              className={`arcade-tab ${
                activeTab === "description" ? "active" : ""
              }`}
              onClick={() => setActiveTab("description")}
            >
              📝 DESCRIPTION
            </button>
            {scoreVisibility && (
              <button
                className={`arcade-tab ${
                  activeTab === "solves" ? "active" : ""
                }`}
                onClick={() => setActiveTab("solves")}
              >
                🏆 SOLVES ({challenge.solves || 0})
              </button>
            )}
          </div>

          {/* Tab Content */}
          {activeTab === "description" && (
            <div className="arcade-challenge-description">
              <div
                dangerouslySetInnerHTML={{
                  __html: processMarkdown(challenge.description),
                }}
              />
            </div>
          )}

          {activeTab === "solves" && scoreVisibility && (
            <div className="arcade-challenge-solves">
              {solvesLoading ? (
                <div className="arcade-solves-loading">Loading solves...</div>
              ) : solves.length === 0 ? (
                <div className="arcade-solves-empty">
                  No solves yet. Be the first!
                </div>
              ) : (
                <div className="arcade-solves-list">
                  {solves.map((solve, idx) => {
                    // Determine if it's a team or user solve
                    const isTeamMode = window.init?.userMode === "teams";
                    const name =
                      solve.name ||
                      solve.team?.name ||
                      solve.user?.name ||
                      "Anonymous";
                    const userId =
                      solve.account_id || solve.user_id || solve.user?.id;
                    const teamId = solve.team_id || solve.team?.id;

                    // Build the profile link
                    let profileLink = "#";
                    if (isTeamMode && teamId) {
                      profileLink = `/teams/${teamId}`;
                    } else if (userId) {
                      profileLink = `/users/${userId}`;
                    }

                    return (
                      <div key={idx} className="arcade-solve-item">
                        <span className="arcade-solve-rank">#{idx + 1}</span>
                        <a
                          href={profileLink}
                          className="arcade-solve-name arcade-solve-link"
                          onClick={(e) => {
                            if (profileLink === "#") {
                              e.preventDefault();
                            }
                          }}
                        >
                          {name}
                        </a>
                        <span className="arcade-solve-date">
                          {new Date(solve.date).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {challenge.files && challenge.files.length > 0 && (
            <div className="arcade-challenge-files">
              <h4>FILES:</h4>
              <div className="arcade-files-list">
                {challenge.files.map((file, idx) => {
                  // Extract filename from URL (handle both /files/path and /files/path?token=xyz)
                  const fileName = file.split("?")[0].split("/").pop();
                  return (
                    <a
                      key={idx}
                      href={file}
                      download
                      className="arcade-file-link"
                    >
                      <span className="arcade-file-icon">📁</span>
                      <span className="arcade-file-name">{fileName}</span>
                      <span className="arcade-file-download">⬇</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {isWhaleChallenge && (
            <div className="arcade-whale-container">
              <h4>🐳 CONTAINER INSTANCE</h4>
              {containerError && (
                <div className="arcade-container-error">{containerError}</div>
              )}
              {!container ? (
                <button
                  onClick={handleLaunchContainer}
                  disabled={containerLoading}
                  className="arcade-container-button arcade-launch-button"
                >
                  {containerLoading ? "⏳ LAUNCHING..." : "🚀 LAUNCH CONTAINER"}
                </button>
              ) : (
                <div className="arcade-container-info">
                  <div className="arcade-container-status">
                    <span className="arcade-status-badge">● RUNNING</span>
                    {container.remaining_time && (
                      <span className="arcade-time-badge">
                        ⏱ {Math.floor(container.remaining_time / 60)}m{" "}
                        {container.remaining_time % 60}s
                      </span>
                    )}
                  </div>

                  <div className="arcade-container-access">
                    <span className="arcade-info-label">ACCESS URL:</span>
                    <a
                      href={formatContainerUrl(container.user_access)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="arcade-container-link"
                    >
                      {container.user_access}
                    </a>
                  </div>

                  <div className="arcade-container-actions">
                    <button
                      onClick={handleRenewContainer}
                      disabled={containerLoading}
                      className="arcade-container-button arcade-renew-button"
                    >
                      {containerLoading ? "⏳" : "🔄 RENEW"}
                    </button>
                    <button
                      onClick={handleStopContainer}
                      disabled={containerLoading}
                      className="arcade-container-button arcade-stop-button"
                    >
                      {containerLoading ? "⏳" : "🛑 STOP"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="arcade-submit-form">
            <div className="arcade-input-group">
              <input
                type="text"
                value={submission}
                onChange={(e) => setSubmission(e.target.value)}
                placeholder="ENTER FLAG..."
                className="arcade-input"
                disabled={submitting || challenge.solved_by_me}
              />
              <button
                type="submit"
                className="arcade-submit-button"
                disabled={
                  submitting || !submission.trim() || challenge.solved_by_me
                }
              >
                {submitting ? "SUBMITTING..." : "SUBMIT"}
              </button>
            </div>

            {response && (
              <div className={`arcade-response ${getResponseClass()}`}>
                {getResponseMessage()}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChallengeModal;
