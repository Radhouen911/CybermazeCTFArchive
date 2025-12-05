import { useState, useEffect } from 'react';
import api from '../services/api';
import ChallengeModal from '../components/ChallengeModal';
import AnimatedBackground from '../components/AnimatedBackground';

function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const response = await api.getChallenges();
      setChallenges(response.data || []);
    } catch (error) {
      console.error('Failed to load challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategories = () => {
    const categories = [...new Set(challenges.map(c => c.category))];
    return categories.filter(cat => cat !== 'Start').sort();
  };

  const getChallengesByCategory = (category) => {
    return challenges
      .filter(c => c.category === category && c.name !== 'Sanity Check')
      .sort((a, b) => a.value - b.value);
  };

  const getSanityCheck = () => {
    return challenges.find(c => c.name === 'Sanity Check');
  };

  const isChallengeUnlocked = (challenge) => {
    if (!challenge.requirements || challenge.requirements.length === 0) {
      return true;
    }
    return challenge.requirements.every(reqId => {
      const reqChallenge = challenges.find(c => c.id === reqId);
      return reqChallenge && reqChallenge.solved_by_me;
    });
  };

  const handleChallengeClick = async (challengeId) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!isChallengeUnlocked(challenge)) {
      return; // Don't open locked challenges
    }
    
    try {
      const response = await api.getChallenge(challengeId);
      setSelectedChallenge(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Failed to load challenge:', error);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedChallenge(null);
  };

  const handleSubmitSuccess = () => {
    loadChallenges();
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
    <div className="challenges-page">
      <div className="arcade-header">
        <div className="container">
          <div className="arcade-title-wrapper">
            <h1 className="arcade-title">CHALLENGES</h1>
            <div className="arcade-stats">
              <div className="stat-item">
                <span className="stat-label">LEVEL</span>
                <span className="stat-value">2</span>
              </div>
              <div className="stat-divider">/</div>
              <div className="stat-item">
                <span className="stat-label">POINTS AVAILABLE</span>
                <span className="stat-value">2</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container arcade-container">
        <AnimatedBackground />
        <div className="skill-tree-container">
          {/* Sanity Check - Central Node */}
          {getSanityCheck() && (
            <div className="sanity-check-node">
              <button
                className={`tree-node sanity-node ${getSanityCheck().solved_by_me ? 'node-solved' : 'node-unsolved'}`}
                onClick={() => handleChallengeClick(getSanityCheck().id)}
                data-node-id={getSanityCheck().id}
              >
                <div className="node-name">{getSanityCheck().name}</div>
                <div className="node-points">{getSanityCheck().value}</div>
              </button>
              <div className="sanity-label">START HERE</div>
            </div>
          )}

          {/* Four Vertical Branches */}
          <div className="skill-tree-branches">
            {getCategories().map((category, idx) => (
              <div key={idx} className="skill-branch">
                <div className="branch-header">
                  <h3 className="branch-title">{category}</h3>
                </div>
                
                {/* Connection from Sanity to first node */}
                <div className="path-root-connector"></div>

                {/* Challenges in vertical arrangement */}
                <div className="branch-nodes">
                  {getChallengesByCategory(category).map((challenge, cIdx) => (
                    <div key={challenge.id} className="node-wrapper">
                      {cIdx > 0 && <div className="vertical-connector"></div>}
                      <button
                        className={`tree-node ${
                          !isChallengeUnlocked(challenge) ? 'node-locked' :
                          challenge.solved_by_me ? 'node-solved' : 'node-unsolved'
                        }`}
                        onClick={() => handleChallengeClick(challenge.id)}
                        data-node-id={challenge.id}
                      >
                        <div className="node-name">{challenge.name}</div>
                        <div className="node-points">{challenge.value}</div>
                        {challenge.solved_by_me && <div className="node-check">✓</div>}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && selectedChallenge && (
        <ChallengeModal
          challenge={selectedChallenge}
          onClose={handleCloseModal}
          onSubmitSuccess={handleSubmitSuccess}
        />
      )}
    </div>
  );
}

export default Challenges;
