
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";
import ItemCard from "../components/ItemCard";
import "./MyReports.css";

const API = "https://campus-lost-found-backend-4iei.onrender.com/api";

function MyReports() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [expandedItem, setExpandedItem] = useState(null);
  const [claims, setClaims] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "success" });

  const messageTimer = useRef(null);

  function showMessage(text, type = "success") {
    setMessage({ text, type });

    if (messageTimer.current) {
      clearTimeout(messageTimer.current);
    }

    messageTimer.current = setTimeout(() => {
      setMessage({ text: "", type: "success" });
    }, 4000);
  }

  useEffect(() => {
    loadReports();

    return () => {
      if (messageTimer.current) {
        clearTimeout(messageTimer.current);
      }
    };
  }, []);

  async function loadReports() {
    if (!user?.userId) {
      showMessage("Please log in to view your reports.", "error");
      return;
    }

    try {
      const response = await axios.get(
        `${API}/items/user/${user.userId}`
      );

      setItems(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to load reports:", error);
      showMessage("Could not load your reports.", "error");
    }
  }

  function startEdit(item) {
    setEditingItem({
      ...item,
      itemName: item.itemName || "",
      type: item.type || "LOST",
      category: item.category || "",
      description: item.description || "",
      date: item.date || "",
      location: item.location || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleEditChange(event) {
    const { name, value } = event.target;

    setEditingItem((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function updateItem(event) {
    event.preventDefault();

    if (!editingItem?.id) {
      showMessage("Unable to identify the report.", "error");
      return;
    }

    try {
      await axios.put(
        `${API}/items/${editingItem.id}`,
        editingItem
      );

      setEditingItem(null);
      await loadReports();
      showMessage("Report updated successfully!");
    } catch (error) {
      console.error("Update failed:", error.response?.data || error);
      showMessage(
        error.response?.data?.message ||
          "Report update failed. Please try again.",
        "error"
      );
    }
  }

  async function deleteItem(itemId) {
    if (!window.confirm("Are you sure you want to delete this report?")) {
      return;
    }

    try {
      await axios.delete(`${API}/items/${itemId}`);

      if (editingItem?.id === itemId) {
        setEditingItem(null);
      }

      await loadReports();
      showMessage("Report deleted successfully!");
    } catch (error) {
      console.error("Delete failed:", error);
      showMessage("Could not delete the report.", "error");
    }
  }

  async function viewClaims(item) {
    if (expandedItem === item.id) {
      setExpandedItem(null);
      setClaims([]);
      return;
    }

    try {
      const response = await axios.get(
        `${API}/claims/reporter/${user.userId}`
      );

      const allClaims = Array.isArray(response.data)
        ? response.data
        : [];

      setClaims(
        allClaims.filter(
          (claim) => Number(claim.itemId) === Number(item.id)
        )
      );

      setExpandedItem(item.id);
    } catch (error) {
      console.error("Failed to load claims:", error);
      showMessage(
        "Could not load claims. Please check the claims API.",
        "error"
      );
    }
  }

  async function reviewClaim(claimId, status) {
    const action = status === "APPROVED" ? "approve" : "reject";

    if (!window.confirm(`Are you sure you want to ${action} this claim?`)) {
      return;
    }

    try {
      await axios.put(
        `${API}/claims/${claimId}/review`,
        {},
        {
          params: { reporterId: user.userId, status },
        }
      );

      showMessage(`Claim ${action}d successfully!`);

      if (expandedItem !== null) {
        const response = await axios.get(
          `${API}/claims/reporter/${user.userId}`
        );

        const allClaims = Array.isArray(response.data)
          ? response.data
          : [];

        setClaims(
          allClaims.filter(
            (claim) => Number(claim.itemId) === Number(expandedItem)
          )
        );
      }

      await loadReports();
    } catch (error) {
      console.error("Claim review failed:", error.response?.data || error);
      showMessage(
        error.response?.data?.message || "Could not update the claim.",
        "error"
      );
    }
  }

  async function confirmReturn(item) {
    if (
      !window.confirm(
        "Confirm that this item has been returned to its owner?"
      )
    ) {
      return;
    }

    try {
      await axios.put(
        `${API}/claims/item/${item.id}/returned`,
        {},
        { params: { reporterId: user.userId } }
      );

      showMessage("Item marked as returned successfully!");
      await loadReports();

      if (expandedItem !== null) {
        const response = await axios.get(
          `${API}/claims/reporter/${user.userId}`
        );

        const allClaims = Array.isArray(response.data)
          ? response.data
          : [];

        setClaims(
          allClaims.filter(
            (claim) => Number(claim.itemId) === Number(expandedItem)
          )
        );
      }
    } catch (error) {
      console.error(
        "Return confirmation failed:",
        error.response?.data || error
      );

      showMessage(
        error.response?.data?.message ||
          "Could not confirm the return.",
        "error"
      );
    }
  }

  function downloadQR(itemId) {
    const canvas = document.getElementById(`qr-${itemId}`);

    if (!canvas) {
      showMessage("QR code is not available.", "error");
      return;
    }

    const link = document.createElement("a");
    link.download = `item-${itemId}-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    showMessage("QR code downloaded!");
  }

  return (
    <div className="my-reports-page">
      <h1 className="my-reports-heading">My Reports</h1>

      {message.text && (
        <div
          className={`my-reports-message ${message.type}`}
          role="status"
          aria-live="polite"
        >
          {message.text}
        </div>
      )}

      {editingItem && (
        <div className="my-report-edit-form">
          <h2>Edit Report</h2>

          <form onSubmit={updateItem}>
            <label htmlFor="edit-itemName">Item Name</label>
            <input
              id="edit-itemName"
              name="itemName"
              value={editingItem.itemName}
              onChange={handleEditChange}
              required
            />

            <label htmlFor="edit-type">Item Type</label>
            <select
              id="edit-type"
              name="type"
              value={editingItem.type}
              onChange={handleEditChange}
              required
            >
              <option value="LOST">Lost Item</option>
              <option value="FOUND">Found Item</option>
            </select>

            <label htmlFor="edit-category">Category</label>
            <input
              id="edit-category"
              name="category"
              value={editingItem.category}
              onChange={handleEditChange}
              required
            />

            <label htmlFor="edit-description">Description</label>
            <textarea
              id="edit-description"
              name="description"
              value={editingItem.description}
              onChange={handleEditChange}
              rows="3"
            />

            <label htmlFor="edit-date">Date</label>
            <input
              id="edit-date"
              type="date"
              name="date"
              value={editingItem.date}
              onChange={handleEditChange}
              required
            />

            <label htmlFor="edit-location">Location</label>
            <input
              id="edit-location"
              name="location"
              value={editingItem.location}
              onChange={handleEditChange}
              required
            />

            <div className="my-report-form-actions">
              <button type="submit">Update Report</button>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {!user && <p>Please log in to view your reports.</p>}

      {user && items.length === 0 && (
        <p className="my-reports-empty">
          You have not submitted any reports yet.
        </p>
      )}

      <div className="my-reports-list">
        {items.map((item) => (
          <div key={item.id} className="my-report-card">
            <div className="my-report-item">
              <ItemCard item={item} />
            </div>

            <div className="my-report-actions">
              <button
                type="button"
                className="my-report-edit-button"
                onClick={() => startEdit(item)}
              >
                Edit
              </button>

              <button
                type="button"
                className="my-report-delete-button"
                onClick={() => deleteItem(item.id)}
              >
                Delete
              </button>

              {item.type === "FOUND" && (
                <button
                  type="button"
                  className="my-report-claims-button"
                  onClick={() => viewClaims(item)}
                >
                  {expandedItem === item.id
                    ? "Hide Claims"
                    : "View Claims"}
                </button>
              )}

              {item.type === "FOUND" &&
                item.status === "CLAIMED" && (
                  <button
                    type="button"
                    className="my-report-return-button"
                    onClick={() => confirmReturn(item)}
                  >
                    Confirm Return
                  </button>
                )}
            </div>

            <div className="my-report-qr">
              <h3>Item QR Code</h3>

              <div className="my-report-qr-box">
              <QRCodeCanvas
  id={`qr-${item.id}`}
  value={`${window.location.origin}/item/${item.id}`}
  size={180}
  level="H"
  fgColor="#301050"
  bgColor="#FFFFFF"
  marginSize={2}
/>
  
              </div>

              <button
                type="button"
                className="my-report-download-button"
                onClick={() => downloadQR(item.id)}
              >
                Download QR Code
              </button>
            </div>

            {expandedItem === item.id && (
              <div className="my-report-claims">
                <h3>Claims for {item.itemName}</h3>

                {claims.length === 0 ? (
                  <p>No claims found for this item.</p>
                ) : (
                  claims.map((claim) => (
                    <div key={claim.id} className="my-report-claim-card">
                      <p>
                        <strong>Claimant ID:</strong> {claim.claimantId}
                      </p>

                      <p>
                        <strong>Description:</strong>{" "}
                        {claim.description || "Not provided"}
                      </p>

                      <p>
                        <strong>Proof:</strong>{" "}
                        {claim.proofOfOwnership || "Not provided"}
                      </p>

                      <p>
                        <strong>Status:</strong> {claim.status}
                      </p>

                      {claim.status === "PENDING" && (
                        <div className="my-report-claim-actions">
                          <button
                            type="button"
                            onClick={() =>
                              reviewClaim(claim.id, "APPROVED")
                            }
                          >
                            Approve
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              reviewClaim(claim.id, "REJECTED")
                            }
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyReports;
