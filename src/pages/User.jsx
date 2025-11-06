import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { MdOutlineShoppingCart } from "react-icons/md";
import { FaGoogle, FaCheck, FaTimes } from "react-icons/fa";
import { TfiFacebook } from "react-icons/tfi";
import { FaApple } from "react-icons/fa";

import "./user.css";
import Icon from "../components/Icon";
import CartContext from "../components/CartContext.jsx";

const User = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const navigate = useNavigate();
  const { setToken } = useContext(CartContext);

  const showAlert = (message, type = "success") => {
    setAlertMessage(message);
    if (type === "success") {
      setShowSuccessAlert(true);
      setTimeout(() => {
        setShowSuccessAlert(false);
        navigate("/");
      }, 2000);
    } else {
      setShowErrorAlert(true);
      setTimeout(() => {
        setShowErrorAlert(false);
      }, 3000);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("https://freshcart-backend-4wrc.onrender.com/users/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        showAlert(data.message || "Login failed", "error");
        return;
      }

      localStorage.setItem("accessToken", data.accessToken);
      setToken(data.accessToken);

      showAlert("Login successful! Redirecting...", "success");
    } catch (err) {
      console.error("Login error:", err);
      showAlert("Network error. Please try again.", "error");
    }
  };

  return (
    <div className="signup">
      {/* Modern Success Alert */}
      {showSuccessAlert && (
        <div className="modern-alert success-alert">
          <div className="alert-content">
            <div className="alert-icon success-icon">
              <FaCheck />
            </div>
            <div className="alert-text">
              <div className="alert-title">Success!</div>
              <div className="alert-message">{alertMessage}</div>
            </div>
            <div className="alert-progress-bar">
              <div className="progress-fill"></div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Error Alert */}
      {showErrorAlert && (
        <div className="modern-alert error-alert">
          <div className="alert-content">
            <div className="alert-icon error-icon">
              <FaTimes />
            </div>
            <div className="alert-text">
              <div className="alert-title">Oops!</div>
              <div className="alert-message">{alertMessage}</div>
            </div>
            <button 
              className="alert-close"
              onClick={() => setShowErrorAlert(false)}
            >
              <FaTimes />
            </button>
          </div>
        </div>
      )}

      <div className="left-detail">
        <div className="top-left">
          <div className="top-left-icon">
            <MdOutlineShoppingCart
              className="top-left-icon-itself"
              size={30}
              color="white"
            />
          </div>
          <h3>Cartzilla</h3>
        </div>

        <div className="welcome"><h1>Welcome back</h1></div>
        <div className="account">
          Don't have an account? <a href="">Create an account</a>
        </div>

        <form className="form" onSubmit={handleLogin}>
          <input
            className="inp"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="inp"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="remem">
            <div className="checky-check">
              <input className="checky" type="checkbox" />
              <div>Remember for 30 days</div>
            </div>
            <div>Forget password?</div>
          </div>
          <button type="submit" className="sign-in">Sign In</button>
        </form>
        <button className="sign-up" onClick={()=>navigate("/sign-up")}>sign-up</button>

        <div className="break">
          <hr />
          <div className="line-padding">or continue with</div>
          <hr />
        </div>

        <div className="social-icon-user">
          <Icon icon={<FaGoogle />} text="Google" />
          <Icon icon={<TfiFacebook />} text="Facebook" />
          <Icon icon={<FaApple />} text="Apple" />
        </div>

        <div className="footer-user">
          <a href="#">Need help?</a>
          <p>© All rights reserved. Made by  <span className="wolvy">Wolv.......</span></p>
        </div>
      </div>

      <div className="right-image">
        <img src="/cover.webp" alt="" />
      </div>
    </div>
  );
};

export default User;