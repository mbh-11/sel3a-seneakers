import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, ShoppingBag, AlertCircle, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { trackAddToCart, trackAddToWishlist } from '../pixelEvents';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product, isWishlistPage = false }) => {
  const { addToCart, toggleWishlist, wishlist } = useCart();
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState(null);
  const [showError, setShowError] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const isWishlisted = wishlist.some(w => w.id === product.id);
  
  // Mock Stock Check (In real app, this comes from DB column 'stock')
  const isOutOfStock = product.stock === 0 || product.price === 0;

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    
    if (isOutOfStock) {
      alert("عذراً، هذا المنتج غير متوفر حالياً (Out of Stock)");
      return;
    }

    if (!selectedSize) {
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
      return;
    }

    if (isWishlistPage) {
      setIsMoving(true);
      // Simulate API call delay for the spinner
      await new Promise(resolve => setTimeout(resolve, 800));
      
      addToCart(product, selectedSize, product.colors[0]);
      toggleWishlist(product); // Remove from wishlist
      navigate('/checkout');
    } else {
      addToCart(product, selectedSize, product.colors[0]); 
      trackAddToCart(product);
      setSelectedSize(null);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 200, damping: 20 }
    }
  };

  return (
    <motion.div 
      variants={cardVariants}
      className="relative bg-white border-4 border-black p-3 rounded-2xl group transition-all duration-300 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 overflow-hidden"
    >
      {/* Error Tooltip */}
      <AnimatePresence>
        {showError && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-brand-red text-white py-2 px-4 rounded-full text-xs font-black uppercase tracking-widest shadow-xl flex items-center"
          >
            <AlertCircle size={14} className="mr-2" /> Select Size First
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wishlist Button */}
      <motion.button 
        whileTap={{ scale: 0.8 }}
        onClick={() => {
          toggleWishlist(product);
          if (!isWishlisted) trackAddToWishlist(product);
        }}
        className={`absolute top-4 right-4 z-20 p-2 bg-white rounded-full border-2 border-black transition-colors ${
          isWishlisted ? 'text-brand-red border-brand-red' : 'hover:bg-black hover:text-white'
        }`}
      >
        <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
      </motion.button>
      
      {/* Product Image and Slide-up Button Container */}
      <div className="relative aspect-square bg-gray-50 mb-6 rounded-xl overflow-hidden cursor-pointer">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null; 
            e.target.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800"; // Fallback Nike shoe
          }}
        />
        
        {/* Quick Add Button Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-10 flex justify-center">
            <button 
              onClick={handleAddToCart}
              disabled={isMoving}
              className={`w-full py-3 rounded-xl font-bold uppercase tracking-widest text-sm flex items-center justify-center transition-all duration-300 transform active:scale-95 ${
                isOutOfStock 
                ? "bg-gray-400 cursor-not-allowed"
                : selectedSize 
                  ? "bg-brand-red text-white shadow-glow-red hover:bg-red-700" 
                  : "bg-brand-black text-white hover:bg-gray-800"
              }`}
            >
              {isMoving ? (
                <Loader2 className="animate-spin mr-2" size={18} />
              ) : (
                <ShoppingBag size={18} className="mr-2" />
              )}
              {isOutOfStock ? "Out of Stock" : isWishlistPage ? "MOVE TO CART" : "Quick Add"}
            </button>
        </div>
      </div>
      
      {/* Product Information */}
      <div className="space-y-4 px-2 pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{product.brand}</p>
            <h3 className="text-lg leading-tight group-hover:text-brand-red transition-colors font-black uppercase tracking-tighter mb-2">{product.name}</h3>
          </div>
          <p className="text-xl font-black ml-4">{product.price} د.ج</p>
        </div>
        
        {/* Size Selection Buttons */}
        <div className="space-y-2">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Size</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`min-w-[40px] h-10 text-xs font-black border-2 rounded-lg transition-all transform active:scale-90 ${
                  selectedSize === size
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-600 border-gray-100 hover:border-black"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div 
          className="flex items-center space-x-1 py-1 cursor-help group/stars"
          title={`${product.rating || 5.0}/5`}
        >
          <div className="flex">
            {[...Array(5)].map((_, i) => {
              const rating = product.rating || 5.0;
              const fillAmount = Math.min(Math.max(rating - i, 0), 1);
              
              if (fillAmount >= 0.9) {
                return <Star key={i} size={14} fill="#FFD700" className="text-[#FFD700]" />;
              } else if (fillAmount >= 0.4) {
                return (
                  <div key={i} className="relative">
                    <Star size={14} className="text-gray-200" />
                    <div className="absolute inset-0 overflow-hidden w-1/2">
                      <Star size={14} fill="#FFD700" className="text-[#FFD700]" />
                    </div>
                  </div>
                );
              } else {
                return <Star key={i} size={14} className="text-gray-200" />;
              }
            })}
          </div>
          <span className="text-[10px] font-bold text-gray-500 ml-2">({product.reviews_count || 48})</span>
          
          {/* Tooltip on Hover */}
          <div className="hidden group-hover/stars:block absolute bg-black text-white text-[8px] px-2 py-1 rounded bottom-full left-0 mb-1 pointer-events-none uppercase font-black tracking-widest">
            {product.rating || 5.0} / 5
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
