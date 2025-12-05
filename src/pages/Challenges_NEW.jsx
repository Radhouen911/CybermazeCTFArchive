import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChallengeModal from "../components/ChallengeModal";
import TaskContainer from "../components/TaskContainer";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

// Path themes configuration - Ordered by difficulty/progression
const PATH_THEMES = {
  "THE CYBERPUNK ALLEY": {
    title: "THE CYBERPUNK ALLEY",
    subtitle: "SHADOWRUN • CYBERPUNK 2077 • NEON NIGHTS",
    color: "#ff00ff",
    gradient: "linear-gradient(135deg, #1a0033 0%, #330066 50%, #1a0033 100%)",
    glow: "0 0 20px #ff00ff",
  },
  "RHYTHM REVOLUTION": {
    title: "RHYTHM REVOLUTION",
    subtitle: "DDR • GUITAR HERO • BEATMANIA",
    color: "#ff1493",
    gradient: "linear-gradient(135deg, #330014 0%, #660029 50%, #330014 100%)",
    glow: "0 0 20px #ff1493",
  },
  "THE NEON GRID": {
    title: "THE NEON GRID",
    subtitle: "TRON • LIGHT CYCLES • DIGITAL FRONTIER",
    color: "#00ffff",
    gradient: "linear-gradient(135deg, #001a33 0%, #003366 50%, #001a33 100%)",
    glow: "0 0 20px #00ffff",
  },
  "FANTASY QUEST TAVERN": {
    title: "FANTASY QUEST TAVERN",
    subtitle: "GOLDEN AXE • GAUNTLET • DUNGEON CRAWLERS",
    color: "#ffa500",
    gradient: "linear-gradient(135deg, #331a00 0%, #664400 50%, #331a00 100%)",
    glow: "0 0 20px #ffa500",
  },
  "8-BIT PIXEL PALACE": {
    title: "8-BIT PIXEL PALACE",
    subtitle: "PAC-MAN • SPACE INVADERS • DONKEY KONG",
    color: "#ffff00",
    gradient: "linear-gradient(135deg, #1a1a00 0%, #333300 50%, #1a1a00 100%)",
    glow: "0 0 20px #ffff00",
  },
  "BOSS BATTLE ARENA": {
    title: "BOSS BATTLE ARENA",
    subtitle: "STREET FIGHTER • MORTAL KOMBAT • FINAL FIGHT",
    color: "#ff0000",
    gradient: "linear-gradient(135deg, #330000 0%, #660000 50%, #330000 100%)",
    glow: "0 0 20px #ff0000",
  },
};

