import React from 'react';
import './Listm.css'

const List = ({ name, img, icon }) => {
  return (
    <div className="cover-list">
      <div className="photo">
        {icon ? icon : <img src={img} alt={name} className='list-icon' />}
      </div>
      <span className='week'>{name}</span>
    </div>
  )
}

export default List
