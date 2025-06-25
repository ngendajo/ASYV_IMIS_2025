// src/components/GalleryCarousel.jsx

import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './gallery.css'; // Create this CSS file for styling
import Image1 from '../../static/images/gallery3.jpg'; 

import Image4 from '../../static/images/gallery1.jpg'; 
import Image3 from '../../static/images/gallery2.jpg'; 


const images = [
    { src: Image1, alt: ' 1' },
    { src: Image4, alt: ' 4' },
   // { src: Image3, alt: ' 3' },
    // Add more images as needed
  ];
  
const GalleryCarousel = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true, // Show arrows for navigation
    
    
  };

  return (
    <div className="gallery-carousel">
      <Slider {...settings}>
        {images.map((image, index) => (
          <div key={index}>
            <img src={image.src} alt={image.alt} />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default GalleryCarousel;
