import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules"; 
import "swiper/css/pagination"; 
import { GoChevronRight } from "react-icons/go";


import "swiper/css";
import './croawsel.css'

const ResponsiveCarousel = () => {
   return (
    <div className="craw-container">
<Swiper
  modules={[Navigation, Pagination, Autoplay]}
  spaceBetween={20}
  slidesPerView={3}
  navigation
  pagination={{ clickable: true }}
  autoplay={{ delay: 2000, disableOnInteraction: false }}
  breakpoints={{
    0: { slidesPerView: 1 },
    768: { slidesPerView: 2 },
    1024: { slidesPerView: 3 }
  }}
>

        <SwiperSlide>
          <div className="pehla">

              <div className="half">
              
                    <p>124 product</p>
                  <h2>Only fresh lemo to your table</h2>

                  <div className="shop">
                        <a href="#">Shop now</a>
                      <GoChevronRight/>
                  </div>
                
              </div>
  <div className="halfj halft"><img src="/cr1.webp" alt="" /></div>
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div className="dusra">
              <div className="half">
            
          <p>124 product</p>
            <h2>Only fresh lemo to your table</h2>
          <div className="shop">

          <a href="#">Shop now</a>
          <GoChevronRight/>
                  </div>
            
                 </div>
  <div className="halfj halft" ><img src="/cr02.webp" alt="" /></div>
        </div>
              </SwiperSlide>
              <SwiperSlide>
              <div className="teesra">
              <div className="half">

                  <p>124 product</p>
                  <h2>Only fresh lemo to your table</h2>
                  <div className="shop">
                        <a href="#">Shop now</a>
                      <GoChevronRight/>
                  </div>

                </div>
              <div className="halfj halft"><img src="/cr03.webp" alt="" /></div>
              </div>
              </SwiperSlide>
              </Swiper>
              </div>
              );
              };

export default ResponsiveCarousel;
