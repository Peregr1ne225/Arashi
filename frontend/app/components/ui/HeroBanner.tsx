"use client";

import { useState, useEffect } from "react";

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides = [
    {
      id: 1,
      title: "SUMMER SALE",
      subtitle: "Up to 70% Off",
      description:
        "Get ready for the season with our hottest styles at unbeatable prices.",
      imageUrl: "https://picsum.photos/seed/hero-summer/1200/500.jpg",
      bgColor: "bg-gradient-to-r from-pink-400 to-pink-600",
      textColor: "text-white",
      buttonText: "Shop Now",
      buttonColor: "bg-white text-pink-600",
    },
    {
      id: 2,
      title: "NEW ARRIVALS",
      subtitle: "Fresh Styles Daily",
      description:
        "Discover the latest trends and update your wardrobe with our newest collections.",
      imageUrl: "https://picsum.photos/seed/hero-new/1200/500.jpg",
      bgColor: "bg-gradient-to-r from-blue-400 to-blue-600",
      textColor: "text-white",
      buttonText: "Explore",
      buttonColor: "bg-white text-blue-600",
    },
    {
      id: 3,
      title: "FREE SHIPPING",
      subtitle: "On Orders ฿49+",
      description:
        "Enjoy free standard shipping on all orders over ฿49. No code needed.",
      imageUrl: "https://picsum.photos/seed/hero-shipping/1200/500.jpg",
      bgColor: "bg-gradient-to-r from-purple-400 to-purple-600",
      textColor: "text-white",
      buttonText: "Shop Now",
      buttonColor: "bg-white text-purple-600",
    },
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <div className="relative w-full overflow-hidden">
      {/* Hero Banner */}
      <div
        className={`relative h-96 md:h-[500px] ${currentSlideData.bgColor}`}
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <div
            className="w-full h-full opacity-30 bg-cover bg-center"
            style={{ backgroundImage: `url(${currentSlideData.imageUrl})` }}
          />
          <div className="absolute inset-0 bg-black opacity-20"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
          <div className="max-w-4xl">
            <h2
              className={`text-4xl md:text-6xl font-bold mb-2 ${currentSlideData.textColor}`}
            >
              {currentSlideData.title}
            </h2>
            <h3
              className={`text-2xl md:text-3xl font-medium mb-4 ${currentSlideData.textColor}`}
            >
              {currentSlideData.subtitle}
            </h3>
            <p
              className={`text-base md:text-lg mb-8 max-w-2xl mx-auto ${currentSlideData.textColor} opacity-90`}
            >
              {currentSlideData.description}
            </p>
            <button
              className={`px-8 py-3 rounded-full font-medium transition-all hover:shadow-lg transform hover:scale-105 bg-white text-black border border-black`}
            >
              {currentSlideData.buttonText}
            </button>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 transition-all"
          aria-label="Previous slide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 rounded-full p-2 transition-all"
          aria-label="Next slide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-white w-8"
                  : "bg-white bg-opacity-50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Promotional Banner */}
      <div className="bg-black text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-8 text-sm">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Free shipping on orders over ฿49</span>
            </div>
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>30-day easy returns</span>
            </div>
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span>100% secure payment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
