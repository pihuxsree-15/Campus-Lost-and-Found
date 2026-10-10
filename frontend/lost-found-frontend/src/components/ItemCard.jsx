
import { Link } from "react-router-dom";

function ItemCard({ item }) {
  return (
    <div className="item-card">
      {item.mediaUrl && (
        <div className="item-media">
          {item.mediaType === "video" ? (
            <video
              src={item.mediaUrl}
              controls
              preload="metadata"
              style={{
                width: "100%",
                maxHeight: "280px",
                objectFit: "contain",
                borderRadius: "12px",
                marginBottom: "12px"
              }}
            />
          ) : (
            <img
              src={item.mediaUrl}
              alt={item.itemName || "Lost or found item"}
              style={{
                width: "100%",
                maxHeight: "280px",
                objectFit: "contain",
                borderRadius: "12px",
                marginBottom: "12px"
              }}
            />
          )}
        </div>
      )}

      <h3>{item.itemName}</h3>

      <p><strong>Category:</strong> {item.category}</p>
      <p><strong>Type:</strong> {item.type}</p>
      <p><strong>Description:</strong> {item.description}</p>
      <p><strong>Date:</strong> {item.date}</p>
      <p><strong>Location:</strong> {item.location}</p>
      <p><strong>Status:</strong> {item.status}</p>

      <hr />

      <p><strong>Contact:</strong> {item.contactName}</p>
      <p><strong>Email:</strong> {item.contactEmail}</p>

      <Link
        to={`/item/${item.id}`}
        style={{
          display: "inline-block",
          marginTop: "12px",
          padding: "10px 18px",
          borderRadius: "10px",
          background: "#6241a5",
          color: "#ffffff",
          textDecoration: "none",
          fontWeight: "600"
        }}
      >
        View Details
      </Link>
    </div>
  );
}

export default ItemCard;
