// Profile.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [uploaded, setUploaded] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) {
          console.warn("No token found in localStorage!");
          setLoading(false);
          return;
        }

        // Fetch user, cart, and uploaded products together
        const [userRes, cartRes, uploadedRes] = await Promise.all([
          axios.get("https://freshcart-backend-4wrc.onrender.com/users/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://freshcart-backend-4wrc.onrender.com/cart", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://freshcart-backend-4wrc.onrender.com/products/user", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setUser(userRes.data);
        setCart(cartRes.data.items || []);
        setUploaded(uploadedRes.data || []);
      } catch (error) {
        console.error("❌ Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) return <p className="loading">Loading your profile...</p>;

  return (
    <div className="profile-page">
      <h2 className="profile-title">My Profile</h2>

      {user ? (
        <>
          {/* User Info Section */}
          <section className="user-info card">
            <h3>User Details</h3>
            <p><strong>Name:</strong> {user.name || "No name set"}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </section>

          {/* Cart Section */}
          <section className="cart-section card">
            <h3>My Cart</h3>
            {cart.length > 0 ? (
              <ul>
                {cart.map((item) => (
                  <li key={item._id}>
                    {item.product?.title || "Unknown Product"} — Qty:{" "}
                    {item.quantity}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Your cart is empty.</p>
            )}
          </section>

          {/* Uploaded Products Section */}
          <section className="uploaded-section card">
            <h3>My Uploaded Products</h3>
            {uploaded.length > 0 ? (
              <ul>
                {uploaded.map((p) => (
                  <li key={p._id}>
                    <span className="product-title">{p.title}</span> — ₹{p.price}
                  </li>
                ))}
              </ul>
            ) : (
              <p>You haven’t uploaded any products yet.</p>
            )}
          </section>
        </>
      ) : (
        <p className="error">User not found. Please login again.</p>
      )}
    </div>
  );
};

export default Profile;
