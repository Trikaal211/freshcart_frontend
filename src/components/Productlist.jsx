import React from 'react'
import List from './List'
import { Link } from "react-router-dom"
import { AiOutlinePercentage } from "react-icons/ai"
import './productlist.css'

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
              <Link 
                to="/all-products" 
                key={index} 
                className="list-link"
              >
                {index === 0 ? (
                  <List 
                    name={item.name} 
                    icon={<AiOutlinePercentage className="list-icons" />} 
                  />
                ) : (
                  <List 
                    name={item.name} 
                    img={item.img} 
                  />
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Productlist
