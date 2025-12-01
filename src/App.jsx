import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import TeamRequiredGuard from "./components/TeamRequiredGuard";
import { AuthProvider } from "./context/AuthContext";
import Challenges from "./pages/Challenges";
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
              <Route
                path="/challenges"
                element={
                  <TeamRequiredGuard>
                    <Challenges />
                  </TeamRequiredGuard>
                }
              />
              <Route
                path="/scoreboard"
                element={
                  <TeamRequiredGuard>
                    <Scoreboard />
                  </TeamRequiredGuard>
                }
              />
              <Route
                path="/users"
                element={
                  <TeamRequiredGuard>
                    <Users />
                  </TeamRequiredGuard>
                }
              />
              <Route
                path="/users/:userId"
                element={
                  <TeamRequiredGuard>
                    <PublicUserProfile />
                  </TeamRequiredGuard>
                }
              />
              <Route
                path="/profile"
                element={
                  <TeamRequiredGuard>
                    <UserProfile />
                  </TeamRequiredGuard>
                }
              />
            </Routes>
          </main>
          <footer className="arcade-footer">
            <div className="container text-center">
              <small className="text-muted">
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
