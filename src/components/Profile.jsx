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

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) {
          console.warn("No token found in localStorage!");
          setLoading(false);
          return;
        }

        // Fetch user details, cart, uploaded products, and orders
        const [userRes, cartRes, productsRes, ordersRes] = await Promise.all([
          axios.get("https://freshcart-backend-4wrc.onrender.com/users/me", {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }),
          axios.get("https://freshcart-backend-4wrc.onrender.com/cart", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://freshcart-backend-4wrc.onrender.com/products/my-products", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://freshcart-backend-4wrc.onrender.com/orders/my-orders", {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        setUser(userRes.data);
        setCart(cartRes.data.items || []);
        setMyProducts(productsRes.data || []);
        setMyOrders(ordersRes.data || []);
      } catch (error) {
        console.error("❌ Error fetching profile data:", error);
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
        return sum + (order.orderPrice || product.price) * order.quantity;
      }, 0);
      return total + productRevenue;
    }, 0);
  };

  if (loading) return <p>Loading your profile...</p>;

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
          My Cart
        </button>
        <button 
          className={activeTab === "orders" ? "active" : ""}
          onClick={() => setActiveTab("orders")}
        >
          My Orders
        </button>
        <button 
          className={activeTab === "products" ? "active" : ""}
          onClick={() => setActiveTab("products")}
        >
          My Products & Sales
        </button>
      </div>

      {user ? (
        <>
          {/* Profile Info Tab */}
          {activeTab === "profile" && (
            <section className="user-info">
              <h3>Personal Information</h3>
              <p>
                <strong>Name:</strong> {user.name || "No name set"}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
            </section>
          )}

          {/* Cart Tab */}
          {activeTab === "cart" && (
            <section className="cart">
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
          )}

          {/* My Orders Tab */}
          {activeTab === "orders" && (
            <section className="my-orders">
              <h3>My Orders</h3>
              {myOrders.length > 0 ? (
                <div className="orders-list">
                  {myOrders.map((order) => (
                    <div key={order._id} className="order-card">
                      <h4>Order #{order._id.slice(-6)}</h4>
                      <p><strong>Status:</strong> {order.status}</p>
                      <p><strong>Total:</strong> ₹{order.totalAmount}</p>
                      <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                      <div className="order-items">
                        <h5>Items:</h5>
                        <ul>
                          {order.items.map((item, index) => (
                            <li key={index}>
                              {item.product?.title} - Qty: {item.quantity} - ₹{item.price}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>You haven't placed any orders yet.</p>
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

              <h3>My Uploaded Products</h3>
              
              {myProducts.length > 0 ? (
                <div className="products-list">
                  {myProducts.map((product) => (
                    <div key={product._id} className="product-card">
                      <div className="product-header">
                        <h4>{product.title}</h4>
                        <span className="price">₹{product.price}</span>
                      </div>
                      <p><strong>Orders Received:</strong> {getOrdersForProduct(product).length}</p>
                      
                      {getOrdersForProduct(product).length > 0 && (
                        <div className="orders-list">
                          <h5>Order Details:</h5>
                          <ul>
                            {getOrdersForProduct(product).map((order, index) => (
                              <li key={index} className="order-item">
                                <div className="order-info">
                                  <strong>Customer Order:</strong> <br />
                                  <strong>Quantity:</strong> {order.quantity} <br />
                                  <strong>Amount:</strong> ₹{(order.orderPrice || product.price) * order.quantity} <br />
                                  <strong>Status:</strong> {order.status} <br />
                                  <strong>Order Date:</strong> {new Date(order.orderDate).toLocaleDateString()}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>You haven't uploaded any products yet.</p>
              )}
            </section>
          )}
        </>
      ) : (
        <p>User not found. Please login again.</p>
      )}
    </div>
  );
};

export default Profile;