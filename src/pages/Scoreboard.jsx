import { useState, useEffect } from 'react';
import api from '../services/api';

function Scoreboard() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScoreboard();
  }, []);

  const loadScoreboard = async () => {
    try {
      setLoading(true);
      const response = await api.getScoreboard();
      setScores(response.data || []);
    } catch (error) {
      console.error('Failed to load scoreboard:', error);
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
