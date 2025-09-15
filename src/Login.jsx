import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true); // toggle between login/signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        setMessage("");
        navigate("/"); // ✅ redirect on successful login
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        setMessage("Account created! Please log in.");
        setIsLogin(true);
      }
    } catch (error) {
      const readableMessage = getFriendlyError(error.code);
      setMessage(readableMessage);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setMessage("");
      navigate("/"); // ✅ redirect after Google login
    } catch (error) {
      setMessage("Google login failed. Please try again.");
    }
  };

  const handleForgotPassword = async () => {
    if (!email) return setMessage("Please enter your email first.");
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("A password reset link has been sent to your email.");
    } catch (error) {
      setMessage("Could not send reset link. Try again later.");
    }
  };

  const getFriendlyError = (code) => {
    switch (code) {
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "Invalid email or password.";
      case "auth/email-already-in-use":
        return "This email is already registered.";
      case "auth/invalid-email":
        return "Please enter a valid email.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      default:
        return "Something went wrong. Please try again.";
    }
  };

  return (
    <div className="login-container">
      <h2>{isLogin ? "Login" : "Sign Up"}</h2>
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isLogin ? "Login" : "Sign Up"}</button>
      </form>

      <button onClick={handleGoogleLogin} className="google-btn">
        Continue with Google
      </button>

      {isLogin && (
        <p className="forgot" onClick={handleForgotPassword}>
          Forgot Password?
        </p>
      )}

      <p onClick={() => setIsLogin(!isLogin)} className="toggle-auth">
        {isLogin
          ? "Don't have an account? Sign Up"
          : "Already have an account? Login"}
      </p>

      {message && <p className="message">{message}</p>}
    </div>
  );
}
