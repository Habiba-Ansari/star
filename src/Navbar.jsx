// src/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import { FaHome, FaComments, FaPlusCircle, FaTrophy, FaUser } from 'react-icons/fa';

function Navbar() {
  return (
    <nav className="bottom-navbar">
      <Link to="/" className="nav-item">
        <FaHome />
        <span>Home</span>
      </Link>

      <Link to="/chats" className="nav-item">
        <FaComments />
        <span>Chats</span>
      </Link>

      <Link to="/post" className="nav-item">
        <FaPlusCircle />
        <span>Post</span>
      </Link>
      
      <Link to="/profile" className="nav-item">
        <FaUser />
        <span>Profile</span>
      </Link>
    </nav>
  );
}

export default Navbar;
