import React from 'react'
import List from './list'
import { AiOutlinePercentage } from "react-icons/ai";
import './productlist.css';

const Productlist = () => {
  const items = [
    { name: "Weekly sale", img: "/th04.webp" },
    { name: "Vegetables", img: "/th01.webp" },
    { name: "Easter is coming", img: "/th03.webp" },
    { name: "Poultry meat", img: "/th02.webp" },
    { name: "Fresh fruits", img: "/th04.webp" },
    { name: "St. Patrick's day", img: "/th05.webp" },
    { name: "Exotic fruits", img: "/th06.webp" }
  ];

  return (
    <div className='baapu'>
    <div className='main-list'>
      <div className='list-cover'>
        <div className="list">
          {items.map((item, index) => (
            index === 0 ? (
              <List 
                key={index} 
                name={item.name} 
                icon={<AiOutlinePercentage className="list-icons" />} 
              />
            ) : (
              <List 
                key={index} 
                name={item.name} 
                img={item.img} 
              />
            )
          ))}
        </div>
      </div>
    </div>
    </div>
  )
}

export default Productlist
