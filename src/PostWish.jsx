import React, { useState, useEffect } from 'react';
import './PostWish.css';
import { db, auth } from './firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function PostWish() {
  const [text, setText] = useState('');
  const [isAnon, setIsAnon] = useState(false);
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [urgency, setUrgency] = useState('3');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(currentUser => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 🧠 Sapling AI detection
  const detectAI = async (inputText) => {
    try {
      const response = await fetch('https://api.sapling.ai/api/v1/aidetect', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer A2DWLR91VG37H68MVSSKZRNJE08QK81S', // ✅ Your API Key
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await response.json();
      return data?.ai === true;
    } catch (err) {
      console.error('Sapling AI detection failed:', err);
      return false;
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    setError('');

    if (!text || !category || !location) return setError('Fill all fields');
    if (!user) return setError('You must be logged in.');

    // 🔒 Block common AI phrases before even using Sapling
    const badWords = ['as an ai', 'i do not possess', 'language model'];
    const lowered = text.toLowerCase();
    for (let word of badWords) {
      if (lowered.includes(word)) {
        setError('❌ Wish yourself — the AI does not need a wish!');
        return;
      }
    }

    // 🧠 Sapling detection
    const isAI = await detectAI(text);
    if (isAI) {
      setError('⚠️ This wish seems AI-generated. Please rephrase it more personally.');
      return;
    }

    try {
      await addDoc(collection(db, 'wishes'), {
        text,
        isAnon,
        uid: user.uid,
        username: isAnon ? 'Anonymous' : user.email.split('@')[0],
        category,
        location,
        urgency: parseInt(urgency),
        createdAt: Timestamp.now(),
        fulfilled: false,
        fulfiller: '',
      });
      navigate('/');
    } catch (err) {
      setError('Failed to post wish.');
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingLeft: '2rem',
          paddingTop: '2rem',
          fontSize: '1.2rem',
          color: '#555',
        }}
      >
        Please log in to post your wishes.
      </div>
    );
  }

  return (
    <div className="ppostcard-container">
      <div className="top-left-wave"></div>

      <div className="ppostcard-left">
        <textarea
          placeholder="What do you wish for?"
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <div className="ppostcard-right">
        <div className="waves"></div>
        <div className="stamp-box"></div>

        <div className="to-fields">
          <input
            placeholder="Category (e.g. Health, Education, Help)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <input
            placeholder="Your Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <label>
            Urgency:
            <select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
              <option value="1">Not Urgent</option>
              <option value="3">Moderate</option>
              <option value="5">Very Urgent</option>
            </select>
          </label>
          <label style={{ marginTop: '10px' }}>
            <input
              type="checkbox"
              checked={isAnon}
              onChange={() => setIsAnon(!isAnon)}
            />
            Post Anonymously
          </label>
        </div>

        <div className="ppostcard-submit">
          <button type="submit" onClick={handlePost}>Post Wish</button>
          {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        </div>
      </div>
    </div>
  );
}

export default PostWish;
