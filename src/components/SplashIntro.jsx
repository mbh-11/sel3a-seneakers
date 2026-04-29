import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SplashIntro = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide the splash screen after 2.5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center overflow-hidden"
          exit={{
            opacity: 0,
            transition: { duration: 0.5, ease: "easeInOut" }
          }}
        >
          {/* Main Logo Image */}
          <motion.img
            src="/logo.jpg"
            alt="Sel3a Sneakers Logo"
            className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-2xl mb-4"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1.2, 0.9, 1.1, 1],
              opacity: 1,
              x: [0, -10, 10, -5, 5, 0],
              y: [0, 10, -10, 5, -5, 0],
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />

          {/* Typographic Text */}
          <motion.div
            className="flex items-center justify-center tracking-wide leading-none whitespace-nowrap text-[40px] sm:text-[60px] md:text-[90px]"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1.2, 0.9, 1.1, 1],
              opacity: 1,
              x: [0, -10, 10, -5, 5, 0],
              y: [0, 10, -10, 5, -5, 0],
              skewX: [0, -15, 15, -5, 5, 0]
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ fontFamily: "'Permanent Marker', cursive", transform: 'rotate(-2deg)' }}
          >
            <div className="flex items-center justify-center drop-shadow-xl">
              <span 
                style={{ 
                  color: 'white',
                  WebkitTextStroke: '2px black',
                  textShadow: '3px 3px 0px rgba(0,0,0,0.8)',
                }}
              >
                sel3a&nbsp;
              </span>
              <span 
                style={{ 
                  color: '#FF0000',
                  WebkitTextStroke: '2px black',
                  textShadow: '3px 3px 0px rgba(0,0,0,0.8)'
                }}
              >
                sneakers
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashIntro;
