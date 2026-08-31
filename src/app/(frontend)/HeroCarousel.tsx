"use client";

import { useState, useEffect } from "react";

export default function HeroCarousel() {
  // Make sure you have these 3 images inside your public/images folder!
  const images = [
    "/images/slide1.jpg",
    "/images/slide2.jpg",
    "/images/slide3.jpg",
    "/images/slide4.jpg",
    "/images/slide5.jpg"
  ];
  
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 2500); // Changes image every 5 seconds
    
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="absolute inset-0 z-0 bg-[#6A00F4]">
      {images.map((img, index) => (
        <div
          key={img}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url('${img}')` }}
        />
      ))}
    </div>
  );
}