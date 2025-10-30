import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import './wishlist.css';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('accessToken');

  // Fetch wishlist data
useEffect(() => {
  const fetchWishlist = async () => {
    if (!token) {
      setError('Please login to view your wishlist');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
const response = await fetch('https://freshcart-backend-4wrc.onrender.com/wishlist', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    

      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data.wishlist?.products || []);
      } else {
        setError('Failed to fetch wishlist');
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError('Error loading wishlist');
    } finally {
      setLoading(false);
    }
  };

  fetchWishlist();
}, [token]);
useEffect(() => {
  if (wishlistItems.length > 4) {
    alert("momos");
    
  }
  return ;
}, [wishlistItems]);

  // Remove item from wishlist
  const removeFromWishlist = async (productId) => {
    if (!token) return;

    try {
const response = await fetch(`https://freshcart-backend-4wrc.onrender.com/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Remove from local state
        setWishlistItems(prev => 
          prev.filter(item => item.productId._id !== productId)
        );
      } else {
        alert('Failed to remove from wishlist');
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      alert('Error removing from wishlist');
    }
  };

  // Move to cart
  const moveToCart = async (product) => {
    if (!token) {
      alert('Please login to add items to cart');
      return;
    }

    try {
const response = await fetch('https://freshcart-backend-4wrc.onrender.com/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product.productId._id,
          quantity: 1
        })
        
      });

      if (response.ok) {
        // Remove from wishlist after moving to cart
        await removeFromWishlist(product.productId._id);
        alert('Item moved to cart!');
      } else {
        alert('Failed to add to cart');
      }
    } catch (err) {
      console.error('Error moving to cart:', err);
      alert('Error moving to cart');
    }
  };

  // Clear entire wishlist
  const clearWishlist = async () => {
    if (!token || wishlistItems.length === 0) return;

    if (!window.confirm('Are you sure you want to clear your entire wishlist?')) {
      return;
    }

    try {
const response = await fetch('https://freshcart-backend-4wrc.onrender.com/wishlist', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setWishlistItems([]);
        alert('Wishlist cleared successfully');
      } else {
        alert('Failed to clear wishlist');
      }
    } catch (err) {
      console.error('Error clearing wishlist:', err);
      alert('Error clearing wishlist');
    }
  };

  if (loading) {
    return (
      <div className="wishlist-container">
        <div className="loading">Loading your wishlist...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wishlist-container">
        <div className="error-message">
          {error}
          {!token && (
            <Link to="/login" className="login-link">
              Login here
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-container">
      <div className="wishlist-header">
        <h1>My Wishlist</h1>
        {wishlistItems.length > 0 && (
          <button 
            onClick={clearWishlist}
            className="clear-wishlist-btn"
          >
            Clear All
          </button>
        )}
      </div>

      {wishlistItems.length === 0 ? (
        <div className="empty-wishlist">
          <AiOutlineHeart className="empty-heart-icon" />
          <h2>Your wishlist is empty</h2>
          <p>Start adding items you love to your wishlist!</p>
          <Link to="/home" className="shop-now-btn">
            Start Shopping
          </Link>
        </div>
      ) : (
        <>
          <p className="wishlist-count">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} in wishlist
          </p>
          
          <div className="wishlist-grid">
            {wishlistItems.map((item) => (
              <div key={item.productId._id} className="wishlist-item">
                <div className="wishlist-item-image">
<Link to={`/product/${item?.productId?._id}`}>
                    <img 
                      src={item.productId.images?.[0] || '/fallback.png'} 
                      alt={item.productId.title}
                    />
                  </Link>
                  
                  <button
                    onClick={() => removeFromWishlist(item.productId._id)}
                    className="remove-wishlist-btn"
                    title="Remove from wishlist"
                  >
                    <AiFillHeart className="remove-icon" />
                  </button>

                  {item.productId.discount && (
                    <span className="discount-badge">
                      {item.productId.discount}
                    </span>
                  )}
                </div>

                <div className="wishlist-item-info">
                  <Link 
                    to={`/product/${item.productId._id}`}
                    className="product-title"
                  >
                    {item.productId.title}
                  </Link>
                  
                  <p className="product-weight">{item.productId.weight}</p>
                  
                  <div className="price-section">
                    <span className="current-price">
                      ${item.productId.discountPrice || item.productId.price}
                    </span>
                    {item.productId.oldPrice && (
                      <span className="old-price">
                        ${item.productId.oldPrice}
                      </span>
                    )}
                  </div>

                  <div className="wishlist-actions">
                    <button
                      onClick={() => moveToCart(item)}
                      className="move-to-cart-btn"
                    >
                      Move to Cart
                    </button>
                    
                    <button
                      onClick={() => removeFromWishlist(item.productId._id)}
                      className="remove-btn"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Wishlist;