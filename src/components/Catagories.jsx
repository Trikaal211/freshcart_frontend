import React, { useEffect, useState } from "react";
import "./catagories.css";
import Productslisst from "./ProductLisst.jsx";

const Categories = () => {
  const [categories, setCategories] = useState([]);  
  const [products, setProducts] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:3000/categories");
        const data = await res.json();
        setCategories(data);
        setLoadingCategories(false);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

useEffect(() => {
  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:3000/products?sort=popular");
      let data = await res.json();

      // Sort products by count (descending) - sabse zyada first
      data = data.sort((a, b) => (b.count || 0) - (a.count || 0));

      setProducts(data);
      setLoadingProducts(false);
    } catch (err) {
      console.error("Error fetching products:", err);
      setLoadingProducts(false);
    }
  };
  fetchProducts();
}, []);


  return (
    <section className="wrapper">
      <div className="cover">
        <div className="category-listo">
          <h3 className="h2">Categories</h3>
          {loadingCategories ? (
            <p>Loading categories...</p>
          ) : (
            <div className="category-list">
          {categories.map((cat, index) => ( <div key={index} className="category-item"> <div className="aalu"> <img src={cat.image} alt={cat.name} /> </div> <div className="prod"> <p className="cat-name">{cat.name}</p> <p className="cat-products">{cat.products} products</p> </div> </div> ))}
            </div>
          )}
        </div>

        <div className="product-section">
          <h2>All Products</h2>
          {loadingProducts ? <p>Loading products...</p> : <Productslisst products={products} />}
        </div>
      </div>
    </section>
  );
};

export default Categories;
