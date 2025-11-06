import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./allproduct.css";
import Productslisst from "../components/ProductLisst.jsx";

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const scrollAttempts = useRef(0);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await fetch("https://freshcart-backend-4wrc.onrender.com/products");
        const data = await res.json();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching all products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // IMPROVED SCROLLING LOGIC
  useEffect(() => {
    if (loading) return;

    const scrollToProduct = () => {
      const hash = window.location.hash;
      console.log("Current hash:", hash);
      
      if (hash && hash.startsWith('#product-')) {
        const productId = hash.replace('#product-', '');
        console.log("Looking for product with ID:", productId);
        
        const productElement = document.getElementById(`product-${productId}`);
        
        if (productElement) {
          console.log("✅ Product element FOUND! Scrolling...");
          
          // Smooth scroll to product
          productElement.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
          
          // Add highlight effect
          productElement.style.transition = 'all 0.5s ease';
          productElement.style.boxShadow = '0 0 0 3px #4CAF50';
          productElement.style.borderRadius = '10px';
          productElement.style.backgroundColor = '#f8fff8';
          
          // Remove highlight after 3 seconds
          setTimeout(() => {
            productElement.style.boxShadow = '';
            productElement.style.borderRadius = '';
            productElement.style.backgroundColor = '';
          }, 3000);
          
          // Clear hash from URL
          setTimeout(() => {
            window.history.replaceState(null, null, window.location.pathname);
          }, 1000);
          
        } else {
          console.log("❌ Product element NOT found, retrying...");
          scrollAttempts.current += 1;
          
          // Retry after delay (max 5 attempts)
          if (scrollAttempts.current < 5) {
            setTimeout(scrollToProduct, 500);
          } else {
            console.log("❌ Max scroll attempts reached");
          }
        }
      }
    };

    // Initial scroll attempt
    scrollToProduct();
    
    // Additional attempt after products render
    const timer = setTimeout(scrollToProduct, 1000);
    
    return () => clearTimeout(timer);
  }, [loading]);

  return (
    <section className="all-wrapper">
      <div className="all-cover">
        <div className="top-popular">
          <p onClick={() => navigate("/")} className="back-to">Back to home</p>
          <h2>All Products</h2>
        </div>
        {loading ? <p>Loading...</p> : <Productslisst products={products} />}
      </div>
    </section>
  );
};

export default AllProducts;