import React from 'react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowLeft, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const Wishlist = () => {
  const { wishlist } = useCart();

  return (
    <div className="bg-white min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8 border-b-8 border-black pb-8">
          <div className="text-center md:text-right" dir="rtl">
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4">
              قائمة <span className="text-brand-red">المفضلات</span>
            </h1>
            <p className="font-bold uppercase tracking-widest text-gray-500 flex items-center justify-center md:justify-start">
              Saved Items / {wishlist.length} Products <Heart className="ml-2 text-brand-red fill-brand-red" size={18} />
            </p>
          </div>
          <Link to="/store" className="btn-primary flex items-center gap-3 py-4 px-10 text-xl font-black">
            <ArrowLeft size={24} /> BACK TO STORE
          </Link>
        </div>

        {wishlist.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-40 border-4 border-dashed border-gray-200 rounded-[3rem]"
          >
            <div className="w-40 h-40 bg-gray-50 rounded-full flex items-center justify-center mb-10 relative">
              <Heart size={80} className="text-gray-200" />
              <div className="absolute top-0 right-0 w-12 h-12 bg-brand-red rounded-full border-4 border-white animate-bounce" />
            </div>
            <h3 className="text-4xl font-black uppercase tracking-tighter text-gray-400 mb-6 italic">Your Heart is Empty</h3>
            <p className="text-gray-400 font-bold uppercase tracking-widest mb-10">Add some heat to your favorites squad!</p>
            <Link to="/store" className="btn-primary">GO SHOPPING</Link>
          </motion.div>
        ) : (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10"
          >
            <AnimatePresence>
              {wishlist.map((product) => (
                <ProductCard key={product.id} product={product} isWishlistPage={true} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Bento Bottom Banner */}
      {wishlist.length > 0 && (
        <div className="container mx-auto px-4 mt-20">
          <div className="bg-brand-black p-12 rounded-[2rem] flex flex-col md:flex-row justify-between items-center text-white border-b-8 border-brand-red shadow-bento">
             <div className="text-center md:text-left mb-8 md:mb-0" dir="rtl">
               <h2 className="text-4xl font-black uppercase mb-2">هل أنت مستعد للشراء؟</h2>
               <p className="text-gray-500 font-bold uppercase tracking-widest text-sm italic">Move your favorites to the cart and step into style.</p>
             </div>
             <Link 
               to="/checkout"
               className="bg-white text-black py-6 px-12 font-black uppercase text-xl hover:bg-brand-red hover:text-white transition-all transform hover:-translate-y-2 flex items-center gap-4"
             >
               CHECKOUT NOW <ShoppingBag size={24} />
             </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
