import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import  CartContext  from "./CartContext.jsx";
import "./ProductDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:3000/products/${id}`);
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) return <div>Loading...</div>;

  return (
    <div className="product-detail-wrapper">
      <img src={product.images[0]} alt={product.title} />
      <h1>{product.title}</h1>
      <p>{product.description}</p>
      <p>Price: ₹{product.discountPrice || product.price}</p>

      <div className="cart-actions">
        <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
        <span>{quantity}</span>
        <button onClick={() => setQuantity(q => q + 1)}>+</button>
        <button onClick={() => addToCart(product._id, quantity)}>Add to Cart</button>
      </div>
    </div>
  );
};

export default ProductDetail;
