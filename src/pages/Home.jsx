import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [ctfStatus, setCtfStatus] = useState("loading"); // loading, before, active, ended
  const [ctfConfig, setCtfConfig] = useState(null);

  useEffect(() => {
    fetchCtfConfig();

    // Refresh config every 30 seconds to catch admin changes
    const configRefresh = setInterval(fetchCtfConfig, 30000);

    return () => clearInterval(configRefresh);
  }, []);

  const fetchCtfConfig = async () => {
    try {
      // Get times from window.init (set by backend template)
      const startTime = window.init?.ctfStart;
      const endTime = window.init?.ctfEnd;

      // Store config
      setCtfConfig({ start: startTime, end: endTime });

      // Check CTF status
      const now = new Date();

      // Handle both Unix timestamps (numbers/strings) and ISO strings
      let start = null;
      let end = null;

      if (startTime) {
        // Check if it's a Unix timestamp (number or numeric string)
        const numericStart =
          typeof startTime === "number" ? startTime : parseInt(startTime, 10);
        if (!isNaN(numericStart) && numericStart > 1000000000) {
          // Unix timestamp in seconds - convert to milliseconds
          start = new Date(numericStart * 1000);
        } else {
          // ISO string
          start = new Date(startTime);
        }
      }

      if (endTime) {
        // Check if it's a Unix timestamp (number or numeric string)
        const numericEnd =
          typeof endTime === "number" ? endTime : parseInt(endTime, 10);
        if (!isNaN(numericEnd) && numericEnd > 1000000000) {
          // Unix timestamp in seconds - convert to milliseconds
          end = new Date(numericEnd * 1000);
        } else {
          // ISO string
          end = new Date(endTime);
        }
      }

      if (!start) {
        // No start time set - CTF is always active
        setCtfStatus("active");
      } else if (now < start) {
        setCtfStatus("before");
      } else if (end && now > end) {
        setCtfStatus("ended");
      } else {
        setCtfStatus("active");
      }
    } catch (error) {
      console.error("[CTF Timer] Failed to check CTF config:", error);
      // Default to active if we can't fetch config
      setCtfStatus("active");
    }
  };

  useEffect(() => {
    if (!ctfConfig || ctfStatus !== "before") return;

    let soundPlayed = false;

    const calculateTimeLeft = () => {
      // Convert Unix timestamp to Date
      const startTime = ctfConfig.start;
      const numericStart =
        typeof startTime === "number" ? startTime : parseInt(startTime, 10);
      const targetDate = new Date(numericStart * 1000);

      const now = new Date();
      const difference = targetDate - now;

      if (difference > 0) {
        const newTimeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };

        setTimeLeft(newTimeLeft);

        // Play sound when 4 seconds left (and only once)
        if (
          !soundPlayed &&
          newTimeLeft.days === 0 &&
          newTimeLeft.hours === 0 &&
          newTimeLeft.minutes === 0 &&
          newTimeLeft.seconds === 4
        ) {
          soundPlayed = true;
          const startSound = new Audio("/themes/Arcade/static/start.mp3");
          startSound.volume = 0.7;
          startSound
            .play()
            .catch((err) => console.log("Audio play failed:", err));
        }
      } else {
        // Timer reached zero - CTF has started!
        setCtfStatus("active");
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [ctfConfig, ctfStatus]);

  return (
    <div className="home-page">
      <div className="home-container">
        {/* Hero Section */}
        <div className="home-hero">
          <h1 className="home-title">WELCOME TO CYBERMAZE</h1>
          <p className="home-subtitle">
            THE ULTIMATE CAPTURE THE FLAG CHALLENGE
          </p>
        </div>

        {/* Countdown Section - Only show if CTF hasn't started */}
        {ctfStatus === "before" && (
          <div className="countdown-section">
            <h2 className="countdown-label">EVENT STARTS IN</h2>
            <div className="countdown-timer">
              <div className="countdown-block">
                <div className="countdown-value">
                  {String(timeLeft.days).padStart(2, "0")}
                </div>
                <div className="countdown-unit">DAYS</div>
              </div>
              <div className="countdown-separator">:</div>
              <div className="countdown-block">
                <div className="countdown-value">
                  {String(timeLeft.hours).padStart(2, "0")}
                </div>
                <div className="countdown-unit">HOURS</div>
              </div>
              <div className="countdown-separator">:</div>
              <div className="countdown-block">
                <div className="countdown-value">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </div>
                <div className="countdown-unit">MINUTES</div>
              </div>
              <div className="countdown-separator">:</div>
              <div className="countdown-block">
                <div className="countdown-value">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </div>
                <div className="countdown-unit">SECONDS</div>
              </div>
            </div>
          </div>
        )}

        {/* CTF Active Message */}
        {ctfStatus === "active" && (
          <div className="countdown-section">
            <h2
              className="countdown-label"
              style={{
                color: "#00ff00",
                fontSize: "3.5rem",
                marginBottom: "1.5rem",
                textShadow:
                  "0 0 30px rgba(0, 255, 0, 0.8), 0 0 60px rgba(0, 255, 0, 0.5)",
                animation: "pulse 2s infinite",
              }}
            >
              🎮 CTF HAS STARTED! 🎮
            </h2>
            <p
              className="home-subtitle"
              style={{
                marginTop: "1rem",
                fontSize: "1.5rem",
                color: "#00ffff",
                textShadow: "0 0 10px rgba(0, 255, 255, 0.6)",
              }}
            >
              ENJOY THE CHALLENGES AND GOOD LUCK!
            </p>
          </div>
        )}

        {/* CTF Ended Message */}
        {ctfStatus === "ended" && (
          <div className="countdown-section">
            <h2 className="countdown-label" style={{ color: "#ff0066" }}>
              🏁 CTF HAS ENDED 🏁
            </h2>
            <p
              className="home-subtitle"
              style={{ marginTop: "1rem", fontSize: "1.2rem" }}
            >
              THANK YOU FOR PARTICIPATING!
            </p>
          </div>
        )}

        {/* Info Section */}
        <div className="home-info">
          <div className="info-card modern-card">
            <div className="info-icon">🎮</div>
            <h3 className="info-title">COMPETE</h3>
            <p className="info-text">
              Test your skills against players from around the world
            </p>
          </div>
          <div className="info-card modern-card">
            <div className="info-icon">🏆</div>
            <h3 className="info-title">WIN PRIZES</h3>
            <p className="info-text">
              Top performers will receive exclusive rewards
            </p>
          </div>
          <div className="info-card modern-card">
            <div className="info-icon">🔐</div>
            <h3 className="info-title">LEARN</h3>
            <p className="info-text">
              Master cybersecurity through hands-on challenges
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="home-cta">
          <Link to="/register" className="cta-button neon-button">
            REGISTER NOW
          </Link>
          <Link to="/challenges" className="cta-button-secondary neon-button">
            VIEW CHALLENGES
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
