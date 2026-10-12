
import { useEffect, useState } from "react";
import axios from "axios";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    if (!user?.userId) {
      setError("Please log in to view notifications.");
      return;
    }

    axios
      .get(`https://campus-lost-found-backend-4iei.onrender.com/api/notifications/user/${user.userId}`)
      .then((response) => setNotifications(response.data))
      .catch(() => setError("Unable to load notifications."));
  }, [user?.userId]);

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(
        `https://campus-lost-found-backend-4iei.onrender.com/api/notifications/${notificationId}/read/user/${user.userId}`
      );

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch {
      setError("Unable to update notification.");
    }
  };

  return (
    <div className="page-container">
      <h2>Notifications</h2>

      {error && <p>{error}</p>}

      {!error && notifications.length === 0 && (
        <p>No notifications yet.</p>
      )}

      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="item-card"
          style={{
            marginBottom: "12px",
            opacity: notification.read ? 0.7 : 1
          }}
        >
          <p>{notification.message}</p>
          <small>
            {notification.createdAt
              ? new Date(notification.createdAt).toLocaleString()
              : ""}
          </small>

          {!notification.read && (
            <button onClick={() => markAsRead(notification.id)}>
              Mark as read
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default Notifications;
