import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./checkout.css";

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get data from navigation state
  const { selectedAddress, type, cartItems: navCartItems } = location.state || {};

  // Cart states
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [saving, setSaving] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // Other checkout states
  const [pickupLocation, setPickupLocation] = useState(
    selectedAddress?.address || "Downtown Store, 123 Main St"
  );
  const [isEditingPickup, setIsEditingPickup] = useState(false);
  const [phone, setPhone] = useState("");
  const [deliveryDay, setDeliveryDay] = useState("Today");
  const [deliverySlot, setDeliverySlot] = useState("10:00 - 12:00");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [packaging, setPackaging] = useState("eco");
  const [deliveryCost] = useState(type === "delivery" ? 5.00 : 0);
  const [orderNote, setOrderNote] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = localStorage.getItem("accessToken");

  const currency = (v) => `₹${v.toFixed(2)}`;

  // Fetch cart items function
  const fetchCartItems = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get("https://freshcart-backend-4wrc.onrender.com/cart", {
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      });
      
      const cartData = res.data;
      setCartItems(cartData.products || []);
      
      // Calculate totals directly here
      let calculatedSubtotal = 0;
      let calculatedSaving = 0;
      let itemCount = 0;

      (cartData.products || []).forEach(item => {
        const product = item.productId;
        if (product) {
          const actualPrice = product.discountPrice || product.price;
          const originalPrice = product.price;
          const quantity = item.quantity;
          
          calculatedSubtotal += actualPrice * quantity;
          calculatedSaving += (originalPrice - actualPrice) * quantity;
          itemCount += quantity;
        }
      });

      setSubtotal(calculatedSubtotal);
      setSaving(-calculatedSaving);
      setTotalItems(itemCount);
    } catch (err) {
      console.error("Error fetching cart:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate cart totals
  useEffect(() => {
    const calculateTotals = (items) => {
      let calculatedSubtotal = 0;
      let calculatedSaving = 0;
      let itemCount = 0;

      items.forEach(item => {
        const product = item.productId;
        if (product) {
          const actualPrice = product.discountPrice || product.price;
          const originalPrice = product.price;
          const quantity = item.quantity;
          
          calculatedSubtotal += actualPrice * quantity;
          calculatedSaving += (originalPrice - actualPrice) * quantity;
          itemCount += quantity;
        }
      });

      setSubtotal(calculatedSubtotal);
      setSaving(-calculatedSaving);
      setTotalItems(itemCount);
    };

    if (navCartItems && navCartItems.length > 0) {
      setCartItems(navCartItems);
      calculateTotals(navCartItems);
      setLoading(false);
    } else {
      fetchCartItems();
    }
  }, [navCartItems]);

  // ✅ NEW: Handle order creation and integration with product uploaders
  const handleConfirm = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    
    // Validation
    if (!phone) {
      setError("Please enter a phone number.");
      setIsSubmitting(false);
      return;
    }
    if (paymentMethod === "card" && (!cardNumber || !cardExpiry || !cardCvc)) {
      setError("Please fill card details.");
      setIsSubmitting(false);
      return;
    }
    if (!ageConfirmed) {
      setError("Please confirm your age.");
      setIsSubmitting(false);
      return;
    }
    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      setIsSubmitting(false);
      return;
    }

    try {
      // ✅ Prepare order items for backend
      const orderItems = cartItems.map(item => ({
        productId: item.productId._id || item.productId,
        quantity: item.quantity,
        price: item.productId.discountPrice || item.productId.price
      }));

      const totalAmount = subtotal + saving + deliveryCost;

      // ✅ Create order in backend
      const orderResponse = await axios.post(
        "https://freshcart-backend-4wrc.onrender.com/orders",
        { 
          address: pickupLocation,
          items: orderItems,
          phone: phone,
          deliveryTime: `${deliveryDay} · ${deliverySlot}`,
          paymentMethod: paymentMethod,
          totalAmount: totalAmount,
          orderNote: orderNote,
          packaging: packaging
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      console.log("✅ Order created:", orderResponse.data);

      // ✅ Clear cart after successful order
      await axios.delete("https://freshcart-backend-4wrc.onrender.com/cart/clear/all", {
        headers: { Authorization: `Bearer ${token}` }
      });

      // ✅ Update each product with order information for the uploaders
      for (const item of cartItems) {
        const productId = item.productId._id || item.productId;
        
        try {
          await axios.post(
            `https://freshcart-backend-4wrc.onrender.com/products/${productId}/order`,
            {
              quantity: item.quantity,
              orderPrice: item.productId.discountPrice || item.productId.price,
              orderId: orderResponse.data.order._id // Assuming the response has order ID
            },
            {
              headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
              }
            }
          );
          console.log(`✅ Order added to product ${productId}`);
        } catch (productErr) {
          console.error(`❌ Error updating product ${productId}:`, productErr);
          // Continue with other products even if one fails
        }
      }

      // ✅ Show success and redirect
      setConfirmed(true);
      setError("");
      
      // Redirect to orders page after 2 seconds
      setTimeout(() => {
        navigate("/profile");
      }, 2000);

    } catch (err) {
      console.error("❌ Error placing order:", err);
      const errorMessage = err.response?.data?.error || "Something went wrong during checkout!";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="checkout-wrap">
          <div className="loading">Loading your cart...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="checkout-wrap">
        <div className="left">
          <form onSubmit={handleConfirm}>
            {/* Delivery/Pickup Location */}
            <div className="section">
              <h3>{type === "delivery" ? "Delivery Address" : "Pickup Location"}</h3>
              <div className="input-row">
                <div style={{ flex: 1 }}>
                  <span className="inline-label">
                    Selected {type === "delivery" ? "delivery address" : "pickup location"}
                  </span>
                  {isEditingPickup ? (
                    <input
                      className="input"
                      value={pickupLocation}
                      onChange={(e) => setPickupLocation(e.target.value)}
                      placeholder={`Enter ${type === "delivery" ? "delivery address" : "pickup location"}`}
                    />
                  ) : (
                    <div className="input saved-address">{pickupLocation}</div>
                  )}
                </div>
                <button
                  type="button"
                  className={`change-link ${isEditingPickup ? "editing" : ""}`}
                  onClick={() => setIsEditingPickup(!isEditingPickup)}
                >
                  {isEditingPickup ? "Save" : "Change"}
                </button>
              </div>

              <div>
                <span className="inline-label">Phone number *</span>
                <input
                  className="input small"
                  placeholder="+91 — — — —"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Delivery/Pickup Date and Time */}
            <div className="section">
              <h3>{type === "delivery" ? "Delivery" : "Pickup"} date and time</h3>
              <div className="radio-grid">
                {["Today", "Tomorrow", "Other date"].map((d) => (
                  <button
                    type="button"
                    key={d}
                    onClick={() => setDeliveryDay(d)}
                    className={`radio-pill ${deliveryDay === d ? "selected" : ""}`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <div className="radio-grid">
                {["10:00 - 12:00", "12:00 - 14:00", "14:00 - 16:00", "16:00 - 18:00", "18:00 - 20:00"].map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setDeliverySlot(s)}
                    className={`radio-pill ${deliverySlot === s ? "selected" : ""}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="footer-note">
                {type === "delivery" ? "Delivery" : "Pickup"} cost: 
                <strong>{deliveryCost === 0 ? " Free" : currency(deliveryCost)}</strong>
              </div>
            </div>

            {/* Payment Method */}
            <div className="section">
              <h3>Payment method</h3>
              <div className="payment-card">
                <label>
                  <input
                    type="radio"
                    name="pm"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                  />{" "}
                  Credit/Debit Card
                </label>
                {paymentMethod === "card" && (
                  <div className="card-details">
                    <input
                      className="input"
                      placeholder="Card number"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                    <div className="card-inputs">
                      <input
                        className="input small"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                      />
                      <input
                        className="input small"
                        placeholder="CVC"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                      />
                    </div>
                  </div>
                )}
                <label>
                  <input
                    type="radio"
                    name="pm"
                    checked={paymentMethod === "paypal"}
                    onChange={() => setPaymentMethod("paypal")}
                  />{" "}
                  PayPal
                </label>
                <label>
                  <input
                    type="radio"
                    name="pm"
                    checked={paymentMethod === "gpay"}
                    onChange={() => setPaymentMethod("gpay")}
                  />{" "}
                  Google Pay
                </label>
                <label>
                  <input
                    type="radio"
                    name="pm"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                  />{" "}
                  Cash on delivery
                </label>
              </div>
            </div>

            {/* Packaging */}
            <div className="section">
              <h3>Packaging</h3>
              <label>
                <input
                  type="radio"
                  name="pack"
                  checked={packaging === "branded"}
                  onChange={() => setPackaging("branded")}
                />{" "}
                Branded bags
              </label>
              <label>
                <input
                  type="radio"
                  name="pack"
                  checked={packaging === "eco"}
                  onChange={() => setPackaging("eco")}
                />{" "}
                Eco-friendly packaging
              </label>
            </div>

            {/* Order Note */}
            <div className="section">
              <h3>Order note</h3>
              <textarea
                className="input"
                rows={3}
                placeholder="Order note"
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
              />
              <label>
                <input
                  type="checkbox"
                  checked={ageConfirmed}
                  onChange={(e) => setAgeConfirmed(e.target.checked)}
                />{" "}
                I confirm I am 18+ if required
              </label>
            </div>

            {/* Error + Confirmation */}
            {error && <div className="error">{error}</div>}
            <button 
              className="confirm-btn" 
              disabled={cartItems.length === 0 || isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Placing Order..." : "Confirm the order →"}
            </button>
            {confirmed && (
              <div className="confirmation">
                ✅ Order confirmed! {type === "delivery" ? "Delivery" : "Pickup"} {deliveryDay} · {deliverySlot}
                <br />
                <small>Redirecting to your profile...</small>
              </div>
            )}
          </form>
        </div>

        {/* Right Side Summary */}
        <aside className="right">
          <h3>Order summary</h3>
          
          {/* Cart Items List */}
          {cartItems.length > 0 ? (
            <div className="cart-items-summary">
              {cartItems.map((item) => {
                const product = item.productId;
                if (!product) return null;
                
                const price = product.discountPrice || product.price;
                const total = price * item.quantity;
                
                return (
                  <div key={item._id} className="checkout-cart-item">
                    <img 
                      src={product.images?.[0] || "/fallback.png"} 
                      alt={product.title} 
                      onError={(e) => {
                        e.target.src = "/fallback.png";
                      }}
                    />
                    <div className="item-details">
                      <h4>{product.title}</h4>
                      <p>Qty: {item.quantity}</p>
                      <p>Price: {currency(total)}</p>
                      <small>Seller: {product.uploadedBy?.name || "FreshCart"}</small>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-cart-message">Your cart is empty</div>
          )}

          <div className="order-row">
            <span>Subtotal ({totalItems} items):</span>
            <span>{currency(subtotal)}</span>
          </div>
          <div className="order-row">
            <span>Saving:</span>
            <span className="red">{currency(saving)}</span>
          </div>
          <div className="order-row">
            <span>{type === "delivery" ? "Delivery" : "Pickup"}:</span>
            <span>{deliveryCost === 0 ? "Free" : currency(deliveryCost)}</span>
          </div>
          <div className="order-row total">
            <span>Estimated total:</span>
            <span>{currency(subtotal + saving + deliveryCost)}</span>
          </div>
          <div className="warn">
            Weighted product in the cart — actual total may differ.
          </div>
        </aside>
      </div>
    </>
  );
}