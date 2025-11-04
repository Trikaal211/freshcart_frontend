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

        console.log("👤 User data:", userRes.data);

        // Fetch all data parallelly
        const [cartRes, productsRes, ordersRes] = await Promise.all([
          axios.get("https://freshcart-backend-4wrc.onrender.com/cart", {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => ({ data: { products: [] } })),

          axios.get("https://freshcart-backend-4wrc.onrender.com/products/my-products", {
            headers: { Authorization: `Bearer ${token}` },
          }).catch((err) => { 
            console.error("❌ Error fetching products:", err);
            return { data: [] };
          }),

          axios.get("https://freshcart-backend-4wrc.onrender.com/orders/my-orders", {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => ({ data: [] })),
        ]);

        console.log("🛒 Cart items:", cartRes.data.products?.length || 0);
        console.log("📦 My products:", productsRes.data.length);
        console.log("📋 My orders:", ordersRes.data.length);

        setCart(cartRes.data.products || []);
        setMyProducts(productsRes.data || []);
        setMyOrders(ordersRes.data || []);

        // Extract received orders
        const allOrders = extractReceivedOrders(productsRes.data);
        console.log("📬 Final received orders:", allOrders.length);
        setReceivedOrders(allOrders);
      } catch (err) {
        console.error("❌ Profile fetch error:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  // Extract received orders
  const extractReceivedOrders = (products) => {
    if (!products || !Array.isArray(products)) {
      return [];
    }

    const allOrders = [];
    
    products.forEach((product) => {
      if (product.orders && product.orders.length > 0) {
        product.orders.forEach((order) => {
          const orderData = {
            ...order,
            productId: product._id,
            productTitle: product.title,
            productImage: product.images?.[0],
            buyerName: order.buyerName || "Unknown Buyer",
            buyerEmail: order.buyerEmail || "No email",
            address: order.address || "Address not available",
            phone: order.phone || "No phone",
            orderId: order.orderId,
            status: order.status || "pending"
          };

          allOrders.push(orderData);
        });
      }
    });
    
    return allOrders;
  };

  const refreshMyProducts = async () => {
    try {
      console.log("🔄 Refreshing products...");
      const res = await axios.get(
        "https://freshcart-backend-4wrc.onrender.com/products/my-products",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMyProducts(res.data || []);
      
      const allOrders = extractReceivedOrders(res.data);
      setReceivedOrders(allOrders);
      alert("✅ Products refreshed!");
    } catch (err) {
      console.error("❌ Refresh failed", err);
      alert("❌ Refresh failed");
    }
  };

  // Mark order as shipped
  const markAsShipped = async (order) => {
    try {
      console.log("🚚 Marking order as shipped:", order);
      
      if (!order.productId) {
        alert("❌ Error: Product ID not found for this order");
        return;
      }
      
      if (!order.orderId) {
        alert("❌ Error: Order ID not found for this order");
        return;
      }

      const response = await axios.patch(
        `https://freshcart-backend-4wrc.onrender.com/products/${order.productId}/orders/${order.orderId}/status`,
        { status: "shipped" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ Order update response:", response.data);

      // Update UI instantly
      setReceivedOrders((prev) =>
        prev.map((o) => 
          o.orderId === order.orderId ? { ...o, status: "shipped" } : o
        )
      );

      alert("✅ Order marked as shipped successfully!");

    } catch (err) {
      console.error("❌ Error updating order:", err);
      alert("Failed to update order status: " + (err.response?.data?.error || err.message));
    }
  };

  // Debug function
  const debugOrders = () => {
    console.log("=== 🐛 DEBUG ORDERS ===");
    console.log("My Products:", myProducts);
    console.log("Received Orders:", receivedOrders);
    
    myProducts.forEach((product, index) => {
      console.log(`Product ${index + 1}:`, {
        title: product.title,
        ordersCount: product.orders?.length || 0,
        orders: product.orders?.map(o => ({
          orderId: o.orderId,
          buyerName: o.buyerName,
          status: o.status
        }))
      });
    });
  };

  if (loading) return <div className="profile-page"><div className="loading">Loading...</div></div>;
  if (error) return <div className="profile-page"><div className="error-message"><h2>Error</h2><p>{error}</p></div></div>;

  return (
    <div className="profile-page">
      <h2 className="title">👤 Profile</h2>

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

      {activeTab === "profile" && (
        <section className="user-info">
          <h3>Personal Details</h3>
          <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </section>
      )}
      
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

      {activeTab === "orders" && (
        <section>
          <h3>📦 My Orders ({myOrders.length})</h3>
          {myOrders.length === 0 ? (
            <p>You haven't placed any orders yet.</p>
          ) : (
            myOrders.map((o) => (
              <div key={o._id} className="order-card">
                <p><strong>ID:</strong> {o._id}</p>
                <p><strong>Status:</strong> {o.status}</p>
                <p><strong>Total:</strong> ₹{o.totalAmount}</p>
                <p><strong>Address:</strong> {o.address}</p>
              </div>
            ))
          )}
        </section>
      )}

      {activeTab === "products" && (
        <section className="my-products">
          <div className="section-header">
            <h3>📦 My Uploaded Products ({myProducts.length})</h3>
            <div>
              <button onClick={debugOrders} className="debug-btn">
                🐛 Debug
              </button>
              <button onClick={refreshMyProducts} className="refresh-btn">
                🔄 Refresh
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
                  <div key={order.orderId} className="order-card received-order">
                    <img
                      src={order.productImage || "https://via.placeholder.com/80"}
                      alt={order.productTitle}
                    />
                    <div className="order-info">
                      <h4>{order.productTitle}</h4>
                      <p><strong>Order ID:</strong> {order.orderId ? order.orderId.toString().slice(-8) : '❌ MISSING'}</p>
                      <p><strong>Quantity:</strong> {order.quantity}</p>
                      <p><strong>Buyer:</strong> {order.buyerName}</p>
                      <p><strong>Email:</strong> {order.buyerEmail}</p>
                      <p><strong>Phone:</strong> {order.phone}</p>
                      <p><strong>Address:</strong> {order.address}</p>
                      <p><strong>Status:</strong> 
                        <span className={`status ${order.status}`}>{order.status}</span>
                      </p>
                    </div>
                    <button
                      className="ship-btn"
                      onClick={() => markAsShipped(order)}
                      disabled={order.status === "shipped" || !order.orderId}
                    >
                      {order.status === "shipped" ? "✅ Shipped" : "🚚 Mark as Shipped"}
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