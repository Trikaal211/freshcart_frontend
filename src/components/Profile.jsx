// Profile.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("hey")
        const [userRes, cartRes] = await Promise.all([
axios.get("https://freshcart-backend-4wrc.onrender.com/users/me", {
            headers: { Authorization: `Bearer ${token}` },
              withCredentials: true,
          }),
axios.get("https://freshcart-backend-4wrc.onrender.com/cart", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setUser(userRes.data);
        setCart(cartRes.data.items || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="profile-page">
      <h2>User Profile</h2>

      <section className="user-info">
        <p><strong>Name:</strong> {user?.email}</p>
        <p><strong>Email:</strong> {user?.email}</p>
      </section>

      <section className="cart">
        <h3>My Cart</h3>
        {cart.length > 0 ? (
          <ul>
            {cart.map((item) => (
              <li key={item._id}>
                {item.product?.name} — {item.quantity}
              </li>
            ))}
          </ul>
        ) : (
          <p>Your cart is empty.</p>
        )}
      </section>

      {/* Future: Orders & Address sections can come here */}
    </div>
  );
};

export default Profile;
