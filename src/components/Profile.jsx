import React, { useEffect, useState } from "react";
import axios from "axios";
import "./profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [receivedOrders, setReceivedOrders] = useState([]); // ✅ Separate orders list
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [error, setError] = useState("");

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) {
          setError("Please login to view your profile");
          setLoading(false);
          return;
        }

        // Fetch user
        const userRes = await axios.get(
          "https://freshcart-backend-4wrc.onrender.com/users/me",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(userRes.data);

        // Fetch all data parallelly
        const [cartRes, productsRes, ordersRes] = await Promise.all([
          axios
            .get("https://freshcart-backend-4wrc.onrender.com/cart", {
              headers: { Authorization: `Bearer ${token}` },
            })
            .catch(() => ({ data: { products: [] } })),

          axios
            .get(
              "https://freshcart-backend-4wrc.onrender.com/products/my-products",
              { headers: { Authorization: `Bearer ${token}` } }
            )
            .catch(() => ({ data: [] })),

          axios
            .get("https://freshcart-backend-4wrc.onrender.com/orders/my-orders", {
              headers: { Authorization: `Bearer ${token}` },
            })
            .catch(() => ({ data: [] })),
        ]);

        setCart(cartRes.data.products || []);
        setMyProducts(productsRes.data || []);
        setMyOrders(ordersRes.data || []);

        // Extract received orders from products
        const allOrders = [];
        productsRes.data.forEach((p) => {
          if (p.orders && p.orders.length > 0) {
            p.orders.forEach((o) =>
              allOrders.push({
                ...o,
                productTitle: p.title,
                productImage: p.images?.[0],
              })
            );
          }
        });
        setReceivedOrders(allOrders);
      } catch (err) {
        console.error(err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const refreshMyProducts = async () => {
    try {
      const res = await axios.get(
        "https://freshcart-backend-4wrc.onrender.com/products/my-products",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMyProducts(res.data);
    } catch (err) {
      console.error("Refresh failed", err);
    }
  };

  // ✅ Mark order as shipped
  const markAsShipped = async (orderId) => {
    try {
   await axios.patch(
  `https://freshcart-backend-4wrc.onrender.com/orders/update-status/${orderId}`,
  { status: "shipped" },
  {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
      // Update UI instantly
      setReceivedOrders((prev) =>
        prev.filter((o) => o._id !== orderId)
      );
      setMyOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: "shipped" } : o))
      );

      console.log(" Order marked as shipped");
    } catch (err) {
      console.error("Error updating order:", err);
    }
  };

  if (loading)
    return <div className="profile-page"><div className="loading">Loading...</div></div>;
  if (error)
    return (
      <div className="profile-page">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );

  return (
    <div className="profile-page">
      <h2 className="title">👤 Profile</h2>

      {/* Tabs */}
      <div className="profile-tabs">
        {["profile", "cart", "orders", "products"].map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "profile" && "Profile Info"}
            {tab === "cart" && `My Cart (${cart.length})`}
            {tab === "orders" && `My Orders (${myOrders.length})`}
            {tab === "products" && "My Products"}
          </button>
        ))}
      </div>

      {/* Profile Info */}
      {activeTab === "profile" && (
        <section className="user-info">
          <h3>Personal Details</h3>
          <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </section>
      )}

      {/* My Cart */}
      {activeTab === "cart" && (
        <section>
          <h3>🛒 My Cart</h3>
          {cart.length === 0 ? <p>No items in cart.</p> :
            cart.map((c) => (
              <div key={c._id} className="cart-item">
                <p>{c.productId?.title} - Qty: {c.quantity}</p>
              </div>
            ))}
        </section>
      )}

      {/* My Orders */}
      {activeTab === "orders" && (
        <section>
          <h3>📦 My Orders</h3>
          {myOrders.length === 0 ? (
            <p>You haven’t placed any orders yet.</p>
          ) : (
            myOrders.map((o) => (
              <div key={o._id} className="order-card">
                <p><strong>ID:</strong> {o._id}</p>
                <p><strong>Status:</strong> {o.status}</p>
                <p><strong>Total:</strong> ₹{o.totalAmount}</p>
              </div>
            ))
          )}
        </section>
      )}

      {/* My Products */}
      {activeTab === "products" && (
        <section className="my-products">
          <div className="section-header">
            <h3> My Uploaded Products</h3>
            <button onClick={refreshMyProducts} className="refresh-btn">🔄 Refresh</button>
          </div>

          {/* Uploaded Products */}
          <div className="uploaded-products">
            {myProducts.length === 0 ? (
              <p>No products uploaded.</p>
            ) : (
              myProducts.map((p) => (
                <div key={p._id} className="product-card">
                  <img
                    src={p.images?.[0] || "https://via.placeholder.com/60"}
                    alt={p.title}
                    className="thumb"
                  />
                  <div>
                    <h4>{p.title}</h4>
                    <p>₹{p.price}</p>
                    <p>Stock: {p.quantity}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Received Orders */}
          <div className="received-orders">
            <h3>📬 Received Orders ({receivedOrders.length})</h3>
            {receivedOrders.length === 0 ? (
              <p>No received orders yet.</p>
            ) : (
              receivedOrders.map((order) => (
                <div key={order._id} className="order-detail-card">
                  <div className="order-top">
                    <img
                      src={order.productImage || "https://via.placeholder.com/50"}
                      alt={order.productTitle}
                      className="thumb"
                    />
                    <div>
                      <h4>{order.productTitle}</h4>
                      <p>Quantity: {order.quantity}</p>
                      <p>Status: {order.status}</p>
                    </div>
                  </div>
                  <button
                    className="ship-btn"
                    onClick={() => markAsShipped(order._id)}
                    disabled={order.status === "shipped"}
                  >
                    {order.status === "shipped" ? "Shipped" : " Mark as Shipped"}
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default Profile;
