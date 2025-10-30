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
          setError("Please login to view your profile");
          setLoading(false);
          return;
        }

        console.log("🔍 Fetching profile data...");

        // Fetch user details first
        try {
          const userRes = await axios.get("https://freshcart-backend-4wrc.onrender.com/users/me", {
            headers: { 
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          });
          console.log("✅ User data loaded");
          setUser(userRes.data);
        } catch (userError) {
          console.error("❌ Error fetching user:", userError);
          setError("Failed to load user data");
        }

        // Fetch other data in parallel with better error handling
        const promises = [
          // Cart
          axios.get("https://freshcart-backend-4wrc.onrender.com/cart", {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(err => {
            console.error("Cart fetch error:", err);
            return { data: { products: [] } }; // Return empty cart on error
          }),
          
          // My Products - with fallback
          axios.get("https://freshcart-backend-4wrc.onrender.com/products/my-products", {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(err => {
            console.error("My Products fetch error:", err);
            // If endpoint doesn't exist or fails, return empty array
            return { data: [] };
          }),
          
          // My Orders - with fallback  
          axios.get("https://freshcart-backend-4wrc.onrender.com/orders/my-orders", {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(err => {
            console.error("My Orders fetch error:", err);
            return { data: [] };
          })
        ];

        const [cartRes, productsRes, ordersRes] = await Promise.all(promises);

        // Set cart data
        setCart(cartRes.data.products || cartRes.data.items || []);

        // Set products data
        if (productsRes.data && Array.isArray(productsRes.data)) {
          setMyProducts(productsRes.data);
          console.log(`✅ Loaded ${productsRes.data.length} products`);
        } else {
          setMyProducts([]);
          console.log("⚠️ No products data or invalid format");
        }

        // Set orders data
        if (ordersRes.data && Array.isArray(ordersRes.data)) {
          setMyOrders(ordersRes.data);
        } else {
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

  // Refresh my products data
  const refreshMyProducts = async () => {
    if (!token) return;
    
    try {
      const response = await axios.get("https://freshcart-backend-4wrc.onrender.com/products/my-products", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyProducts(response.data || []);
      console.log("🔄 Products refreshed");
    } catch (error) {
      console.error("❌ Error refreshing products:", error);
    }
  };

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
      <div className="profile-header">
        <h2>User Profile</h2>
        <button onClick={refreshMyProducts} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

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
                    <h4>{item.productId?.title || item.product?.title || "Unknown Product"}</h4>
                    <p>Quantity: {item.quantity}</p>
                    <p>Price: ₹{item.productId?.price || item.product?.price || "N/A"}</p>
                    {(item.productId?.discountPrice || item.product?.discountPrice) && (
                      <p className="discount">
                        Discounted: ₹{item.productId?.discountPrice || item.product?.discountPrice}
                      </p>
                    )}
                  </div>
                  {(item.productId?.images?.[0] || item.product?.images?.[0]) && (
                    <img 
                      src={item.productId?.images?.[0] || item.product?.images?.[0]} 
                      alt={item.productId?.title || item.product?.title}
                      className="item-image"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/80x80?text=Product";
                      }}
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
          <div className="section-header">
            <h3>My Uploaded Products</h3>
            <div className="header-actions">
              <button onClick={refreshMyProducts} className="refresh-btn small">
                🔄 Refresh
              </button>
              <button 
                onClick={() => window.location.href = "/upload-product"}
                className="upload-btn"
              >
                📤 Upload New Product
              </button>
            </div>
          </div>

          {/* Sales Overview */}
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
          
          {myProducts.length > 0 ? (
            <div className="products-list">
              {myProducts.map((product) => {
                const productOrders = getOrdersForProduct(product);
                
                return (
                  <div key={product._id} className="product-card">
                    <div className="product-header">
                      <div className="product-title">
                        <h4>{product.title}</h4>
                        {product.images?.[0] && (
                          <img 
                            src={product.images[0]} 
                            alt={product.title}
                            className="product-thumbnail"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/60x60?text=Product";
                            }}
                          />
                        )}
                      </div>
                      <div className="product-pricing">
                        <span className="price">₹{product.price}</span>
                        {product.discountPrice && product.discountPrice < product.price && (
                          <span className="discount-price">₹{product.discountPrice}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="product-meta">
                      <p><strong>Brand:</strong> {product.brand || "N/A"}</p>
                      <p><strong>Category:</strong> {product.category?.name || "Uncategorized"}</p>
                      <p><strong>Status:</strong> 
                        <span className={`availability ${product.availability?.toLowerCase() || "in-stock"}`}>
                          {product.availability || "In Stock"}
                        </span>
                      </p>
                    </div>
                    
                    <div className="product-stats">
                      <div className="stat-item">
                        <strong>Stock:</strong> {product.quantity || 0}
                      </div>
                      <div className="stat-item">
                        <strong>Orders:</strong> {productOrders.length}
                      </div>
                      <div className="stat-item">
                        <strong>Clicks:</strong> {product.clicks || 0}
                      </div>
                    </div>
                    
                    {productOrders.length > 0 ? (
                      <div className="product-orders">
                        <h5>📦 Orders Received ({productOrders.length})</h5>
                        <div className="orders-container">
                          {productOrders.map((order, index) => (
                            <div key={index} className="order-detail">
                              <div className="order-meta">
                                <strong>Order #{index + 1}</strong>
                                <span className={`order-status ${order.status || "pending"}`}>
                                  {order.status || "pending"}
                                </span>
                              </div>
                              <div className="order-info">
                                <p><strong>Quantity:</strong> {order.quantity}</p>
                                <p><strong>Price:</strong> ₹{order.orderPrice || product.price}</p>
                                <p><strong>Total:</strong> ₹{(order.orderPrice || product.price) * order.quantity}</p>
                                <p><strong>Date:</strong> {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : "N/A"}</p>
                                {order.user && (
                                  <p><strong>Customer:</strong> {order.user.name || order.user.email}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="no-orders">
                        <p>📭 No orders received yet for this product.</p>
                        <p className="hint">When customers order this product, details will appear here.</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-content">
                <h4>📤 No Products Uploaded Yet</h4>
                <p>You haven't uploaded any products to sell.</p>
                <button 
                  onClick={() => window.location.href = "/upload-product"}
                  className="cta-button"
                >
                  Upload Your First Product
                </button>
                <p className="hint">
                  Start selling by uploading your products. You'll see orders from customers here.
                </p>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Profile;