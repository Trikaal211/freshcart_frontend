import React from 'react'
import './icon.css'



const Icon = ({icon, text}) => {
  return (
    <div className='special-icons'>
        <div className='social-icon'>
            {icon}
          {text}
        </div>
        
        </div>
  )
}

export default Icon