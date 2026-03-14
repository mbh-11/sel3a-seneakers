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
          className="fixed inset-0 z-[9999] bg-gray-50 flex flex-col items-center justify-center overflow-hidden origin-top-left"
          exit={{ 
            opacity: 0,
            scale: 0.1,
            x: '-40vw',
            y: '-40vh',
            transition: { duration: 0.8, ease: "easeInOut" }
          }}
        >
          {/* Logo with Yoyo effect (shaking under the weight of boxes) */}
          <motion.img
            src="/src/assets/logo.jpg"
            alt="Sel3a Sneakers Logo"
            className="w-48 h-48 md:w-64 md:h-64 object-contain mix-blend-multiply drop-shadow-xl"
            animate={{ 
              y: [0, -5, 0],
              rotate: [0, -2, 2, 0]
            }}
            transition={{ 
              duration: 0.4, 
              repeat: Infinity, 
              repeatType: "mirror",
              ease: "easeInOut"
            }}
          />

          {/* Typing Effect Text */}
          <motion.div 
            className="mt-8 flex space-x-2 text-3xl md:text-5xl font-black uppercase tracking-tighter"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.1, delayChildren: 0.5 }
              }
            }}
            initial="hidden"
            animate="show"
          >
            {/* Word: SEL3A (Red) */}
            <div className="flex text-brand-red">
              {"SEL3A".split("").map((char, index) => (
                <motion.span 
                  key={`sel3a-${index}`}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300 } }
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </div>
            
            {/* Space */}
            <div className="w-2 md:w-4"></div>
            
            {/* Word: SNEAKERS (Green) */}
            <div className="flex text-brand-green">
              {"SNEAKERS".split("").map((char, index) => (
                <motion.span 
                  key={`sneakers-${index}`}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300 } }
                  }}
                >
                  {char}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashIntro;
