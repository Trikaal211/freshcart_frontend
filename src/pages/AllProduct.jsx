import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./allproduct.css"

import Productslisst from "../components/ProductLisst.jsx";

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
const naviagte = useNavigate();
  return (
    <section className="all-wrapper">
      <div className="all-cover">
        <div className="top-popular">
        <p onClick={()=>naviagte("/")} className="back-to">Back to home</p>
        <h2>All Products</h2>
        </div>
        {loading ? <p>Loading...</p> : <Productslisst products={products} />}
      </div>
    </section>
  );
};

export default AllProducts;
