import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);

      // Get users list directly
      const usersResponse = await api.getUsers();
      const usersData = usersResponse.data || [];

      // Fetch individual user data with scores only
      const usersWithData = await Promise.all(
        usersData.map(async (user) => {
          let userScore = user.score || 0;

          // Try to get detailed user info for accurate score
          try {
            const userDetailResponse = await api.getUser(user.id);
            if (userDetailResponse.success && userDetailResponse.data) {
              userScore = userDetailResponse.data.score || 0;
            }
          } catch (err) {
            // Silently fail - use basic user data
          }

          return {
            id: user.id,
            name: user.name,
            score: userScore,
            place: user.place || null,
          };
        })
      );

      // Sort by score descending
      usersWithData.sort((a, b) => (b.score || 0) - (a.score || 0));

      // Assign ranks based on sorted order
      usersWithData.forEach((user, idx) => {
        if (!user.place) {
          user.place = idx + 1;
        }
      });

      setUsers(usersWithData);
    } catch (error) {
      console.error("Failed to load users:", error);
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
    <div className="users-page">
      <div className="container">
        <div className="arcade-header">
          <div className="arcade-title-wrapper">
            <h1 className="arcade-title">USERS</h1>
            <div className="arcade-subtitle">REGISTERED PLAYERS</div>
          </div>
        </div>

        <div className="users-grid">
          {users.map((user, idx) => (
            <Link
              key={user.id}
              to={`/users/${user.id}`}
              className="user-card modern-card"
            >
              <div className="user-rank">#{user.place || idx + 1}</div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-stats">
                  <span className="user-score">{user.score || 0} PTS</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Users;
