import "../styles/taskContainer.css";

function TaskContainer({
  taskName,
  points,
  onClick,
  isSolved = false,
  isLocked = false,
  taskNumber = 1,
  pathColor = "#ffff00",
}) {
  const pointsColor = pathColor;

  return (
    <div className="task-container-wrapper">
      <button
        className={`task-container-button ${
          isLocked ? "task-locked" : isSolved ? "task-solved" : "task-active"
        }`}
        onClick={onClick}
        disabled={isLocked}
      >
        {/* Background Image */}
        <img
          src="/themes/Arcade/static/Task case.png"
          alt="Task Container"
          className="task-bg-image"
        />

        {/* Content Overlay */}
        <div className="task-content-overlay">
          {/* Task Name - Centered in the container */}
          <div className="task-name-display">{taskName}</div>

          {/* Points Display - Bottom right corner */}
          <div className="task-points-display">
            <span
              className="points-value"
              style={{
                color: pointsColor,
                textShadow: `2px 2px 0 #000, 0 0 10px ${pointsColor}, 0 0 20px ${pointsColor}`,
              }}
            >
              {points}
            </span>
            <span className="points-label">PTS</span>
          </div>

          {/* Status Indicators */}
          {isSolved && <div className="task-status-badge solved-badge">✓</div>}

          {isLocked && <div className="task-status-badge locked-badge">🔒</div>}
        </div>
      </button>
    </div>
  );
}

export default TaskContainer;
