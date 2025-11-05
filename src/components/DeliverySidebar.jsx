import React, { useState, useEffect } from "react";
import { HiMiniChevronDown, HiMapPin, HiClock, HiPhone } from "react-icons/hi2";
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

  // Load addresses from localStorage on component mount
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

  // Save addresses to localStorage whenever they change
  useEffect(() => {
    if (deliveryAddresses.length > 0) {
      localStorage.setItem('userDeliveryAddresses', JSON.stringify(deliveryAddresses));
    }
  }, [deliveryAddresses]);

  // Save selected address to localStorage
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
    
    // Reset form and close
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
        {/* Header */}
        <div className="sidebar-header">
          <div className="header-content">
            <h2>Delivery Options</h2>
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
          
          {/* Tab Navigation */}
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

        {/* Delivery Content */}
        {activeTab === "delivery" && !showForm && (
          <div className="sidebar-content">
            <div className="addresses-section">
              <h3 className="section-title">Saved Addresses</h3>
              
              <div className="addresses-list">
                {deliveryAddresses.length > 0 ? (
                  deliveryAddresses.map(addr => (
                    <div 
                      key={addr.id} 
                      className={`address-card ${selectedDelivery === addr.id ? "selected" : ""}`}
                      onClick={() => handleDeliverySelect(addr.id)}
                    >
                      <div className="address-header">
                        <div className="address-label">
                          <span className="label-badge">{addr.label}</span>
                          {addr.isDefault && <span className="default-badge">Default</span>}
                        </div>
                        <div className="address-actions">
                          {!addr.isDefault && (
                            <button 
                              className="action-btn set-default"
                              onClick={(e) => setAsDefaultAddress(addr.id, e)}
                              title="Set as default"
                            >
                              Set Default
                            </button>
                          )}
                          <button 
                            className="action-btn remove"
                            onClick={(e) => handleRemoveAddress(addr.id, e)}
                            title="Remove address"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      
                      <div className="address-details">
                        <div className="radio-container">
                          <input 
                            type="radio" 
                            name="delivery" 
                            checked={selectedDelivery === addr.id} 
                            onChange={() => handleDeliverySelect(addr.id)} 
                            className="address-radio"
                          />
                          <span className="radio-checkmark"></span>
                        </div>
                        <div className="address-info">
                          <p className="address-text">{addr.address}</p>
                          {addr.details && (
                            <p className="address-detail">{addr.details}</p>
                          )}
                        </div>
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
                className="add-address-btn primary-btn"
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
              <div className="form-section">
                <label className="form-label">Address Label</label>
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

              <div className="form-section">
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
                <div className="form-section">
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
                
                <div className="form-section">
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
              
              <div className="form-section">
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
              
              <button type="submit" className="save-address-btn primary-btn">
                Save Address
              </button>
            </form>
          </div>
        )}

        {/* Pickup Content */}
        {activeTab === "pickup" && (
          <div className="sidebar-content">
            <div className="pickup-section">
              <h3 className="section-title">Pickup Locations</h3>
              
              <div className="pickup-list">
                {pickupAddresses.map(addr => (
                  <div 
                    key={addr.id} 
                    className={`pickup-card ${selectedPickup === addr.id ? "selected" : ""}`}
                    onClick={() => handlePickupSelect(addr.id)}
                  >
                    <div className="radio-container">
                      <input 
                        type="radio" 
                        name="pickup" 
                        checked={selectedPickup === addr.id} 
                        onChange={() => handlePickupSelect(addr.id)} 
                        className="address-radio"
                      />
                      <span className="radio-checkmark"></span>
                    </div>
                    
                    <div className="pickup-info">
                      <div className="pickup-header">
                        <h4 className="pickup-name">{addr.name}</h4>
                        <span className="pickup-distance">{addr.distance}</span>
                      </div>
                      
                      <p className="pickup-address">
                        <HiMapPin className="info-icon" />
                        {addr.address}
                      </p>
                      
                      <div className="pickup-meta">
                        <div className="meta-item">
                          <HiClock className="info-icon" />
                          <span>Open: {addr.hours}</span>
                        </div>
                        <div className="meta-item">
                          <HiPhone className="info-icon" />
                          <span>{addr.phone}</span>
                        </div>
                      </div>
                      
                      <div className="pickup-features">
                        {addr.features?.map((feature, index) => (
                          <span key={index} className="feature-tag">{feature}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pickup-benefits">
              <h4>Pickup Benefits</h4>
              <div className="benefits-list">
                <div className="benefit-item">
                  <span className="benefit-icon">🚗</span>
                  <span>Free pickup available</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">⚡</span>
                  <span>Ready in 30 minutes</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">📞</span>
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