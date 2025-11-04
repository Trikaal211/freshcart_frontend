import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import './navbar.css';
import DeliverySidebar from "./DeliverySidebar";

import { IoGridOutline } from "react-icons/io5";
import { MdKeyboardArrowDown } from "react-icons/md";
import { HiMiniChevronDown } from "react-icons/hi2";
import { RiSearchLine, RiCloseLine } from "react-icons/ri";
import { BsBrightnessHigh } from "react-icons/bs";
import { FaRegUser, FaChevronDown } from "react-icons/fa";
import { CiLocationOn, CiShoppingCart } from "react-icons/ci";

const Navbar = () => {
  // ---------------- STATES ----------------
  const [menuOpen, setMenuOpen] = useState(false);
  const [cart, setOpenCart] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(false);
  const [openAddress, setOpenAddress] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("delivery");
  const [show, Setshow] = useState({ home: false, shop: false, account: false, pages: false });
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isFixed, setIsFixed] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileSearchTerm, setMobileSearchTerm] = useState("");
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  
  // USER DATA STATE
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);

  const navigate = useNavigate();
  const searchBoxRef = useRef(null);
  const mobileSearchRef = useRef(null);

  // ---------------- CATEGORIES DATA ----------------
  const categoriesData = [
    {
      title: "Bakery & bread",
      items: [
        "Shop all",
        "Bread",
        "Pastries", 
        "Bakery cookies",
        "Cupcakes",
        "Buns & rolls"
      ]
    },
    {
      title: "Meat products",
      items: [
        "Shop all",
        "Fresh meat",
        "Processed meat",
        "Seafood",
        "Poultry products",
        "Prepared meat"
      ]
    },
    {
      title: "Vegetables",
      items: [
        "Shop all",
        "Leafy greens",
        "Root vegetables",
        "Allium vegetables",
        "Peppers and tomatoes",
        "Cruciferous",
        "Seasonal squashes",
        "Beans, peas & lentils"
      ]
    },
    {
      title: "Sauces and ketchup",
      items: [
        "Shop all",
        "Tomato-based sauces",
        "Salad dressing", 
        "Hot sauces"
      ]
    },
    {
      title: "Fresh fruits", 
      items: [
        "Shop all",
        "Citrus fruits",
        "Berries",
        "Tropical fruits",
        "Stone fruits",
        "Exotic fruits",
        "Melons"
      ]
    },
    {
      title: "Italian dinner",
      items: [
        "Shop all",
        "Pasta & sauces",
        "Italian cheese",
        "Italian meats",
        "Desserts & beverages"
      ]
    },
    {
      title: "Beverages",
      items: [
        "Shop all",
        "Soft drinks",
        "Juices",
        "Sports & energy drinks",
        "Tea and coffee",
        "Alcoholic beverages"
      ]
    },
    {
      title: "Daily & eggs",
      items: [
        "Shop all",
        "Chees",
        "Milk & yogurt",
        "Sour cream",
        "Eggs",
        "Butter & margarine"
      ]
    },
    {
      title: "Delivery",
      items: [
        "Set your address"
      ]
    }
  ];

  const featuredItems = [
    "St. Patrick's day",
    "Exotic fruits"
  ];

  // ---------------- DELIVERY / PICKUP STATE ----------------
  const [deliveryAddresses, setDeliveryAddresses] = useState([
    { id: 1, address: "567 Cherry Lane Apt B12 Sacramento, 95829" },
    { id: 2, address: "1901 Thornridge Cir. Shiloh, Hawaii, 81063" }
  ]);
  const [pickupAddresses] = useState([
    { id: 1, name: "Sacramento Supercenter", address: "8270 Delta Shores Cir S, Sacramento, CA 95832", open: "07:00 - 22:00" }
  ]);
  const [selectedDelivery, setSelectedDelivery] = useState(deliveryAddresses[0]?.id || null);
  const [selectedPickup, setSelectedPickup] = useState(pickupAddresses[0]?.id || null);

  const addDeliveryAddress = (newAddress) => {
    const id = deliveryAddresses.length + 1;
    setDeliveryAddresses([...deliveryAddresses, { id, address: newAddress }]);
    setSelectedDelivery(id);
    setShowForm(false);
  };

  // ---------------- HELPERS ----------------
  const toggleli = (menu) => {
    Setshow((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const isLoggedIn = !!localStorage.getItem("accessToken");

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setUserDropdown(false);
    setUser(null);
    navigate("/user");
    window.location.reload();
  };

  function isTokenValid(token) {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  // FETCH USER DATA FUNCTION
  const fetchUserData = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    
    setLoadingUser(true);
    try {
const response = await axios.get("https://freshcart-backend-4wrc.onrender.com/users/me", {
        headers: { 
          Authorization: `Bearer ${token}` 
        },
        withCredentials: true
      });
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("accessToken");
        setUser(null);
      }
    } finally {
      setLoadingUser(false);
    }
  };

  async function handleDelete(cartItemId) {
    const token = localStorage.getItem("accessToken");
    if (!token) { alert("Please login first!"); return; }
    try {
const res = await fetch(`https://freshcart-backend-4wrc.onrender.com/cart/${cartItemId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete on server");
      setCartItems(prev => prev.filter(item => item._id !== cartItemId));
    } catch (err) { console.error("Error removing cart item:", err); }
  }

  async function handleQuantityChange(cartItemId, newQuantity) {
    const token = localStorage.getItem("accessToken");
    if (!token) { alert("Please login first!"); return; }
    try {
const res = await fetch(`https://freshcart-backend-4wrc.onrender.com/cart/${cartItemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ quantity: newQuantity })
      });
      if (!res.ok) throw new Error("Failed to update quantity");
      const updatedCart = await res.json();
      setCartItems(updatedCart.products || []);
    } catch (err) { console.error("Error updating quantity:", err); }
  }

  // Calculate total cart items count
  const getCartItemsCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Handle user icon click
  const handleUserIconClick = () => {
    const isSmallScreen = window.innerWidth <= 348;
    
    if (isSmallScreen) {
      if (isLoggedIn) {
        navigate("/profile");
      } else {
        navigate("/user");
      }
    } else {
      const token = localStorage.getItem("accessToken");
      if (isTokenValid(token)) {
        if (!user && isLoggedIn) {
          fetchUserData();
        }
        setUserDropdown(!userDropdown);
      } else { 
        alert("Session expired"); 
        localStorage.removeItem("accessToken"); 
        setUser(null);
        navigate("/user"); 
      }
    }
  };

  // ---------------- EFFECTS ----------------
  useEffect(() => {
    // Fetch cart items on component mount
    const fetchCartOnMount = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      
      setLoadingCart(true);
      try {
const res = await fetch("https://freshcart-backend-4wrc.onrender.com/cart", {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          credentials: "include"
        });
        if (!res.ok) throw new Error("Failed to fetch cart");
        const data = await res.json();
        setCartItems(data.products || []);
      } catch (err) { console.error("Error fetching cart:", err); }
      finally { setLoadingCart(false); }
    };
    
    fetchCartOnMount();
  }, []);

  // Fetch user data when component mounts
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token && isTokenValid(token)) {
      fetchUserData();
    }
  }, []);

  useEffect(() => {
    if (menuOpen || cart || userDropdown || openAddress || categoriesOpen || mobileSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [menuOpen, cart, userDropdown, openAddress, categoriesOpen, mobileSearchOpen]);

  useEffect(() => {
    const handleScroll = () => setIsFixed(window.scrollY > 100);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Click outside handler for ALL dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // User dropdown
      if (userDropdown && !event.target.closest('.user-dropdown-container')) {
        setUserDropdown(false);
      }
      
      // Categories dropdown
      if (categoriesOpen && !event.target.closest('.categories-container')) {
        setCategoriesOpen(false);
      }
      
      // Search dropdown (desktop)
      if (searchDropdownOpen && searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setSearchDropdownOpen(false);
      }
      
      // Mobile search sidebar
      if (mobileSearchOpen && mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)) {
        setMobileSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userDropdown, categoriesOpen, searchDropdownOpen, mobileSearchOpen]);

  useEffect(() => {
    if (cart) {
      const token = localStorage.getItem("accessToken");
      const fetchCart = async () => {
        setLoadingCart(true);
        try {
const res = await fetch("https://freshcart-backend-4wrc.onrender.com/cart", {
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            credentials: "include"
          });
          if (!res.ok) throw new Error("Failed to fetch cart");
          const data = await res.json();
          setCartItems(data.products || []);
        } catch (err) { console.error("Error fetching cart:", err); }
        finally { setLoadingCart(false); }
      };
      fetchCart();
    }
  }, [cart]);

  // Desktop search effect
  useEffect(() => {
    if (!searchTerm) { 
      setSearchResults([]); 
      setSearchDropdownOpen(false);
      return; 
    }
    
    const fetchSearchResults = async () => {
      try {
const res = await fetch("https://freshcart-backend-4wrc.onrender.com/products");
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        const filtered = data.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
        setSearchResults(filtered);
        setSearchDropdownOpen(true);
      } catch (err) { console.error(err); }
    };
    
    const debounce = setTimeout(() => fetchSearchResults(), 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

  // Mobile search effect
  useEffect(() => {
    if (!mobileSearchTerm) { 
      setSearchResults([]); 
      return; 
    }
    
    const fetchSearchResults = async () => {
      try {
const res = await fetch("https://freshcart-backend-4wrc.onrender.com/products");
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        const filtered = data.filter(p => p.title.toLowerCase().includes(mobileSearchTerm.toLowerCase()));
        setSearchResults(filtered);
      } catch (err) { console.error(err); }
    };
    
    const debounce = setTimeout(() => fetchSearchResults(), 300);
    return () => clearTimeout(debounce);
  }, [mobileSearchTerm]);

  // ---------------- JSX ----------------
  return (
    <div className={`main ${isFixed ? "fixed" : ""}`}>
      <div className="navbar-cover">

        {/* LEFT */}
        <div className='lefti'>
          <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            <span></span><span></span><span></span>
          </button>
          <div className="nav-brand"><Link className="cart" to="/">Cartzilla</Link></div>
          
          {/* CATEGORIES DROPDOWN */}
          <div className="categories-container">
            <button 
              className="category-btn" 
              onClick={() => setCategoriesOpen(!categoriesOpen)}
            >
              <IoGridOutline size={20}/>Categories<MdKeyboardArrowDown />
            </button>
            
            {categoriesOpen && (
              <div className="categories-dropdown">
                <div className="categories-content">
                  <div className="categories-grid">
                    {/* Column 1 */}
                    <div className="category-column">
                      <div className="category-section">
                        <h4 className="category-title">Bakery & bread</h4>
                        <ul className="category-items">
                          {categoriesData[0].items.map((item, itemIndex) => (
                            <li key={itemIndex}>
                              <Link to="/all-products" onClick={() => setCategoriesOpen(false)}>
                                {item}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="category-section">
                        <h4 className="category-title">Meat products</h4>
                        <ul className="category-items">
                          {categoriesData[1].items.map((item, itemIndex) => (
                            <li key={itemIndex}>
                              <Link to="/all-products" onClick={() => setCategoriesOpen(false)}>
                                {item}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Column 2 */}
                    <div className="category-column">
                      <div className="category-section">
                        <h4 className="category-title">Vegetables</h4>
                        <ul className="category-items">
                          {categoriesData[2].items.map((item, itemIndex) => (
                            <li key={itemIndex}>
                              <Link to="/all-products" onClick={() => setCategoriesOpen(false)}>
                                {item}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="category-section">
                        <h4 className="category-title">Sauces and ketchup</h4>
                        <ul className="category-items">
                          {categoriesData[3].items.map((item, itemIndex) => (
                            <li key={itemIndex}>
                              <Link to="/all-products" onClick={() => setCategoriesOpen(false)}>
                                {item}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Column 3 */}
                    <div className="category-column">
                      <div className="category-section">
                        <h4 className="category-title">Fresh fruits</h4>
                        <ul className="category-items">
                          {categoriesData[4].items.map((item, itemIndex) => (
                            <li key={itemIndex}>
                              <Link to="/all-products" onClick={() => setCategoriesOpen(false)}>
                                {item}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="category-section">
                        <h4 className="category-title">Italian dinner</h4>
                        <ul className="category-items">
                          {categoriesData[5].items.map((item, itemIndex) => (
                            <li key={itemIndex}>
                              <Link to="/all-products" onClick={() => setCategoriesOpen(false)}>
                                {item}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Column 4 */}
                    <div className="category-column">
                      <div className="category-section">
                        <h4 className="category-title">Beverages</h4>
                        <ul className="category-items">
                          {categoriesData[6].items.map((item, itemIndex) => (
                            <li key={itemIndex}>
                              <Link to="/all-products" onClick={() => setCategoriesOpen(false)}>
                                {item}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="category-section">
                        <h4 className="category-title">Daily & eggs</h4>
                        <ul className="category-items">
                          {categoriesData[7].items.map((item, itemIndex) => (
                            <li key={itemIndex}>
                              <Link to="/all-products" onClick={() => setCategoriesOpen(false)}>
                                {item}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="category-section">
                        <h4 className="category-title">Delivery</h4>
                        <ul className="category-items">
                          {categoriesData[8].items.map((item, itemIndex) => (
                            <li key={itemIndex}>
                              <Link to="/all-products" onClick={() => setCategoriesOpen(false)}>
                                {item}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="categories-featured">
                    <div className="featured-divider"></div>
                    <div className="featured-items">
                      {featuredItems.map((item, index) => (
                        <div key={index} className="featured-item">
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MENU SIDEBAR */}
        <div className={`sidebar ${menuOpen ? "open" : ""}`}>
          <div className="sidebar-header">
            <h2>Browse Cartzilla</h2>
            <button className="close-btn" onClick={() => setMenuOpen(false)}>×</button>
          </div>
          <ul className="sidebar-menu">
            <Link to="/" className='accory' onClick={() => setMenuOpen(false)}>Home</Link>
            
            <div onClick={() => toggleli("shop")} className='accory'>Shop</div>
            {show.shop && (
              <div className={`accoryy open`}>
                <li>
                  <Link to="/all-products" onClick={() => setMenuOpen(false)}>All Products</Link>
                </li>
                <li>
                  <Link to="/recipes" onClick={() => setMenuOpen(false)}>Recipes</Link>
                </li>
                <li>
                  <Link to="/categories" onClick={() => setMenuOpen(false)}>Categories</Link>
                </li>
              </div>
            )}
            
            <div onClick={() => toggleli("account")} className='accory'>Account</div>
            {show.account && (
              <div className={`accoryy open`}>
                <li>
                  <Link to="/user" onClick={() => setMenuOpen(false)}>Login/Signup</Link>
                </li>
                <li>
                  <Link to="/profile" onClick={() => setMenuOpen(false)}>My Profile</Link>
                </li>
                <li>
                  <Link to="/orders" onClick={() => setMenuOpen(false)}>My Orders</Link>
                </li>
                <li>
                  <Link to="/wishlist" onClick={() => setMenuOpen(false)}>Wishlist</Link>
                </li>
              </div>
            )}
            
            <div onClick={() => toggleli("pages")} className='accory'>Pages</div>
            {show.pages && (
              <div className={`accoryy open`}>
                <li>
                  <Link to="/about" onClick={() => setMenuOpen(false)}>About Us</Link>
                </li>
                <li>
                  <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
                </li>
                <li>
                  <Link to="/faq" onClick={() => setMenuOpen(false)}>FAQ</Link>
                </li>
                <li>
                  <Link to="/terms" onClick={() => setMenuOpen(false)}>Terms & Conditions</Link>
                </li>
                <li>
                  <Link to="/privacy" onClick={() => setMenuOpen(false)}>Privacy Policy</Link>
                </li>
              </div>
            )}
          </ul>
        </div>

        {/* SEARCH */}
        <div className="search-box" ref={searchBoxRef}>
          <input 
            type="search" 
            className="nav-input" 
            placeholder="Search for products"
            value={searchTerm} 
            onChange={(e)=>setSearchTerm(e.target.value)}
            onFocus={() => {
              if (searchResults.length > 0) {
                setSearchDropdownOpen(true);
              }
            }}
          />
          <div className='searchy'><RiSearchLine className="icon-s"/></div>
          
          {/* SEARCH RESULTS DROPDOWN */}
          {searchDropdownOpen && searchResults.length > 0 && (
            <div className="search-results-dropdown">
              {searchResults.map(p => (
                <Link 
                  key={p._id} 
                  to={`/product/${p._id}`} 
                  className="search-result-item" 
                  onClick={() => {
                    setSearchTerm("");
                    setSearchDropdownOpen(false);
                  }}
                >
                  <div className='search-item'>
                    {p.title}
                    <img className='srch-image' src={p.images[0]} alt=""/>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className='right-side'>
          <div className="delivery-navbar" onClick={() => setOpenAddress(true)}>
            <div className="st">Delivery</div>
            <div className="address"><div className="dooja">Set your address</div><HiMiniChevronDown /></div>
          </div>

          {/* DELIVERY PICKUP SIDEBAR */}
          <DeliverySidebar
            openAddress={openAddress}
            setOpenAddress={setOpenAddress}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            deliveryAddresses={deliveryAddresses}
            setDeliveryAddresses={setDeliveryAddresses}
            pickupAddresses={pickupAddresses}
            selectedDelivery={selectedDelivery}
            setSelectedDelivery={setSelectedDelivery}
            selectedPickup={selectedPickup}
            setSelectedPickup={setSelectedPickup}
            showForm={showForm}
            setShowForm={setShowForm}
            addDeliveryAddress={addDeliveryAddress}
          />

          {/* USER & CART */}
          <div className="right-corner">
            {/* MOBILE SEARCH ICON */}
            <div className="right-div mobile-search-icon" onClick={() => setMobileSearchOpen(true)}>
              <RiSearchLine size={18}/>
            </div>

            <div className="right-div"><BsBrightnessHigh size={18}/></div>
            <div className="right-div-l"><CiLocationOn size={22}/></div>
            
            {/* USER DROPDOWN */}
            <div className="right-div user user-dropdown-container">
              {isLoggedIn ? (
                <div 
                  className="user-icon-wrapper"
                  onClick={handleUserIconClick}
                >
                  <FaRegUser size={16} className='user-icon'/>
                  <FaChevronDown size={10} className="dropdown-arroww" />
                </div>
              ) : (
                <Link to="/user" className="user-login-link">
                  <FaRegUser size={16} />
                </Link>
              )}
              
              {/* USER DROPDOWN MENU */}
              {userDropdown && window.innerWidth > 348 && (
                <div className="user-dropdown-menu">
                  <div className="dropdown-header">
                    <div className="user-avatar">
                      <FaRegUser size={20} />
                    </div>
                    <div className="user-info">
                      {loadingUser ? (
                        <div className="user-loading">Loading...</div>
                      ) : user ? (
                        <>
                          <div className="user-name">
                            Welcome {user.name || user.firstName || user.email.split('@')[0]}
                          </div>
                          <div className="user-email">{user.email}</div>
                        </>
                      ) : (
                        <>
                          <div className="user-name">Welcome User</div>
                          <div className="user-email">user@example.com</div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="dropdown-divider"></div>
                  
                  <Link 
                    to="/profile" 
                    className="dropdown-item"
                    onClick={() => setUserDropdown(false)}
                  >
                    <span className="item-icon"></span>
                    My Profile
                  </Link>
                  
                  <Link 
                    to="/wishlist" 
                    className="dropdown-item"
                    onClick={() => setUserDropdown(false)}
                  >
                    <span className="item-icon"></span>
                    My Wishlist
                  </Link>
                  
                  <Link 
                    to="/orders" 
                    className="dropdown-item"
                    onClick={() => setUserDropdown(false)}
                  >
                    <span className="item-icon"></span>
                    My Orders
                  </Link>
                  
                  <div className="dropdown-divider"></div>
                  
                  <button 
                    className="dropdown-item logout-btn"
                    onClick={handleLogout}
                  >
                    <span className="item-icon"></span>
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* CART ICON */}
            <div onClick={()=>setOpenCart(true)} className="right-div cart-icon">
              <CiShoppingCart size={24}/>
              {cartItems.length > 0 && (
                <span className="cart-badge">{getCartItemsCount()}</span>
              )}
            </div>
          </div>

          {/* CART SIDEBAR */}
        {/* CART SIDEBAR */}
<div className={`cart-side ${cart? "open":""}`}>
  <div className="cart-header">
    <h2>Your Cart ({getCartItemsCount()} items)</h2>
    <button onClick={()=>setOpenCart(false)}>×</button>
  </div>
  
  <div className="cart-content">
    {loadingCart ? (
      <div className="cart-loading">
        <div className="loading-spinner"></div>
        <p>Loading your cart...</p>
      </div>
    ) : cartItems.length === 0 ? (
      <div className="empty-cart">
        <div className="empty-cart-icon">
          <CiShoppingCart size={48} />
        </div>
        <p>Your cart is empty</p>
        <Link 
          to="/all-products" 
          className="continue-shopping"
          onClick={() => setOpenCart(false)}
        >
          Continue Shopping
        </Link>
      </div>
    ) : (
      <div className="cart-items">
        {cartItems.map(item => {
          const product = item.productId; 
          if(!product) return null;
          
          const price = product.discountPrice || product.price;
          const total = (price * item.quantity).toFixed(2);
          
          return (
            <div key={item._id} className="cart-item">
              <img 
                src={product.images?.[0] || "/fallback.png"} 
                alt={product.title}
                onError={(e) => {
                  e.target.src = "/fallback.png";
                }}
              />
              <div className="cart-item-info">
                <h4 className="cart-item-title">{product.title}</h4>
                <p className="cart-item-price">${price.toFixed(2)}</p>
                
                <div className="quantity-control">
                  <button 
                    onClick={()=>handleQuantityChange(item._id, item.quantity-1)} 
                    disabled={item.quantity<=1}
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={()=>handleQuantityChange(item._id, item.quantity+1)}>
                    +
                  </button>
                </div>
                
                <div className="cart-item-actions">
                  <span className="cart-item-total">Total: ${total}</span>
                  <button 
                    className="delete-btn"
                    onClick={()=>handleDelete(item._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )}
  </div>
  
  {cartItems.length > 0 && (
    <div className="cart-footer">
      <div className="cart-summary">
        <span className="cart-total">Total Amount:</span>
        <span className="cart-amount">
          ${cartItems.reduce((total, item) => {
            const product = item.productId;
            const price = product?.discountPrice || product?.price || 0;
            return total + (price * item.quantity);
          }, 0).toFixed(2)}
        </span>
      </div>
      <button 
        className="checkout-btn" 
        onClick={() => {
          const selectedAddress = activeTab === "delivery" 
            ? deliveryAddresses.find(a => a.id === selectedDelivery) 
            : pickupAddresses.find(a => a.id === selectedPickup);
          
          navigate("/checkout", { 
            state: { 
              selectedAddress, 
              type: activeTab,
              cartItems: cartItems
            } 
          });
          setOpenCart(false);
        }}
      >
        Proceed to Checkout
      </button>
    </div>
  )}
</div>
        </div>

        {/* MOBILE SEARCH SIDEBAR */}
        <div className={`mobile-search-sidebar ${mobileSearchOpen ? "open" : ""}`} ref={mobileSearchRef}>
          <div className="mobile-search-header">
            <button className="close-btn" onClick={() => setMobileSearchOpen(false)}>
              <RiCloseLine size={20} />
            </button>
            <input 
              type="text" 
              className="mobile-search-input" 
              placeholder="Search for products..."
              value={mobileSearchTerm}
              onChange={(e) => setMobileSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <div className="mobile-search-results">
            {searchResults.length > 0 ? (
              searchResults.map(p => (
                <Link 
                  key={p._id} 
                  to={`/product/${p._id}`} 
                  className="search-result-item" 
                  onClick={() => {
                    setMobileSearchTerm("");
                    setMobileSearchOpen(false);
                  }}
                >
                  <div className='search-item'>
                    {p.title}
                    <img className='srch-image' src={p.images[0]} alt=""/>
                  </div>
                </Link>
              ))
            ) : mobileSearchTerm ? (
              <p>No products found</p>
            ) : null}
          </div>
        </div>

        {/* OVERLAYS */}
        {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)}></div>}
        {openAddress && <div className="overlay" onClick={()=>setOpenAddress(false)}></div>}
        {cart && <div className="overlay" onClick={()=>setOpenCart(false)}></div>}
        {categoriesOpen && <div className="overlay" onClick={() => setCategoriesOpen(false)}></div>}
        {mobileSearchOpen && <div className="overlay" onClick={() => setMobileSearchOpen(false)}></div>}
      </div>
    </div>
  )
};

export default Navbar;