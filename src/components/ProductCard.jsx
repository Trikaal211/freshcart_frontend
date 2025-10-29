import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import CartContext from "./CartContext.jsx";
import "./productCard.css";

const ProductCard = ({ product }) => {
  const { addToCart, cartItems } = useContext(CartContext);
  const [adding, setAdding] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("accessToken");

  // Check if product is in wishlist on component mount
useEffect(() => {
  if (!token || !product?._id) return;

  const checkWishlistStatus = async () => {
    try {
const response = await fetch(`https://freshcart-backend-4wrc.onrender.com/wishlist/check/${product._id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setIsInWishlist(data.isInWishlist);
      }
    } catch (error) {
      console.error("Error checking wishlist:", error);
    }
  };

  checkWishlistStatus();
}, [product?._id, token]);

  const handleAdd = async () => {
    if (!product?._id) {
      console.error("Product ID missing");
      return;
    }
    
    setAdding(true);
    try {
      await addToCart(product._id.toString(), 1);
    } catch (err) {
      console.error("Add to cart error:", err);
    }
    setAdding(false);
  };

  const handleWishlist = async () => {
    // If user is not logged in, redirect to login
    if (!token) {
      alert("Please login to add items to wishlist");
      navigate("/login");
      return;
    }

    if (!product?._id) {
      console.error("Product ID missing");
      return;
    }

    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        // Remove from wishlist
        await removeFromWishlist();
      } else {
        // Add to wishlist
        await addToWishlist();
      }
    } catch (err) {
      console.error("Wishlist error:", err);
    }
    setWishlistLoading(false);
  };

  const addToWishlist = async () => {
    try {
const response = await fetch("https://freshcart-backend-4wrc.onrender.com/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ productId: product._id })
      });

      if (response.ok) {
        setIsInWishlist(true);
        // Optional: Show success message
        console.log("Product added to wishlist");
      } else {
        const error = await response.json();
        console.error("Failed to add to wishlist:", error.message);
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
    }
  };

  const removeFromWishlist = async () => {
    try {
const response = await fetch(`https://freshcart-backend-4wrc.onrender.com/wishlist/${product._id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        setIsInWishlist(false);
        // Optional: Show success message
        console.log("Product removed from wishlist");
      } else {
        const error = await response.json();
        console.error("Failed to remove from wishlist:", error.message);
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    }
  };

  const isInCart = cartItems?.some(item => 
    item.productId?._id === product._id || 
    item.productId === product._id
  );

  return (
    <div className="product-card">
      <div className="img-wrapper">
        <Link to={`/product/${product._id}`} className="product-card-link">
          <img src={product.images[0]} alt={product.title} />
        </Link>

        {/* wishlist top-right */}
        <div 
          className={`wish ${wishlistLoading ? 'loading' : ''}`} 
          onClick={handleWishlist}
        >
          {isInWishlist ? (
            <AiFillHeart className="wishlist filled" />
          ) : (
            <AiOutlineHeart className="wishlist" />
          )}
        </div>

        {/* add-to-cart button right bottom over image */}
        <div className="add">
          <button 
            onClick={handleAdd} 
            disabled={adding} 
            className={`add-btn ${isInCart ? 'in-cart' : ''}`}
          >
            {adding ? "..." : isInCart ? "✓" : "+"}
          </button>
        </div>

        {/* discount tag top-left if available */}
        {product.discount && <span className="discount">{product.discount}</span>}
      </div>

      {/* product details */}
      <div className="product-info">
        <h6 className="price">
          {product.price}{" "}
          {product.oldPrice && (
            <span className="old-price">{product.oldPrice}</span>
          )}
        </h6>
        <h3 className="name">{product.title}</h3>
        <p className="weight">{product.weight}</p>
      </div>
    </div>
  );
};

export default ProductCard;