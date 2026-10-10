import { useEffect, useState } from "react";
import axios from "axios";
import ItemCard from "../components/ItemCard";

function Home() {
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");

  async function loadItems() {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/items/search",
        {
          params: { category, location }
        }
      );

      const sortedItems = response.data.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setItems(sortedItems);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  return (
    <main className="home-page">

      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">Anurag University Campus</span>

          <h1>
            Lost something?
            <br />
            <span>Let's help you find it.</span>
          </h1>

          <p>
            A simple campus platform to report lost belongings,
            share found items, and reconnect them with their owners.
          </p>

          <div className="hero-actions">
            <a href="/report" className="primary-btn">
              + Report an Item
            </a>

            <a href="#reports" className="secondary-btn">
              Browse Reports
            </a>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-card">
            <div className="hero-icon">🔎</div>
            <h3>Find what matters</h3>
            <p>
              Search through reported items by category and location.
            </p>
          </div>
        </div>
      </section>

      <section className="search-section">
        <div className="section-heading">
          <span>SEARCH</span>
          <h2>Find a lost or found item</h2>
          <p>Search reports using the details you know.</p>
        </div>

        <div className="search-box">
          <div className="search-field">
            <label>Category</label>
            <input
              placeholder="e.g. Wallet, Phone, ID Card"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div className="search-field">
            <label>Location</label>
            <input
              placeholder="e.g. Library, Block A"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <button className="search-btn" onClick={loadItems}>
            🔍 Search
          </button>
        </div>
      </section>

      <section className="reports-section" id="reports">
        <div className="reports-header">
          <div>
            <span className="section-label">CAMPUS REPORTS</span>
            <h2>Recently Reported</h2>
            <p>Latest lost and found reports appear first.</p>
          </div>

          <button className="refresh-btn" onClick={loadItems}>
            ↻ Refresh
          </button>
        </div>

        {items.length > 0 ? (
          <div className="item-grid">
            {items.map((item, index) => (
              <div key={item.id} className="recent-item">

                {index < 3 && (
                  <span className="recent-badge">
                    Recently Reported
                  </span>
                )}

                <ItemCard item={item} />

              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📭</div>

            <h3>No reports found</h3>

            <p>
              Try changing your search or be the first to report an item.
            </p>

            <a href="/report" className="primary-btn">
              Report an Item
            </a>
          </div>
        )}
      </section>

      <section className="info-section">

        <div className="info-card">
          <div className="info-icon">📌</div>

          <h3>Lost something?</h3>

          <p>
            Report your lost item with useful details so others can help
            you locate it.
          </p>
        </div>

        <div className="info-card">
          <div className="info-icon">🧑‍💼</div>

          <h3>Found something?</h3>

          <p>
            Share information about an item you found and help return it
            to its owner.
          </p>
        </div>

        <div className="info-card">
          <div className="info-icon">🔎</div>

          <h3>Campus focused</h3>

          <p>
            Designed specifically to make lost and found management easier
            within the campus community.
          </p>
        </div>

      </section>

    </main>
  );
}

export default Home;