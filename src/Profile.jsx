import React, { useEffect, useState } from 'react';
import './Profile.css';
import { auth, db } from './firebase';
import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const [user, setUser] = useState(null);
  const [createdWishes, setCreatedWishes] = useState([]);
  const [fulfilledWishes, setFulfilledWishes] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [name, setName] = useState('Unknown');
  const [gender, setGender] = useState('Unknown');
  const [age, setAge] = useState('Unknown');
  const [socialLinks, setSocialLinks] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async currentUser => {
      if (currentUser) {
        setUser(currentUser);
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            name: 'Unknown',
            gender: 'Unknown',
            age: 'Unknown',
            socialLinks: []
          });
        }

        const userData = (await getDoc(userRef)).data();
        setName(userData.name || 'Unknown');
        setGender(userData.gender || 'Unknown');
        setAge(userData.age || 'Unknown');
        setSocialLinks(userData.socialLinks || []);
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchWishes = async () => {
      if (!user) return;
      const wishesRef = collection(db, 'wishes');
      const createdQuery = query(wishesRef, where('uid', '==', user.uid));
      const fulfilledQuery = query(wishesRef, where('fulfiller', '==', user.email.split('@')[0]));
      const [createdSnap, fulfilledSnap] = await Promise.all([
        getDocs(createdQuery),
        getDocs(fulfilledQuery),
      ]);
      setCreatedWishes(createdSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setFulfilledWishes(fulfilledSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchWishes();
  }, [user]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account?')) {
      try {
        await user.delete();
        navigate('/');
      } catch {
        alert('Re-login and try again.');
      }
    }
  };

  const updateName = async () => {
    const val = prompt('Enter Name:', name);
    if (val && user) {
      setName(val);
      await updateDoc(doc(db, 'users', user.uid), { name: val });
    }
  };

  const updateGender = async () => {
    const val = prompt('Enter Gender:', gender);
    if (val && user) {
      setGender(val);
      await updateDoc(doc(db, 'users', user.uid), { gender: val });
    }
  };

  const updateAge = async () => {
    const val = prompt('Enter Age:', age);
    if (val && user) {
      setAge(val);
      await updateDoc(doc(db, 'users', user.uid), { age: val });
    }
  };

  const addSocialLink = async () => {
    const val = prompt('Enter Social Media Link:');
    if (val && user) {
      const updated = [...socialLinks, val];
      setSocialLinks(updated);
      await updateDoc(doc(db, 'users', user.uid), { socialLinks: updated });
    }
  };

  const getAnimal = () => {
    const count = fulfilledWishes.length;
    if (count === 0) return 'turtle.png';
    if (count < 5) return 'rabbit.png';
    if (count < 10) return 'horse.png';
    return 'lion.png';
  };

  const filteredWishes = createdWishes.filter(w => {
    if (activeTab === 'fulfilled') return w.fulfilled;
    if (activeTab === 'pending') return !w.fulfilled;
    return true;
  });

  const headerImg = `/assets/${String(Math.floor(Math.random() * 10) + 1).padStart(2, '0')}.jpg`;
  const username = user?.email.split('@')[0];

  return (
    <div className="profile-wrapper">
      <div className="profile-header" style={{ backgroundImage: `url(${headerImg})` }}></div>
      <div className="profile-content">
        <div className="profile-left">
          <img src="/assets/avatar.jpg" className="avatar" alt="avatar" />
          <h2>{username}</h2>

          <p onClick={updateName}><strong>Name:</strong> {name}</p>
          <p onClick={updateGender}><strong>Gender:</strong> {gender}</p>
          <p onClick={updateAge}><strong>Age:</strong> {age}</p>

          <p><strong>Social Links:</strong></p>
          <ul className="social-list">
            {socialLinks.map((link, i) => (
              <li key={i}>
                <a href={link} target="_blank" rel="noopener noreferrer">
                  {link.replace(/https?:\/\//, '').slice(0, 18)}...
                </a>
              </li>
            ))}
          </ul>
          <button className="btn add-social" onClick={addSocialLink}>+ Add Social</button>

          <button onClick={handleLogout} className="btn logout">Logout</button>
          <button onClick={handleDeleteAccount} className="btn delete">Delete Account</button>
        </div>

        <div className="profile-center">
          <div className="tabs">
            <button className={activeTab === 'all' ? 'active' : ''} onClick={() => setActiveTab('all')}>All Wishes</button>
            <button className={activeTab === 'fulfilled' ? 'active' : ''} onClick={() => setActiveTab('fulfilled')}>Fulfilled</button>
            <button className={activeTab === 'pending' ? 'active' : ''} onClick={() => setActiveTab('pending')}>Pending</button>
          </div>

          <div className="wish-list">
            {filteredWishes.length === 0 ? <p>No wishes in this category.</p> : (
              filteredWishes.map(w => (
                <div className="wish-card" key={w.id}>
                  <p className="wish-header">
                    <strong
                      className={w.username?.toLowerCase() !== 'anonymous' ? 'clickable-username' : ''}
                      onClick={() =>
                        w.username?.toLowerCase() !== 'anonymous' && navigate(`/user/${w.username}`)
                      }
                    >
                      {w.username}
                    </strong>
                  </p>
                  <p>{w.text}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="profile-right">
          <img src={`/assets/${getAnimal()}`} className="animal-rank" alt="animal" />
          <h3>Wishes I Fulfilled</h3>
          {fulfilledWishes.map(w => (
            <div className="wish-card fulfilled-wish" key={w.id}>
              <p className="wish-header">
                <strong
                  className={w.username?.toLowerCase() !== 'anonymous' ? 'clickable-username' : ''}
                  onClick={() =>
                    w.username?.toLowerCase() !== 'anonymous' && navigate(`/user/${w.username}`)
                  }
                >
                  {w.username}
                </strong>
              </p>
              <p>{w.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Profile;
