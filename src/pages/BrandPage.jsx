import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { SlidersHorizontal, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import BrandIntro from '../components/BrandIntro';
import ProductCard from '../components/ProductCard';

const BrandPage = () => {
  const location = useLocation();
  
  const [filterBrand, setFilterBrand] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  
  const [showIntro, setShowIntro] = useState(true);
  const [introFinished, setIntroFinished] = useState(false);
  const [activeIntroBrand, setActiveIntroBrand] = useState('All');

  const brands = ['All', 'Nike', 'New Balance', 'Asics'];

  // Sync with URL params & trigger intro
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const brand = params.get('brand');
    const newBrand = brand && brands.includes(brand) ? brand : 'All';
    if (newBrand !== filterBrand) setFilterBrand(newBrand);
  }, [location.search]);

  // Fetch Supabase data
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase.from('products').select('*');
      if (error) {
        console.error(error);
      } else {
        setProducts(data);
      }
    };

    fetchProducts();

    // Set up real-time subscription
    const subscription = supabase
      .channel('public:products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  // Trigger intro when filterBrand changes (1.5 seconds)
  useEffect(() => {
    setActiveIntroBrand(filterBrand);
    setShowIntro(true);
    setIntroFinished(false);
    
    // Auto-hide the intro to allow it to exit after 1.5s
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [filterBrand]);

  const filteredProducts = products.filter(p => {
    const brandMatch = filterBrand === 'All' || p.brand === filterBrand;
    const searchMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return brandMatch && searchMatch;
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
        brand={activeIntroBrand} 
        isVisible={showIntro} 
        onComplete={() => setIntroFinished(true)} 
      />
      <div className="bg-gray-50 min-h-screen pb-24 font-street text-brand-black">
        {/* Header */}
        <div className={`py-20 mb-12 transition-colors duration-500 ${
          filterBrand === 'Nike' ? 'bg-brand-red' :
          filterBrand === 'New Balance' ? 'bg-brand-nb' :
          filterBrand === 'Asics' ? 'bg-brand-asics' :
          'bg-brand-black'
        } text-white relative overflow-hidden`}>
          {/* Bento dynamic background pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none select-none overflow-hidden whitespace-nowrap flex items-center">
            <span className="text-[150px] font-black leading-none uppercase tracking-tighter">
              {filterBrand} {filterBrand} {filterBrand}
            </span>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.h1 
              key={filterBrand}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-7xl md:text-8xl mb-4 leading-none font-black uppercase tracking-tighter"
            >
              {filterBrand === 'All' ? 'THE VAULT' : filterBrand}
            </motion.h1>
            <p className="font-bold uppercase tracking-widest opacity-80">
              {filterBrand === 'All' ? 'Authentic Sneakers Only / Fast Worldwide Shipping' : `Premium ${filterBrand} Collection`}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Filters Sidebar */}
            <div className="lg:w-64 flex-shrink-0 space-y-10">
              <div>
                <h3 className="text-xl mb-6 flex items-center border-b-4 border-black pb-2 font-black uppercase tracking-tighter">
                  <Search size={20} className="mr-2" /> Search
                </h3>
                <input 
                  type="text" 
                  placeholder="Product name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border-4 border-black p-3 font-bold uppercase placeholder:text-gray-300 outline-none focus:bg-white bg-gray-100 transition-colors rounded-xl"
                />
              </div>

              <div>
                <h3 className="text-xl mb-6 flex items-center border-b-4 border-black pb-2 font-black uppercase tracking-tighter">
                  <SlidersHorizontal size={20} className="mr-2" /> Brands
                </h3>
                <div className="space-y-3">
                  {brands.map(brand => (
                    <button
                      key={brand}
                      onClick={() => setFilterBrand(brand)}
                      className={`block w-full text-left px-4 py-3 font-black uppercase text-sm tracking-widest transition-all rounded-xl border-2 ${
                        filterBrand === brand 
                          ? brand === 'Nike' ? 'bg-brand-red text-white border-brand-red shadow-lg shadow-red-500/20' :
                            brand === 'New Balance' ? 'bg-brand-nb text-white border-brand-nb shadow-lg shadow-gray-500/20' :
                            brand === 'Asics' ? 'bg-brand-asics text-white border-brand-asics shadow-lg shadow-blue-500/20' :
                            'bg-brand-black text-white border-black'
                          : 'bg-white border-transparent hover:border-black'
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
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
              <div className="flex justify-between items-center mb-10 border-b-4 border-black pb-4">
                <span className="font-black uppercase tracking-widest text-sm">Showing {filteredProducts.length} Results</span>
                <div className="flex items-center space-x-4">
                  <span className="text-xs font-black uppercase opacity-40">Sort By:</span>
                  <select className="font-black uppercase text-xs border-2 border-black p-2 outline-none bg-white rounded-lg">
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
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8"
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

export default BrandPage;
