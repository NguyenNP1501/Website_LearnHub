import { useEffect, useState } from "react";
import "./Carousel.css";

const images = [
  "https://res.cloudinary.com/due2iglla/image/upload/v1781443568/2007.i605.009..online_education_infographics-01_e6izxu.jpg",
  "https://res.cloudinary.com/due2iglla/image/upload/v1781443567/3808949_gf5sis.jpg",
   "https://res.cloudinary.com/due2iglla/image/upload/v1781443694/2307.i126.074.F.m005.c9.online_education_dlrtvs.jpg"
];

function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  return (
    <div className="carousel">
      <div
        className="carousel-track"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
        }}
      >
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Slide ${index + 1}`}
            className="carousel-image"
          />
        ))}
      </div>

      <button className="btn-prev" onClick={prevSlide}>
        ❮
      </button>

      <button className="btn-next" onClick={nextSlide}>
        ❯
      </button>

      <div className="dots">
        {images.map((_, index) => (
          <span
            key={index}
            className={`dot ${
              currentIndex === index ? "active" : ""
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}

export default Carousel;
