"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { image: "/images/CIT.png" },
    { image: "/images/cyber.png" },
    { image: "/images/mern.png" },
    { image: "/images/net.png" },
  ];

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="relative w-full h-[55vh] sm:h-[65vh] md:h-screen flex items-center justify-center">

      {/* FRAME */}
      <div className="relative w-[95%] md:w-[90%] h-full rounded-3xl overflow-hidden shadow-2xl">

        {/* SLIDES */}
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={
            { transform: `translateX(-${currentSlide * 100}%)` }
            
          }
        >
          {slides.map((slide, index) => (
            <div key={index} className="min-w-full h-full relative ">

              {/* IMAGE */}
              <img
                src={slide.image}
                alt="slider"
                className={`w-full h-full object-cover object-center transition-transform duration-[4000ms] 
                  ${
                    index === currentSlide
                      ? "scale-105 md:scale-110"
                      : "scale-100"
                  }`}
              />

              {/* OVERLAY */}
              <div className="absolute inset-0 bg-black/30" />

              </div>
          ))}
        </div>
      </div>

   
      {/* DOTS */}
      <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "w-8 bg-green-500"
                : "w-3 bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
