function ChallengeCard({ challenge, onClick }) {
  const isSolved = challenge.solved_by_me;

  return (
    <div className="arcade-challenge-wrapper">
      <button
        className={`arcade-challenge-button ${isSolved ? 'arcade-solved' : 'arcade-unsolved'}`}
        onClick={onClick}
      >
        <div className="arcade-challenge-screen">
          <div className="arcade-challenge-status">
            <span className="arcade-status-icon">
              {isSolved ? '★' : '○'}
            </span>
          </div>
          <div className="arcade-challenge-name">{challenge.name}</div>
          <div className="arcade-challenge-points">
            <span className="arcade-points-label">PTS</span>
            <span className="arcade-points-value">{challenge.value}</span>
          </div>
          <div className="arcade-challenge-footer">
            {isSolved ? 'COMPLETED' : 'PRESS START'}
          </div>
        </div>
        <div className="arcade-challenge-glow"></div>
      </button>
    </div>
  );
}

export default ChallengeCard;
