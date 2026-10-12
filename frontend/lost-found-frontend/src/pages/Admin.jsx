
import { useEffect, useState } from "react";
import axios from "axios";

function Admin() {
  const [items, setItems] = useState([]);
  const [claims, setClaims] = useState([]);
  const [error, setError] = useState("");

  async function loadItems() {
    try {
      const response = await axios.get(
        "https://campus-lost-found-backend-4iei.onrender.com/api/items"
      );
      setItems(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadClaims() {
    try {
      const response = await axios.get(
        "https://campus-lost-found-backend-4iei.onrender.com/api/claims/admin"
      );
      setClaims(response.data);
      setError("");
    } catch (error) {
      console.error(error);
      setError("Unable to load claims. Check that the backend is running.");
    }
  }

  async function updateStatus(id, status) {
    const item = items.find((x) => x.id === id);

    try {
      await axios.put(
        `https://campus-lost-found-backend-4iei.onrender.com/api/items/${id}`,
        { ...item, status }
      );
      loadItems();
    } catch (error) {
      alert("Update failed");
    }
  }

  async function deleteItem(id) {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      await axios.delete(`https://campus-lost-found-backend-4iei.onrender.com/api/items/${id}`);
      loadItems();
    } catch (error) {
      alert("Delete failed");
    }
  }

  async function reviewClaim(claimId, decision) {
    try {
      await axios.put(
        `https://campus-lost-found-backend-4iei.onrender.com/api/claims/${claimId}/review`,
        { decision }
      );

      await Promise.all([loadClaims(), loadItems()]);
      alert(`Claim ${decision.toLowerCase()} successfully.`);
    } catch (error) {
      alert(error.response?.data?.message || "Unable to review claim.");
    }
  }

  async function markReturned(itemId) {
    try {
      await axios.put(
        `https://campus-lost-found-backend-4iei.onrender.com/api/claims/item/${itemId}/returned`
      );
      await loadItems();
      alert("Item marked as returned.");
    } catch (error) {
      alert(error.response?.data?.message || "Unable to update item.");
    }
  }

  useEffect(() => {
    loadItems();
    loadClaims();
  }, []);

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>

      <h2>Reported Items</h2>

      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Type</th>
              <th>Category</th>
              <th>Location</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.itemName}</td>
                <td>{item.type}</td>
                <td>{item.category}</td>
                <td>{item.location}</td>
                <td>{item.status}</td>
                <td>
                  <button onClick={() => updateStatus(item.id, "APPROVED")}>
                    Approve
                  </button>{" "}
                  <button onClick={() => updateStatus(item.id, "RESOLVED")}>
                    Resolve
                  </button>{" "}
                  {item.status === "CLAIMED" && (
                    <button onClick={() => markReturned(item.id)}>
                      Mark Returned
                    </button>
                  )}{" "}
                  <button onClick={() => deleteItem(item.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 style={{ marginTop: "35px" }}>Claims Management</h2>
      <p>Review student claims and manage item returns.</p>

      {error && <p>{error}</p>}

      {claims.length === 0 && !error && (
        <p>No claims have been submitted yet.</p>
      )}

      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Claim ID</th>
              <th>Item ID</th>
              <th>Claimant ID</th>
              <th>Description</th>
              <th>Proof of Ownership</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {claims.map((claim) => (
              <tr key={claim.id}>
                <td>{claim.id}</td>
                <td>{claim.itemId}</td>
                <td>{claim.claimantId}</td>
                <td>{claim.description}</td>
                <td>{claim.proofOfOwnership || "Not provided"}</td>
                <td>{claim.status}</td>
                <td>
                  {claim.status === "PENDING" ? (
                    <>
                      <button
                        onClick={() => reviewClaim(claim.id, "APPROVED")}
                      >
                        Approve Claim
                      </button>{" "}
                      <button
                        onClick={() => reviewClaim(claim.id, "REJECTED")}
                      >
                        Reject Claim
                      </button>
                    </>
                  ) : (
                    "Reviewed"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Admin;
