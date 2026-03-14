import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const brandConfigs = {
  Nike: {
    bg: 'bg-brand-red',
    text: 'NIKE',
    initial: { scale: 0.5, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 0.5, 
        ease: "easeOut"
      }
    },
    exit: { 
      scale: 1.5,
      opacity: 0,
      transition: { duration: 0.4, ease: "easeIn" } 
    }
  },
  'New Balance': {
    bg: 'bg-brand-nb',
    text: 'NEW BALANCE',
    initial: { y: 50, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1, 
      transition: { duration: 0.5, ease: "easeOut" }
    },
    exit: { 
      y: -50,
      opacity: 0,
      transition: { duration: 0.4, ease: "easeIn" } 
    }
  },
  Asics: {
    bg: 'bg-brand-asics',
    text: 'ASICS',
    initial: { filter: 'blur(20px)', opacity: 0 },
    animate: { 
      filter: 'blur(0px)', 
      opacity: 1, 
      transition: { duration: 0.5, ease: "easeOut" }
    },
    exit: { 
      filter: 'blur(20px)',
      opacity: 0,
      transition: { duration: 0.4 } 
    }
  },
  All: {
    bg: 'bg-white',
    exit: { 
      opacity: 0,
      transition: { duration: 0.3 } 
    }
  }
};

const BrandIntro = ({ brand, isVisible, onComplete }) => {
  const config = brandConfigs[brand] || brandConfigs['All'];

  return (
    <AnimatePresence mode="wait" onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          key={brand}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={config.exit}
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center ${config.bg} text-white overflow-hidden`}
        >
          {brand === 'All' ? (
            <>
              {/* Lighter Splash Screen for 'Store' (All) */}
              <motion.img
                src="/src/assets/logo.jpg"
                alt="Sel3a Sneakers Logo"
                className="w-40 h-40 md:w-56 md:h-56 object-contain mix-blend-multiply drop-shadow-md"
                animate={{ 
                  y: [0, -3, 0],
                  rotate: [0, -1, 1, 0]
                }}
                transition={{ 
                  duration: 0.3, 
                  repeat: Infinity, 
                  repeatType: "mirror",
                  ease: "easeInOut"
                }}
              />
              <motion.div 
                className="mt-6 flex space-x-2 text-2xl md:text-4xl font-black uppercase tracking-tighter"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <span className="text-brand-red">SEL3A</span>
                <span className="text-brand-green">SNEAKERS</span>
              </motion.div>
            </>
          ) : (
            <motion.h1
              initial={config.initial}
              animate={config.animate}
              className="text-5xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter text-center px-4"
            >
              {config.text}
            </motion.h1>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BrandIntro;
