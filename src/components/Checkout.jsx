// Checkout.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./checkout.css"; // optional

const Checkout = () => {
  const [cart, setCart] = useState([]);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await axios.get("https://freshcart-backend-4wrc.onrender.com/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCart(res.data.items || []);
      } catch (err) {
        console.error("❌ Error fetching cart:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [token]);

  const handleCheckout = async () => {
    if (!address) {
      alert("Please enter your delivery address!");
      return;
    }

    try {
      const res = await axios.post(
        "https://freshcart-backend-4wrc.onrender.com/orders",
        { address },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("✅ Order placed successfully!");
      console.log("Order response:", res.data);
    } catch (err) {
      console.error("❌ Error placing order:", err);
      alert("Something went wrong during checkout!");
    }
  };

  if (loading) return <p>Loading checkout...</p>;

  return (
    <div className="checkout-page">
      <h2>Checkout</h2>

      <div className="cart-summary">
        <h3>Order Summary</h3>
        {cart.length > 0 ? (
          <ul>
            {cart.map((item) => (
              <li key={item._id}>
                {item.product?.title} — Qty: {item.quantity}
              </li>
            ))}
          </ul>
        ) : (
          <p>Your cart is empty.</p>
        )}
      </div>

      <div className="address-section">
        <h3>Delivery Address</h3>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter your address"
        />
      </div>

      <button onClick={handleCheckout} className="checkout-btn">
        Place Order anna
      </button>
    </div>
  );
};

export default Checkout;
