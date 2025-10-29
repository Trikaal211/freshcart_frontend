import React, { useEffect, useState, useContext } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { Link, useNavigate } from "react-router-dom";
import CartContext from "./CartContext.jsx"; // 👈 same context as ProductCard
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./special.css";

const SpecialProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState({});
  const navigate = useNavigate();

  const { addToCart, cartItems } = useContext(CartContext);
  const token = localStorage.getItem("accessToken");

  // ✅ Fetch Special Products
  useEffect(() => {
    const fetchSpecialProducts = async () => {
      try {
        const response = await fetch("http://localhost:3000/products/tag/special");
        const data = await response.json();

        setProducts(
          data.map((p) => ({
            id: p._id,
            name: p.title,
            price: p.price,
            quantity: p.weight,
            image: p.images[0],
            discount: p.discount,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSpecialProducts();
  }, []);

  // ✅ Check if a product is in wishlist
  useEffect(() => {
    if (!token || products.length === 0) return;

    const fetchWishlistStatus = async () => {
      try {
        const res = await fetch("http://localhost:3000/wishlist/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        const wishlistMap = {};
        data.forEach((item) => {
          wishlistMap[item.productId?._id] = true;
        });
        setWishlist(wishlistMap);
      } catch (error) {
        console.error("Error fetching wishlist status:", error);
      }
    };
    fetchWishlistStatus();
  }, [products, token]);

  // ✅ Add or remove from wishlist
  const toggleWishlist = async (productId) => {
    if (!token) {
      alert("Please login to use wishlist");
      navigate("/login");
      return;
    }

    const isInWishlist = wishlist[productId];
    try {
      if (isInWishlist) {
        await fetch(`http://localhost:3000/wishlist/${productId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        setWishlist((prev) => ({ ...prev, [productId]: false }));
      } else {
        await fetch("http://localhost:3000/wishlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId }),
        });
        setWishlist((prev) => ({ ...prev, [productId]: true }));
      }
    } catch (error) {
      console.error("Wishlist toggle error:", error);
    }
  };

  // ✅ Add to Cart
  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId.toString(), 1);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  if (loading) return <div>Loading special products...</div>;

  return (
    <div className="special-section">
      <div className="cover-main">
        <div className="banner-cover">
          <div className="banner">
            <div className="banner-up">
              <h4>Make breakfast healthy and easy</h4>
   <div 
      className="shop" 
      onClick={() => navigate("/all-products")} 
      style={{ cursor: "pointer" }}
    >
      Shop now
    </div>            </div>
            <div className="banner-down">
              <img src="/banner.webp" alt="banner" />
            </div>
          </div>
        </div>

        <div className="product-cover">
          <div className="product-banner">
            <h3>Special products</h3>
              <div 
        className="view-all"
        onClick={() => navigate("/all-products")}
        style={{ cursor: "pointer" }}
      >
        View all
      </div>
          </div>

          <div className="product-swiper-wrap">
            <Swiper
              modules={[Pagination, Navigation]}
              spaceBetween={20}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              breakpoints={{
                490: { slidesPerView: 1 },
                800: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
              }}
              className="product-swiper"
            >
              {products.map((prod) => {
                const isInCart = cartItems?.some(
                  (item) =>
                    item.productId?._id === prod.id ||
                    item.productId === prod.id
                );
                const isInWishlist = wishlist[prod.id];

                return (
                  <SwiperSlide key={prod.id}>
                    <div className="product-card">
                      <div className="img-wrapper">
                        {/* 👇 Product link */}
                        <Link to={`/product/${prod.id}`} className="product-card-link">
                          <img src={prod.image} alt={prod.name} />
                        </Link>

                        {/* ❤️ Wishlist */}
                        <div
                          className="wish"
                          onClick={() => toggleWishlist(prod.id)}
                        >
                          {isInWishlist ? (
                            <AiFillHeart className="wishlist filled" />
                          ) : (
                            <AiOutlineHeart className="wishlist" />
                          )}
                        </div>

                        {/* 🛒 Add to Cart */}
                        <div className="add">
                          <button
                            className={`add-btn ${isInCart ? "in-cart" : ""}`}
                            onClick={() => handleAddToCart(prod.id)}
                          >
                            {isInCart ? "✓" : "+"}
                          </button>
                        </div>

                        {/* 💸 Discount tag (optional) */}
                        {prod.discount && (
                          <span className="discount">{prod.discount}</span>
                        )}
                      </div>

                      <div className="product-info">
                        <h6 className="price">{prod.price}</h6>
                        <h3 className="name">{prod.name}</h3>
                        <p className="weight">{prod.quantity}</p>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialProducts;
