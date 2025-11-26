import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/auth.css";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    registrationCode: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(
        formData.name,
        formData.email,
        formData.password,
        formData.registrationCode
      );
      navigate("/");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <video className="auth-video-bg" autoPlay loop muted playsInline>
        <source
          src="/themes/Arcade/static/cyberpunkalley.mp4"
          type="video/mp4"
        />
      </video>

      <div className="auth-container">
        <div className="auth-box">
          <div className="auth-header">
            <h1 className="auth-title">REGISTER</h1>
            <div className="auth-subtitle">JOIN THE CYBERMAZE</div>
          </div>

          {error && (
            <div className="auth-error">
              <span className="error-icon">⚠</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label htmlFor="name" className="auth-label">
                USERNAME
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="auth-input"
                required
                autoComplete="username"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="email" className="auth-label">
                EMAIL
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="auth-input"
                required
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password" className="auth-label">
                PASSWORD
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="auth-input"
                required
                autoComplete="new-password"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="registrationCode" className="auth-label">
                REGISTRATION CODE
              </label>
              <input
                type="text"
                id="registrationCode"
                name="registrationCode"
                value={formData.registrationCode}
                onChange={handleChange}
                className="auth-input"
                required
                autoComplete="off"
              />
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "REGISTERING..." : "REGISTER"}
            </button>
          </form>

          <div className="auth-footer">
            <span className="auth-footer-text">ALREADY REGISTERED?</span>
            <Link to="/login" className="auth-link">
              LOGIN HERE
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
