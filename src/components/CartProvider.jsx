import React, { useState, useEffect } from "react";
import CartContext from "./CartContext";
import './cartprovider.css';
import { io } from "socket.io-client";
import { FaCheck, FaExclamationTriangle, FaInfoCircle, FaTimes } from "react-icons/fa";

const socket = io("https://freshcart-backend-4wrc.onrender.com"); // Your backend URL

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ products: [] });
  const [token, setToken] = useState(localStorage.getItem("accessToken"));
  
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("");
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertDuration, setAlertDuration] = useState(3000);

  const showModernAlert = (type, title, message, duration = 3000) => {
    setAlertType(type);
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertDuration(duration);
    setShowAlert(true);
    
    setTimeout(() => setShowAlert(false), duration);
  };

  const closeAlert = () => setShowAlert(false);

  useEffect(() => {
    const fetchCart = async () => {
      if (!token) {
        setCart({ products: [] });
        return;
      }
      try {
        const res = await fetch("https://freshcart-backend-4wrc.onrender.com/cart", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
        });
        if (!res.ok) throw new Error("Failed to fetch cart");
        const data = await res.json();
        setCart(data);
      } catch (err) {
        console.error("Error fetching cart:", err);
        setCart({ products: [] });
        showModernAlert("error", "Cart Error", "Failed to load your cart", 4000);
      }
    };

    fetchCart();

    // Listen for socket updates
    socket.on("cartUpdated", (updatedCart) => {
      setCart(updatedCart);
    });

    return () => {
      socket.off("cartUpdated");
    };
  }, [token]);

  const addToCart = async (productId, quantity = 1, price = 0) => {
    const latestToken = localStorage.getItem("accessToken");
    if (!latestToken) {
      showModernAlert("warning", "Login Required", "Please login to add items to cart", 4000);
      return;
    }

    try {
      const res = await fetch("https://freshcart-backend-4wrc.onrender.com/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${latestToken}`,
        },
        body: JSON.stringify({ productId: productId.toString(), quantity: Number(quantity), price: Number(price) }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add to cart");
      }

      const data = await res.json();
      socket.emit("cartChange", data); // Notify server to broadcast

      showModernAlert("success", "Added to Cart!", "Product successfully added to your cart", 2500);
      setCart(data);

    } catch (err) {
      console.error("Error adding to cart:", err);
      showModernAlert("error", "Failed to Add", err.message || "Failed to add product to cart", 4000);
    }
  };

  return (
    <>
      {showAlert && (
        <div className={`modern-alert ${alertType}-alert`}>
          <div className="alert-content">
            <div className={`alert-icon ${alertType}-icon`}>
              {alertType === "success" && <FaCheck />}
              {alertType === "error" && <FaExclamationTriangle />}
              {alertType === "warning" && <FaExclamationTriangle />}
              {alertType === "info" && <FaInfoCircle />}
            </div>
            <div className="alert-text">
              <div className="alert-title">{alertTitle}</div>
              <div className="alert-message">{alertMessage}</div>
            </div>
            <button onClick={closeAlert} className="alert-close"><FaTimes size={14} /></button>
          </div>
          <div className="alert-progress-bar">
            <div className={`progress-fill ${alertType}-fill`} style={{ animationDuration: `${alertDuration}ms` }} />
          </div>
          <div className="alert-particle-1" />
          <div className="alert-particle-2" />
        </div>
      )}

      <CartContext.Provider value={{ 
        cart, 
        addToCart, 
        setToken,
        cartItems: cart.products || [],
        showModernAlert
      }}>
        {children}
      </CartContext.Provider>
    </>
  );
};

export default CartProvider;
