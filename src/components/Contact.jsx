import React from "react";
import { BiLogoPlayStore } from "react-icons/bi";
import { GrApple } from "react-icons/gr";
import { FaAngleRight } from "react-icons/fa6";



import "./contact.css";

const Contact = () => {
  return (
    <div className="container">
       <div className="haha">
      <div className="card1">
       
        <div className="card-image">
          <img
            src="/l1.webp"
            alt="dummy"
          />
        </div>
        <div className="card-text">
          <h2>Make online shop easier with our Cartzilla App</h2>
          <div className="store-buttons">
          
                 <button>  <BiLogoPlayStore className="sto"/> Google Play</button>
        
             <button> <GrApple className="sto" /> App Store</button>
      
          </div>
        </div>
      </div>
      </div>

      <div className="baba">
      <div className="card2">
        <div className="card-image">
          <img
            src="/l2.webp"
            alt="dummy"
          />
        </div>
        <div className="card-text">
          <h2>We'd love to hear what you think!</h2>
          <a  href="#">Give a feedback <FaAngleRight className="arrow"/></a>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Contact;
