import React from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const MySwiper = ({myImages}) => {
  return (
    <Swiper
      // Install Swiper modules
      className='m-2 '
      modules={[ Autoplay]}
      spaceBetween={20}
      slidesPerView={1}
      loop={true}
      pagination={{ clickable: true }}
     
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
      }}
      breakpoints={{
        640: {
          slidesPerView: 2,
          spaceBetween: 30,
        },
        768: {
          slidesPerView: 3,
          spaceBetween: 40,
        },
        1024: {
          slidesPerView: 4,
          spaceBetween: 50,
        },
      }}
    >
      {myImages.map((image, index) => (
        <SwiperSlide key={index} style={{ backgroundColor: 'lightblue', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px' }}>
          <Image src={image}  alt={`Image ${index + 1}`} width={400} height={200} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default MySwiper;