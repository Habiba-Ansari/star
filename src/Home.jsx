import React, { useEffect, useState } from 'react';
import './Home.css';
import { FaSearch, FaThumbsUp, FaThumbsDown, FaTrash } from 'react-icons/fa';
import { db, auth } from './firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  increment,
  collectionGroup,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

import Leaderboard from './Leaderboard';
import ChatCorner from './ChatCorner';

function Home() {
  const [wishes, setWishes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userVotes, setUserVotes] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'wishes'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWishes(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchVotes = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const votesSnapshot = await getDocs(collectionGroup(db, 'votes'));
      const votes = {};
      votesSnapshot.forEach(doc => {
        if (doc.id === currentUser.uid) {
          const wishId = doc.ref.parent.parent.id;
          votes[wishId] = doc.data().type;
        }
      });
      setUserVotes(votes);
    };

    fetchVotes();
  }, []);

  const handleVote = async (wishId, voteType) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const voteRef = doc(db, 'wishes', wishId, 'votes', currentUser.uid);
    const voteSnap = await getDoc(voteRef);
    if (voteSnap.exists()) return;

    await setDoc(voteRef, { type: voteType });

    const wishRef = doc(db, 'wishes', wishId);
    await updateDoc(wishRef, {
      [voteType === 'like' ? 'likes' : 'dislikes']: increment(1),
    });

    setUserVotes((prev) => ({ ...prev, [wishId]: voteType }));
  };

  const handleFulfill = async (wish) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const fulfillerUsername = currentUser.email.split('@')[0];
    const wishOwner = wish.username;
    if (fulfillerUsername === wishOwner) return;

    // ✅ Store the fulfiller's UID for later use in completion
    const chatId = `${wish.id}_${currentUser.uid}`;
    const chatRef = doc(db, 'chats', chatId);
    const existing = await getDoc(chatRef);

    if (!existing.exists()) {
      await setDoc(chatRef, {
        users: [wishOwner, fulfillerUsername],
        wishId: wish.id,
        createdAt: new Date(),
        lastMessage: '',
      });

      const wishRef = doc(db, 'wishes', wish.id);
      await updateDoc(wishRef, {
        status: 'fulfilling',
        fulfiller: fulfillerUsername,
        fulfillerUid: currentUser.uid, // ✅ Store the UID for later
        fulfilled: false,
      });

      await addDoc(collection(db, 'notifications'), {
        to: wishOwner,
        from: fulfillerUsername,
        type: 'fulfill',
        wishId: wish.id,
        seen: false,
        createdAt: new Date(),
      });
    }

    navigate(`/chats/${chatId}`);
  };

  const handleComplete = async (wish) => {
    const inputUsername = prompt("Please enter the fulfiller's username to confirm completion:");
    if (!inputUsername) return;

    if (inputUsername === wish.fulfiller) {
      const wishRef = doc(db, 'wishes', wish.id);
      await updateDoc(wishRef, {
        fulfilled: true,
        status: 'fulfilled',
      });

      // Ask for custom gratitude message
      let gratitudeMsg = prompt(
        "Write your thank you message:",
        "Thank you so much for fulfilling my wish 💫!"
      );
      if (!gratitudeMsg) {
        gratitudeMsg = "Thank you so much for fulfilling my wish 💫!";
      }

      const currentUser = auth.currentUser;
      const wisherUsername = currentUser.email.split('@')[0];

      // Use the fulfiller UID stored during fulfillment
      const chatId = `${wish.id}_${wish.fulfillerUid}`;
      const chatRef = doc(db, 'chats', chatId);
      const chatSnap = await getDoc(chatRef);

      if (chatSnap.exists()) {
        // Add gratitude message to existing chat
        await addDoc(collection(db, 'chats', chatId, 'messages'), {
          senderId: currentUser.uid,
          text: gratitudeMsg,
          timestamp: serverTimestamp(),
          system: true,
        });

        await updateDoc(chatRef, {
          lastMessage: gratitudeMsg,
          lastMessageTime: serverTimestamp(),
        });
      } else {
        // Fallback: Create new chat if existing one not found
        await setDoc(chatRef, {
          users: [wisherUsername, wish.fulfiller],
          wishId: wish.id,
          createdAt: new Date(),
          lastMessage: gratitudeMsg,
        });
        
        await addDoc(collection(db, 'chats', chatId, 'messages'), {
          senderId: currentUser.uid,
          text: gratitudeMsg,
          timestamp: serverTimestamp(),
          system: true,
        });
      }
    } else {
      alert("Username doesn't match the fulfiller. Please try again.");
    }
  };

  // NEW: Delete wish function
  const handleDeleteWish = async (wish) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const currentUsername = currentUser.email.split('@')[0];
    const isOwner = currentUsername === wish.username;

    if (!isOwner) {
      alert("You can only delete your own wishes.");
      return;
    }

    const confirmDelete = window.confirm("Are you sure you want to delete this wish? This action cannot be undone.");
    
    if (confirmDelete) {
      try {
        // Delete the wish document
        await deleteDoc(doc(db, 'wishes', wish.id));
        
        // Optional: Also delete associated votes
        // You might want to keep this or remove it based on your needs
        const votesQuery = query(collection(db, 'wishes', wish.id, 'votes'));
        const votesSnapshot = await getDocs(votesQuery);
        
        const deleteVotesPromises = [];
        votesSnapshot.forEach((voteDoc) => {
          deleteVotesPromises.push(deleteDoc(voteDoc.ref));
        });
        
        await Promise.all(deleteVotesPromises);
        
        alert("Wish deleted successfully.");
      } catch (error) {
        console.error("Error deleting wish: ", error);
        alert("Error deleting wish. Please try again.");
      }
    }
  };

  const filteredWishes = wishes.filter((wish) => {
    const keyword = searchTerm.toLowerCase();
    return (
      wish.text?.toLowerCase().includes(keyword) ||
      wish.location?.toLowerCase().includes(keyword) ||
      String(wish.urgency) === keyword
    );
  });

  return (
    <div className="home-container">
      {/* Left Column - Leaderboard */}
      <div className="leaderboard">
        <Leaderboard />
      </div>

      {/* Middle Column - Wishes Feed */}
      <div className="wishes-feed">
        <div className="top-bar">
          <div className="top-bar-title">Star</div>
          <div className="top-bar-search-container">
            <span className="top-bar-search-icon"><FaSearch /></span>
            <input
              type="text"
              placeholder="Search wishes..."
              className="top-bar-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredWishes.length === 0 ? (
          <p>No wishes found.</p>
        ) : (
          filteredWishes.map((wish) => {
            const currentUser = auth.currentUser;
            const currentUsername = currentUser?.email?.split('@')[0];
            const isOwner = currentUsername === wish.username;
            const userVote = userVotes[wish.id];

            return (
              <div key={wish.id} className="wish-card">
                <div className="wish-header">
                  <strong
                    className={wish.username?.toLowerCase() !== 'anonymous' ? 'clickable-username' : ''}
                    onClick={() =>
                      wish.username?.toLowerCase() !== 'anonymous' &&
                      navigate(`/user/${wish.username}`)
                    }
                  >
                    {wish.username}
                  </strong>
                  {/* Delete button for wish owner */}
                  {isOwner && !wish.fulfilled && (
                    <button 
                      className="delete-wish-btn"
                      onClick={() => handleDeleteWish(wish)}
                      title="Delete wish"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
                <p className="wish-text">{wish.text}</p>
                <p className="wish-meta">Urgency: {wish.urgency}/5</p>
                <p className="wish-category-location">{wish.category} - {wish.location}</p>

                {wish.fulfilled ? (
                  <p className="status-text">Status: Fulfilled by {wish.fulfiller}</p>
                ) : wish.status === 'fulfilling' ? (
                  <p className="status-text">Status: Fulfilling by {wish.fulfiller}</p>
                ) : (
                  <p className="status-text">Status: Pending</p>
                )}

                <div className="like-dislike-container">
                  <button
                    onClick={() => handleVote(wish.id, 'like')}
                    className={`like-btn ${userVote === 'like' ? 'voted' : ''}`}
                    disabled={!!userVote}
                  >
                    <FaThumbsUp /> {wish.likes || 0}
                  </button>
                  <button
                    onClick={() => handleVote(wish.id, 'dislike')}
                    className={`dislike-btn ${userVote === 'dislike' ? 'voted' : ''}`}
                    disabled={!!userVote}
                  >
                    <FaThumbsDown /> {wish.dislikes || 0}
                  </button>
                </div>

                {!wish.fulfilled && currentUser && !isOwner && wish.username?.toLowerCase() !== 'anonymous' && (
                  <button className="wish-button" onClick={() => handleFulfill(wish)}>Fulfill</button>
                )}

                {isOwner && wish.status === 'fulfilling' && !wish.fulfilled && (
                  <button className="wish-button" onClick={() => handleComplete(wish)}>Complete</button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Right Column - Chat Corner */}
      <div className="chat-corner">
        <ChatCorner />
      </div>
    </div>
  );
}

export default Home;