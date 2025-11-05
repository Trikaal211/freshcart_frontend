import React, { useState, useEffect } from "react";
import { HiClock, HiPhone, HiX } from "react-icons/hi";
import { HiMapPin } from "react-icons/hi2";
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
  setShowForm
}) => {
  const [formData, setFormData] = useState({
    street: "",
    city: "",
    zipCode: "",
    details: "",
    label: "Home"
  });

  // Load addresses from localStorage
  useEffect(() => {
    const savedAddresses = localStorage.getItem('userDeliveryAddresses');
    const savedSelection = localStorage.getItem('selectedDeliveryAddress');
    
    if (savedAddresses) {
      setDeliveryAddresses(JSON.parse(savedAddresses));
    }
    if (savedSelection) {
      setSelectedDelivery(savedSelection);
    }
  }, []);

  // Save addresses to localStorage
  useEffect(() => {
    if (deliveryAddresses.length > 0) {
      localStorage.setItem('userDeliveryAddresses', JSON.stringify(deliveryAddresses));
    }
  }, [deliveryAddresses]);

  // Save selected address
  useEffect(() => {
    if (selectedDelivery) {
      localStorage.setItem('selectedDeliveryAddress', selectedDelivery);
    }
  }, [selectedDelivery]);

  const handleDeliverySelect = (addrId) => {
    setSelectedDelivery(addrId);
  };

  const handlePickupSelect = (addrId) => {
    setSelectedPickup(addrId);
  };

  const handleRemoveAddress = (addrId, e) => {
    e.stopPropagation();
    const updatedAddresses = deliveryAddresses.filter(a => a.id !== addrId);
    setDeliveryAddresses(updatedAddresses);
    
    if (selectedDelivery === addrId) {
      const newSelection = updatedAddresses[0]?.id || null;
      setSelectedDelivery(newSelection);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddAddress = (e) => {
    e.preventDefault();
    
    if (!formData.street || !formData.city || !formData.zipCode) {
      alert("Please fill in all required fields");
      return;
    }

    const newAddress = {
      id: `addr-${Date.now()}`,
      address: `${formData.street}, ${formData.city}, ${formData.zipCode}`,
      details: formData.details,
      label: formData.label,
      street: formData.street,
      city: formData.city,
      zipCode: formData.zipCode,
      isDefault: deliveryAddresses.length === 0
    };

    const updatedAddresses = [...deliveryAddresses, newAddress];
    setDeliveryAddresses(updatedAddresses);
    setSelectedDelivery(newAddress.id);
    
    // Reset form
    setFormData({
      street: "",
      city: "",
      zipCode: "",
      details: "",
      label: "Home"
    });
    setShowForm(false);
  };

  const setAsDefaultAddress = (addrId, e) => {
    e.stopPropagation();
    const updatedAddresses = deliveryAddresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addrId
    }));
    setDeliveryAddresses(updatedAddresses);
  };

  return (
    <>
      {/* Overlay */}
      {openAddress && <div className="sidebar-overlay" onClick={() => setOpenAddress(false)}></div>}
      
      <div className={`delivery-sidebar ${openAddress ? "open" : ""}`}>
        {/* Header - FIXED LAYOUT */}
        <div className="sidebar-header">
          <div className="headeru-main">
            <div className="header-title-section">
              <h2 className="header-title">Delivery Options</h2>
              <button 
                className="close-btn" 
                onClick={() => { 
                  setOpenAddress(false); 
                  setShowForm(false); 
                  setActiveTab("delivery"); 
                }}
              >
                <HiX />
              </button>
            </div>
            
            {/* Tab Navigation - SEPARATE ROW */}
            <div className="tab-navigation">
              <button 
                className={`tab-btn ${activeTab === "delivery" ? "active" : ""}`} 
                onClick={() => setActiveTab("delivery")}
              >
                <HiMapPin className="tab-icon" />
                Delivery
              </button>
              <button 
                className={`tab-btn ${activeTab === "pickup" ? "active" : ""}`} 
                onClick={() => setActiveTab("pickup")}
              >
                <HiMapPin className="tab-icon" />
                Pickup
              </button>
            </div>
          </div>
        </div>

        {/* Delivery Content */}
        {activeTab === "delivery" && !showForm && (
          <div className="sidebar-content">
            <div className="content-section">
              <h3 className="section-title">Saved Addresses</h3>
              
              <div className="addresses-list">
                {deliveryAddresses.length > 0 ? (
                  deliveryAddresses.map(addr => (
                    <div 
                      key={addr.id} 
                      className={`address-card ${selectedDelivery === addr.id ? "selected" : ""}`}
                      onClick={() => handleDeliverySelect(addr.id)}
                    >
                      <div className="card-header">
                        <div className="address-type">
                          <span className="type-badge">{addr.label}</span>
                          {addr.isDefault && <span className="default-badge">Default</span>}
                        </div>
                      </div>
                      
                      <div className="card-content">
                        <div className="radio-option">
                          <input 
                            type="radio" 
                            name="delivery" 
                            checked={selectedDelivery === addr.id} 
                            onChange={() => handleDeliverySelect(addr.id)} 
                            className="address-radio"
                          />
                          <span className="radio-custom"></span>
                        </div>
                        
                        <div className="address-details">
                          <p className="address-main">{addr.address}</p>
                          {addr.details && (
                            <p className="address-extra">{addr.details}</p>
                          )}
                        </div>
                      </div>

                      <div className="card-actions">
                        {!addr.isDefault && (
                          <button 
                            className="action-btn default-btn"
                            onClick={(e) => setAsDefaultAddress(addr.id, e)}
                            title="Set as default"
                          >
                            Set Default
                          </button>
                        )}
                        <button 
                          className="action-btn remove-btn"
                          onClick={(e) => handleRemoveAddress(addr.id, e)}
                          title="Remove address"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <HiMapPin className="empty-icon" />
                    <h4>No addresses saved</h4>
                    <p>Add your first delivery address to get started</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="add-address-section">
              <button 
                className="add-address-btn"
                onClick={() => setShowForm(true)}
              >
                <span className="btn-icon">+</span>
                Add New Address
              </button>
            </div>
          </div>
        )}

        {/* Add Address Form */}
        {activeTab === "delivery" && showForm && (
          <div className="sidebar-content">
            <div className="form-header">
              <button className="back-btn" onClick={() => setShowForm(false)}>
                ← Back to Addresses
              </button>
              <h3>Add New Address</h3>
            </div>
            
            <form className="address-form" onSubmit={handleAddAddress}>
              <div className="form-group">
                <label className="form-label">Address Type</label>
                <select 
                  name="label"
                  value={formData.label}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label required">Street Address</label>
                <input 
                  type="text" 
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  placeholder="Enter street address" 
                  className="form-input"
                  required 
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label required">City</label>
                  <input 
                    type="text" 
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City" 
                    className="form-input"
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label required">ZIP Code</label>
                  <input 
                    type="text" 
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="ZIP Code" 
                    className="form-input"
                    required 
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Additional Details</label>
                <input 
                  type="text" 
                  name="details"
                  value={formData.details}
                  onChange={handleInputChange}
                  placeholder="Apartment, suite, floor, etc." 
                  className="form-input"
                />
              </div>
              
              <button type="submit" className="submit-btn">
                Save Address
              </button>
            </form>
          </div>
        )}

        {/* Pickup Content */}
        {activeTab === "pickup" && (
          <div className="sidebar-content">
            <div className="content-section">
              <h3 className="section-title">Pickup Locations</h3>
              
              <div className="pickup-list">
                {pickupAddresses.map(addr => (
                  <div 
                    key={addr.id} 
                    className={`pickup-card ${selectedPickup === addr.id ? "selected" : ""}`}
                    onClick={() => handlePickupSelect(addr.id)}
                  >
                    <div className="radio-option">
                      <input 
                        type="radio" 
                        name="pickup" 
                        checked={selectedPickup === addr.id} 
                        onChange={() => handlePickupSelect(addr.id)} 
                        className="address-radio"
                      />
                      <span className="radio-custom"></span>
                    </div>
                    
                    <div className="pickup-details">
                      <div className="pickup-header">
                        <h4 className="store-name">{addr.name}</h4>
                        <span className="distance">{addr.distance}</span>
                      </div>
                      
                      <div className="store-info">
                        <div className="info-row">
                          <HiMapPin className="info-icon" />
                          <span>{addr.address}</span>
                        </div>
                        
                        <div className="info-row">
                          <HiClock className="info-icon" />
                          <span>Open: {addr.hours}</span>
                        </div>
                        
                        <div className="info-row">
                          <HiPhone className="info-icon" />
                          <span>{addr.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="benefits-section">
              <h4 className="benefits-title">Pickup Benefits</h4>
              <div className="benefits-list">
                <div className="benefit-item">
                  <span className="benefit-emoji">🚗</span>
                  <span>Free pickup available</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-emoji">⚡</span>
                  <span>Ready in 30 minutes</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-emoji">📞</span>
                  <span>Contact-free pickup</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DeliverySidebar;