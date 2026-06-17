import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { SlidersHorizontal, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import BrandIntro from '../components/BrandIntro';
import ProductCard from '../components/ProductCard';

const UnderArmourPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const [showIntro, setShowIntro] = useState(true);
  const [introFinished, setIntroFinished] = useState(false);

  // Fetch Supabase data
  useEffect(() => {
    const fetchProducts = async () => {
      // Fetch only products where brand is 'Under Armour'
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .ilike('brand', 'under armour');
        
      if (error) {
        console.error(error);
      } else {
        setProducts(data || []);
      }
    };

    fetchProducts();

    // Set up real-time subscription
    const subscription = supabase
      .channel('public:products:underarmour')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Trigger intro on mount (1.5 seconds)
  useEffect(() => {
    setShowIntro(true);
    setIntroFinished(false);
    
    // Auto-hide the intro to allow it to exit after 1.5s
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const filteredProducts = products.filter(p => {
    const searchMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return searchMatch;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <>
      <BrandIntro 
        brand="Under Armour" 
        isVisible={showIntro} 
        onComplete={() => setIntroFinished(true)} 
      />
      <div className="bg-gray-50 min-h-screen pb-24 font-street text-brand-black">
        {/* Header */}
        <div className="py-8 md:py-20 mb-4 md:mb-12 transition-colors duration-500 bg-black text-white border-b-4 border-black relative overflow-hidden">
          {/* Dynamic background pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none select-none overflow-hidden whitespace-nowrap flex items-center">
            <span className="text-[100px] md:text-[150px] font-black leading-none uppercase tracking-tighter">
              UNDER ARMOUR UNDER ARMOUR
            </span>
          </div>
          
          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="brand-hero-h1 text-4xl md:text-8xl mb-2 md:mb-4 leading-none font-black uppercase tracking-tighter"
            >
              UNDER ARMOUR
            </motion.h1>
            <p className="brand-hero-p font-bold uppercase tracking-widest opacity-80 text-[10px] md:text-base text-gray-300">
              Protect This House
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Filters Sidebar */}
            <div className={`lg:w-64 flex-shrink-0 space-y-10 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
              <div>
                <h3 className="text-xl mb-6 flex items-center border-b-4 border-black pb-2 font-black uppercase tracking-tighter">
                  <Search size={20} className="mr-2" /> Search
                </h3>
                <input 
                  type="text" 
                  placeholder="Product name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border-4 border-black p-3 font-bold uppercase placeholder:text-gray-300 outline-none focus:bg-white bg-gray-100 transition-colors rounded-xl text-black"
                />
              </div>

              <div className="bg-white p-6 border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-sm font-black uppercase mb-4 text-brand-green">100% Authentic</p>
                <p className="text-xs font-bold text-gray-500 uppercase leading-relaxed">
                  Every item is meticulously verified by our seasoned team for authenticity before shipment. Enjoy our 14-day return policy.
                </p>
              </div>
            </div>

            {/* Product Grid */}
            <div className="flex-grow">
              <div className="flex justify-between items-center mb-6 md:mb-10 border-b-4 border-black pb-4">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    className="lg:hidden flex items-center gap-2 bg-black text-white px-3 py-2 rounded-lg font-black text-xs uppercase"
                  >
                    <SlidersHorizontal size={16} /> Filter
                  </button>
                  <span className="font-black uppercase tracking-widest text-[10px] md:text-sm text-black">Showing {filteredProducts.length} Results</span>
                </div>
                <div className="flex items-center space-x-2 md:space-x-4">
                  <span className="hidden md:inline text-xs font-black uppercase opacity-40 text-black">Sort By:</span>
                  <select className="font-black uppercase text-[10px] md:text-xs border-2 border-black p-1 md:p-2 outline-none bg-white text-black rounded-lg">
                    <option>Latest</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                  </select>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="py-20 text-center border-4 border-dashed border-gray-300 rounded-3xl">
                  <h3 className="text-3xl text-gray-400 uppercase font-black tracking-tighter">No products found.</h3>
                </div>
              ) : (
                <motion.div 
                  variants={containerVariants}
                  initial="hidden"
                  animate={introFinished ? "visible" : "hidden"}
                  className="product-grid grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8"
                >
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UnderArmourPage;
