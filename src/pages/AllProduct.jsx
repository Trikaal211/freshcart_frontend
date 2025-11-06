import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./allproduct.css"

import Productslisst from "../components/ProductLisst.jsx";

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  // ADD THIS useEffect FOR HASH SCROLLING
  useEffect(() => {
    const handleHashScroll = () => {
      if (window.location.hash) {
        const productId = window.location.hash.replace('#product-', '');
        console.log("Looking for product with ID:", productId);
        
        // Wait a bit for products to load and render
        setTimeout(() => {
          const productElement = document.getElementById(`product-${productId}`);
          
          if (productElement) {
            console.log("Product element found, scrolling...");
            productElement.scrollIntoView({ 
              behavior: 'smooth',
              block: 'center'
            });
            
            // Add highlight effect
            productElement.classList.add('product-scroll-target');
            
            // Remove highlight after animation
            setTimeout(() => {
              productElement.classList.remove('product-scroll-target');
            }, 2000);
            
            // Clear the hash from URL after scrolling
            setTimeout(() => {
              window.history.replaceState(null, null, ' ');
            }, 1000);
          } else {
            console.log("Product element not found");
          }
        }, 1000);
      }
    };

    // Run when component mounts and products are loaded
    if (!loading) {
      handleHashScroll();
    }
    
    // Also handle hash changes if user manually changes URL
    window.addEventListener('hashchange', handleHashScroll);
    
    return () => {
      window.removeEventListener('hashchange', handleHashScroll);
    };
  }, [loading]); // Run when loading changes

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