import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import './UserProfile.css';

function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [createdWishes, setCreatedWishes] = useState([]);
  const [fulfilledWishes, setFulfilledWishes] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishes = async () => {
      try {
        const wishesRef = collection(db, 'wishes');

        const createdQuery = query(wishesRef, where('username', '==', username));
        const fulfilledQuery = query(wishesRef, where('fulfiller', '==', username));

        const [createdSnap, fulfilledSnap] = await Promise.all([
          getDocs(createdQuery),
          getDocs(fulfilledQuery),
        ]);

        const createdWishesRaw = createdSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const nonAnonymousWishes = createdWishesRaw.filter(w => !w.anonymous);

        setCreatedWishes(nonAnonymousWishes);
        setFulfilledWishes(fulfilledSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch user profile
        const usersRef = collection(db, 'users');
        const userQuery = query(usersRef, where('username', '==', username));
        const userSnap = await getDocs(userQuery);

        if (!userSnap.empty) {
          setUserData(userSnap.docs[0].data());
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading user wishes or profile:', error);
        setLoading(false);
      }
    };

    fetchWishes();
  }, [username]);

  if (loading) return <p className="center-text">Loading...</p>;

  return (
    <div className="user-profile-wrapper">
      <div className="user-card">
        <img
          src="/assets/avatar.jpg"
          alt="avatar"
          className="user-avatar"
          onError={(e) => (e.target.src = 'https://i.pravatar.cc/96')}
        />
        <h2>{username}</h2>

        {userData && (
          <div className="user-info">
            <p><strong>Name:</strong> {userData.name || 'Unknown'}</p>
            <p><strong>Gender:</strong> {userData.gender || 'Unknown'}</p>
            <p><strong>Age:</strong> {userData.age || 'Unknown'}</p>
            {userData.socialLinks && userData.socialLinks.length > 0 && (
              <>
                <p><strong>Social Links:</strong></p>
                <ul className="social-links">
                  {userData.socialLinks.map((link, i) => (
                    <li key={i}>
                      <a href={link} target="_blank" rel="noopener noreferrer">
                        {link.replace(/https?:\/\//, '').slice(0, 30)}...
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>

      <div className="wish-columns">
        {fulfilledWishes.length > 0 && (
          <div className="wish-column">
            <h3>🌠 Wishes Fulfilled</h3>
            {fulfilledWishes.map(wish => (
              <div key={wish.id} className="wish-card">
                <p className="wish-header">
                  <strong
                    className={wish.username?.toLowerCase() !== 'anonymous' ? 'clickable-username' : ''}
                    onClick={() =>
                      wish.username?.toLowerCase() !== 'anonymous' && navigate(`/user/${wish.username}`)
                    }
                  >
                    {wish.username}
                  </strong>
                </p>
                <p>{wish.text}</p>
              </div>
            ))}
          </div>
        )}

        {createdWishes.length > 0 && (
          <div className="wish-column">
            <h3>📝 Wishes Created</h3>
            {createdWishes.map(wish => (
              <div key={wish.id} className="wish-card">
                <p>{wish.text}</p>
              </div>
            ))}
          </div>
        )}

        {createdWishes.length === 0 && fulfilledWishes.length === 0 && (
          <p className="center-text">No public wishes found for this user.</p>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
