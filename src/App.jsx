import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import { config } from "./config";
import { AuthProvider } from "./context/AuthContext";
import Challenges from "./pages/Challenges_NEW";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PublicTeamProfile from "./pages/PublicTeamProfile";
import PublicUserProfile from "./pages/PublicUserProfile";
import Register from "./pages/Register";
import Scoreboard from "./pages/Scoreboard";
import TeamManagement from "./pages/TeamManagement";
import Teams from "./pages/Teams";
import UserProfile from "./pages/UserProfile";
import Users from "./pages/Users";
import "./styles/arcade.css";
import "./styles/modernArcade.css";
import "./styles/notifications.css";
import "./styles/paths.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="arcade-app">
          <Navbar />
          <main className="arcade-main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/teams/:teamId" element={<PublicTeamProfile />} />
              <Route path="/team" element={<TeamManagement />} />

              {/* Protected routes - require team in team mode */}
              {/* In archive mode, no team requirement */}
              <Route path="/challenges" element={<Challenges />} />
              <Route path="/scoreboard" element={<Scoreboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/users/:userId" element={<PublicUserProfile />} />
              <Route path="/profile" element={<UserProfile />} />
            </Routes>
          </main>
          <footer className="arcade-footer">
            <div className="container text-center">
              <small className="text-muted">
                {config.archiveMode && (
                  <span style={{ color: "#00ffff", fontWeight: "bold" }}>
                    📦 ARCHIVED CTF •{" "}
                  </span>
                )}
                Powered by CTFd • Theme designed by Angel911
              </small>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
