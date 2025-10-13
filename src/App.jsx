import React,{useState,useEffect} from 'react'
import './App.css'
import Hero from './components/Hero'
import  Categories from './components/Catagories'
import Productlist from './components/Productlist'
import Lifestyle from './components/Lifestyle'
import SpecialProducts from './components/Special'
import ResponsiveCarousel from './components/Croawsel'
import Recipes from './components/Recipes'
import Contact from './components/Contact.jsx'

export const App = () => {
  const[show,Setshow] = useState('false')
    const [scrollPercent, setScrollPercent] = useState(0);


 
   useEffect(()=>{
    
     function handler(){
    if(window.scrollY>100){
      Setshow(true)
    }else{
      Setshow(false)
    };


  }

  window.addEventListener('scroll',handler);
  return()=> window.removeEventListener('scroll',handler);
   },[])
     useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (scrollTop / docHeight) * 100;
      setScrollPercent(scrolled);
    }
   
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
   useEffect(() => {
    if (location.hash) {
      const element = document.querySelector(location.hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);


  return (  
    <>
    
       <Productlist/>
      
     <div className='conainer'>
      
      <div className={`right-side-ins ${show?"inp":""}`}
          style={{
        background: "#333",
        border: "3px solid transparent",
        borderRadius: "10px",
        backgroundImage: `linear-gradient(#333, #333), conic-gradient( rgb(0, 183, 255) ${scrollPercent}%, transparent ${scrollPercent}%)`,
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, border-box"
      }}
      >t
       o
       p</div>
   <Hero/>
 <ResponsiveCarousel/>
   < Categories/>
    <Lifestyle/>
    <SpecialProducts/> 
      <div id="recipes"></div>
  <Recipes/>
 <Contact/> 
    </div>
    </>
  )
}
export default App
