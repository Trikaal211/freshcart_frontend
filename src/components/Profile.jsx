import React, { useEffect, useState } from "react";
import axios from "axios";
import "./profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [receivedOrders, setReceivedOrders] = useState([]);
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

        //  FIXED: Extract received orders from products with productId
        const allOrders = [];
        productsRes.data.forEach((product) => {
          if (product.orders && product.orders.length > 0) {
            product.orders.forEach((order) => {
              // Convert mongoose document to plain object if needed
              const orderData = order.toObject ? order.toObject() : order;
              
              allOrders.push({
                ...orderData,
                productId: product._id, // ✅ CRUCIAL: Add productId for API call
                productTitle: product.title,
                productImage: product.images?.[0],
              });
            });
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
      
      //  Also refresh received orders after refreshing products
      const allOrders = [];
      res.data.forEach((product) => {
        if (product.orders && product.orders.length > 0) {
          product.orders.forEach((order) => {
            const orderData = order.toObject ? order.toObject() : order;
            allOrders.push({
              ...orderData,
              productId: product._id,
              productTitle: product.title,
              productImage: product.images?.[0],
            });
          });
        }
      });
      setReceivedOrders(allOrders);
    } catch (err) {
      console.error("Refresh failed", err);
    }
  };

  //  FIXED: Mark order as shipped - uses product-embedded orders
  const markAsShipped = async (order) => {
    try {
      console.log("Marking order as shipped:", order);
      
      // Make sure we have the required IDs
      if (!order.productId) {
        alert("Error: Product ID not found for this order");
        return;
      }

      const response = await axios.patch(
        `https://freshcart-backend-4wrc.onrender.com/products/${order.productId}/orders/${order._id}/status`,
        { status: "shipped" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Order update response:", response.data);

      // Update UI instantly
      setReceivedOrders((prev) =>
        prev.map((o) => 
          o._id === order._id ? { ...o, status: "shipped" } : o
        )
      );

      alert(" Order marked as shipped successfully!");

    } catch (err) {
      console.error(" Error updating order:", err);
      console.error("Error details:", err.response?.data);
      alert("Failed to update order status: " + (err.response?.data?.error || err.message));
    }
  };

  // Debug function to check orders data
  const debugOrders = () => {
    console.log("=== DEBUG ORDERS ===");
    console.log("My Products:", myProducts);
    console.log("Received Orders:", receivedOrders);
    receivedOrders.forEach((order, index) => {
      console.log(`Order ${index}:`, {
        orderId: order._id,
        productId: order.productId,
        status: order.status,
        productTitle: order.productTitle
      });
    });
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
            {tab === "products" && `My Products (${myProducts.length})`}
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
          <h3>🛒 My Cart ({cart.length})</h3>
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
          <h3> My Orders ({myOrders.length})</h3>
          {myOrders.length === 0 ? (
            <p>You haven't placed any orders yet.</p>
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

      {/* My Products & Received Orders */}
      {activeTab === "products" && (
        <section className="my-products">
          <div className="section-header">
            <h3> My Uploaded Products ({myProducts.length})</h3>
            <div>
              <button onClick={debugOrders} className="debug-btn" title="Check console for orders data">
                 Debug
              </button>
              <button onClick={refreshMyProducts} className="refresh-btn">
                🔄Refresh
              </button>
            </div>
          </div>

          <div className="product-grid">
            {myProducts.length === 0 ? (
              <p>No products uploaded.</p>
            ) : (
              myProducts.map((p) => (
                <div key={p._id} className="product-card">
                  <img src={p.images?.[0] || "https://via.placeholder.com/100"} alt={p.title} />
                  <h4>{p.title}</h4>
                  <p>₹{p.price}</p>
                  <p>Stock: {p.quantity}</p>
                  <p className="orders-count">
                    Orders: {p.orders ? p.orders.length : 0}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="received-orders">
            <h3>📬 Received Orders ({receivedOrders.length})</h3>
            <div className="order-grid">
              {receivedOrders.length === 0 ? (
                <p>No received orders yet.</p>
              ) : (
                receivedOrders.map((order) => (
                  <div key={order._id} className="order-card">
                    <img
                      src={order.productImage || "https://via.placeholder.com/80"}
                      alt={order.productTitle}
                    />
                    <div className="order-info">
                      <h4>{order.productTitle}</h4>
                      <p><strong>Order ID:</strong> {order._id}</p>
                      <p><strong>Quantity:</strong> {order.quantity}</p>
                                            <p><strong>Quantity:</strong> {order.buyerName}</p>

                      <p><strong>Status:</strong> 
                        <span className={`status ${order.status}`}>{order.status}</span>
                      </p>
                      <p><strong>Product ID:</strong> {order.productId}</p>
                    </div>
                    <button
                      className="ship-btn"
                      onClick={() => markAsShipped(order)}
                      disabled={order.status === "shipped"}
                    >
                      {order.status === "shipped" ? " Shipped" : " Mark as Shipped"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Profile;