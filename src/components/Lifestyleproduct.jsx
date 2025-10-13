import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import Productslisst from "./ProductLisst.jsx"; // Reusable component
import  CartContext  from "./CartContext.jsx";

const LifestyleProducts = () => {
  const { type } = useParams(); 
  const [products, setProducts] = useState([]);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`http://localhost:3000/products/lifestyle/${type}`);
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, [type]);

  if (products.length === 0) {
    return <p>No {type} products found.</p>;
  }

  return (
    <div>
      <h2>{type.toUpperCase()} Products</h2>
      {/* ProductsList component ko use karte hue */}
      <Productslisst products={products} addToCart={addToCart} />
    </div>
  );
};

export default LifestyleProducts;