import React, { useEffect, useState } from 'react';
import { db, auth } from './firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './ChatCorner.css';

const emojiAvatars = [
  '🌈', '⭐', '💖', '🍭', '🧸', '🌸', '🌟', '✨', '🎀', '🦄', '💫', '🎉',
  '🍬', '🍓', '🐻', '🧁', '🌼', '🍰', '🎠', '💐', '🐣', '🎈', '🫧', '🌺'
];

function ChatCorner() {
  const [chats, setChats] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(currentUser => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const username = user.email?.split('@')[0] || 'unknown';
    const q = query(collection(db, 'chats'), where('users', 'array-contains', username));

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChats(data);
    });

    return () => unsub();
  }, [user]);

  if (!user) {
    return <div className="chat-corner-placeholder">Please log in to see your chats.</div>;
  }

  const currentUsername = user.email?.split('@')[0] || 'unknown';

  return (
    <div className="chat-corner-container">
      <h2 className="chat-corner-title">Your Chats</h2>

      {chats.length === 0 ? (
        <p className="chat-info-msg">No conversations yet.</p>
      ) : (
        chats.map((chat, index) => {
          const otherUser = chat.users?.find(u => u !== currentUsername) || 'Unknown User';
          const emoji = emojiAvatars[index % emojiAvatars.length];
          const time = chat.lastMessageTime?.toDate
            ? chat.lastMessageTime.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '';

          return (
            <div
              key={chat.id}
              className="chat-item"
              onClick={() => navigate(`/chats/${chat.id}`)}
            >
              <div className="chat-emoji">{emoji}</div>
              <div className="chat-text">
                <div className="chat-header">
                  <span className="chat-username">{otherUser}</span>
                  <span className="chat-time">{time}</span>
                </div>
                <div className="chat-preview">
                  {chat.lastMessage || 'No messages yet'}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default ChatCorner;
