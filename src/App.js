// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { auth } from './firebase';

import Navbar from './Navbar';
import Login from './Login';
import Home from './Home';
import PostWish from './PostWish';
import ChatPage from './ChatPage';
import Profile from './Profile';
import UserProfile from './UserProfile';
import Leaderboard from './Leaderboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Navbar user={user} />
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/post" element={<PostWish />} />

        {/* ✅ Single route that handles /chats and /chats/:chatId */}
        <Route path="/chats" element={<ChatPage />} />
        <Route path="/chats/:chatId" element={<ChatPage />} />

        <Route path="/profile" element={<Profile />} />
        <Route path="/user/:username" element={<UserProfile />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </Router>
  );
}

export default App;
