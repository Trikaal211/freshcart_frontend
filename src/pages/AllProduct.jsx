import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./allproduct.css";
import ProductsList from "../components/ProductLisst.jsx";

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

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

  // 🟢 Handle hash scroll (for newly uploaded product)
  useEffect(() => {
    if (loading) return;

    const hash = location.hash; // e.g. #product-672fae2...
    if (!hash) return;

    const productId = hash.replace("#product-", "");
    const elementId = `product-${productId}`;
    console.log("Looking for:", elementId);

    // Wait a moment for DOM render
    setTimeout(() => {
      const productElement = document.getElementById(elementId);

      if (productElement) {
        console.log("Found element, scrolling...");
        productElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        // Highlight effect
        productElement.classList.add("product-scroll-target");

        // Floating label / arrow
        const arrow = document.createElement("div");
        arrow.className = "scroll-arrow";
        arrow.innerHTML = "✨ Newly Added!";
        productElement.appendChild(arrow);

        // Remove highlight + arrow after delay
        setTimeout(() => {
          arrow.remove();
          productElement.classList.remove("product-scroll-target");
        }, 3000);

        // Clear hash from URL (so refresh doesn't scroll again)
        window.history.replaceState(null, null, window.location.pathname);
      } else {
        console.warn("❌ Product element not found:", elementId);
      }
    }, 800);
  }, [loading, location.hash]);

  return (
    <section className="all-wrapper">
      <div className="all-cover">
        <div className="top-popular">
          <p onClick={() => navigate("/")} className="back-to">
            Back to home
          </p>
          <h2>All Products</h2>
        </div>

        {loading ? <p>Loading...</p> : <ProductsList products={products} />}
      </div>
    </section>
  );
};

export default AllProducts;
