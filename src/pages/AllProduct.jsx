import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./allproduct.css";
import ProductsList from "../components/ProductLisst.jsx";

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  // 🟢 Handle hash scroll (for recently uploaded product)
  useEffect(() => {
    const handleHashScroll = () => {
      if (window.location.hash) {
        const productId = window.location.hash.replace("#product-", "");
        console.log("Looking for product with ID:", productId);

        // Wait for products to render
        setTimeout(() => {
          const productElement = document.getElementById(`product-${productId}`);

          if (productElement) {
            console.log("Product element found, scrolling...");
            productElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });

            // ✅ Highlight newly uploaded product
            productElement.classList.add("product-scroll-target");

            // ✅ Floating Arrow animation
            const arrow = document.createElement("div");
            arrow.className = "scroll-arrow";
            arrow.innerHTML = "⬇️ Your Product Here";
            productElement.appendChild(arrow);

            // Remove arrow + highlight after animation
            setTimeout(() => {
              arrow.remove();
              productElement.classList.remove("product-scroll-target");
            }, 3000);

            // Clear hash from URL
            setTimeout(() => {
              window.history.replaceState(null, null, " ");
            }, 1000);
          } else {
            console.log("Product element not found");
          }
        }, 1000);
      }
    };

    if (!loading) handleHashScroll();
    window.addEventListener("hashchange", handleHashScroll);

    return () => window.removeEventListener("hashchange", handleHashScroll);
  }, [loading]);

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
