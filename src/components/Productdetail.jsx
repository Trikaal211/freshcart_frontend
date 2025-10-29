import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import CartContext from "./CartContext.jsx";
import "./productDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
const res = await fetch(`https://freshcart-backend-4wrc.onrender.com/products/${id}`);
        const data = await res.json();
        setProduct(data);
        setMainImage(data.images?.[0]);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) return <div>Loading...</div>;

  return (
    <div className="product-detail-wrapper">
      {/* 🖼️ LEFT - Images */}
      <div className="product-images">
        <div className="thumbnails">
          {product.images?.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`thumb-${i}`}
              onClick={() => setMainImage(img)}
              className={mainImage === img ? "active" : ""}
            />
          ))}
        </div>

        <div className="main-image">
          <img src={mainImage} alt={product.title} />
          {product.discountPrice && (
            <span className="discount-badge">
              {Math.round(
                ((product.price - product.discountPrice) / product.price) * 100
              )}
              % OFF
            </span>
          )}
        </div>
      </div>

      {/* 📄 RIGHT - Product Info */}
      <div className="product-info">
        <span className="category">{product.category}</span>
        <h1>{product.title}</h1>
        <p className="subtitle">{product.subtitle}</p>

        <div className="ratings">
          <span className="stars">⭐⭐⭐⭐⭐</span>
          <span className="rating-text">4.8 (234 Reviews)</span>
        </div>

        <div className="price-section">
          <h2>₹{product.discountPrice || product.price}</h2>
          {product.discountPrice && (
            <span className="old-price">₹{product.price}</span>
          )}
          {product.discountPrice && (
            <span className="discount-percent">
              {Math.round(
                ((product.price - product.discountPrice) / product.price) * 100
              )}
              % OFF
            </span>
          )}
        </div>

        <div className="availability-section">
          <span
            className={`stock-status ${
              product.stock > 0 ? "in-stock" : "out-of-stock"
            }`}
          >
            {product.stock > 0 ? "In Stock" : "Out of Stock"}
          </span>
          <p className="delivery-info">
            <span className="free-shipping">Free Shipping</span> •{" "}
            <span className="shipping-time">2–4 business days</span>
          </p>
        </div>

        <div className="cart-actions">
          <div className="quantity">
            <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(q => q + 1)}>+</button>
          </div>

          <button
            className={`add-to-cart ${product.stock === 0 ? "disabled" : ""}`}
            onClick={() => addToCart(product._id, quantity)}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>

        <p className="description">{product.description}</p>
      </div>
    </div>
  );
};

export default ProductDetail;
