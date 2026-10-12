
import { useEffect, useState } from "react";
import axios from "axios";

function MyClaims() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [claims, setClaims] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.userId) {
      setError("Please log in to view your claims.");
      return;
    }

    axios
      .get(`https://campus-lost-found-backend-4iei.onrender.com/api/claims/my/${user.userId}`)
      .then((response) => setClaims(response.data))
      .catch(() => setError("Could not load your claims."));
  }, [user?.userId]);

  return (
    <div className="page-container">
      <h1>My Claims</h1>
      <p>Track the status of items you have claimed.</p>

      {error && <p>{error}</p>}

      {!error && claims.length === 0 && (
        <p>You haven't submitted any claims yet.</p>
      )}

      <div className="claims-list">
        {claims.map((claim) => (
          <div className="claim-card" key={claim.id}>
            <h3>Claim #{claim.id}</h3>
            <p><strong>Item ID:</strong> {claim.itemId}</p>
            <p><strong>Description:</strong> {claim.description}</p>
            <p><strong>Proof:</strong> {claim.proofOfOwnership || "Not provided"}</p>
            <p>
              <strong>Status:</strong>{" "}
              <span className={`claim-status ${claim.status?.toLowerCase()}`}>
                {claim.status}
              </span>
            </p>
            <p>
              <strong>Submitted:</strong>{" "}
              {claim.createdAt
                ? new Date(claim.createdAt).toLocaleString()
                : "—"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyClaims;
