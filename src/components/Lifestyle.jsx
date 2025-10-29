import React from "react";
import "./lifestyle.css";
import { FaLeaf } from "react-icons/fa"; 
import { GiWheat, GiFruitBowl, GiAvocado } from "react-icons/gi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import { useNavigate } from "react-router-dom";

const Lifestyle = () => {
  const navigate = useNavigate();

  const lifestyles = [
    { icon: <GiWheat className="icon" />, title: "Gluten-Free", text: "Foods that don't contain gluten", bg: "gluten", type: "Gluten Free" },
    { icon: <GiFruitBowl className="icon" />, title: "Vegan", text: "Vegetable based goodness", bg: "vegan", type: "Vegan" },
    { icon: <FaLeaf className="icon" />, title: "Plant based", text: "Based on herbal ingredients", bg: "plant", type: "Plant-based" },
    { icon: <GiAvocado className="icon" />, title: "Keto", text: "Good fats served in food", bg: "keto", type: "keto" }
  ];


  return (
    <section className="lifestyle-section">
      <h2 className="lifestyle-title">Shop by lifestyle</h2>

  
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={3}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          breakpoints={{
            480: { slidesPerView: 1, spaceBetween: 15 },
            768: { slidesPerView: 3, spaceBetween: 20 },
            1024: { slidesPerView: 4, spaceBetween: 30 }
          }}
        >
          {lifestyles.map((item, index) => (
            <SwiperSlide key={index}>
              <div 
                className="lifestyle-card"
                onClick={() => navigate(`/lifestyle/${item.type}`)} // 👈 navigate here
                style={{ cursor: "pointer" }}
              >
                <div className={`icon-wrapper ${item.bg}`}>{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      
    </section>
  );
};


export default Lifestyle;
