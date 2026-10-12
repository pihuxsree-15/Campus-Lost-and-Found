
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.userId) {
      setUnreadCount(0);
      return;
    }

    axios
      .get(
        `https://campus-lost-found-backend-4iei.onrender.com/api/notifications/user/${user.userId}/unread-count`
      )
      .then((response) => setUnreadCount(response.data.count))
      .catch(() => setUnreadCount(0));
  }, [user?.userId]);

  function logout() {
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload();
  }

  return (
    <nav className="navbar">
      <h2>Campus Lost &amp; Found</h2>

      <div className="nav-links">
        <Link to="/">Home</Link>

        {user && (
          <>
            <Link to="/report">Report Item</Link>
            <Link to="/my-reports">My Reports</Link>
            <Link to="/my-claims">My Claims</Link>
          </>
        )}

        {user?.role === "ADMIN" && (
          <Link to="/admin">Admin</Link>
        )}

        {!user ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <>
            <Link
              to="/notifications"
              className="notification-bell"
              title="Notifications"
              aria-label={`Notifications, ${unreadCount} unread`}
            >
              🔔
              {unreadCount > 0 && (
                <span className="notification-badge">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>

            <button onClick={logout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
