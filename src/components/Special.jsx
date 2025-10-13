import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import { AiOutlineHeart } from "react-icons/ai";

import "swiper/css";  
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./special.css";

const SpecialProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpecialProducts = async () => {
      try {
        const response = await fetch("http://localhost:3000/products/tag/special"); // your backend URL
        const data = await response.json();
        console.log(data)
        // Map _id to id if needed
        setProducts(data.map(p => ({
          id: p._id,
  name: p.title,        // Use `title` instead of `name`
  price: p.price,
  quantity: p.weight,   // Use `weight` instead of `quantity`
  image: p.images[0]
        })));
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialProducts();
  }, []);

  if (loading) return <div>Loading special products...</div>;

  return (
    <div className="special-section">
      <div className="cover-main">
        <div className="banner-cover">
          <div className="banner">
            <div className="banner-up">
              <h4>Make breakfast healthy and easy</h4>
              <div className="shop">Shop now</div>
            </div>
            <div className="banner-down">
              <img src="/banner.webp" alt="banner" />
            </div>
          </div>
        </div>

        <div className="product-cover">
          <div className="product-banner">
            <h3>Special products</h3>
            <div>View all</div>
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
              {products.map(prod => (
                <SwiperSlide key={prod.id}>
                  <div className="product-card">
                    <div className="img-wrapper">
                      <img src = {prod.image} alt = {prod.name} />
                      <div className="add">
                        <button className="add-btn">+</button>
                      </div>
                      <div className="wish">
                        <AiOutlineHeart className="wishlist" />
                      </div>
                    </div>

                    <div className="product-info">
                      <h6 className="price">{prod.price}</h6>
                      <h3 className="name">{prod.name}</h3>
                    </div>

                    <div className="weigh">{prod.quantity}</div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialProducts;
