import React, { useEffect, useState } from "react";
import axios from "axios";
import "./profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [error, setError] = useState("");

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) {
          console.warn("No token found in localStorage!");
          setError("Please login to view your profile");
          setLoading(false);
          return;
        }

        console.log("🔍 Fetching profile data with token:", token.substring(0, 20) + "...");

        // Fetch user details first
        try {
          const userRes = await axios.get("https://freshcart-backend-4wrc.onrender.com/users/me", {
            headers: { 
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });
          console.log("✅ User data:", userRes.data);
          setUser(userRes.data);
        } catch (userError) {
          console.error("❌ Error fetching user:", userError);
          setError("Failed to load user data");
        }

        // Fetch other data in parallel
        const [cartRes, productsRes, ordersRes] = await Promise.allSettled([
          axios.get("https://freshcart-backend-4wrc.onrender.com/cart", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("https://freshcart-backend-4wrc.onrender.com/products/my-products", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("https://freshcart-backend-4wrc.onrender.com/orders/my-orders", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        // Handle cart response
        if (cartRes.status === 'fulfilled') {
          console.log("✅ Cart data:", cartRes.value.data);
          setCart(cartRes.value.data.products || cartRes.value.data.items || []);
        } else {
          console.error("❌ Error fetching cart:", cartRes.reason);
        }

        // Handle products response
        if (productsRes.status === 'fulfilled') {
          console.log("✅ Products data:", productsRes.value.data);
          setMyProducts(productsRes.value.data || []);
        } else {
          console.error("❌ Error fetching products:", productsRes.reason);
          // If endpoint doesn't exist, set empty array
          setMyProducts([]);
        }

        // Handle orders response
        if (ordersRes.status === 'fulfilled') {
          console.log("✅ Orders data:", ordersRes.value.data);
          setMyOrders(ordersRes.value.data || []);
        } else {
          console.error("❌ Error fetching orders:", ordersRes.reason);
          // If endpoint doesn't exist, set empty array
          setMyOrders([]);
        }

      } catch (error) {
        console.error("❌ Error in fetchData:", error);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const getOrdersForProduct = (product) => {
    return product.orders || [];
  };

  const getTotalOrders = () => {
    return myProducts.reduce((total, product) => total + (product.orders?.length || 0), 0);
  };

  const getTotalRevenue = () => {
    return myProducts.reduce((total, product) => {
      const productRevenue = (product.orders || []).reduce((sum, order) => {
        return sum + (order.orderPrice || product.price || 0) * (order.quantity || 1);
      }, 0);
      return total + productRevenue;
    }, 0);
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading">Loading your profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="error-message">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="error-message">
          <h2>User Not Found</h2>
          <p>Please check if you're logged in correctly.</p>
          <button onClick={() => {
            localStorage.removeItem("accessToken");
            window.location.href = "/login";
          }}>Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <h2>User Profile</h2>

      {/* Tabs */}
      <div className="profile-tabs">
        <button 
          className={activeTab === "profile" ? "active" : ""}
          onClick={() => setActiveTab("profile")}
        >
          Profile Info
        </button>
        <button 
          className={activeTab === "cart" ? "active" : ""}
          onClick={() => setActiveTab("cart")}
        >
          My Cart ({cart.length})
        </button>
        <button 
          className={activeTab === "orders" ? "active" : ""}
          onClick={() => setActiveTab("orders")}
        >
          My Orders ({myOrders.length})
        </button>
        <button 
          className={activeTab === "products" ? "active" : ""}
          onClick={() => setActiveTab("products")}
        >
          My Products ({myProducts.length})
        </button>
      </div>

      {/* Profile Info Tab */}
      {activeTab === "profile" && (
        <section className="user-info">
          <h3>Personal Information</h3>
          <div className="info-card">
            <p>
              <strong>Name:</strong> {user.name || "No name set"}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>User ID:</strong> {user._id}
            </p>
            {user.role && (
              <p>
                <strong>Role:</strong> {user.role}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Cart Tab */}
      {activeTab === "cart" && (
        <section className="cart">
          <h3>My Cart ({cart.length} items)</h3>
          {cart.length > 0 ? (
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item._id} className="cart-item">
                  <div className="item-info">
                    <h4>{item.productId?.title || "Unknown Product"}</h4>
                    <p>Quantity: {item.quantity}</p>
                    <p>Price: ₹{item.productId?.price || "N/A"}</p>
                    {item.productId?.discountPrice && (
                      <p className="discount">Discounted: ₹{item.productId.discountPrice}</p>
                    )}
                  </div>
                  {item.productId?.images?.[0] && (
                    <img 
                      src={item.productId.images[0]} 
                      alt={item.productId.title}
                      className="item-image"
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Your cart is empty.</p>
              <button onClick={() => window.location.href = "/products"}>
                Continue Shopping
              </button>
            </div>
          )}
        </section>
      )}

      {/* My Orders Tab */}
      {activeTab === "orders" && (
        <section className="my-orders">
          <h3>My Orders ({myOrders.length})</h3>
          {myOrders.length > 0 ? (
            <div className="orders-list">
              {myOrders.map((order) => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <h4>Order #{order._id?.slice(-6) || "N/A"}</h4>
                    <span className={`status ${order.status || "pending"}`}>
                      {order.status || "Pending"}
                    </span>
                  </div>
                  <div className="order-details">
                    <p><strong>Total:</strong> ₹{order.totalAmount || "N/A"}</p>
                    <p><strong>Date:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}</p>
                    <p><strong>Items:</strong> {order.items?.length || 0}</p>
                  </div>
                  {order.items && order.items.length > 0 && (
                    <div className="order-items">
                      <h5>Items:</h5>
                      <ul>
                        {order.items.map((item, index) => (
                          <li key={index}>
                            {item.product?.title || "Unknown Product"} - 
                            Qty: {item.quantity} - 
                            ₹{item.price || "N/A"}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>You haven't placed any orders yet.</p>
              <button onClick={() => window.location.href = "/all-products"}>
                Start Shopping
              </button>
            </div>
          )}
        </section>
      )}

      {/* My Products Tab */}
      {activeTab === "products" && (
        <section className="my-products">
          <div className="sales-summary">
            <h3>Sales Overview</h3>
            <div className="stats">
              <div className="stat">
                <strong>Total Products:</strong> {myProducts.length}
              </div>
              <div className="stat">
                <strong>Total Orders:</strong> {getTotalOrders()}
              </div>
              <div className="stat">
                <strong>Total Revenue:</strong> ₹{getTotalRevenue()}
              </div>
            </div>
          </div>

          <h3>My Uploaded Products ({myProducts.length})</h3>
          
          {myProducts.length > 0 ? (
            <div className="products-list">
              {myProducts.map((product) => (
                <div key={product._id} className="product-card">
                  <div className="product-header">
                    <h4>{product.title}</h4>
                    <div className="product-pricing">
                      <span className="price">₹{product.price}</span>
                      {product.discountPrice && (
                        <span className="discount-price">₹{product.discountPrice}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="product-stats">
                    <p><strong>Orders Received:</strong> {getOrdersForProduct(product).length}</p>
                    <p><strong>In Stock:</strong> {product.quantity || 0}</p>
                    <p><strong>Status:</strong> {product.availability || "In Stock"}</p>
                  </div>
                  
                  {getOrdersForProduct(product).length > 0 && (
                    <div className="orders-list">
                      <h5>Order Details:</h5>
                      <div className="order-items-container">
                        {getOrdersForProduct(product).map((order, index) => (
                          <div key={index} className="order-item">
                            <div className="order-info">
                              <strong>Order #{index + 1}</strong>
                              <p><strong>Quantity:</strong> {order.quantity}</p>
                              <p><strong>Amount:</strong> ₹{(order.orderPrice || product.price || 0) * (order.quantity || 1)}</p>
                              <p><strong>Status:</strong> {order.status || "pending"}</p>
                              <p><strong>Order Date:</strong> {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "N/A"}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {getOrdersForProduct(product).length === 0 && (
                    <div className="no-orders">
                      <p>No orders received yet for this product.</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>You haven't uploaded any products yet.</p>
              <button onClick={() => window.location.href = "/upload-product"}>
                Upload Your First Product
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Profile;