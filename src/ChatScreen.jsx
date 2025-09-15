import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { auth, db } from './firebase';
import {
  doc, collection, addDoc, onSnapshot, serverTimestamp,
  query, orderBy, updateDoc
} from 'firebase/firestore';
import { FaCamera } from 'react-icons/fa';
import './ChatScreen.css';

function ChatScreen() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!chatId || !auth.currentUser) return;

    const text = newMsg.trim();
    if (!text) return;

    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      senderId: auth.currentUser.uid,
      text,
      timestamp: serverTimestamp()
    });

    await updateDoc(doc(db, 'chats', chatId), {
      lastMessage: text,
      lastMessageTime: serverTimestamp()
    });

    setNewMsg('');
  };

  const handleImageUpload = () => {
    // your existing image upload logic
  };

  const formatTime = (timestamp) => {
    if (!timestamp?.toDate) return '';
    return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`chat-message 
              ${msg.senderId === auth.currentUser?.uid ? 'own' : 'other'}
              ${msg.system ? 'system-message thank-you' : ''}`} // 👈 Added 'thank-you' class
          >
            {msg.imageUrl ? (
              <img src={msg.imageUrl} alt="shared" className="chat-image" />
            ) : (
              <div className="chat-text">{msg.text}</div>
            )}
            <div className="chat-time">{formatTime(msg.timestamp)}</div>
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>

      <form className="chat-input-form" onSubmit={sendMessage}>
        <input
          className="chat-input"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Type your message..."
        />
        <button className="chat-send-button" type="submit">Send</button>
        <button
          type="button"
          className="chat-icon-button"
          onClick={handleImageUpload}
          title="Click Photo"
        >
          <FaCamera />
        </button>
      </form>
    </div>
  );
}

export default ChatScreen;