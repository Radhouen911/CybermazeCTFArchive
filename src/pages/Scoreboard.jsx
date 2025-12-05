import { useEffect, useState } from "react";
import api from "../services/api";

function Scoreboard() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scoreVisibility, setScoreVisibility] = useState(true);

  useEffect(() => {
    checkScoreVisibility();
    if (scoreVisibility) {
      loadScoreboard();
    }
  }, []);

  const checkScoreVisibility = () => {
    const visibility =
      window.init?.scoreVisibility !== false &&
      window.init?.scoreVisibility !== "false" &&
      window.init?.scoreVisibility !== "hidden";
    setScoreVisibility(visibility);
  };

  const loadScoreboard = async () => {
    try {
      setLoading(true);
      const response = await api.getScoreboard();
      setScores(response.data || []);
    } catch (error) {
      console.error("Failed to load scoreboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Dark hour - scores hidden
  if (!scoreVisibility) {
    return (
      <div className="scoreboard-page">
        <div className="arcade-header">
          <div className="container">
            <div className="arcade-title-wrapper">
              <h1 className="arcade-title">SCOREBOARD</h1>
            </div>
          </div>
        </div>
        <div className="container">
          <div className="no-challenges-message">
            <div className="no-challenges-icon">🌙</div>
            <h2>Dark Hour Active</h2>
            <p>Scores are currently hidden. Check back later!</p>
          </div>
        </div>
      </div>
    );
  }

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

  return (
    <div className="scoreboard-page">
      <div className="arcade-header">
        <div className="container">
          <div className="arcade-title-wrapper">
            <h1 className="arcade-title">SCOREBOARD</h1>
          </div>
        </div>
      </div>

      <div className="container arcade-container">
        <div className="arcade-scoreboard">
          {scores.map((entry, idx) => (
            <div key={idx} className="arcade-score-entry">
              <span className="arcade-rank">#{idx + 1}</span>
              <span className="arcade-player">{entry.name}</span>
              <span className="arcade-score">{entry.score} PTS</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Scoreboard;
