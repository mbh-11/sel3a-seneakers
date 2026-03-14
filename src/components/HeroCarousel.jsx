import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroCarousel = ({ products }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // 1 for next, -1 for prev

  useEffect(() => {
    if (products.length === 0) return;
    const timer = setInterval(() => {
      paginate(1);
    }, 3000);
    return () => clearInterval(timer);
  }, [currentIndex, products.length]);

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      if (newDirection === 1) {
        return (prevIndex + 1) % products.length;
      }
      return (prevIndex - 1 + products.length) % products.length;
    });
  };

  if (!products || products.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-gray-50 rounded-3xl border-4 border-dashed border-gray-200">
        <p className="font-black uppercase text-gray-300 tracking-widest">Loading Collection...</p>
      </div>
    );
  }

  const currentProduct = products[currentIndex];

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
      rotate: direction > 0 ? 20 : -20,
      scale: 0.8
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      rotate: -15,
      scale: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 500 : -500,
      opacity: 0,
      rotate: direction < 0 ? 20 : -20,
      scale: 0.8
    })
  };

  return (
    <div className="relative w-full h-[450px] md:h-[600px] flex items-center justify-center group overflow-visible">
      
      {/* Background Circle Animation */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] md:w-[100%] aspect-square border-[15px] md:border-[30px] border-gray-100 -z-10 rounded-full animate-[spin_50s_linear_infinite]" />
      
      {/* Product Display */}
      <div className="relative w-full h-full flex items-center justify-center">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.4 },
              rotate: { type: "spring", stiffness: 200, damping: 20 },
              scale: { duration: 0.4 }
            }}
            className="absolute w-full h-full flex items-center justify-center"
          >
            <div className="relative max-w-[85%] md:max-w-full">
              {/* Main Shoe Image */}
              <img 
                src={currentProduct.image} 
                alt={currentProduct.name} 
                className="w-full h-auto max-h-[400px] md:max-h-[550px] object-contain drop-shadow-[30px_30px_0px_rgba(0,0,0,1)] grayscale-[0.2] hover:grayscale-0 transition-all duration-700 pointer-events-none mix-blend-multiply"
              />
              
              {/* Product Info Overlay (appearing on hover or mobile) */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -bottom-6 -right-4 md:right-0 bg-brand-black text-white p-4 md:p-6 border-4 border-white shadow-[10px_10px_0px_0px_rgba(230,30,37,1)] z-20 group/info"
              >
                <h3 className="text-sm md:text-xl font-black uppercase leading-tight mb-1">{currentProduct.name}</h3>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-brand-red font-black text-lg md:text-2xl">{currentProduct.price} د.ج</p>
                  <Link 
                    to={`/store`} 
                    className="bg-white text-black p-2 hover:bg-brand-red hover:text-white transition-colors"
                  >
                    <ShoppingCart size={18} />
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Manual Controls - Arrows */}
      <div className="absolute inset-0 flex items-center justify-between z-30 pointer-events-none px-2 md:px-0">
        <button 
          onClick={() => paginate(-1)}
          className="pointer-events-auto p-3 bg-white border-4 border-black hover:bg-brand-red hover:text-white transition-all transform hover:-rotate-6 active:scale-95 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          aria-label="Previous Slide"
        >
          <ChevronLeft size={24} className="md:w-8 md:h-8" />
        </button>
        <button 
          onClick={() => paginate(1)}
          className="pointer-events-auto p-3 bg-white border-4 border-black hover:bg-brand-red hover:text-white transition-all transform hover:rotate-6 active:scale-95 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          aria-label="Next Slide"
        >
          <ChevronRight size={24} className="md:w-8 md:h-8" />
        </button>
      </div>

      {/* Pagination Bottom Dots */}
      <div className="absolute -bottom-2 md:bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-30">
        {products.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
            className={`h-4 transition-all duration-300 border-2 border-black ${
              currentIndex === idx 
                ? 'w-12 bg-brand-red scale-110' 
                : 'w-4 bg-white hover:bg-gray-200'
            } rounded-full`}
          />
        ))}
      </div>
      
      {/* Decorative Brand Text Background (Subtle) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center -z-20 opacity-[0.03] select-none pointer-events-none">
        <span className="text-[6rem] md:text-[20rem] font-black uppercase leading-none block">
          {currentProduct.brand}
        </span>
      </div>
    </div>
  );
};

export default HeroCarousel;
