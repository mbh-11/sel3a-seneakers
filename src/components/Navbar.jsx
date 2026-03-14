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
    { name: 'Store', path: '/store' },
    { name: 'Nike', path: '/store?brand=Nike' },
    { name: 'New Balance', path: '/store?brand=New Balance' },
    { name: 'Asics', path: '/store?brand=Asics' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b-4 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          
            <motion.div
              whileHover={{ 
                x: [0, -2, 2, -2, 2, 0],
                transition: { duration: 0.4 }
              }}
              className="flex items-center"
            >
              <Link to="/" className="flex-shrink-0 flex items-center group">
                <img 
                  className="h-16 w-auto transition-all duration-300 group-hover:brightness-110" 
                  src="/src/assets/logo.jpg" 
                  alt="Sel3a Sneakers" 
                />
              </Link>
              
              <Link 
                to="/" 
                className="ml-3 text-4xl font-black uppercase tracking-tighter flex"
                style={{ fontFamily: '"Montserrat", sans-serif' }}
              >
                <span className="text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)]" style={{ WebkitTextStroke: '2px black' }}>SEL3A</span>
                <span className="text-brand-red ml-2 drop-shadow-[2px_2px_0_rgba(0,0,0,1)]" style={{ WebkitTextStroke: '2px black' }}>SNEAKERS</span>
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
          <div className="flex items-center space-x-2">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSearchOpen(true)}
              className="p-3 hover:bg-gray-100 transition-colors rounded-full"
            >
              <Search size={22} className="text-black" />
            </motion.button>
            
            <Link to="/wishlist">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 hover:bg-gray-100 transition-colors rounded-full relative"
              >
                <Heart size={22} className={`text-black ${wishlist.length > 0 ? 'fill-brand-red text-brand-red' : ''}`} />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 h-5 w-5 bg-brand-black text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white">
                    {wishlist.length}
                  </span>
                )}
              </motion.div>
            </Link>

            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsCartOpen(true)}
              className="p-3 hover:bg-gray-100 transition-colors rounded-full relative"
            >
              <ShoppingBag size={22} className="text-black" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 h-5 w-5 bg-brand-red text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white">
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
            <div className="px-4 pt-2 pb-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-xl font-black uppercase tracking-tighter hover:text-brand-red"
                >
                  {link.name}
                </Link>
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
