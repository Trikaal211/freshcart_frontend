import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import './navbar.css';

import { IoGridOutline } from "react-icons/io5";
import { MdKeyboardArrowDown } from "react-icons/md";
import { HiMiniChevronDown } from "react-icons/hi2";
import { RiSearchLine } from "react-icons/ri";
import { BsBrightnessHigh } from "react-icons/bs";
import { FaRegUser } from "react-icons/fa";
import { CiLocationOn } from "react-icons/ci";
import { CiShoppingCart } from "react-icons/ci";
                    
const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cart, setOpenCart] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [loadingCart, setLoadingCart] = useState(false);
  const [openAddress, setOpenAddress] = useState(false);
  const [showForm, setShowForm] = useState(false); 
  const [activeTab, setActiveTab] = useState("delivery"); 
  const [show, Setshow] = useState({
    home: false,         
    shop: false,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isFixed, setIsFixed] = useState(false);
  
  // NEW: User dropdown state
  const [userDropdown, setUserDropdown] = useState(false);
  const navigate = useNavigate();

  const toggleli = (menu) => {
    Setshow((prev) => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  // Check if user is logged in  
  const isLoggedIn = !!localStorage.getItem("accessToken");

  // NEW: Logout function
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setUserDropdown(false);
    navigate("/user");
    // Optional: reload to reset all states
    window.location.reload();
  };

  useEffect(() => {
    if (menuOpen || cart || userDropdown || openAddress) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [menuOpen, cart, userDropdown, openAddress]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsFixed(true);
      } else {
        setIsFixed(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdown && !event.target.closest('.user-dropdown-container')) {
        setUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userDropdown]);

  // Fetch cart items when cart sidebar opens
  const token = localStorage.getItem("accessToken");
  console.log(token)

  // Fetch cart items when cart sidebar opens
  useEffect(() => {
    if (cart) {
      const fetchCart = async () => {
        setLoadingCart(true);
        try {
          const res = await fetch("http://localhost:3000/cart", {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // 🔹 added token  
            },
              credentials: "include"
          });
          if (!res.ok) throw new Error("Failed to fetch cart");
          const data = await res.json();
          
          setCartItems(data.products || []);
        } catch (err) {
          console.error("Error fetching cart:", err);
        } finally {
          setLoadingCart(false);
        }
      };
      fetchCart();
    }
  }, [cart, token]);

  // 🔴 FIXED: handleDelete function with token
  async function handleDelete(cartItemId) {
    if (!token) {
      alert("Please login first!");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/cart/${cartItemId}`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` // 🔹 added token
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete on server");
      }

      setCartItems((prev) => prev.filter((item) => item._id !== cartItemId));

    } catch (err) {
      console.error("Error removing cart item:", err);
    }
  }

  // quantity update function
  async function handleQuantityChange(cartItemId, newQuantity) {
    if (!token) {
      alert("Please login first!");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/cart/${cartItemId}`, {
        method: "PUT",   // ✅ PUT use karo
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });

      if (!res.ok) {
        throw new Error("Failed to update quantity");
      }

      const updatedCart = await res.json();

      // ✅ backend se full updated cart aa raha hai
      setCartItems(updatedCart.products || []);
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  }

  useEffect(() => {
    if (!searchTerm) {
      setSearchResults([]);
      return;
    }
    const fetchSearchResults = async () => {
      try {
        const res = await fetch("http://localhost:3000/products");
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        const filtered = data.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));
        setSearchResults(filtered);
      } catch (err) { console.error(err); }
    };
    const debounce = setTimeout(() => fetchSearchResults(), 300);
    return () => clearTimeout(debounce);
  }, [searchTerm]);

function isTokenValid(token) {
  if (!token) return false;
  try {
    const decoded = jwtDecode(token); // ✅ correct function name
    console.log("Decoded token:", decoded);
    const currentTime = Date.now() / 1000; // seconds
    return decoded.exp > currentTime; // compare expiry properly
  } catch (err) {
    console.error("Token decode failed:", err);
    return false; // invalid token
  }
}


  return (
    <div className={`main ${isFixed ? "fixed" : ""}`}>
      <div className="navbar-cover">
        <div className='left'>
          <button className="menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}>
            <span></span>
            <span></span>
            <span></span>
          </button>

        <div className="nav-brand">
          <Link className="cart" to="/">Cartzilla</Link>
        </div>

          <div className="category-btn">
            <IoGridOutline size={20} className="catagory-icon" />
            Categories
            <MdKeyboardArrowDown className="cat-icon" />
          </div>
        </div>

        <div className={`sidebar ${menuOpen ? "open" : ""}`}>
          <div className="sidebar-header">
            <h2>Browse Cartzilla</h2>
            <button className="close-btn" onClick={() => setMenuOpen(false)}>×</button>
          </div>

          <ul className="sidebar-menu">
            <div onClick={() => toggleli("home")} className='accory'>Home</div>
            {show.home ? (
              <div className={`accoryy ${show.home ? "open" : ""}`}>
                <li>hey</li><li>hey</li><li>hey</li><li>hey</li>
              </div>
            ) : false}

            <div onClick={() => toggleli("shop")} className='accory'>Shop</div>
            {show.shop ? (
              <div className={`accoryy ${show.shop ? "open" : ""}`}>
                <li>hey</li><li>hey</li><li>hey</li><li>hey</li>
              </div>
            ) : false}

            <div className='accory'>Account</div>
            <div className='accory'>Pages</div>
            <div className='accory'>Docs</div>
            <div className='accory'>Components</div>
          </ul>
        </div>

        {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)}></div>}
   
        <div className="search-box">
          <input 
            type="search" 
            className="nav-input" 
            placeholder="Search for products" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className='searchy'><RiSearchLine className="icon-s" /></div>
          {searchResults.length > 0 && (
            <div className="search-results-dropdown">
              {searchResults.map(product => (
                <Link 
                  key={product._id} 
                  to={`/product/${product._id}`} 
                  className="search-result-item"
                  onClick={() => setSearchTerm("")}
                >
                  <div className='search-item'>
                  {product.title}
                  <img className='srch-image' src={product.images[0]} alt="" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className='right-side'>
          <div className="delivery-navbar" onClick={() => setOpenAddress(true)}>
            <div className="st">Delivery</div>
            <div className="address">
              <div className="dooja">Set your address</div>
              <HiMiniChevronDown size={20} className="address-icon" />
            </div>
          </div>

          <div className={`address-sidebar ${openAddress ? "open" : ""}`}>
            <div className="address-header">
              <div className='address-header-top'>
                <h3>Delivery options</h3>
                <button className="close-btn" onClick={() => {
                  setOpenAddress(false);
                  setShowForm(false); 
                  setActiveTab("delivery");
                }}>×</button>
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

            {/* ---------- DELIVERY CONTENT ---------- */}
            {activeTab === "delivery" && !showForm && (
              <div className="address-body">
                <div className='address'>
                  <label className="address-option">
                    <input type="radio" name="address" defaultChecked />
                    <span>567 Cherry Lane Apt B12 Sacramento, 95829</span>
                  </label>
                  <div>
                  <button className="remove-btn">×</button>
                  </div>
                </div>
                <div className='address'>
                  <label className="address-option">
                    <input type="radio" name="address" />
                    <span>1901 Thornridge Cir. Shiloh, Hawaii, 81063</span>
                  </label>
 <div>
                  <button className="remove-btn">×</button>
                  </div>                </div>
                <div className='address'>
                  <label className="address-option">
                    <input type="radio" name="address" />
                    <span>3517 W. Gray St. Utica, Pennsylvania, 57867</span>
                  </label>
 <div>
                  <button className="remove-btn">×</button>
                  </div>                </div>

                <div className="add-address" onClick={() => setShowForm(true)}>
                  + Add delivery address
                </div>
                <div className='cofirm-address'>
                  <button>Confirm address</button>
                </div>
              </div>
            )}

            {/* ---------- DELIVERY ADD FORM ---------- */}
            {activeTab === "delivery" && showForm && (
              <div className="address-form">
                <div className="back-btn" onClick={() => setShowForm(false)}>
                  ← Back to my addresses
                </div>

                <h4>Add an address to start ordering</h4>
                <button className="map-btn"> Find on map</button>

                <form>
                  <select required>
                    <option value="">Select state</option>
                    <option>California</option>
                    <option>Texas</option>
                  </select>

                  <input type="text" placeholder="Postcode *" required />
                  <select required>
                    <option value="">Select city</option>
                    <option>Sacramento</option>
                    <option>Austin</option>
                  </select>
                  <input type="text" placeholder="Street address *" required />

                  <button type="submit" className="confirm-btn">
                    Confirm address
                  </button>
                </form>
              </div>
            )}

            {/* ---------- PICKUP CONTENT ---------- */}
            {activeTab === "pickup" && !showForm && (
              <div className="address-body">
                <div className='address'>
                  <label className="address-option">
                    <input type="radio" name="pickup" defaultChecked />
                    <div>
                      <strong>Sacramento Supercenter</strong>
                      <div>8270 Delta Shores Cir S, Sacramento, CA 95832</div>
                      <div>Open: <b>07:00 - 22:00</b></div>
                    </div>
                  </label>
                  <button className="remove-btn">×</button>
                </div>

                <div className='address'>
                  <label className="address-option">
                    <input type="radio" name="pickup" />
                    <div>
                      <strong>West Sacramento Supercenter</strong>
                      <div>755 Riverpoint Ct, West Sacramento, CA 95605</div>
                      <div>Open: <b>07:00 - 21:00</b></div>
                    </div>
                  </label>
                  <button className="remove-btn">×</button>
                </div>

                <div className='address'>
                  <label className="address-option">
                    <input type="radio" name="pickup" />
                    <div>
                      <strong>Rancho Cordova Supercenter</strong>
                      <div>10655 Folsom Blvd, Rancho Cordova, CA 95670</div>
                      <div>Open: <b>08:00 - 23:00</b></div>
                    </div>
                  </label>
                  <button className="remove-btn">×</button>

                </div>

                <div onClick={()=>setShowForm(true)} className="add-address">
                  + Add store address
                </div>
                <div className='cofirm-address'>
                  <button>Confirm address</button>
                </div>
              </div>
            )}
            {activeTab === "pickup" && showForm && (
              <>
                <div onClick={()=>setShowForm(false)}>back</div>
                <div>enter store address </div>
              </>
            )}
          </div>

          {openAddress && <div className="overlay" onClick={() => setOpenAddress(false)}></div>}

          <div className="right-corner">
            <div className="right-div"><BsBrightnessHigh size={18} /></div>
            <div className="right-div-l"><CiLocationOn size={22} /></div>
            
            {/* UPDATED USER ICON WITH DROPDOWN */}
            <div className="right-div user user-dropdown-container">
              {isLoggedIn ? (
                <>
                 <div 
  className="user-icon-wrapper"
  onClick={() => {
    const token = localStorage.getItem("accessToken");
    if (isTokenValid(token)) {
      setUserDropdown(!userDropdown);
    } else {
      alert("Session expired. Please login again.");
      localStorage.removeItem("accessToken");
      navigate("/user");
    }
  }}
>
  <FaRegUser size={18} />
</div>
                  
                  {/* USER DROPDOWN MENU */}
                  {userDropdown && (
                    <div className="user-dropdown">
                      <Link 
                        to="/profile" 
                        className="dropdown-item"
                        onClick={() => setUserDropdown(false)}
                      >
                        My Profile
                      </Link>
                          <Link 
      to="/wishlist" 
      className="dropdown-item"
      onClick={() => setUserDropdown(false)}
    >
      My Wishlist
    </Link>

                      <Link 
                        to="/orders" 
                        className="dropdown-item"
                        onClick={() => setUserDropdown(false)}
                      >
                        My Orders
                      </Link>
                      
                      <button 
                        className="dropdown-item logout-btn"
                        onClick={handleLogout}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link to="/user">
                  <FaRegUser size={18} />
                </Link>
              )}
            </div>

            <div onClick={()=>setOpenCart(true)}  className="right-div">
              <CiShoppingCart size={24} />
            </div>
          </div>
      
          {/* --------- MERGED CART SIDE --------- */}
          <div className={`cart-side ${cart? "open" : ""}`}>
            <div className="cart-header">
              <h2>Your Cart</h2>
              <button onClick={()=>setOpenCart(false)}>×</button>
            </div>

            {loadingCart ? (
              <p>Loading cart...</p>
            ) : cartItems.length === 0 ? (
              <p>Your cart is empty</p>
            ) : (
              <div className="cart-items">
            {cartItems.map((item) => {
  const product = item.productId;  // populated product
  if (!product) return null;       // agar null mila toh skip karo

  return (
    <div key={item._id} className="cart-item">
      <img 
        src={product.images?.[0] || "/fallback.png"} 
        alt={product.title} 
      />
      <div className="cart-item-info">
        <h4>{product.title}</h4>
        <div className="quantity-control">
<button 
  onClick={() => handleQuantityChange(item._id, item.quantity - 1)} 
  disabled={item.quantity <= 1}
>
  -
</button>

<span>{item.quantity}</span>

<button 
  onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
>
  +
</button>
</div>
        <p>Qty: {item.quantity}</p>
<p>Total: ${( (product.discountPrice || product.price) * item.quantity ).toFixed(2)}</p>
      </div>
      {/* 🔴 FIXED delete button */}
      <button onClick={() => handleDelete(item._id)}>delete</button>
    </div>
  );
})}
              </div>
            )}
            {cartItems.length>0 &&<button className="checkout-btn">Go to Checkout</button>}
          </div>
          {cart && <div className="overlay" onClick={() => setOpenCart(false)}></div>}
        </div>
      </div>
    </div>
  )
}

export default Navbar;