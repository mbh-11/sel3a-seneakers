import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getOptimizedImageUrl } from '../utils/imageOptimization';

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
      <div className="w-full h-[300px] flex items-center justify-center bg-gray-50 rounded-3xl border-4 border-dashed border-gray-200">
        <p className="font-black uppercase text-gray-300 tracking-widest">Loading...</p>
      </div>
    );
  }

  const currentProduct = products[currentIndex];

  return (
    <div className="relative w-full h-[300px] md:h-[600px] flex items-center justify-center overflow-hidden">

      {/* Background Circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] md:w-[100%] aspect-square border-[10px] md:border-[30px] border-gray-100 -z-10 rounded-full" />

      {/* Main Content */}
      <div className="relative w-full h-full flex items-center justify-center">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative flex items-center justify-center w-full px-4"
        >
          <div className="relative">
            {/* Shoe Image */}
            <img
              src={getOptimizedImageUrl(currentProduct.image)}
              alt={currentProduct.name}
              className="w-full h-auto max-h-[250px] md:max-h-[500px] object-contain drop-shadow-2xl"
              loading="eager"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800";
              }}
            />

            {/* Product Badge */}
            <div className="absolute -bottom-4 right-0 bg-black text-white p-3 border-2 border-white shadow-lg z-20">
              <p className="text-[10px] md:text-sm font-black uppercase tracking-tighter">{currentProduct.name}</p>
              <p className="text-brand-red font-black text-xs md:text-lg">{currentProduct.price} د.ج</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="absolute inset-0 flex items-center justify-between z-30 pointer-events-none px-4">
        <button
          onClick={() => paginate(-1)}
          className="pointer-events-auto p-2 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:scale-95"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => paginate(1)}
          className="pointer-events-auto p-2 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:scale-95"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Brand Text Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center -z-20 opacity-[0.05] pointer-events-none">
        <span className="text-6xl md:text-[200px] font-black uppercase leading-none block">
          {currentProduct.brand}
        </span>
      </div>
    </div>
  );
};

export default HeroCarousel;
