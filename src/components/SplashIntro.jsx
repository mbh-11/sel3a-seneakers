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
            scale: 0,
            transition: { duration: 0.5, ease: "easeInOut" }
          }}
        >
          {/* Main Logo Image Restored */}
          {/* Main Logo Image Restored */}
          <motion.img
            src="/logo.jpg"
            alt="Sel3a Sneakers Logo"
            className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-2xl mb-8"
          />

          {/* Typographic Logo in New Stroked style */}
          <motion.div
            className="flex items-center justify-center font-bold text-[40px] xs:text-[48px] sm:text-[56px] tracking-wide leading-none italic whitespace-nowrap mt-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            style={{ fontFamily: "'Boogaloo', cursive", transform: 'skewX(-5deg)' }}
          >
            <div className="flex items-center justify-center">
              <span 
                style={{ 
                  color: 'white',
                  WebkitTextStroke: '2px black',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.4)',
                  paddingRight: '2px'
                }}
              >
                sel3a.
              </span>
              <span 
                style={{ 
                  color: '#FF0000',
                  WebkitTextStroke: '2px black',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.4)'
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
