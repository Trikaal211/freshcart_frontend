import React, { useState, useEffect } from "react";
import axios from "axios";
import "./checkout.css";

const Checkout = () => {
  const [cartSummary, setCartSummary] = useState({ items: [], subtotal: 0, total: 0 });
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchCartSummary = async () => {
      try {
        const res = await axios.get("https://freshcart-backend-4wrc.onrender.com/cart/summary", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartSummary(res.data);
      } catch (err) {
        console.error("❌ Error fetching cart summary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCartSummary();
  }, [token]);

  const handleCheckout = async () => {
    if (!address.trim()) {
      alert("Please enter your delivery address!");
      return;
    }

    if (cartSummary.items.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    setCheckoutLoading(true);

    try {
      // Prepare order items for the order creation
      const orderItems = cartSummary.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      }));

      // Create order
      const orderRes = await axios.post(
        "https://freshcart-backend-4wrc.onrender.com/orders",
        { 
          address: address.trim(),
          items: orderItems,
          paymentMethod: paymentMethod,
          totalAmount: cartSummary.total
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Clear cart after successful order
      await axios.delete("https://freshcart-backend-4wrc.onrender.com/cart/clear/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("✅ Order placed successfully!");
      console.log("Order response:", orderRes.data);
      
      // Reset form and cart
      setCartSummary({ items: [], subtotal: 0, total: 0 });
      setAddress("");
      setPaymentMethod("cod");
      
    } catch (err) {
      console.error("❌ Error placing order:", err);
      const errorMessage = err.response?.data?.error || "Something went wrong during checkout!";
      alert(errorMessage);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading checkout...</div>;

  return (
    <div className="checkout-page">
      <h2>Checkout</h2>

      <div className="checkout-layout">
        {/* Order Summary */}
        <div className="order-summary">
          <h3>Order Summary</h3>
          {cartSummary.items.length > 0 ? (
            <>
              <div className="order-items">
                {cartSummary.items.map((item) => (
                  <div key={item.productId} className="order-item">
                    <div className="item-details">
                      <h4>{item.product.title}</h4>
                      <p>Quantity: {item.quantity}</p>
                      <p>₹{item.price} × {item.quantity} = ₹{item.itemTotal}</p>
                    </div>
                    {item.product.images?.[0] && (
                      <img 
                        src={item.product.images[0]} 
                        alt={item.product.title}
                        className="item-image"
                      />
                    )}
                  </div>
                ))}
              </div>
              
              <div className="price-breakdown">
                <div className="price-row">
                  <span>Subtotal:</span>
                  <span>₹{cartSummary.subtotal}</span>
                </div>
                <div className="price-row">
                  <span>Shipping:</span>
                  <span>{cartSummary.shipping === 0 ? "FREE" : `₹${cartSummary.shipping}`}</span>
                </div>
                <div className="price-row total">
                  <span>Total:</span>
                  <span>₹{cartSummary.total}</span>
                </div>
              </div>
            </>
          ) : (
            <p className="empty-cart">Your cart is empty.</p>
          )}
        </div>

        {/* Checkout Form */}
        <div className="checkout-form">
          {/* Delivery Address */}
          <div className="form-section">
            <h3>Delivery Address</h3>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your complete delivery address (house number, street, city, pincode)..."
              rows="4"
              className="address-input"
            />
          </div>

          {/* Payment Method */}
          <div className="form-section">
            <h3>Payment Method</h3>
            <div className="payment-options">
              <label className="payment-option">
                <input
                  type="radio"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>Cash on Delivery</span>
              </label>
              <label className="payment-option">
                <input
                  type="radio"
                  value="online"
                  checked={paymentMethod === "online"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>Online Payment</span>
              </label>
            </div>
          </div>

          {/* Checkout Button */}
          <button 
            onClick={handleCheckout} 
            className="checkout-btn"
            disabled={checkoutLoading || cartSummary.items.length === 0 || !address.trim()}
          >
            {checkoutLoading ? (
              <span>Placing Order...</span>
            ) : (
              <span>Place Order - ₹{cartSummary.total}</span>
            )}
          </button>

          {paymentMethod === "cod" && (
            <p className="cod-note">
              💵 You'll pay ₹{cartSummary.total} when your order is delivered
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;