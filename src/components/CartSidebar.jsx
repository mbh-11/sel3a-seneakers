import React from 'react';
import { useCart } from '../context/CartContext';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { trackInitiateCheckout } from '../pixelEvents';

const CartSidebar = () => {
  const { cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, cartTotal } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col border-l-4 border-black"
          >
            <div className="p-6 flex justify-between items-center border-b-4 border-black bg-brand-black text-white">
              <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center">
                <ShoppingBag className="mr-3" /> My Bag
              </h2>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="hover:rotate-90 transition-transform duration-300"
              >
                <X size={28} />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <ShoppingBag size={64} className="text-gray-300 mb-4" />
                  <p className="text-xl font-bold uppercase tracking-widest text-gray-400">Your bag is empty</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="mt-6 btn-primary"
                  >
                    Go Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex space-x-4 border-b-2 border-gray-100 pb-6 group">
                    <div className="w-24 h-24 bg-gray-100 border-2 border-black flex-shrink-0 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <h3 className="font-bold text-lg leading-tight">{item.name}</h3>
                        <button onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)} className="text-gray-400 hover:text-brand-red">
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <p className="text-sm text-gray-500 font-bold uppercase">{item.brand} | SZ: {item.selectedSize} | {item.selectedColor}</p>
                      
                      <div className="mt-4 flex justify-between items-center">
                        <div className="flex items-center border-2 border-black">
                          <button 
                            onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, -1)}
                            className="px-2 py-1 hover:bg-gray-100"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-4 font-black">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, 1)}
                            className="px-2 py-1 hover:bg-gray-100"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <span className="font-black text-xl">{item.price * item.quantity} د.ج</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-6 border-t-4 border-black space-y-4 bg-gray-50">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold uppercase tracking-widest">Total</span>
                  <span className="text-3xl font-black">{cartTotal} د.ج</span>
                </div>
                <Link 
                  to="/checkout" 
                  onClick={() => {
                    setIsCartOpen(false);
                    trackInitiateCheckout(cartTotal, cartItems);
                  }}
                  className="w-full btn-primary block text-center"
                >
                  Checkout Now
                </Link>
                <p className="text-[10px] text-center text-gray-500 uppercase font-bold">Free shipping on orders over 10000 د.ج</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;
