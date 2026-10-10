
import { Link } from "react-router-dom";

function Sidebar() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <aside className="sidebar">
      <h3>Menu</h3>
      <Link to="/">Home</Link>

      {user && (
        <>
          <Link to="/report">Report Item</Link>
          <Link to="/my-reports">My Reports</Link>
          <Link to="/notifications">Notifications</Link>
        </>
      )}

      {user?.role === "ADMIN" && (
        <Link to="/admin">Admin Dashboard</Link>
      )}
    </aside>
  );
}

export default Sidebar;
