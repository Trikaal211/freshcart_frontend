import React from "react";
import ProductCard from "./ProductCard";

const ProductsList = ({ products }) => {
  return (
 <div className="products-grid">
  {products?.length > 0 ? (
    products.map(p => <ProductCard key={p._id || p.title} product={p} />)
  ) : (
    <p>No products found</p>
  )}
</div>
  );
};

export default ProductsList;
