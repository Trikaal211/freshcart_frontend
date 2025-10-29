import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './hero.css';

const slides = [
  { img: "/01.webp", title: "Healthy Food Available to Everyone", para: "Free shipping - order over 50%" },
  { img: "/02.webp", title: "Enjoy refreshing summer drink", para:"Only natural ingredents" }
];

const Hero = () => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleShopNow = () => {
    navigate("/all-products");
  };

  return (
    <div className="hero">
      {slides.map((slide, index) => (
        <img
          key={index}
          src={slide.img}
          alt=""
          className={`hero-img ${index === current ? "active" : ""}`}
        />
      ))}

      <div className="hero-overlay">
        <div className="hero-left">
          <p>{slides[current].para}</p>
          <h1 className="hero-title">{slides[current].title}</h1>
          <button className="hero-btn" onClick={handleShopNow}>
            Shop now
          </button>
        </div>
        <div className='hero-right'></div>
      </div>

      <div className="hero-dots">
        {slides.map((_, index) => (
          <span key={index} className={`dot ${index === current ? "active" : ""}`} />
        ))}
      </div>
    </div>
  );
};

export default Hero;
