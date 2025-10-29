import React, { useState, useEffect } from "react";
import CartContext from "./CartContext";

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ products: [] }); //  Object format 
  const [token, setToken] = useState(localStorage.getItem("accessToken"));

  useEffect(() => {
    const fetchCart = async () => {
      if (!token) {
        setCart({ products: [] }); //  Clear cart if no token
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
        
        //  Correct way to set cart
        setCart(data); // Pure cart object set karein
      } catch (err) {
        console.error("Error fetching cart:", err);
        setCart({ products: [] }); //  Error case mein empty cart
      }
    };

    fetchCart();
  }, [token]);

  // Add to Cart - Fixed
const addToCart = async (productId, quantity = 1, price = 0) => {
  const latestToken = localStorage.getItem("accessToken");
  if (!latestToken) return alert("Please login first!");

  try {
const res = await fetch("https://freshcart-backend-4wrc.onrender.com/cart/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${latestToken}`,
      },
      body: JSON.stringify({ productId: productId.toString(), quantity: Number(quantity), price:Number(price) }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to add to cart");
    }

    const data = await res.json();
    alert(data.updatedQuantity) 
    setCart(data); // updated cart set
  } catch (err) {
    console.error("Error adding to cart:", err);
    alert(err.message || "Failed to add product to cart");
  }
};


  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      setToken,
      cartItems: cart.products || [] // Extra convenience property
    }}>
      {children}
    </CartContext.Provider>
  );
};
export default CartProvider;
