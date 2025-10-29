import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./Checkout.css";

export default function Checkout() {
  const location = useLocation();
  
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

  const currency = (v) => `$${v.toFixed(2)}`;

  // Fetch cart items function
  const fetchCartItems = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/cart", {
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        credentials: "include"
      });
      
      if (!res.ok) throw new Error("Failed to fetch cart");
      const data = await res.json();
      setCartItems(data.products || []);
      
      // Calculate totals directly here
      let calculatedSubtotal = 0;
      let calculatedSaving = 0;
      let itemCount = 0;

      (data.products || []).forEach(item => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navCartItems]);

  const handleConfirm = (e) => {
    e.preventDefault();
    setError("");
    
    if (!phone) return setError("Please enter a phone number.");
    if (paymentMethod === "card" && (!cardNumber || !cardExpiry || !cardCvc))
      return setError("Please fill card details.");
    if (!ageConfirmed) return setError("Please confirm your age.");
    if (cartItems.length === 0) return setError("Your cart is empty.");
    
    setConfirmed(true);
    
    // Here you would typically send order to backend
    console.log("Order confirmed:", {
      items: cartItems,
      address: pickupLocation,
      phone,
      delivery: `${deliveryDay} · ${deliverySlot}`,
      paymentMethod,
      total: subtotal + saving + deliveryCost
    });
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
                  placeholder="+1 — — — —"
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
            <button className="confirm-btn" disabled={cartItems.length === 0}>
              Confirm the order →
            </button>
            {confirmed && (
              <div className="confirmation">
                Order confirmed! {type === "delivery" ? "Delivery" : "Pickup"} {deliveryDay} · {deliverySlot}
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
                    <img src={product.images?.[0] || "/fallback.png"} alt={product.title} />
                    <div className="item-details">
                      <h4>{product.title}</h4>
                      <p>Qty: {item.quantity}</p>
                      <p>Price: {currency(total)}</p>
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