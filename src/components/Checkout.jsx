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

  // Address states - IMPORTANT: Use the selected address from props
  const [pickupLocation, setPickupLocation] = useState("");
  const [isEditingPickup, setIsEditingPickup] = useState(false);
  
  // Other checkout states
  const [phone, setPhone] = useState("");
  const [deliveryDay, setDeliveryDay] = useState("Today");
  const [deliverySlot, setDeliverySlot] = useState("10:00 - 12:00");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [packaging, setPackaging] = useState("eco");
  const [deliveryCost] = useState(0); // Free delivery for now
  const [orderNote, setOrderNote] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = localStorage.getItem("accessToken");

  const currency = (v) => `₹${v.toFixed(2)}`;

  // Set the address when component mounts or when selectedAddress changes
  useEffect(() => {
    console.log("Checkout received data:", { selectedAddress, type, navCartItems });
    
    if (selectedAddress) {
      console.log("Selected address received:", selectedAddress);
      // Handle both object and string formats
      if (typeof selectedAddress === 'object') {
        setPickupLocation(selectedAddress.address || selectedAddress.name || JSON.stringify(selectedAddress));
      } else {
        setPickupLocation(selectedAddress);
      }
    } else {
      // Fallback: Try to get from localStorage
      const savedAddress = localStorage.getItem('selectedDeliveryAddress');
      const savedAddresses = localStorage.getItem('userDeliveryAddresses');
      
      if (savedAddress && savedAddresses) {
        try {
          const addresses = JSON.parse(savedAddresses);
          const defaultAddress = addresses.find(addr => addr.id === savedAddress);
          if (defaultAddress) {
            setPickupLocation(defaultAddress.address);
            console.log("Using saved address from localStorage:", defaultAddress.address);
          }
        } catch (err) {
          console.error("Error parsing saved addresses:", err);
        }
      }
      
      // Final fallback
      if (!pickupLocation) {
        setPickupLocation(type === "delivery" 
          ? "Please select delivery address" 
          : "Please select pickup location"
        );
      }
    }
  }, [selectedAddress, type]);

  // Fetch cart items function
  const fetchCartItems = async () => {
    if (!token) {
      setError("Please login to continue checkout");
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
      console.log("Cart data:", cartData);
      
      // Handle different response formats
      const products = cartData.products || cartData.items || [];
      setCartItems(products);
      
      // Calculate totals
      calculateTotals(products);
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError("Failed to load cart items");
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals function
  const calculateTotals = (products) => {
    let calculatedSubtotal = 0;
    let calculatedSaving = 0;
    let itemCount = 0;

    products.forEach(item => {
      const product = item.productId || item.product;
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
    setSaving(calculatedSaving > 0 ? -calculatedSaving : 0);
    setTotalItems(itemCount);
  };

  // Calculate cart totals
  useEffect(() => {
    if (navCartItems && navCartItems.length > 0) {
      setCartItems(navCartItems);
      calculateTotals(navCartItems);
      setLoading(false);
    } else {
      fetchCartItems();
    }
  }, [navCartItems]);

  // Handle address change
  const handleAddressChange = () => {
    if (isEditingPickup) {
      // Save the edited address
      setIsEditingPickup(false);
    } else {
      // Go back to address selection
      navigate(-1); // Go back to previous page (where DeliverySidebar is open)
    }
  };

  // Handle order creation
  const handleConfirm = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    
    // Validation
    if (!phone.trim()) {
      setError("Please enter a phone number.");
      setIsSubmitting(false);
      return;
    }
    if (phone.trim().length < 10) {
      setError("Please enter a valid phone number.");
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
    if (!pickupLocation || pickupLocation.includes("Please select")) {
      setError(`Please select a ${type === "delivery" ? "delivery address" : "pickup location"}.`);
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("Starting order creation...");

      // Prepare order items for backend
      const orderItems = cartItems.map(item => ({
        productId: (item.productId?._id || item.productId || item.product?._id),
        quantity: item.quantity,
        price: (item.productId?.discountPrice || item.productId?.price || item.product?.price)
      }));

      console.log("Order items:", orderItems);

      const totalAmount = subtotal + saving + deliveryCost;

      // Create order in backend
      const orderData = {
        address: pickupLocation,
        items: orderItems,
        phone: phone.trim(),
        deliveryTime: `${deliveryDay} · ${deliverySlot}`,
        paymentMethod: paymentMethod,
        totalAmount: totalAmount,
        orderNote: orderNote,
        packaging: packaging,
        deliveryType: type // Add delivery type to order data
      };

      console.log("Order data:", orderData);

      const orderResponse = await axios.post(
        "https://freshcart-backend-4wrc.onrender.com/orders",
        orderData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      console.log("Order created:", orderResponse.data);

      // Clear cart after successful order
      try {
        await axios.delete("https://freshcart-backend-4wrc.onrender.com/cart/clear/all", {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Cart cleared successfully");
      } catch (clearError) {
        console.warn("Could not clear cart:", clearError);
        // Continue even if cart clearing fails
      }

      // Update products with order information
      console.log("Updating products with order info...");
      const updatePromises = cartItems.map(async (item) => {
        try {
          const productId = item.productId?._id || item.productId || item.product?._id;
          if (!productId) {
            console.warn("No product ID found for item:", item);
            return;
          }

          await axios.post(
            `https://freshcart-backend-4wrc.onrender.com/products/${productId}/order`,
            {
              quantity: item.quantity,
              orderPrice: item.productId?.discountPrice || item.productId?.price || item.product?.price,
              orderId: orderResponse.data.order?._id || orderResponse.data._id
            },
            {
              headers: { 
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
              }
            }
          );
          console.log(`Order added to product ${productId}`);
        } catch (productErr) {
          console.error(`Error updating product:`, productErr);
          // Continue with other products even if one fails
        }
      });

      await Promise.allSettled(updatePromises);

      // Show success and redirect
      setConfirmed(true);
      setError("");
      
      // Redirect to profile after 3 seconds
      setTimeout(() => {
        navigate("/profile", { 
          state: { 
            message: "Order placed successfully!",
            orderId: orderResponse.data.order?._id || orderResponse.data._id
          }
        });
      }, 3000);

    } catch (err) {
      console.error("Error placing order:", err);
      let errorMessage = "Something went wrong during checkout!";
      
      if (err.response) {
        console.error("Response error:", err.response.data);
        errorMessage = err.response.data.error || err.response.data.message || errorMessage;
      } else if (err.request) {
        console.error("Network error:", err.request);
        errorMessage = "Network error. Please check your connection.";
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="checkout-wrap">
        <div className="loading">Loading your cart...</div>
      </div>
    );
  }

  return (
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
                  <div className={`input saved-address ${!pickupLocation || pickupLocation.includes("Please select") ? "missing-address" : ""}`}>
                    {pickupLocation}
                    {!pickupLocation || pickupLocation.includes("Please select") ? (
                      <span className="address-warning"> (Please select an address)</span>
                    ) : null}
                  </div>
                )}
              </div>
              <button
                type="button"
                className={`change-link ${isEditingPickup ? "editing" : ""}`}
                onClick={handleAddressChange}
              >
                {isEditingPickup ? "Save" : "Change"}
              </button>
            </div>

            <div>
              <span className="inline-label">Phone number *</span>
              <input
                className="input small"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
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
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
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
                      onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
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
              placeholder="Any special instructions for delivery..."
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
            />
            <label style={{ marginTop: '15px', display: 'block' }}>
              <input
                type="checkbox"
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
                style={{ marginRight: '8px' }}
              />{" "}
              I confirm I am 18+ if required
            </label>
          </div>

          {/* Error + Confirmation */}
          {error && <div className="error">{error}</div>}
          
          <button 
            className="confirm-btn" 
            disabled={cartItems.length === 0 || isSubmitting || !ageConfirmed || !pickupLocation || pickupLocation.includes("Please select")}
            type="submit"
          >
            {isSubmitting ? "Placing Order..." : `Confirm Order →`}
          </button>
          
          {confirmed && (
            <div className="confirmation">
              Order confirmed! {type === "delivery" ? "Delivery" : "Pickup"} {deliveryDay} · {deliverySlot}
              <br />
              <small>Redirecting to your profile...</small>
            </div>
          )}
        </form>
      </div>

      {/* Right Side Summary */}
      <aside className="right">
        <h3>Order Summary</h3>
        
        {/* Cart Items List */}
        {cartItems.length > 0 ? (
          <div className="cart-items-summary">
            {cartItems.map((item, index) => {
              const product = item.productId || item.product;
              if (!product) return null;
              
              const price = product.discountPrice || product.price;
              const total = price * item.quantity;
              
              return (
                <div key={item._id || index} className="checkout-cart-item">
                  <img 
                    src={product.images?.[0] || "/fallback.png"} 
                    alt={product.title} 
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/60x60?text=Product";
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
        
        {saving > 0 && (
          <div className="order-row">
            <span>You Save:</span>
            <span className="red">{currency(saving)}</span>
          </div>
        )}
        
        <div className="order-row">
          <span>{type === "delivery" ? "Delivery" : "Pickup"}:</span>
          <span>{deliveryCost === 0 ? "Free" : currency(deliveryCost)}</span>
        </div>
        
        <div className="order-row total">
          <span>Total Amount:</span>
          <span>{currency(subtotal + saving + deliveryCost)}</span>
        </div>
        
        <div className="warn">
           Weighted products in cart — final amount may vary slightly.
        </div>
      </aside>
    </div>
  );
}