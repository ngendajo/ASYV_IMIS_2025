import React from 'react';

// npm install react-slick slick-carousel
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './home_gallery.css';

import Image1 from '../../static/images/gallery1.jpg'; //3600 * 1800
import Image2 from '../../static/images/gallery2.jpg'; //7000 * 3500
import Image3 from '../../static/images/gallery3.jpg'; //4000 * 2000
import Image4 from '../../static/images/gallery4.jpg'; //6200 * 3100

const images = [
    { src: Image1, alt: 'Graduates holding banner' },
    { src: Image2, alt: 'Solo performance' },
    { src: Image3, alt: 'Graduates walking' },
    { src: Image4, alt: 'Group performance' },
  ];
  
const GalleryCarousel = () => {
  const settings = {
    dots: true,
    arrows: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
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