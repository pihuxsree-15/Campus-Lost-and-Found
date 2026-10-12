
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ReportItem() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [form, setForm] = useState({
    itemName: "",
    category: "",
    description: "",
    date: "",
    location: "",
    type: "LOST",
    contactName: user?.name || "",
    contactEmail: user?.email || "",
    userId: user?.userId || null
  });

  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      let mediaUrl = "";
      let mediaType = "";

      if (file) {
        const data = new FormData();
        data.append("file", file);

        const uploadResponse = await axios.post(
          "https://campus-lost-found-backend-4iei.onrender.com/api/items/upload",
          data
        );

        mediaUrl = uploadResponse.data.mediaUrl;
        mediaType = uploadResponse.data.mediaType;
      }

      await axios.post("https://campus-lost-found-backend-4iei.onrender.com/api/items", {
        ...form,
        mediaUrl,
        mediaType
      });

      setMessage("Item report submitted successfully!");

      setForm({
        ...form,
        itemName: "",
        category: "",
        description: "",
        date: "",
        location: ""
      });

      setFile(null);

      const fileInput = document.getElementById("itemMedia");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.message ||
        (typeof error.response?.data === "string"
          ? error.response.data
          : "Failed to submit report or upload media.")
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="form-container">
      <h1>Report Lost / Found Item</h1>

      <form onSubmit={handleSubmit}>
        <input
          name="itemName"
          placeholder="Item Name"
          value={form.itemName}
          onChange={handleChange}
          required
        />

        <select name="type" value={form.type} onChange={handleChange}>
          <option value="LOST">Lost Item</option>
          <option value="FOUND">Found Item</option>
        </select>

        <input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
        />

        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
        />

        <input
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          required
        />

        <label htmlFor="itemMedia">
          Upload Item Photo or Video (optional, max 20 MB)
        </label>

        <input
          id="itemMedia"
          type="file"
          accept="image/*,video/*"
          onChange={(e) => {
            const selectedFile = e.target.files[0];

            if (selectedFile && selectedFile.size > 20 * 1024 * 1024) {
              setMessage("File must not exceed 20 MB.");
              e.target.value = "";
              setFile(null);
              return;
            }

            setMessage("");
            setFile(selectedFile || null);
          }}
        />

        {file && (
          <p>Selected: {file.name}</p>
        )}

        <button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Submit Report"}
        </button>
      </form>

      <p>{message}</p>
    </div>
  );
}

export default ReportItem;