function Challenges() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const [teamRequired, setTeamRequired] = useState(false);
  const [ctfStatus, setCtfStatus] = useState("active"); // before, active, ended, paused

  const paths = Object.keys(PATH_THEMES);

  // Filter to only show paths that have challenges
  const getPathsWithChallenges = () => {
    return paths.filter((path) => challenges.some((c) => c.category === path));
  };

  // Always filter - only show paths with challenges
  const availablePaths = getPathsWithChallenges();

  // If no paths have challenges, show first path with empty message
  const currentPath =
    availablePaths.length > 0 ? availablePaths[currentPathIndex] : paths[0];
  const currentTheme = PATH_THEMES[currentPath];

  // Sound effect for path switching
  const playPathChangeSound = () => {
    const audio = new Audio("./sel.mp3");
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  useEffect(() => {
    checkCtfStatus();
    loadChallenges();
  }, []);

  const checkCtfStatus = () => {
    // Get times from window.init
    const startTime = window.init?.ctfStart;
    const endTime = window.init?.ctfEnd;
    const isPaused =
      window.init?.ctfPaused === true || window.init?.ctfPaused === "true";

    if (isPaused) {
      setCtfStatus("paused");
      return;
    }

    const now = new Date();
    let start = null;
    let end = null;

    if (startTime) {
      const numericStart =
        typeof startTime === "number" ? startTime : parseInt(startTime, 10);
      if (!isNaN(numericStart) && numericStart > 1000000000) {
        start = new Date(numericStart * 1000);
      } else {
        start = new Date(startTime);
      }
    }

    if (endTime) {
      const numericEnd =
        typeof endTime === "number" ? endTime : parseInt(endTime, 10);
      if (!isNaN(numericEnd) && numericEnd > 1000000000) {
        end = new Date(numericEnd * 1000);
      } else {
        end = new Date(endTime);
      }
    }

    if (!start) {
      setCtfStatus("active");
    } else if (now < start) {
      setCtfStatus("before");
    } else if (end && now > end) {
      setCtfStatus("ended");
    } else {
      setCtfStatus("active");
    }
  };

  const loadChallenges = async () => {
    try {
      setLoading(true);

      const response = await api.getChallenges();

      // Handle different response structures
      let challengeData = [];
      if (response.success && response.data) {
        challengeData = Array.isArray(response.data) ? response.data : [];
      } else if (Array.isArray(response.data)) {
        challengeData = response.data;
      } else if (response.data && typeof response.data === "object") {
        // Sometimes CTFd returns {data: [...]}
        challengeData = response.data.data || [];
      }

      setChallenges(challengeData);
    } catch (error) {
      console.error("Failed to load challenges:", error);

      // Check if error is due to team requirement
      if (error.message && error.message.includes("permission")) {
        // Check if user needs to be on a team
        if (isAuthenticated && !user?.team_id) {
          setTeamRequired(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPathChallenges = () => {
    const filtered = challenges.filter((c) => c.category === currentPath);
    const sorted = filtered.sort((a, b) => a.value - b.value);

    // Always show 5 challenges - add placeholders if needed
    const minChallenges = 5;
    if (sorted.length < minChallenges) {
      const placeholders = Array(minChallenges - sorted.length)
        .fill(null)
        .map((_, idx) => ({
          id: `placeholder-${idx}`,
          name: "???",
          value: 0,
          isPlaceholder: true,
          solved_by_me: false,
        }));
      return [...sorted, ...placeholders];
    }

    return sorted;
  };

  const nextPath = () => {
    playPathChangeSound();
    setCurrentPathIndex((prev) => (prev + 1) % availablePaths.length);
  };

  const prevPath = () => {
    playPathChangeSound();
    setCurrentPathIndex(
      (prev) => (prev - 1 + availablePaths.length) % availablePaths.length
    );
  };

  const isChallengeUnlocked = (challenge) => {
    if (!challenge.requirements || challenge.requirements.length === 0) {
      return true;
    }
    return challenge.requirements.every((reqId) => {
      const reqChallenge = challenges.find((c) => c.id === reqId);
      return reqChallenge && reqChallenge.solved_by_me;
    });
  };

  const handleChallengeClick = async (challengeId) => {
    // Ignore placeholder challenges
    if (
      typeof challengeId === "string" &&
      challengeId.startsWith("placeholder-")
    ) {
      return;
    }

    const challenge = challenges.find((c) => c.id === challengeId);
    if (!isChallengeUnlocked(challenge)) {
      return;
    }

    try {
      const response = await api.getChallenge(challengeId);
      setSelectedChallenge(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Failed to load challenge:", error);
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

  // If team is required but user doesn't have one, show team requirement message
  // Admins bypass this requirement
  const isAdmin = user?.isAdmin || window.init?.userType === "admin";
  if (teamRequired && isAuthenticated && !user?.team_id && !isAdmin) {
    return (
      <div className="challenges-page">
        <div className="container">
          <div className="no-challenges-message">
            <div className="no-challenges-icon">👥</div>
            <h2>Team Required</h2>
            <p>You must be on a team to view challenges.</p>
            <button
              className="arcade-button"
              onClick={() => navigate("/teams")}
              style={{ marginTop: "20px" }}
            >
              GO TO TEAMS
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="challenges-page path-themed"
      style={{
        "--path-color": currentTheme.color,
        "--path-glow": currentTheme.glow,
      }}
    >
      {/* Video Background for The Neon Grid */}
      {currentPath === "THE NEON GRID" && (
        <video
          className="path-video-background"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="./neonlights.mp4" type="video/mp4" />
        </video>
      )}

      {/* GIF Background for 8-Bit Pixel Palace */}
      {currentPath === "8-BIT PIXEL PALACE" && (
        <div
          className="path-video-background"
          style={{
            backgroundImage: "url('./8bit.gif')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      )}

      {/* Video Background for The Cyberpunk Alley */}
      {currentPath === "THE CYBERPUNK ALLEY" && (
        <video
          className="path-video-background"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="./cyberpunkalley.mp4" type="video/mp4" />
        </video>
      )}

      {/* Video Background for Fantasy Quest Tavern */}
      {currentPath === "FANTASY QUEST TAVERN" && (
        <video
          className="path-video-background"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="./fantasy.mp4" type="video/mp4" />
        </video>
      )}

      {/* Video Background for Boss Battle Arena */}
      {currentPath === "BOSS BATTLE ARENA" && (
        <video
          className="path-video-background"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="./battlearena.mp4" type="video/mp4" />
        </video>
      )}

      {/* Video Background for Rhythm Revolution */}
      {currentPath === "RHYTHM REVOLUTION" && (
        <video
          className="path-video-background"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="./rythmrevo.mp4" type="video/mp4" />
        </video>
      )}

      {/* Path Header - Only show if there are challenges */}
      {availablePaths.length > 0 && (
        <div className="path-header" style={{ background: "transparent" }}>
          <div className="container">
            <div className="path-title-wrapper">
              <h1 className="path-title">{currentTheme.title}</h1>
            </div>
          </div>
        </div>
      )}

      {/* Path Navigation - Only show if there are challenges */}
      {availablePaths.length > 0 && (
        <div className="path-navigation">
          <button
            className="path-nav-button path-nav-prev"
            onClick={prevPath}
          />

          <div className="path-indicator">
            {availablePaths.map((path, idx) => (
              <div
                key={path}
                className={`path-dot ${
                  idx === currentPathIndex ? "active" : ""
                }`}
                style={
                  idx === currentPathIndex
                    ? {
                        background: currentTheme.color,
                        boxShadow: `0 0 15px ${currentTheme.color}`,
                      }
                    : {}
                }
                onClick={() => {
                  playPathChangeSound();
                  setCurrentPathIndex(idx);
                }}
              />
            ))}
          </div>

          <button
            className="path-nav-button path-nav-next"
            onClick={nextPath}
          />
        </div>
      )}

      {/* CTF Status Messages */}
      {ctfStatus === "before" && (
        <div className="container">
          <div className="no-challenges-message">
            <div className="no-challenges-icon">⏰</div>
            <h2>CTF Has Not Started Yet</h2>
            <p>
              Please wait for the competition to begin. Check the home page for
              the countdown timer.
            </p>
          </div>
        </div>
      )}

      {ctfStatus === "paused" && (
        <div className="container">
          <div className="no-challenges-message">
            <div className="no-challenges-icon">⏸️</div>
            <h2>CTF is Paused</h2>
            <p>
              The competition is temporarily paused. Please check back later.
            </p>
          </div>
        </div>
      )}

      {ctfStatus === "ended" && (
        <div className="container">
          <div className="no-challenges-message">
            <div className="no-challenges-icon">🏁</div>
            <h2>CTF Has Ended</h2>
            <p>
              Thank you for participating! Check the scoreboard for final
              results.
            </p>
          </div>
        </div>
      )}

      {/* Challenges Grid - Only show if CTF is active */}
      {ctfStatus === "active" && (
        <div className="container path-container">
          {getCurrentPathChallenges().length > 0 ? (
            <div className="path-challenges-grid">
              {getCurrentPathChallenges().map((challenge, idx) => (
                <div key={challenge.id} className="path-challenge-card">
                  {/* Connection line to previous */}
                  {idx > 0 && (
                    <div
                      className="challenge-connector"
                      style={{
                        background: currentTheme.color,
                        boxShadow: currentTheme.glow,
                      }}
                    />
                  )}

                  <TaskContainer
                    taskName={challenge.name}
                    points={challenge.value}
                    onClick={() => handleChallengeClick(challenge.id)}
                    isSolved={challenge.solved_by_me}
                    isLocked={
                      challenge.isPlaceholder || !isChallengeUnlocked(challenge)
                    }
                    taskNumber={idx + 1}
                    pathColor={currentTheme.color}
                    tags={challenge.tags || []}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="no-challenges-message">
              <div className="no-challenges-icon">🎮</div>
              <h2>No Challenges Available</h2>
              <p>Check back later for new challenges in this path!</p>
            </div>
          )}
        </div>
      )}

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
