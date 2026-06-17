import React, { useEffect } from 'react';
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
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    exit: {
      scale: 1.1,
      opacity: 0,
      transition: { duration: 0.4 }
    }
  },
  Adidas: {
    bg: 'bg-brand-adidas',
    text: 'ADIDAS',
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } // Custom cubic-bezier for premium feel
    },
    exit: {
      scale: 1.1,
      opacity: 0,
      transition: { duration: 0.4, ease: "easeIn" }
    }
  },
  'ON RUNNING': {
    bg: 'bg-brand-on',
    text: 'ON RUNNING',
    initial: { y: 20, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 1,
        ease: "easeInOut"
      }
    },
    exit: {
      y: -20,
      opacity: 0,
      transition: { duration: 0.4 }
    }
  },
  'Onitsuka Tiger': {
    bg: 'bg-yellow-400',
    text: 'ONITSUKA TIGER',
    initial: { scale: 0.2, opacity: 0, rotate: -45 },
    animate: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    },
    exit: {
      scale: 5,
      opacity: 0,
      transition: { duration: 0.5 }
    }
  },
  Saucony: {
    bg: 'bg-[#F8F6F1]',
    text: 'SAUCONY',
    textColor: 'text-[#8A8D8F]',
    initial: { scale: 0.5, opacity: 0, filter: 'blur(10px)' },
    animate: {
      scale: 1,
      opacity: 1,
      filter: 'blur(0px)',
      transition: { duration: 0.8, ease: "easeOut" }
    },
    exit: {
      scale: 1.2,
      opacity: 0,
      filter: 'blur(10px)',
      transition: { duration: 0.4, ease: "easeIn" }
    }
  },
  'Under Armour': {
    bg: 'bg-[#1D1D1D]',
    text: 'UNDER ARMOUR',
    textColor: 'text-white',
    initial: { scale: 1.2, opacity: 0, y: -20 },
    animate: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      transition: { duration: 0.4, ease: "easeIn" }
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

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isVisible]);

  return (
    <AnimatePresence mode="wait" onExitComplete={onComplete}>
      {isVisible && (
        <motion.div
          key={brand}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={config.exit}
          className={`fixed inset-0 z-[100] flex flex-col items-center justify-center text-white overflow-hidden ${brand === 'ON RUNNING' ? '' : config.bg}`}
          style={brand === 'ON RUNNING' ? { 
            background: 'linear-gradient(135deg, #C9A84C, #F5E6A3, #FFFFFF)'
          } : {}}
        >
          {/* Custom Background Decoration for On Running */}
          {brand === 'ON RUNNING' && (
            <div className="absolute inset-0 z-0 pointer-events-none">
              <div 
                className="absolute inset-0 opacity-20"
                style={{ 
                  backgroundImage: 'radial-gradient(rgba(26,26,26,0.5) 1.5px, transparent 1.5px)',
                  backgroundSize: '15px 15px'
                }}
              />
              <motion.div
                className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-12"
                initial={{ x: "-100%" }}
                animate={{ x: "50%" }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
            </div>
          )}

          {/* Custom Background Decoration for Onitsuka Tiger (Tiger Stripes) */}
          {brand === 'Onitsuka Tiger' && (
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ x: i % 2 === 0 ? '-100%' : '100%', rotate: i % 2 === 0 ? 45 : -45 }}
                  animate={{ x: i % 2 === 0 ? '-20%' : '20%' }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                  className="absolute h-[150px] w-[500%] bg-black -left-[200%]"
                  style={{ top: `${i * 20}%` }}
                />
              ))}
            </div>
          )}

          {brand === 'All' ? (
            <div className="flex flex-col items-center">
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
            </div>
          ) : (
            <motion.h1
              initial={config.initial}
              animate={config.animate}
              className={`relative z-10 text-[48px] md:text-8xl lg:text-9xl font-black uppercase tracking-tighter text-center px-4 ${config.textColor ? config.textColor : (brand === 'Onitsuka Tiger' ? 'text-black' : 'text-white drop-shadow-2xl')}`}
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
