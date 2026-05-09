import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, ShoppingBag, Loader2, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { trackAddToCart, trackAddToWishlist } from '../pixelEvents';
import { useNavigate } from 'react-router-dom';
import { getOptimizedImageUrl } from '../utils/imageOptimization';

const ProductCard = ({ product, isWishlistPage = false }) => {
  const { addToCart, toggleWishlist, wishlist } = useCart();
  const navigate = useNavigate();
  const [isMoving, setIsMoving] = useState(false);
  const [isJustAdded, setIsJustAdded] = useState(false);
  const isWishlisted = wishlist.some(w => w.id === product.id);

  // Real Inventory Check
  const inventory = product.inventory || {};
  const isForceOutOfStock = inventory.is_out_of_stock === true;
  const isOutOfStock = isForceOutOfStock || (Object.keys(inventory).filter(k => k !== 'is_out_of_stock').length > 0 && Object.values(inventory).filter(v => typeof v === 'number').every(qty => qty === 0));
  const isSizeOutOfStock = (size) => isForceOutOfStock || (inventory[size] || 0) === 0;

  // Price Calculation Logic
  let finalPrice = product.price;
  let finalOldPrice = product.old_price || product.oldPrice;
  let finalDiscount = product.discount;

  if (typeof product.price === 'string' && !finalOldPrice) {
    const cleaned = product.price.replace(/د\.ج/g, ' ').trim();
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      finalPrice = parts[0];
      finalOldPrice = parts[1];
      if (parts.length >= 3) {
        finalDiscount = parts[2];
      }
    }
  }

  let oldP = 0;
  let newP = 0;
  let isValidDiscount = false;

  if (finalOldPrice && finalPrice) {
    oldP = parseFloat(String(finalOldPrice).replace(/[^0-9.]/g, ''));
    newP = parseFloat(String(finalPrice).replace(/[^0-9.]/g, ''));
    if (oldP > newP) {
      isValidDiscount = true;
      if (!finalDiscount) {
        finalDiscount = Math.round(((oldP - newP) / oldP) * 100) + '%';
      }
    } else {
      finalOldPrice = null;
      finalDiscount = null;
    }
  }

  const formatPrice = (p) => {
    if (!p) return '';
    const val = String(p).replace(/د\.ج/gi, '').trim();
    return `${val} د.ج`;
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();

    if (isOutOfStock) {
      alert("عذراً، هذا المنتج غير متوفر حالياً (Out of Stock)");
      return;
    }

    const color = product.colors?.[0] || 'Default';

    if (isWishlistPage) {
      setIsMoving(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      addToCart(product, null, color);
      trackAddToCart(product);
      toggleWishlist(product);
      navigate('/checkout');
    } else {
      // Add directly without size requirement (size selection deferred to checkout)
      addToCart(product, null, color);
      trackAddToCart(product);
      setIsJustAdded(true);
      setTimeout(() => setIsJustAdded(false), 3000); // Show toast for 3 seconds
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
      className={`mobile-card-clean relative bg-white border-2 md:border-4 ${product.brand?.toLowerCase() === 'saucony' ? 'border-blue-500 hover:shadow-[8px_8px_0px_0px_rgba(59,130,246,0.5)]' : 'border-black hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'} p-2 md:p-3 rounded-2xl group transition-all duration-300 hover:-translate-y-2 overflow-hidden flex flex-col h-full`}
    >

      {/* Wishlist Button */}
      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={() => {
          toggleWishlist(product);
          if (!isWishlisted) trackAddToWishlist(product);
        }}
        className={`absolute top-4 right-4 z-20 p-2 bg-white rounded-full border-2 border-black transition-colors ${isWishlisted ? 'text-brand-red border-brand-red' : 'hover:bg-black hover:text-white'
          }`}
      >
        <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
      </motion.button>

      <div
        onClick={() => !isOutOfStock && navigate(`/checkout/${product.id}`, { state: { product } })}
        className={`product-image-container relative w-full aspect-[3/2] bg-gray-50 mb-2 md:mb-6 rounded-xl overflow-hidden ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} shrink-0 flex items-center justify-center`}
      >
        {isOutOfStock && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
            <span className="bg-black text-white px-4 py-2 rounded-lg font-black uppercase text-sm md:text-base rotate-12 shadow-xl border-2 border-white/20">
              نفذت الكمية
            </span>
          </div>
        )}
        {isValidDiscount && (
          <div className="absolute top-3 left-3 z-20 bg-red-50 text-brand-red border border-red-100 text-[10px] md:text-xs font-black px-2.5 py-1 rounded-md shadow-sm">
            {finalDiscount ? (String(finalDiscount).includes('-') ? finalDiscount : `-${finalDiscount}`) : 'SALE'}
          </div>
        )}
        <img
          src={getOptimizedImageUrl(product.image)}
          alt={product.name}
          className="product-image w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800"; // Fallback Nike shoe
          }}
        />

      </div>

      {/* Product Information */}
      <div className="flex-grow flex flex-col justify-between space-y-1 md:space-y-4 px-0 md:px-2 pb-1 md:pb-2 text-left">
        <div className="flex flex-col justify-between items-start gap-0.5 md:gap-4">
          <div className="flex-1 min-w-0 w-full">
            <p className={`product-brand-label text-[8px] md:text-xs font-black uppercase tracking-widest mb-0 ${product.brand?.toLowerCase() === 'asics' ? 'text-brand-asics' :
              product.brand?.toLowerCase() === 'nike' ? 'text-brand-red' :
                product.brand?.toLowerCase() === 'adidas' ? 'text-brand-adidas' :
                  product.brand?.toLowerCase() === 'new balance' ? 'text-brand-nb' :
                    product.brand?.toLowerCase() === 'saucony' ? 'text-blue-600' :
                    'text-gray-400'
              }`}>{product.brand}</p>
            <h3 className="product-name text-[10px] md:text-lg leading-tight group-hover:text-brand-red transition-colors font-black uppercase tracking-tighter mb-0.5 md:mb-2">{product.name}</h3>
          </div>
          <div className="flex items-center gap-3 w-full mt-2" dir="ltr">
            {/* Line 1: New Price */}
            <p className="text-[20px] md:text-[24px] font-black text-black leading-none whitespace-nowrap">
              {formatPrice(finalPrice)}
            </p>
            {/* Line 2: Old Price */}
            {isValidDiscount && (
              <span className="line-through text-gray-400 text-[12px] md:text-[14px] font-bold leading-none whitespace-nowrap mt-1">
                {formatPrice(finalOldPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Mobile Action Area - Removed Size Buttons from Card */}
        <div className="hidden md:hidden pt-1">
          {/* Defer selection to Checkout */}
        </div>

        <div className="flex items-center justify-between py-0.5 md:py-1">
          <div
            className="flex items-center space-x-1 cursor-help group/stars"
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

          {/* Quick Cart Icon */}
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={handleAddToCart}
            className={`p-2 rounded-full transition-all duration-300 ${isJustAdded
              ? 'bg-green-500 text-white shadow-lg'
              : 'bg-gray-100 text-gray-600 hover:bg-black hover:text-white'
              }`}
          >
            <ShoppingBag size={16} className={isJustAdded ? 'animate-bounce' : ''} />
          </motion.button>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {isJustAdded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-xs"
          >
            <div className="bg-green-600 text-white p-4 rounded-2xl shadow-2xl border-2 border-white/20 flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <CheckCircle size={20} />
              </div>
              <div className="flex-1 text-right">
                <p className="text-xs font-black uppercase tracking-tight">تمت إضافة المنتج بنجاح!</p>
                <p className="text-[10px] opacity-90 font-bold">يمكنك اختيار المقاس في صفحة الدفع</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProductCard;
