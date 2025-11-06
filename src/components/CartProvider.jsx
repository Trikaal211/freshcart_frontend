import React, { useState, useEffect } from "react";
import CartContext from "./CartContext";
import './cartprovider.css'; // Import CSS file

// Import modern alert icons
import { FaCheck, FaExclamationTriangle, FaInfoCircle, FaTimes } from "react-icons/fa";

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ products: [] });
  const [token, setToken] = useState(localStorage.getItem("accessToken"));
  
  // Modern Alert States
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState(""); // success, error, warning, info
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertDuration, setAlertDuration] = useState(3000);

  // Modern Alert Function
  const showModernAlert = (type, title, message, duration = 3000) => {
    setAlertType(type);
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertDuration(duration);
    setShowAlert(true);
    
    setTimeout(() => {
      setShowAlert(false);
    }, duration);
  };

  // Close Alert Manually
  const closeAlert = () => {
    setShowAlert(false);
  };

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
        console.log("Cart API Response:", data);
        
        setCart(data);
      } catch (err) {
        console.error("Error fetching cart:", err);
        setCart({ products: [] });
        showModernAlert("error", "Cart Error", "Failed to load your cart", 4000);
      }
    };

    fetchCart();
  }, [token]);

  // Add to Cart - Fixed with Modern Alert
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
        body: JSON.stringify({ 
          productId: productId.toString(), 
          quantity: Number(quantity), 
          price: Number(price) 
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to add to cart");
      }

      const data = await res.json();
      
      // Show success alert with product added message
      showModernAlert(
        "success", 
        "Added to Cart!", 
        "Product successfully added to your cart",
        2500
      );
      
      setCart(data);
    } catch (err) {
      console.error("Error adding to cart:", err);
      showModernAlert(
        "error", 
        "Failed to Add", 
        err.message || "Failed to add product to cart",
        4000
      );
    }
  };

  return (
    <>
      {/* Modern Alert Component */}
      {showAlert && (
        <div className={`modern-alert ${alertType}-alert`}>
          <div className="alert-content">
            {/* Alert Icon */}
            <div className={`alert-icon ${alertType}-icon`}>
              {alertType === "success" && <FaCheck />}
              {alertType === "error" && <FaExclamationTriangle />}
              {alertType === "warning" && <FaExclamationTriangle />}
              {alertType === "info" && <FaInfoCircle />}
            </div>
            
            {/* Alert Content */}
            <div className="alert-text">
              <div className="alert-title">{alertTitle}</div>
              <div className="alert-message">{alertMessage}</div>
            </div>
            
            {/* Close Button */}
            <button 
              onClick={closeAlert}
              className="alert-close"
            >
              <FaTimes size={14} />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="alert-progress-bar">
            <div 
              className={`progress-fill ${alertType}-fill`}
              style={{ animationDuration: `${alertDuration}ms` }}
            />
          </div>

          {/* Floating Particles */}
          <div className="alert-particle-1" />
          <div className="alert-particle-2" />
        </div>
      )}

      <CartContext.Provider value={{ 
        cart, 
        addToCart, 
        setToken,
        cartItems: cart.products || [],
        showModernAlert // Export alert function for other components to use
      }}>
        {children}
      </CartContext.Provider>
    </>
  );
};

export default CartProvider;