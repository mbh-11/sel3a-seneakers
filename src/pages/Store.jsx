import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Heart, Star, SlidersHorizontal, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import BrandIntro from '../components/BrandIntro';
import ProductCard from '../components/ProductCard';
import { trackSearch, trackPageView } from '../pixelEvents';

const Store = () => {
  const location = useLocation();
  const { addToCart, toggleWishlist, wishlist } = useCart();

  const [filterBrand, setFilterBrand] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [showIntro, setShowIntro] = useState(true);
  const [introFinished, setIntroFinished] = useState(false);
  const [activeIntroBrand, setActiveIntroBrand] = useState('All');
  const [products, setProducts] = useState([]);

  const brands = ['All', 'Nike', 'Adidas', 'New Balance', 'Asics', 'Onitsuka Tiger', 'ON RUNNING'];

  // Fetch products from Supabase
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

  useEffect(() => {
    trackPageView();
  }, []);

  // Track search with 2s debounce to give Meta time to learn without noise.
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      const timer = setTimeout(() => {
        trackSearch(searchQuery);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  // Sync with URL params & trigger intro
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const brand = params.get('brand');
    const newBrand = brand && brands.includes(brand) ? brand : 'All';
    if (newBrand !== filterBrand) setFilterBrand(newBrand);
  }, [location.search]);

  // Trigger intro when filterBrand changes
  useEffect(() => {
    setActiveIntroBrand(filterBrand);
    setShowIntro(true);
    setIntroFinished(false);

    // Auto-hide the intro to allow it to exit
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 1200);

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
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 200, damping: 20 }
    }
  };

  return (
    <>
      <BrandIntro
        brand={activeIntroBrand}
        isVisible={showIntro}
        onComplete={() => setIntroFinished(true)}
      />
      <div className="bg-white min-h-screen pb-24">
        {/* Header */}
        <div
          className="py-8 md:py-20 mb-4 md:mb-12 transition-all duration-500"
          style={filterBrand === 'ON RUNNING' ? {
            background: 'linear-gradient(135deg, #1A1A1A, #C9A84C, #F5E6A3)'
          } : {
            background: '#1A1A1A'
          }}
        >
          <div className="container mx-auto px-4">
            {filterBrand === 'ON RUNNING' ? (
              <>
                <h1 className="brand-hero-h1 text-5xl md:text-8xl mb-2 md:mb-4 leading-none uppercase tracking-tighter" style={{ color: '#FFFFFF', textShadow: '2px 2px 4px #C9A84C' }}>ON RUNNING</h1>
                <p className="brand-hero-p font-bold uppercase tracking-widest text-[10px] md:text-base" style={{ color: '#F5E6A3' }}>PREMIUM ON RUNNING COLLECTION</p>
              </>
            ) : (
              <>
                <h1 className="brand-hero-h1 text-5xl md:text-8xl mb-2 md:mb-4 leading-none uppercase tracking-tighter text-white">THE VAULT</h1>
                <p className="brand-hero-p font-bold uppercase tracking-widest text-brand-red text-[10px] md:text-base">Authentic Sneakers Only / Fast Worldwide Shipping</p>
              </>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12">

            {/* Filters Sidebar */}
            <div className={`lg:w-64 flex-shrink-0 space-y-8 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
              <div>
                <h3 className="text-xl mb-6 flex items-center border-b-4 border-black pb-2 font-black uppercase tracking-tighter">
                  <Search size={20} className="mr-2" /> Search
                </h3>
                <input
                  type="text"
                  placeholder="Product name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border-4 border-black p-3 font-bold uppercase placeholder:text-gray-300 outline-none focus:bg-white bg-gray-50 transition-colors"
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
                      onClick={() => {
                        setFilterBrand(brand);
                        setShowMobileFilters(false);
                      }}
                      className={`block w-full text-left px-4 py-3 font-black uppercase text-sm tracking-widest transition-all border-2 ${filterBrand === brand ?
                        (brand === 'Asics' ? 'bg-brand-asics text-white border-brand-asics' :
                          brand === 'Onitsuka Tiger' ? 'bg-yellow-400 !text-black border-yellow-400' :
                            brand === 'ON RUNNING' ? 'bg-brand-on text-white border-brand-on' :
                              'bg-brand-red text-white border-brand-red')
                        : 'bg-white border-transparent hover:border-black'
                        }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-100 p-6 border-4 border-black">
                <p className="text-xs font-black uppercase mb-4">Limited Edition Items</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase leading-relaxed">
                  All items are verified by our team for authenticity before shipment. Returns accepted within 14 days.
                </p>
              </div>
            </div>

            {/* Product Grid */}
            <div className="flex-grow">
              <div className="flex justify-between items-center mb-6 md:mb-10 border-b-4 border-black pb-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    className="lg:hidden flex items-center gap-2 bg-black text-white px-3 py-2 rounded-lg font-black text-[10px] uppercase shadow-lg active:scale-95 transition-transform"
                  >
                    <SlidersHorizontal size={14} /> Filter
                  </button>
                  <span className="font-black uppercase tracking-widest text-[10px] md:text-sm">Showing {filteredProducts.length} Results</span>
                </div>
                <div className="flex items-center space-x-2 md:space-x-4">
                  <span className="hidden md:inline text-xs font-black uppercase opacity-40">Sort By:</span>
                  <select className="font-black uppercase text-[10px] md:text-xs border-2 border-black p-1 md:p-2 outline-none bg-white rounded-lg">
                    <option>Latest</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                  </select>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="py-20 text-center border-4 border-dashed border-gray-200">
                  <h3 className="text-3xl text-gray-300 uppercase italic">No products found matching your search.</h3>
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

export default Store;
