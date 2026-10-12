
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

function ItemDetails() {
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [description, setDescription] = useState("");
  const [proof, setProof] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchItem() {
      try {
        const response = await axios.get(
          `https://campus-lost-found-backend-4iei.onrender.com/api/items/${id}`
        );
        setItem(response.data);
      } catch (err) {
        console.error(err);
        setError("Unable to load this item. It may have been deleted.");
      } finally {
        setLoading(false);
      }
    }

    fetchItem();
  }, [id]);

  async function submitClaim(event) {
    event.preventDefault();
    setMessage("");
    setSubmitting(true);

    try {
      await axios.post("https://campus-lost-found-backend-4iei.onrender.com/api/claims", {
        itemId: Number(id),
        claimantId: user.userId,
        description,
        proofOfOwnership: proof
      });

      setMessage("Claim submitted successfully! You can track it in My Claims.");
      setDescription("");
      setProof("");
      setShowClaimForm(false);
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Unable to submit your claim."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="container"><h2>Loading item details...</h2></div>;
  }

  if (error || !item) {
    return (
      <div className="container">
        <h2>Item Not Found</h2>
        <p>{error || "No item details available."}</p>
        <Link to="/">Back to Home</Link>
      </div>
    );
  }

  const unavailable = ["CLAIMED", "RETURNED", "RESOLVED"].includes(
    (item.status || "").toUpperCase()
  );

  const isOwner =
    user?.userId != null &&
    String(user.userId) === String(item.userId);

  return (
    <div className="container">
      <div className="form-container">
        <h1>{item.itemName}</h1>

        {item.mediaUrl && (
          <div style={{ marginBottom: "20px", textAlign: "center" }}>
            {item.mediaType === "video" ? (
              <video
                src={item.mediaUrl}
                controls
                preload="metadata"
                style={{
                  width: "100%",
                  maxWidth: "600px",
                  maxHeight: "450px",
                  objectFit: "contain",
                  borderRadius: "14px"
                }}
              />
            ) : (
              <img
                src={item.mediaUrl}
                alt={item.itemName || "Lost or found item"}
                style={{
                  width: "100%",
                  maxWidth: "600px",
                  maxHeight: "450px",
                  objectFit: "contain",
                  borderRadius: "14px"
                }}
              />
            )}
          </div>
        )}

        <p><strong>Report ID:</strong> {item.id}</p>
        <p><strong>Category:</strong> {item.category}</p>
        <p><strong>Type:</strong> {item.type}</p>
        <p><strong>Description:</strong> {item.description}</p>
        <p><strong>Date:</strong> {item.date}</p>
        <p><strong>Location:</strong> {item.location}</p>
        <p><strong>Status:</strong> {item.status}</p>
        <hr />
        <p><strong>Contact:</strong> {item.contactName}</p>
        <p><strong>Email:</strong> {item.contactEmail}</p>

        {message && (
          <p role="status" style={{ marginTop: "16px" }}>
            {message}
          </p>
        )}

        {!user ? (
          <p><Link to="/login">Log in</Link> to submit a claim.</p>
        ) : isOwner ? (
          <p>You cannot claim your own report.</p>
        ) : unavailable ? (
          <p>This item is no longer available to claim.</p>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setShowClaimForm(!showClaimForm)}
              style={{ margin: "16px 0" }}
            >
              {showClaimForm ? "Cancel Claim" : "Claim This Item"}
            </button>

            {showClaimForm && (
              <form onSubmit={submitClaim}>
                <h2>Claim Form</h2>

                <label htmlFor="claimDescription">
                  Describe why this item belongs to you
                </label>
                <textarea
                  id="claimDescription"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  required
                  maxLength={1000}
                  rows={4}
                  placeholder="Describe the item and identifying details"
                  style={{ width: "100%", marginBottom: "14px" }}
                />

                <label htmlFor="claimProof">
                  Proof of ownership (optional)
                </label>
                <textarea
                  id="claimProof"
                  value={proof}
                  onChange={(event) => setProof(event.target.value)}
                  maxLength={2000}
                  rows={3}
                  placeholder="Mention identifying marks or other evidence"
                  style={{ width: "100%", marginBottom: "14px" }}
                />

                <button type="submit" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Claim"}
                </button>
              </form>
            )}
          </>
        )}

        <p style={{ marginTop: "20px" }}>
          <Link to="/">Back to Home</Link>
        </p>
      </div>
    </div>
  );
}

export default ItemDetails;
