import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Heart, Star, SlidersHorizontal, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import BrandIntro from '../components/BrandIntro';

const Store = () => {
  const location = useLocation();
  const { addToCart, toggleWishlist, wishlist } = useCart();
  
  const [filterBrand, setFilterBrand] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showIntro, setShowIntro] = useState(true);
  const [introFinished, setIntroFinished] = useState(false);
  const [activeIntroBrand, setActiveIntroBrand] = useState('All');
  const [products, setProducts] = useState([]);

  const brands = ['All', 'Nike', 'New Balance', 'Asics'];

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
        <div className="bg-brand-black text-white py-20 mb-12">
          <div className="container mx-auto px-4">
            <h1 className="text-7xl md:text-8xl mb-4 leading-none">THE VAULT</h1>
            <p className="font-bold uppercase tracking-widest text-brand-red">Authentic Sneakers Only / Fast Worldwide Shipping</p>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12">
            
            {/* Filters Sidebar */}
            <div className="lg:w-64 flex-shrink-0 space-y-10">
              <div>
                <h3 className="text-xl mb-6 flex items-center border-b-4 border-black pb-2">
                  <Search size={20} className="mr-2" /> Search
                </h3>
                <input 
                  type="text" 
                  placeholder="Product name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border-4 border-black p-3 font-bold uppercase placeholder:text-gray-300 outline-none focus:bg-gray-50 bg-white"
                />
              </div>

              <div>
                <h3 className="text-xl mb-6 flex items-center border-b-4 border-black pb-2">
                  <SlidersHorizontal size={20} className="mr-2" /> Brands
                </h3>
                <div className="space-y-3">
                  {brands.map(brand => (
                    <button
                      key={brand}
                      onClick={() => setFilterBrand(brand)}
                      className={`block w-full text-left px-4 py-2 font-black uppercase text-sm tracking-widest transition-all ${
                        filterBrand === brand ? 'bg-brand-red text-white' : 'hover:bg-gray-100'
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
              <div className="flex justify-between items-center mb-10 border-b-4 border-black pb-4">
                <span className="font-black uppercase tracking-widest text-sm">Showing {filteredProducts.length} Results</span>
                <div className="flex items-center space-x-4">
                  <span className="text-xs font-black uppercase opacity-40">Sort By:</span>
                  <select className="font-black uppercase text-xs border-2 border-black p-1 outline-none bg-white">
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
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8"
                >
                  {filteredProducts.map((product) => (
                    <motion.div 
                      key={product.id}
                      variants={itemVariants}
                      whileHover={{ y: -5 }}
                      className="card-product group"
                    >
                      <button 
                        onClick={() => toggleWishlist(product)}
                        className="absolute top-4 right-4 z-10 p-2 bg-white border-2 border-black hover:bg-black hover:text-white transition-colors"
                      >
                        <Heart size={20} fill={wishlist.find(w => w.id === product.id) ? "black" : "none"} />
                      </button>
                      
                      <div className="aspect-square bg-gray-50 mb-6 overflow-hidden">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{product.brand}</p>
                            <h3 className="text-xl leading-tight group-hover:text-brand-red transition-colors">{product.name}</h3>
                          </div>
                          <p className="text-xl font-black">{product.price} د.ج</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 pt-2">
                          {product.sizes.map(size => (
                            <span key={size} className="text-[10px] font-black border border-gray-200 px-2 py-0.5 hover:border-black cursor-pointer">{size}</span>
                          ))}
                        </div>

                        <button 
                          onClick={() => addToCart(product, product.sizes[0], product.colors[0])}
                          className="btn-add-to-cart mt-4"
                        >
                          <ShoppingBag size={18} className="mr-2" /> Add to Bag
                        </button>
                      </div>
                    </motion.div>
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
