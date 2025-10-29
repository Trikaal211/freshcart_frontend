import React, { useEffect, useState } from "react";
import "./catagories.css";
import Productslisst from "./ProductLisst.jsx";
import { useNavigate } from "react-router-dom";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const navigate = useNavigate();

  // ✅ Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:3000/categories");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // ✅ Fetch 8 Most Popular Products
  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const res = await fetch("http://localhost:3000/products/popular");
        const data = await res.json();
        setPopularProducts(data);
      } catch (err) {
        console.error("Error fetching popular products:", err);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchPopular();
  }, []);

  // ✅ View All click handler
  const handleViewAll = () => {
    navigate("/all-products");
  };

  // ✅ Category click handler
  const handleCategoryClick = (categoryName) => {
    navigate(`/all-products?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <section className="wrapper">
      <div className="cover">

        {/* ✅ Categories Section */}
        <div className="category-listo">
          <h3 className="h2">Categories</h3>
          {loadingCategories ? (
            <p>Loading categories...</p>
          ) : (
            <div className="category-list">
              {categories.map((cat, index) => (
                <div
                  key={index}
                  className="category-item"
                  onClick={() => handleCategoryClick(cat.name)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="aalu">
                    <img src={cat.image} alt={cat.name} />
                  </div>
                  <div className="prod">
                    <p className="cat-name">{cat.name}</p>
                    <p className="cat-products">{cat.products} products</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ✅ Popular Products Section */}
        <div className="product-section">
          <div className="popular-product">
            <h2>Popular Products</h2>
            <button className="view-all-btn" onClick={handleViewAll}>
              View All →
            </button>
          </div>
          {loadingProducts ? (
            <p>Loading products...</p>
          ) : (
            <Productslisst products={popularProducts} />
          )}
        </div>
      </div>
    </section>
  );
};

export default Categories;
