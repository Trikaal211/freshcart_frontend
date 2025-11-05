import React, { useState, useEffect } from "react";
import "./App.css";
import Hero from "./components/Hero";
import Categories from "./components/Catagories";
import Productlist from "./components/Productlist";
import Lifestyle from "./components/Lifestyle";
import SpecialProducts from "./components/Special";
import ResponsiveCarousel from "./components/Croawsel";
import Recipes from "./components/Recipes";
import Contact from "./components/Contact.jsx";
import axios from "axios";

const App = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [loading, setLoading] = useState(true);

  // 🟢 Backend wake-up loader
  useEffect(() => {
    const wakeServer = async () => {
      try {
        await axios.get("https://freshcart-backend-4wrc.onrender.com/products/popular");
        setLoading(false);
      } catch {
        console.log("⏳ Backend waking up...");
        setTimeout(wakeServer, 4000);
      }
    };
    wakeServer();
  }, []);

  // 🟠 Scroll top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (scrollTop / docHeight) * 100;
      setScrollPercent(scrolled);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 🔵 Smooth anchor scroll
  useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) element.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  // 🟣 Loading screen aesthetic
  if (loading) {
    return (
      <div className="loader-container">
        <div className="loader-circle"></div>
        <h2>⚙️ Waking up backend...</h2>
        <p>Please wait around 20–30 seconds</p>
      </div>
    );
  }

  return (
    <>

      <div className="container">
        {showScrollTop && (
          <div
            className="scroll-top-btn"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
            style={{
              background: `conic-gradient(#00b7ff ${scrollPercent}%, transparent ${scrollPercent}%)`,
            }}
          >
            ↑
          </div>
        )}

        <Hero />
        <ResponsiveCarousel />
        <Categories />
        <Lifestyle />
        <SpecialProducts />
              <Productlist />

        <div id="recipes"></div>
        <Recipes />
        <Contact />
      </div>
    </>
  );
};

export default App;
