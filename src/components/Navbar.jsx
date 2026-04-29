import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, User, Menu, X, Search } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import SearchOverlay from './SearchOverlay';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { cartCount, wishlist, setIsCartOpen } = useCart();

  const navLinks = [
    { name: 'Store', path: '/store', color: '#111111', subtitle: 'All Sneakers' },
    { name: 'Nike', path: '/store?brand=Nike', color: '#E83535', subtitle: 'Just Do It' },
    { name: 'Adidas', path: '/store?brand=Adidas', color: '#0088CC', subtitle: 'Originals' },
    { name: 'New Balance', path: '/store?brand=New Balance', color: '#8DA1B5', subtitle: 'Classic NB' },
    { name: 'Asics', path: '/store?brand=Asics', color: '#B5A194', subtitle: 'Sound Mind, Sound Body' },
    { name: 'Onitsuka Tiger', path: '/store?brand=Onitsuka Tiger', color: '#DDBB44', subtitle: 'Iconic Stripes' },
    { name: 'ON RUNNING', path: '/store?brand=ON RUNNING', color: '#C9A84C', subtitle: 'CLOUDTILT' },
    { name: 'Saucony', path: '/saucony', color: '#F8F6F1', subtitle: 'Originals' },
  ];
  const brands = ['All', 'Nike', 'Adidas', 'New Balance', 'Asics', 'Onitsuka Tiger', 'ON RUNNING', 'Saucony'];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b-4 border-black">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">

          <motion.div
            whileHover={{
              x: [0, -2, 2, -2, 2, 0],
              transition: { duration: 0.4 }
            }}
            className="flex items-center flex-1 min-w-0"
          >
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <img
                className="h-12 md:h-16 w-auto transition-all duration-300 group-hover:brightness-110"
                src="/logo.jpg"
                alt="Sel3a Sneakers"
                loading="eager"
              />
            </Link>

            <Link
              to="/"
              className="ml-2 flex items-center text-[22px] sm:text-[35px] md:text-[45px] tracking-wide leading-none group whitespace-nowrap overflow-hidden transition-transform hover:scale-105"
              style={{ fontFamily: "'Permanent Marker', cursive", transform: 'rotate(-2deg)' }}
            >
              <div className="flex items-center overflow-hidden text-ellipsis drop-shadow-md">
                <span
                  style={{
                    color: 'white',
                    WebkitTextStroke: '1px black',
                    textShadow: '2px 2px 3px rgba(0,0,0,0.4)',
                  }}
                >
                  sel3a 
                </span>
                <span
                  style={{
                    color: '#FF0000',
                    WebkitTextStroke: '1px black',
                    textShadow: '2px 2px 3px rgba(0,0,0,0.4)',
                  }}
                >
                  sneakers
                </span>
              </div>
            </Link>
          </motion.div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-sm font-black uppercase tracking-widest hover:text-brand-red transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-1 md:space-x-2 shrink-0">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 sm:p-3 hover:bg-gray-100 transition-colors rounded-full"
            >
              <Search size={18} className="text-black sm:w-[22px] sm:h-[22px]" />
            </motion.button>

            <Link to="/wishlist">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 sm:p-3 hover:bg-gray-100 transition-colors rounded-full relative"
              >
                <Heart size={20} className={`text-black sm:w-[22px] sm:h-[22px] ${wishlist.length > 0 ? 'fill-brand-red text-brand-red' : ''}`} />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 sm:h-5 sm:w-5 bg-brand-black text-white text-[8px] sm:text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white">
                    {wishlist.length}
                  </span>
                )}
              </motion.div>
            </Link>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsCartOpen(true)}
              className="p-1.5 sm:p-3 hover:bg-gray-100 transition-colors rounded-full relative"
            >
              <ShoppingBag size={18} className="text-black sm:w-[22px] sm:h-[22px]" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 sm:h-5 sm:w-5 bg-brand-red text-white text-[8px] sm:text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </motion.button>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-3"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t-2 border-black"
          >
            <div className="flex flex-col p-4 space-y-2">
              {navLinks.map((link) => (
                <motion.div
                  key={link.name}
                  whileTap={{ scale: 0.97 }}
                  className="w-full"
                >
                  <Link
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="relative flex items-center justify-between px-5 py-2 transition-all duration-300 border-b-2 border-black/10 last:border-b-0 hover:bg-black/5 overflow-hidden"
                    style={{
                      backgroundColor: link.color,
                      color: (link.name === 'Onitsuka Tiger' || link.name === 'ON RUNNING') ? '#1A1A1A' : (link.name === 'Saucony' ? '#8A8D8F' : '#ffffff'),
                      border: '2px solid black',
                      boxShadow: '3px 3px 0px 0px rgba(0,0,0,1)'
                    }}
                  >
                    {/* Special Animation for ON RUNNING */}
                    {link.name === 'ON RUNNING' && (
                      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                        {/* Moving Gradient Sahl */}
                        <motion.div
                          animate={{
                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                          }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0"
                          style={{
                            background: 'linear-gradient(270deg, #C9A84C, #F5E6A3, #FFFFFF)',
                            backgroundSize: '400% 400%'
                          }}
                        />
                        {/* Halftone Pattern fading center */}
                        <div
                          className="absolute inset-0 opacity-20"
                          style={{
                            backgroundImage: 'radial-gradient(rgba(26,26,26,0.3) 1.5px, transparent 1.5px)',
                            backgroundSize: '15px 15px',
                            maskImage: 'linear-gradient(to right, black, transparent 40%, transparent 60%, black)',
                            WebkitMaskImage: 'linear-gradient(to right, black, transparent 40%, transparent 60%, black)'
                          }}
                        />
                      </div>
                    )}

                    <div className="relative z-10 flex items-center space-x-3">
                      <span
                        className="text-lg font-black uppercase tracking-tighter leading-none"
                        style={link.name === 'ON RUNNING' ? { textShadow: '0.5px 0.5px 0px rgba(255,255,255,0.8)' } : {}}
                      >
                        {link.name}
                      </span>
                      <span
                        className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60 mt-0.5 border-l border-current pl-2"
                      >
                        {link.subtitle}
                      </span>
                    </div>
                    <div className="relative z-10 flex items-center">
                      <span className="text-xl font-black opacity-30">→</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </nav>
  );
};

export default Navbar;
