import React, { useEffect, useState } from "react";
import { Link, useLocation } from 'react-router-dom';

import "./footer.css";
import {
  FaInstagram,
  FaFacebook,
  FaTelegramPlane,
  FaWhatsapp,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

const rightColumns = [
  {
    title: "Categories",
    items: [
      "Weekly sale",
      "Special price",
      "Easter is coming",
      "Italian dinner",
      "Fresh fruits",
      "Exotic fruits",
    ],
  },
  {
    title: "Company",
    items: ["Blog and news", "About us", "FAQ page", "Contact us", "Careers"],
  },
  {
    title: "Account",
    items: [
      "Your account",
      "Shipping rates & policies",
      "Refunds & replacements",
      "Delivery info",
      "Order tracking",
      "Taxes & fees",
    ],
  },
  {
    title: "Customer service",
    items: [
      "Payment methods",
      "Money back guarantee",
      "Product returns",
      "Support center",
      "Shipping",
      "Terms & conditions",
    ],
  },
];

const Footer = () => {
  const [openIndex, setOpenIndex] = useState(null); 
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
    const location = useLocation(); 


  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobileAccordion = width <= 500;

  const toggle = (i) => {
    if (!isMobileAccordion) return; 
    setOpenIndex((prev) => (prev === i ? null : i));
  };

  

  return (
    <footer className="footer">
  {location.pathname !== "/upload-product" && (
        <Link to="/upload-product" className="upload-link">
          Upload Product
        </Link>
      )}
      <div className="subscribe-section">
        <div className="subs-start">
          <div className="text-area">
            <h2>Stay in touch with us</h2>
            <p>Receive the latest updates about our products & promotions</p>
            <div className="subscribe-box">
              <div className="inpu">
                <input type="email" placeholder="Your email" />
              </div>
              <button>Subscribe</button>
            </div>
          </div>
        </div>
      </div>


      <div className="footer-link-cover">
        <div className="footer-links">
          <div className="footer-column1 footer-column">
            <h3>Cartzilla</h3>
            <p>
              With a wide selection of fresh produce, pantry staples, and
              household essentials, we've got all you need just a click away.
            </p>
            <div className="social-icons">
              <FaInstagram />
              <FaFacebook />
              <FaTelegramPlane />
              <FaWhatsapp />
            </div>
          </div>

          <div className="footer-column2">
            {rightColumns.map((col, i) => {
              const opened = openIndex === i;
              return (
                <div key={col.title} className="footer-column">
                  <button
                    className={`accordion-header ${isMobileAccordion ? "mobile" : ""}`}
                    onClick={() => toggle(i)}
                    aria-expanded={isMobileAccordion ? !!opened : true}
                    aria-controls={`col-${i}-content`}
                    type="button"
                  >
                    <span className="acc-title">{col.title}</span>
                    {isMobileAccordion ? (
                      <span className="acc-icon">
                        {opened ? <FaChevronUp /> : <FaChevronDown />}
                      </span>
                    ) : null}
                  </button>

                  <div
                    id={`col-${i}-content`}
                    className={`accordion-content ${
                      isMobileAccordion ? (opened ? "open" : "closed") : "open"
                    }`}
                    role="region"
                    aria-hidden={isMobileAccordion ? (!opened).toString() : "false"}
                  >
                    <ul>
                      {col.items.map((it) => (
                        <li key={it}>{it}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

     
      <div className="footer-bottom">
        <p>
          © All rights reserved. Made with Jaalsaazi <span className="span">wolverin</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
