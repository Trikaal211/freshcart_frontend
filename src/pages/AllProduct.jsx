import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./allproduct.css";
import ProductsList from "../components/ProductLisst.jsx";

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const scrollAttempts = useRef(0);
  const maxScrollAttempts = 10; // Increased attempts

  // 🟢 Fetch all products
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

  // 🟢 IMPROVED Handle hash scroll 
  useEffect(() => {
    if (loading) {
      console.log("⏳ Still loading products...");
      return;
    }

    console.log("✅ Products loaded, checking for hash...");
    
    const scrollToProduct = () => {
      const hash = window.location.hash;
      console.log("🔍 Current hash:", hash);

      if (hash && hash.startsWith('#product-')) {
        const productId = hash.replace('#product-', '');
        console.log("🎯 Looking for product with ID:", productId);
        
        const productElement = document.getElementById(`product-${productId}`);
        
        if (productElement) {
          console.log("✅✅✅ PRODUCT ELEMENT FOUND! Scrolling...");
          
          // Force reflow to ensure element is ready
          productElement.offsetHeight;
          
          // Smooth scroll to product with better options
          productElement.scrollIntoView({ 
            behavior: "smooth",
            block: "center",
            inline: "nearest"
          });

          // 🎨 Better highlight effect
          productElement.style.transition = "all 0.8s ease";
          productElement.style.boxShadow = "0 0 0 4px #4CAF50, 0 0 20px rgba(76, 175, 80, 0.5)";
          productElement.style.borderRadius = "12px";
          productElement.style.backgroundColor = "#f0fff0";
          productElement.style.padding = "10px";
          productElement.style.margin = "-10px";
          
          // Remove highlight after 4 seconds
          setTimeout(() => {
            productElement.style.boxShadow = "";
            productElement.style.borderRadius = "";
            productElement.style.backgroundColor = "";
            productElement.style.padding = "";
            productElement.style.margin = "";
          }, 4000);

          // Clear hash from URL
          setTimeout(() => {
            window.history.replaceState(null, null, window.location.pathname + window.location.search);
            console.log("🗑️ Hash cleared from URL");
          }, 2000);
          
          scrollAttempts.current = 0; // Reset attempts
          
        } else {
          scrollAttempts.current += 1;
          console.log(`❌ Product element NOT found (attempt ${scrollAttempts.current}/${maxScrollAttempts})`);
          
          // Retry after delay
          if (scrollAttempts.current < maxScrollAttempts) {
            console.log("🔄 Retrying in 300ms...");
            setTimeout(scrollToProduct, 300);
          } else {
            console.log("💥 MAX SCROLL ATTEMPTS REACHED - Product might not exist");
          }
        }
      } else {
        console.log("ℹ️ No product hash found in URL");
      }
    };

    // Initial scroll attempt with small delay
    const timer = setTimeout(scrollToProduct, 100);
    
    return () => clearTimeout(timer);
  }, [loading, products]); // ✅ Added products dependency

  return (
    <section className="all-wrapper">
      <div className="all-cover">
        <div className="top-popular">
          <p onClick={() => navigate("/")} className="back-to">
            Back to home
          </p>
          <h2>All Products</h2>
        </div>

        {loading ? (
          <div style={{textAlign: 'center', padding: '2rem'}}>
            <p>📦 Loading products...</p>
          </div>
        ) : (
          <>
            <div style={{textAlign: 'center', marginBottom: '1rem', color: '#666'}}>
              <p>🔄 Found {products.length} products</p>
            </div>
            <ProductsList products={products} />
          </>
        )}
      </div>
    </section>
  );
};

export default AllProducts;