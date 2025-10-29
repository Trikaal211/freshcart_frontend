import React from "react";
import { HiMiniChevronDown } from "react-icons/hi2";
import "./deliverysidebar.css"; 

const DeliverySidebar = ({
  openAddress,
  setOpenAddress,
  activeTab,
  setActiveTab,
  deliveryAddresses,
  setDeliveryAddresses,
  pickupAddresses,
  selectedDelivery,
  setSelectedDelivery,
  selectedPickup,
  setSelectedPickup,
  showForm,
  setShowForm,
  addDeliveryAddress
}) => {

  const handleDeliverySelect = (addrId) => {
    setSelectedDelivery(addrId);
    // You can also automatically close sidebar after selection if needed
    // setOpenAddress(false);
  };

  const handlePickupSelect = (addrId) => {
    setSelectedPickup(addrId);
    // You can also automatically close sidebar after selection if needed
    // setOpenAddress(false);
  };

  const handleRemoveAddress = (addrId, e) => {
    e.stopPropagation();
    const updatedAddresses = deliveryAddresses.filter(a => a.id !== addrId);
    setDeliveryAddresses(updatedAddresses);
    if (selectedDelivery === addrId) {
      setSelectedDelivery(updatedAddresses[0]?.id || null);
    }
  };

  return (
    <div className={`address-sidebar ${openAddress ? "open" : ""}`}>
      <div className="address-header">
        <div className='address-header-top'>
          <h3>Delivery Options</h3>
          <button 
            className="close-btn" 
            onClick={() => { 
              setOpenAddress(false); 
              setShowForm(false); 
              setActiveTab("delivery"); 
            }}
          >
            ×
          </button>
        </div>
        
        <div className='switch-dp'>
          <button 
            className={activeTab === "delivery" ? "active" : ""} 
            onClick={() => setActiveTab("delivery")}
          >
            Delivery
          </button>
          <button 
            className={activeTab === "pickup" ? "active" : ""} 
            onClick={() => setActiveTab("pickup")}
          >
            Pickup
          </button>
        </div>
      </div>

      {/* DELIVERY CONTENT */}
      {activeTab === "delivery" && !showForm && (
        <div className="address-body">
          <div className="address-list">
            {deliveryAddresses.length > 0 ? (
              deliveryAddresses.map(addr => (
                <div 
                  key={addr.id} 
                  className={`address-item ${selectedDelivery === addr.id ? "selected" : ""}`}
                  onClick={() => handleDeliverySelect(addr.id)}
                >
                  <label className="address-option">
                    <input 
                      type="radio" 
                      name="delivery" 
                      checked={selectedDelivery === addr.id} 
                      onChange={() => handleDeliverySelect(addr.id)} 
                    />
                    <span className="address-text">{addr.address}</span>
                  </label>
                  <button 
                    className="remove-btn" 
                    onClick={(e) => handleRemoveAddress(addr.id, e)}
                    title="Remove address"
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <div className="no-addresses">
                <p>No delivery addresses saved</p>
              </div>
            )}
          </div>
          
          <div className="add-address-section">
            <button 
              className="add-address-btn"
              onClick={() => setShowForm(true)}
            >
              <span>+</span>
              Add New Delivery Address
            </button>
          </div>
        </div>
      )}

      {/* ADD ADDRESS FORM */}
      {activeTab === "delivery" && showForm && (
        <div className="address-form">
          <div className="form-header">
            <button className="back-btn" onClick={() => setShowForm(false)}>
              ← Back
            </button>
            <h4>Add New Address</h4>
          </div>
          
          <form 
            className="address-form-content"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const street = formData.get('street');
              const city = formData.get('city');
              const zipCode = formData.get('zipCode');
              const fullAddress = `${street}, ${city}, ${zipCode}`;
              addDeliveryAddress(fullAddress);
            }}
          >
            <div className="form-group">
              <label>Street Address *</label>
              <input 
                type="text" 
                name="street" 
                placeholder="Enter street address" 
                required 
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input 
                  type="text" 
                  name="city" 
                  placeholder="City" 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>ZIP Code *</label>
                <input 
                  type="text" 
                  name="zipCode" 
                  placeholder="ZIP Code" 
                  required 
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Additional Details (Optional)</label>
              <input 
                type="text" 
                name="details" 
                placeholder="Apartment, suite, etc." 
              />
            </div>
            
            <button type="submit" className="confirm-address-btn">
              Save Address
            </button>
          </form>
        </div>
      )}

      {/* PICKUP CONTENT */}
      {activeTab === "pickup" && (
        <div className="address-body">
          <div className="pickup-list">
            {pickupAddresses.map(addr => (
              <div 
                key={addr.id} 
                className={`address-item ${selectedPickup === addr.id ? "selected" : ""}`}
                onClick={() => handlePickupSelect(addr.id)}
              >
                <label className="address-option">
                  <input 
                    type="radio" 
                    name="pickup" 
                    checked={selectedPickup === addr.id} 
                    onChange={() => handlePickupSelect(addr.id)} 
                  />
                  <div className="pickup-details">
                    <strong className="pickup-name">{addr.name}</strong>
                    <span className="pickup-address">{addr.address}</span>
                    <div className="pickup-hours">
                      <span className="hours-label">Open:</span>
                      <span className="hours-value">{addr.open}</span>
                    </div>
                  </div>
                </label>
              </div>
            ))}
          </div>
          
          <div className="pickup-info">
            <div className="info-item">
              <span className="info-icon">⏰</span>
              <span>Free pickup available</span>
            </div>
            <div className="info-item">
              <span className="info-icon">📞</span>
              <span>Contact store for assistance</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliverySidebar;