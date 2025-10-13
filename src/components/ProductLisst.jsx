import React from "react";
import ProductCard from "./ProductCard";

const ProductsList = ({ products }) => {
  return (
    <div className="products-grid">
      {products.map(p => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
};

export default ProductsList;
