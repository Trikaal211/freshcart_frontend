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
            .catch((err) => { 
              console.error("❌ Error fetching products:", err);
              return { data: [] };
            }),

          axios
            .get("https://freshcart-backend-4wrc.onrender.com/orders/my-orders", {
              headers: { Authorization: `Bearer ${token}` },
            })
            .catch(() => ({ data: [] })),
        ]);

        console.log("🛒 Cart data:", cartRes.data);
        console.log("📦 My products data:", productsRes.data);
        console.log("📋 My orders data:", ordersRes.data);

        setCart(cartRes.data.products || []);
        setMyProducts(productsRes.data || []);
        setMyOrders(ordersRes.data || []);

        // ✅ FIXED: Extract received orders with better debugging
        const allOrders = extractReceivedOrders(productsRes.data);
        console.log("📬 Extracted received orders:", allOrders);
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

  // ✅ FIXED: Better order extraction function
  const extractReceivedOrders = (products) => {
    if (!products || !Array.isArray(products)) {
      console.log("❌ No products data available");
      return [];
    }

    const allOrders = [];
    
    console.log(`🔍 Processing ${products.length} products for orders...`);
    
    products.forEach((product, productIndex) => {
      console.log(`\n📦 Product ${productIndex + 1}:`, {
        id: product._id,
        title: product.title,
        ordersCount: product.orders ? product.orders.length : 0
      });

      if (product.orders && product.orders.length > 0) {
        product.orders.forEach((order, orderIndex) => {
          console.log(`   📋 Order ${orderIndex + 1}:`, {
            orderId: order.orderId,
            hasOrderId: !!order.orderId,
            hasProductId: !!product._id,
            buyerName: order.buyerName,
            status: order.status
          });

          // ✅ Include ALL orders for now to debug
          const orderData = {
            ...order,
            productId: product._id,
            productTitle: product.title,
            productImage: product.images?.[0],
            // Ensure all required fields exist
            buyerName: order.buyerName || "Unknown Buyer",
            buyerEmail: order.buyerEmail || "No email",
            address: order.address || "Address not available",
            phone: order.phone || "No phone",
            orderId: order.orderId || `temp-${product._id}-${orderIndex}`,
            status: order.status || "pending"
          };

          allOrders.push(orderData);
          console.log(`   ✅ Added order to list`);
        });
      } else {
        console.log(`   ❌ No orders in this product`);
      }
    });
    
    console.log(`\n🎯 Total extracted orders: ${allOrders.length}`);
    return allOrders;
  };

  const refreshMyProducts = async () => {
    try {
      console.log("🔄 Refreshing products...");
      const res = await axios.get(
        "https://freshcart-backend-4wrc.onrender.com/products/my-products",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("🔄 Refresh response:", res.data);
      setMyProducts(res.data || []);
      
      const allOrders = extractReceivedOrders(res.data);
      console.log("🔄 New received orders after refresh:", allOrders);
      setReceivedOrders(allOrders);
    } catch (err) {
      console.error("❌ Refresh failed", err);
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
      
      if (!order.orderId || order.orderId.toString().startsWith('temp-')) {
        alert("❌ Error: Valid Order ID not found for this order");
        return;
      }

      console.log("📤 Sending request with:", {
        productId: order.productId,
        orderId: order.orderId
      });

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
      console.error("Error details:", err.response?.data);
      alert("Failed to update order status: " + (err.response?.data?.error || err.message));
    }
  };

  // Debug function
  const debugOrders = () => {
    console.log("=== 🐛 DEBUG ORDERS ===");
    console.log("My Products:", myProducts);
    console.log("Received Orders:", receivedOrders);
    
    if (myProducts.length === 0) {
      console.log("❌ No products found - might be authentication issue");
    }
    
    receivedOrders.forEach((order, index) => {
      console.log(`Order ${index}:`, {
        orderId: order.orderId,
        productId: order.productId,
        status: order.status,
        productTitle: order.productTitle,
        buyerName: order.buyerName,
        address: order.address,
        hasOrderId: !!order.orderId,
        hasProductId: !!order.productId
      });
    });

    const invalidOrders = receivedOrders.filter(o => !o.orderId || o.orderId.toString().startsWith('temp-'));
    if (invalidOrders.length > 0) {
      console.warn("❌ Invalid orders (missing IDs):", invalidOrders);
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

      {/* My Products & Received Orders */}
      {activeTab === "products" && (
        <section className="my-products">
          <div className="section-header">
            <h3>📦 My Uploaded Products ({myProducts.length})</h3>
            <div>
              <button onClick={debugOrders} className="debug-btn" title="Check console for orders data">
                🐛 Debug
              </button>
              <button onClick={refreshMyProducts} className="refresh-btn">
                🔄 Refresh
              </button>
            </div>
          </div>

          {myProducts.length === 0 ? (
            <div className="no-products">
              <p>❌ No products uploaded yet.</p>
              <p><small>If you have uploaded products but they're not showing, check:</small></p>
              <ul>
                <li><small>1. Are you logged in with the correct account?</small></li>
                <li><small>2. Did you upload products with this account?</small></li>
                <li><small>3. Check browser console for errors</small></li>
              </ul>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {myProducts.map((p) => (
                  <div key={p._id} className="product-card">
                    <img src={p.images?.[0] || "https://via.placeholder.com/100"} alt={p.title} />
                    <h4>{p.title}</h4>
                    <p>₹{p.price}</p>
                    <p>Stock: {p.quantity}</p>
                    <p className="orders-count">
                      Orders: {p.orders ? p.orders.length : 0}
                    </p>
                    {/* Show order IDs for debugging */}
                    {p.orders && p.orders.length > 0 && (
                      <div style={{fontSize: '10px', marginTop: '5px', color: '#666'}}>
                        Order IDs: {p.orders.map(o => o.orderId ? o.orderId.toString().slice(-6) : 'N/A').join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="received-orders">
                <h3>📬 Received Orders ({receivedOrders.length})</h3>
                
                {/* Show validation info */}
                <div className="validation-info">
                  <small>
                    Valid orders: {receivedOrders.filter(o => o.orderId && !o.orderId.toString().startsWith('temp-')).length} / {receivedOrders.length}
                  </small>
                </div>

                {receivedOrders.length === 0 ? (
                  <div className="no-orders">
                    <p>📭 No received orders yet.</p>
                    <p><small>Orders will appear here when customers buy your products.</small></p>
                  </div>
                ) : (
                  <div className="order-grid">
                    {receivedOrders.map((order, index) => (
                      <div key={order.orderId || `order-${index}`} className="order-card received-order">
                        <img
                          src={order.productImage || "https://via.placeholder.com/80"}
                          alt={order.productTitle}
                        />
                        <div className="order-info">
                          <h4>{order.productTitle}</h4>
                          <p><strong>Order ID:</strong> 
                            {order.orderId ? (
                              order.orderId.toString().startsWith('temp-') ? 
                                <span style={{color: 'red'}}>❌ TEMP ID</span> : 
                                order.orderId.toString().slice(-8)
                            ) : '❌ MISSING'}
                          </p>
                          <p><strong>Product ID:</strong> {order.productId ? order.productId.toString().slice(-8) : '❌ MISSING'}</p>
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
                          disabled={order.status === "shipped" || !order.orderId || order.orderId.toString().startsWith('temp-')}
                          title={!order.orderId || order.orderId.toString().startsWith('temp-') ? "Missing valid order data" : ""}
                        >
                          {order.status === "shipped" ? "✅ Shipped" : "🚚 Mark as Shipped"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
};

export default Profile;