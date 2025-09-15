import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import "./Leaderboard.css";

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const wishesRef = collection(db, "wishes");
    const fulfilledQuery = query(wishesRef, where("fulfilled", "==", true));

    const unsubscribe = onSnapshot(fulfilledQuery, (snapshot) => {
      const counts = {};

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const fulfiller = data.fulfiller;
        if (fulfiller) {
          counts[fulfiller] = (counts[fulfiller] || 0) + 1;
        }
      });

      const sorted = Object.entries(counts)
        .map(([username, count]) => ({ username, count }))
        .sort((a, b) => b.count - a.count);

      setLeaderboard(sorted);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="leaderboard-container">
      <h2>Top Helpers</h2>
      {loading ? (
        <p className="loading-text">Loading leaderboard...</p>
      ) : leaderboard.length === 0 ? (
        <p className="no-data-text">No fulfilled wishes yet. Be the first!</p>
      ) : (
        <div className="leaderboard-content">
          <ol className="leaderboard-list">
            {leaderboard.slice(0, 10).map((user, index) => (
              <li key={user.username} className="leaderboard-item">
                <div className="rank-medal">
                  <span className="rank">{medals[index] || `#${index + 1}`}</span>
                </div>
                <div className="user-info">
                  <span className="name">{user.username}</span>
                  <span className="count">{user.count} wish{user.count !== 1 ? 'es' : ''} fulfilled</span>
                </div>
                <div className="score-badge">
                  {user.count}
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export default Leaderboard;